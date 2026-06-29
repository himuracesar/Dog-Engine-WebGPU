// ── Maps of string → value WebGPU ───────────────────────────────

const VISIBILITY_MAP = {
    Vertex: GPUShaderStage.VERTEX,
    Fragment: GPUShaderStage.FRAGMENT,
    Compute: GPUShaderStage.COMPUTE,
};

const BUFFER_TYPE_MAP = {
    uniform: "uniform",
    storage: "storage",
    "read-only-storage": "read-only-storage",
};

const SAMPLER_TYPE_MAP = {
    filtering: "filtering",
    "non-filtering": "non-filtering",
    comparison: "comparison",
};

const TEXTURE_SAMPLE_TYPE_MAP = {
    float: "float",
    "unfilterable-float": "unfilterable-float",
    depth: "depth",
    sint: "sint",
    uint: "uint",
};

const TEXTURE_VIEW_DIMENSION_MAP = {
    "1d": "1d",
    "2d": "2d",
    "2d-array": "2d-array",
    cube: "cube",
    "cube-array": "cube-array",
    "3d": "3d",
};

const STORAGE_TEXTURE_ACCESS_MAP = {
    "write-only": "write-only",
    "read-only": "read-only",
    "read-write": "read-write",
};

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Converts string "Vertex | Fragment" to GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT
 * Also accepts an array: ["Vertex", "Fragment"]
 * @param {string} value Value to convert
 * @returns {GPUShaderStage} Converted value
 * 
 * @author Claude-AI-Dev
 */
function parseVisibility(value) {
    if (value === undefined)
        throw new Error(`WebGPU-API-Private::parseVisibility:: Visibility is undefined`);

    const keys = Array.isArray(value)
        ? value
        : value.split("|").map(s => s.trim());

    return keys.reduce((acc, key) => {
        if (!(key in VISIBILITY_MAP)) {
            throw new Error(`WebGPU-API-Private::parseVisibility:: Invalid visibility: "${key}". Valid: ${Object.keys(VISIBILITY_MAP).join(", ")}`);
        }

        return acc | VISIBILITY_MAP[key];
    }, 0);
}

/**
 * Look up a value in a map
 * @param {JSON Object} map Map to look up in
 * @param {string} value Value to look up
 * @param {string} field Field name
 * @returns {JSON Object} Value
 * 
 * @author Claude-AI-Dev    
 */
function lookup(map, value, field) {
    if (!(value in map)) {
        throw new Error(`WebGPU-API-Private::lookup:: Invalid value: "${value}". Valid: ${Object.keys(map).join(", ")}`);
    }

    return map[value];
}

// ── Parsers for resource type ───────────────────────────────────

/**
 * Parses a buffer from a JSON object
 *    { "type": "uniform", "hasDynamicOffset": false, "minBindingSize": 0 }
 * @param {JSON Object} raw Raw buffer object
 * @returns {GPUBufferDescriptor} Buffer descriptor
 * 
 * @author Claude-AI-Dev    
 */
function parseBuffer(raw) {
    const descriptor = {
        type: lookup(BUFFER_TYPE_MAP, raw.type ?? "uniform", "buffer.type"),
    };

    if (raw.hasDynamicOffset !== undefined)
        descriptor.hasDynamicOffset = raw.hasDynamicOffset;
    if (raw.minBindingSize !== undefined)
        descriptor.minBindingSize = raw.minBindingSize;

    return descriptor;
}

/**
 * Parses a sampler from a JSON object
 *      { "type": "filtering" }
 * @param {JSON Object} raw Raw sampler object
 * @returns {GPUSamplerDescriptor} Sampler descriptor
 * 
 * @author Claude-AI-Dev    
 */
function parseSampler(raw) {
    return {
        type: lookup(SAMPLER_TYPE_MAP, raw.type ?? "filtering", "sampler.type"),
    };
}

/**
 * Parses a texture from a JSON object
 *     { "sampleType": "float", "viewDimension": "2d", "multisampled": false }
 * @param {JSON Object} raw Raw texture object
 * @returns {GPUTextureDescriptor} Texture descriptor
 * 
 * @author Claude-AI-Dev    
 */
