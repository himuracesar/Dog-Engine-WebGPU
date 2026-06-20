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
    if (raw.sampleType !== undefined) descriptor.sampleType = lookup(TEXTURE_SAMPLE_TYPE_MAP, raw.sampleType, "texture.sampleType");
    if (raw.viewDimension !== undefined) descriptor.viewDimension = lookup(TEXTURE_VIEW_DIMENSION_MAP, raw.viewDimension, "texture.viewDimension");
    if (raw.multisampled !== undefined) descriptor.multisampled = raw.multisampled;
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

    if (raw.viewDimension !== undefined) descriptor.viewDimension = lookup(TEXTURE_VIEW_DIMENSION_MAP, raw.viewDimension, "storageTexture.viewDimension");
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
    if (entry.buffer) result.buffer = parseBuffer(entry.buffer);
    else if (entry.sampler) result.sampler = parseSampler(entry.sampler);
    else if (entry.texture) result.texture = parseTexture(entry.texture);
    else if (entry.storageTexture) result.storageTexture = parseStorageTexture(entry.storageTexture);
    else throw new Error(`WebGPU-API-Private::parseEntry:: The entry with binding ${binding} has no resource type (buffer, sampler, texture, storageTexture).`);

    return result;
}