function parseTexture(raw) {
    const descriptor = {};
    if (raw.sampleType !== undefined)
        descriptor.sampleType = lookup(TEXTURE_SAMPLE_TYPE_MAP, raw.sampleType, "texture.sampleType");
    if (raw.viewDimension !== undefined)
        descriptor.viewDimension = lookup(TEXTURE_VIEW_DIMENSION_MAP, raw.viewDimension, "texture.viewDimension");
    if (raw.multisampled !== undefined)
        descriptor.multisampled = raw.multisampled;

    return descriptor;
}

/**
 * Parses a storage texture from a JSON object
 *      { "access": "write-only", "format": "rgba8unorm", "viewDimension": "2d" }
 * @param {JSON Object} raw Raw storage texture object
 * @returns {GPUStorageTextureDescriptor} Storage texture descriptor
 * 
 * @author Claude-AI-Dev    
 */
function parseStorageTexture(raw) {
    if (!raw.format)
        throw new Error('WebGPU-API-Private::parseStorageTexture:: storageTexture requires "format".');

    const descriptor = {
        access: lookup(STORAGE_TEXTURE_ACCESS_MAP, raw.access ?? "write-only", "storageTexture.access"),
        format: raw.format,
    };

    if (raw.viewDimension !== undefined)
        descriptor.viewDimension = lookup(TEXTURE_VIEW_DIMENSION_MAP, raw.viewDimension, "storageTexture.viewDimension");

    return descriptor;
}

/**
 * Parses a single entry from the JSON and returns a GPUBindGroupLayoutEntry
 * @param {JSON Object} entry Raw entry object
 * @returns {GPUBindGroupLayoutEntry} Bind group layout entry
 * 
 * @author Claude-AI-Dev    
 */
function parseEntry(entry) {
    const binding = parseInt(entry.binding, 10);
    const visibility = parseVisibility(entry.visibility);

    if (isNaN(binding)) {
        throw new Error(`WebGPU-API-Private::parseEntry:: "binding" invalid: "${entry.binding}"`);
    }

    const result = { binding, visibility };

    // Detects the type of the resource
    if (entry.buffer)
        result.buffer = parseBuffer(entry.buffer);
    else if (entry.sampler)
        result.sampler = parseSampler(entry.sampler);
    else if (entry.texture)
        result.texture = parseTexture(entry.texture);
    else if (entry.storageTexture)
        result.storageTexture = parseStorageTexture(entry.storageTexture);
    else
        throw new Error(`WebGPU-API-Private::parseEntry:: The entry with binding ${binding} has no resource type (buffer, sampler, texture, storageTexture).`);

    return result;
}

//------------------------------------ OBJ Files -----------------------------------------

/**
 * Parse the materials from the obj file
 * @param {string} textLib The content of the MTL file.
 * @returns {Map<string, Material>} A map of materials.
 * 
 * @author Martin Melendez Blas
 */
function parseLib(textLib) {
    var material = null;
    var materials = [];

    function setMaterial(parts) {
        material = {
            Kd: [0, 0, 0],
            Ka: [0, 0, 0],
            Ks: [0, 0, 0],
            Ke: [0, 0, 0],
            Ni: 0,
            Ns: 0,
            d: 0,
            illum: 1.0,
            map_Kd: ""
        };

        materials[parts[0]] = material;
    }

    const keywords = {
        Kd(parts) {
            material.Kd = parts.map(parseFloat);
        },
        Ka(parts) {
            material.Ka = parts.map(parseFloat);
        },
        Ks(parts) {
            material.Ks = parts.map(parseFloat);
        },
        Ke(parts) {
            material.Ke = parts.map(parseFloat);
        },
        Ns(parts) {
            material.Ns = parseFloat(parts[0]);
        },
        Ni(parts) {
            material.Ni = parseFloat(parts[0]);
        },
        d(parts) {
            material.d = parseFloat(parts[0]);
        },
        illum(parts) {
            material.illum = parts[0];
        },
        map_Kd(parts) {
            material.map_Kd = parts[0] + "";
        },
        newmtl(parts) {
            setMaterial(parts);
        }
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = textLib.split('\n');

    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();

        if (line === '' || line.startsWith('#')) {
            continue;
        }

        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }

        const [, keyword2, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword2];

        if (!handler) {
            console.warn('unhandled keyword:', keyword2);  // eslint-disable-line no-console
            continue;
        }

        handler(parts, unparsedArgs);
    }

    return materials;
};

/**
 * Parses an OBJ file.
 * @param {string} text The content of the OBJ file.
 * @returns {Promise<Object>} The parsed OBJ data.
 */
async function parseOBJ(text) {
    // because indices are base 1 let's just fill in the 0th data
    const objPositions = [[0, 0, 0]];
    const objTexcoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];
    const objColors = [[0, 0, 0]];

    // same order as `f` indices
    const objVertexData = [
        objPositions,
        objTexcoords,
        objNormals,
        objColors,
    ];

    // same order as `f` indices
    let webglVertexData = [
        [],   // positions
        [],   // texcoords
        [],   // normals
        [],   // colors
    ];

    const materialLibs = [];
    const geometries = [];
    let geometry;
    let groups = ['default'];
    let material = 'default';
    let object = 'default';

    const noop = () => { };

    function newGeometry() {
        // If there is an existing geometry and it's
        // not empty then start a new one.
        if (geometry && geometry.data.position.length) {
            geometry = undefined;
        }
    }

    function setGeometry() {
        if (!geometry) {
            const position = [];
            const texcoord = [];
            const normal = [];
            const color = [];

            webglVertexData = [
                position,
                texcoord,
                normal,
                color,
            ];

            geometry = {
                object,
                groups,
                material,
                data: {
                    position,
                    texcoord,
                    normal,
                    color,
                },
            };

            geometries.push(geometry);
        }
    }

    function addVertex(vert) {
        const ptn = vert.split('/');
        ptn.forEach((objIndexStr, i) => {
            if (!objIndexStr) {
                return;
            }

            const objIndex = parseInt(objIndexStr);
            const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);

            webglVertexData[i].push(...objVertexData[i][index]);

            // if this is the position index (index 0) and we parsed
            // vertex colors then copy the vertex colors to the webgl vertex color data
            if (i === 0 && objColors.length > 1) {
                geometry.data.color.push(...objColors[index]);
            }
        });
    }

    const keywords = {
        v(parts) {
            // if there are more than 3 values here they are vertex colors
            if (parts.length > 3) {
                objPositions.push(parts.slice(0, 3).map(parseFloat));
                objColors.push(parts.slice(3).map(parseFloat));
            } else {
                objPositions.push(parts.map(parseFloat));
            }
        },
        vn(parts) {
            objNormals.push(parts.map(parseFloat));
        },
        vt(parts) {
            // should check for missing v and extra w?
            objTexcoords.push(parts.slice(0, 2).map(parseFloat));
        },
        f(parts) {
            setGeometry();
            const numTriangles = parts.length - 2;
            for (let tri = 0; tri < numTriangles; ++tri) {
                addVertex(parts[0]);
                addVertex(parts[tri + 1]);
                addVertex(parts[tri + 2]);
            }
        },
        s: noop,    // smoothing group
        mtllib(parts, unparsedArgs) {
            // the spec says there can be multiple filenames here
            // but many exist with spaces in a single filename
            materialLibs.push(unparsedArgs);
        },
        usemtl(parts, unparsedArgs) {
            material = unparsedArgs;
            newGeometry();
        },
        g(parts) {
            groups = parts;
            newGeometry();
        },
        o(parts, unparsedArgs) {
            object = unparsedArgs;
            newGeometry();
        },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
            continue;
        }

        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }

        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
            continue;
        }

        handler(parts, unparsedArgs);
    }

    // remove any arrays that have no entries.
    for (const geometry of geometries) {
        geometry.data = Object.fromEntries(
            Object.entries(geometry.data).filter(([, array]) => array.length > 0));
    }

    return {
        geometries,
        materialLibs,
    };
}