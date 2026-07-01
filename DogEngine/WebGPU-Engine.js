
(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

/**
 * Function taken in Geeks for Geeks
 * https://www.geeksforgeeks.org/how-to-include-a-javascript-file-in-another-javascript-file/
 * @param {string} file Path and name of the js file
 */
function include(file) {
    let script = document.createElement('script');
    script.src = file;
    script.type = 'text/javascript';
    script.defer = true;

    document.getElementsByTagName('head').item(0).appendChild(script);
}

//----------- Include other js files here ----------------
include("/DogEngine/dataStructures/GeeksNode.js");
include("/DogEngine/dataStructures/GeeksQueue.js");

include("/DogEngine/DogResource.js");
include("/DogEngine/DogBuffer.js");
include("/DogEngine/DogTexture.js");
include("/DogEngine/DogSampler.js");
include("/DogEngine/DogMaterial.js");
include("/DogEngine/DogTransform.js");
include("/DogEngine/DogMesh.js");

include("/DogEngine/DogResourceManager.js");
include("/DogEngine/bounding/DogBoundingVolume.js");
include("/DogEngine/bounding/DogBoundingSphere.js");
include("/DogEngine/bounding/DogBoundingBox.js");
include("/DogEngine/input/KeyCode.js");

include("/DogEngine/WebGPU-API-Private.js");
//-------------------------------------------------------

//----------- Enums and global variables here ----------------
/**
 * Options to topology an object.
 */
const TopologyMode = Object.freeze({
    TriangleList: "triangle-list",
    LineList: "line-list",
    PointList: "point-list"
});

/**
 * Options to cull an object.
 */
const CullMode = Object.freeze({
    Back: "back",
    Front: "front",
    None: "none"
});

/**
 * Options to define the front face of an object.
 */
const FrontFaceMode = Object.freeze({
    Ccw: "ccw",
    Cw: "cw"
});

/**
 * Buffer types for vertex and index buffers.
 */
const BufferType = Object.freeze({
    Vertex: "vertex",
    Index: "index",
    Data: "data"
});

/**
 * Types of bounding volumes for collision detection.
 */
const BoundingVolumeType = Object.freeze({
    None: 0,
    Sphere: 1,
    Box: 2
});

/**
 * Visibility on GPU
 */
const GPUVisibility = Object.freeze({
    Vertex: GPUShaderStage.VERTEX,
    Fragment: GPUShaderStage.FRAGMENT
});

//------------------------------------------------------------

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function () {
            return factory.call(root);
        });
    } else {
        // Browser globals
        root.webGPUengine = factory.call(root);
    }
}(this, function () {
    "use strict";

    const topWindow = this;

    /**
     * Initializes WebGPU on a given canvas element
     * @param {HTMLCanvasElement} canvas Canvas element to initialize WebGPU on
     * @returns 
     */
    async function initWebGPU(canvas) {
        if (!navigator.gpu) {
            throw new Error("WebGPU not supported on this browser.");
        }

        const adapter = await navigator.gpu.requestAdapter();
        /*const adapter = await navigator.gpu.requestAdapter({
            //powerPreference: 'high-performance' // <--- Dedicated GPU
            powerPreference: 'low-power' // <--- Integrated GPU
        });*/
        if (!adapter) {
            throw new Error("No appropriate GPUAdapter found.");
        }

        const device = await adapter.requestDevice();
        const context = canvas.getContext("webgpu");
        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
            device: device,
            format: canvasFormat,
        });

        const info = adapter.info;
        console.log(`Dog Engine - Vendor: ${info.vendor}`);      // Ej: "nvidia" o "intel"
        console.log(`Dog Engine - Architecture: ${info.architecture}`);
        console.log(`Dog Engine - Device: ${info.device}`);      // Nombre del modelo (si no está bloqueado por privacidad)
        console.log(`Dog Engine - Description: ${info.description}`);
        console.log("Dog Engine - Max Uniform Buffers per group: ", device.limits.maxUniformBuffersPerShaderStage);
        console.log("Dog Engine - Max Bind Groups simultaneously: ", device.limits.maxBindGroups); // El mínimo garantizado es 4

        return {
            device: device,
            context: context,
            canvasFormat: canvasFormat
        };
    }

    /**
     * Create bind groups based on the input JSON configuration.
     * @param {JSON Object} groups - An array of configuration objects, each containing
     *                               group, binding, and entry information for creating
     *                               bind groups.
     * @returns {string} The name of the bind group.
     */
    function createBindGroup(id, descriptor) {
        const bindGroup = pGraphics.device.createBindGroup(
            descriptor
        );

        let name = "BindGroup" + id;
        resourceManager.addBindGroup(name, bindGroup);

        return name;
    }

    /**
     * Create bind group layouts based on the input JSON configuration.
     * @param {JSON Object} groups - An array of configuration objects, each containing
     *                               group, binding, and entry information for creating
     *                               bind group layouts.
     * 
     * @author Claude-AI-Dev
     */
    function createBindGroupLayouts(groups) {

        for (let i = 0; i < groups.length; i++) {
            let jsonObj = {}
            for (let j = 0; j < groups[i].entries.length; j++) {
                jsonObj = {
                    group: groups[i].group,
                    binding: groups[i].entries[j].binding
                }

                resourceManager.addGroupAndBinding(groups[i].entries[j].name, jsonObj);
            }
        }

        const parsed = parseBindGroupLayouts(groups);

        for (const { group, descriptor } of parsed) {
            let bindGroupLayout = pGraphics.device.createBindGroupLayout(descriptor);
            resourceManager.addBindGroupLayout(group, bindGroupLayout);
        }

        return parsed;
    }

    /**
     * Parse bind group layouts from JSON.
     * @param {JSON Object} json JSON object containing bind group layouts.
     * @returns {Array} Array of parsed bind group layouts.
     * 
     * @author Claude-AI-Dev
     */
    function parseBindGroupLayouts(json) {
        return json.map((block, i) => {
            if (!Array.isArray(block.entries) || block.entries.length === 0) {
                throw new Error(`WebGPU-Engine::parseBindGroupLayouts:: The block ${i} ("${block.label}") does not have entries.`);
            }

            const entries = block.entries.map(parseEntry);

            return {
                label: block.label ?? `BindGroupLayout_${i}`,
                group: block.group ?? i,
                descriptor: { label: block.label, entries },
            };
        });
    }

    /**
     * Create a DogBuffer and stores in the resource manager.
     * @param {name} name Name/Id of the buffer (id of the resource).
     * @param {BufferType} type The type of the buffer.
     * @param {Float32Array | Uint16Array} data The data for the buffer.
     * @param {int} size Size of the buffer. 0 (zero) is the default value.
     * @param {boolean} store Indicates if the buffer has to add to the resource manager.
     * @returns {string} The name/id of the buffer if the creation and stores in the resource manager is ok, "-1"
     * otherwise.
     */
    function createDogBuffer(name, type, data, size = 0, store = false) {
        try {
            const b = resourceManager.get(name);
            if (b != null) {
                b.addReference();

                return name;
            }
        } catch (error) {
            console.log("WebGPU-Engine::createDogBuffer:: The resource manager is not initialized." + error);
        }

        const buffer = new DogBuffer(name, type, data, size);
        buffer.addReference();

        if (store) {
            try {
                resourceManager.add(name, buffer);
            }
            catch (error) {
                console.log("The resource " + name + " cannot add to resource manager." + error);

                return "-1";
            }
        } else {
            return buffer;
        }

        return name;
    }

    /**
     * Get the content of shader file
     * @param {string} fileName Path and name of the file
     * @returns {string} The content of the file
     */
    async function readTextFromFile(fileName) {
        var request = new XMLHttpRequest();

        request.onreadystatechange = await function () {
            debugger;
            if (request.readyState === 4 && request.status !== 404) {
                return request.responseText;
            }
        }

        request.open('GET', fileName, true); // Create a request to acquire the file
        request.send();                      // Send the request
    }

    /*async function loadShaderFromFile(fileName) {
        debugger;
        try {
            const response = await fetch(fileName);
            const fileString = await response.text(); 
            console.log(fileString);
        } catch (error) {
            console.error('Fetch failed:', error);
        }
    }*/

    /**
     * Read a file as JSON.
     * @param {string} fileName Path and name of the file
     * @returns {JSON Object} The JSON object
     */
    async function readFileAsJson(fileName) {
        try {
            // 1. Fetch the file relative to your script location
            const response = await fetch(fileName);

            // 2. Direct conversion from file stream to JavaScript object
            const json = await response.json();

            return json;
        } catch (error) {
            console.error("Could not read the file as JSON:", error);
        }
    }

    /**
     * Read a file as text.
     * @param {string} fileName Path and name of the file
     * @returns {string} The content of the file
     */
    async function readFileAsText(fileName) {
        try {
            const response = await fetch(fileName);

            return response.text();
        } catch (error) {
            console.error("Could not read the file as text:", error);
        }
    }

    /**
     * Create a DogTexture and stores in the resource manager. If the texture already exists in the resource manager, 
     * increase the number of references and it will be returned.
     * @param {string} fileName Name/Id of the texture (id of the resource).
     * @returns {DogTexture} The texture if the creation and stores in the resource manager is ok, null otherwise.
     */
    async function createDogTextureFromImage(fileName) {
        let index = fileName.length;
        while (fileName[index] != "/")
            index--;

        const name = fileName.substring(index + 1, fileName.length);

        let texture = resourceManager.get(name);
        if (texture !== undefined && texture != null) {
            texture.addReference();

            return texture;
        }

        const response = await fetch(fileName);
        const imageBitmap = await createImageBitmap(await response.blob());

        let gpuTexture = pGraphics.device.createTexture({
            label: name,
            size: [imageBitmap.width, imageBitmap.height, 1],
            format: 'rgba8unorm',//'bgra8unorm', //'rgba8unorm-srgb', //'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });

        pGraphics.device.queue.copyExternalImageToTexture(
            { source: imageBitmap },//, flipY: true },
            { texture: gpuTexture },
            [imageBitmap.width, imageBitmap.height]
        );

        texture = new DogTexture(name);
        texture.setGPUTexture(gpuTexture);
        texture.setWidthAndHeight(imageBitmap.width, imageBitmap.height);
        texture.setFormat(gpuTexture.format);
        texture.addReference();

        resourceManager.add(name, texture);

        return texture;
    }

    /**
     * Creates a dummy white texture. Only creates if the dummy texture does not exist in the resource manager.
     * The size of this texture is 1 pixel.
     * @returns {DogTexture} The dummy texture.
     */
    function createDummyTexture() {
        let name = "dummy-dog-texture";
        let texture = resourceManager.get(name);
        if (texture !== undefined && texture != null) {
            texture.addReference();
            return texture;
        }

        let gpuTexture = pGraphics.device.createTexture({
            label: name,
            size: [1, 1, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });

        pGraphics.device.queue.copyExternalImageToTexture(
            { source: new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1) },
            { texture: gpuTexture },
            [1, 1]
        );

        texture = new DogTexture(name);
        texture.setGPUTexture(gpuTexture);
        texture.setWidthAndHeight(1, 1);
        texture.setFormat(gpuTexture.format);
        texture.addReference();

        resourceManager.add(name, texture);

        return texture;
    }

    /**
     * Creates a dog texture.
     * @param {string} name Name/Id of the texture (id of the resource).
     * @param {GPUTextureDescriptor} descriptor The descriptor of the texture.
     * @returns {DogTexture} The texture.
     */
    function createDogTexture(name, descriptor) {
        const gpuTexture = pGraphics.device.createTexture({
            label: name,
            size: descriptor.size,
            format: descriptor.format,
            usage: descriptor.usage,
        });

        const texture = new DogTexture(name);
        texture.setGPUTexture(gpuTexture);
        texture.setWidthAndHeight(descriptor.size[0], descriptor.size[1]);
        texture.setFormat(descriptor.format);
        texture.addReference();

        resourceManager.add(name, texture);

        return texture;
    }

    /**
     * Creates a dummy white material. Only creates if the dummy material does not exist in the resource manager.
     * @param {boolean} createBuffer If the buffer should be created.
     * @param {boolean} createBindGroup If the bind group should be created.
     * @returns {DogMaterial} The dummy material.
     */
    function createDefaultMaterial(name, createBuffer = true, createBindGroup = true) {
        let material = resourceManager.get(name);
        if (material !== undefined && material != null) {
            material.addReference();

            return material;
        }

        material = new DogMaterial(name, createBuffer, createBindGroup);
        material.setDiffuseColor([0.7, 0.7, 0.7, 1.0]);
        material.setSpecularColor([0.5, 0.5, 0.5, 1.0]);
        material.setAmbientColor([0.2, 0.2, 0.2, 1.0]);
        material.setEmissiveColor([0.0, 0.0, 0.0, 1.0]);
        material.setSpecularPower(20.0);
        material.setTransparency(1.0);
        material.setOpticalDensity(0.0)
        material.setRoughness(0.5)
        material.setMetallness(0.5)
        material.setHasTexture(false)
        material.setFresnel(0.0)
        material.addReference();

        resourceManager.add(name, material);

        return material;
    }

    /**
     * Create a DogSampler and stores in the resource manager. If the sampler already exists in the resource manager, 
     * increase the number of references and it will be returned.
     * @param {string} name Name/Id of the sampler (id of the resource).
     * @param {object} config Configuration of the sampler. 
     *                      The configuration object has the following properties:
     * @param config.addressModeU {string} Address mode for the U coordinate. (default: "")
     * @param config.addressModeV {string} Address mode for the V coordinate. (default: "")
     * @param config.magFilter {string} Magnification filter. (default: "")
     * @param config.minFilter {string} Minification filter. (default: "")
     * @param config.mipmapFilter {string} Mipmap filter. (default: "")
     * @returns {DogSampler} The sampler if the creation and stores in the resource manager is ok, null otherwise.
     */
    function createDogSampler(name, config = {}) {
        const amu = config.addressModeU || "";
        const amv = config.addressModeV || "";
        const maf = config.magFilter || "";
        const mif = config.minFilter || "";
        const mm = config.mipmapFilter || "";

        if (name === undefined || name == null || name == "") {
            name = "amu-" + amu.substring(0, 2) +
                "amv-" + amv.substring(0, 2) +
                "maf-" + maf.substring(0, 2) +
                "mif-" + mif.substring(0, 2) +
                "mm-" + mm.substring(0, 2);
        }

        if (resourceManager.get(name) !== undefined && resourceManager.get(name) !== null) {
            const sampler = resourceManager.get(name);
            sampler.addReference();

            return sampler;
        }

        const sampler = new DogSampler(name, config);
        sampler.addReference();

        resourceManager.add(name, sampler);

        return sampler;
    }

    /**
     * Creates a new static mesh from an OBJ file. The MTL file must be in the same directory.
     * @param {string} fileName The path to the OBJ file.
     * @returns {DogStaticMesh} The static mesh if the creation and stores in the resource manager is ok, null otherwise.
     */
    async function createMeshByObjFile(fileName) {
        let text = await readFileAsText(fileName);
        let obj = await parseOBJ(text);

        let staticMesh = new DogStaticMesh();

        /** Load Materials */
        let basePath = "";
        let index = fileName.length;
        while (fileName[index] != "/")
            index--;

        basePath = fileName.substring(0, index + 1);
        let name = fileName.substring(index + 1, fileName.length);

        let materials = [];
        for (let i = 0; i < obj.materialLibs.length; i++) {
            let response = await fetch(basePath + obj.materialLibs[i]);
            let text = await response.text();
            materials = parseLib(text);
        }

        let lenMaterials = Object.keys(materials).length;
        if (lenMaterials == 0) {
            lenMaterials = 1;
        }

        const bufferSizeMaterial = 24 * 4 * lenMaterials;
        let idBufferMaterial = createDogBuffer(name + "-buffer-material", BufferType.Data, null, bufferSizeMaterial, true);

        let iMaterial = 0;
        for (let m in materials) {
            const mat = materials[m];

            let material = new DogMaterial(m.toString(), false, false);
            material.setAmbientColor([mat.Ka[0], mat.Ka[1], mat.Ka[2], 1.0]);
            material.setDiffuseColor([mat.Kd[0], mat.Kd[1], mat.Kd[2], 1.0]);
            material.setSpecularColor([mat.Ks[0], mat.Ks[1], mat.Ks[2], 1.0]);
            material.setEmissiveColor([mat.Ke[0], mat.Ke[1], mat.Ke[2], 1.0]);
            material.setTransparency(mat.d);
            material.setSpecularPower(mat.Ns);
            material.setOpticalDensity(mat.Ni);
            material.setIdBuffer(idBufferMaterial);
            material.setBufferOffset(24 * 4 * iMaterial++);

            let texture = null;
            if (mat.map_Kd !== undefined && mat.map_Kd != "") {
                texture = await createDogTextureFromImage(basePath + mat.map_Kd);
            } else {
                texture = createDummyTexture();
            }

            material.setDiffuseTextureIndex(texture.getName());
            material.setHasTexture(true);

            let sampler = createDogSampler(null, { magFilter: 'linear', minFilter: 'linear' });
            texture.setIdSampler(sampler.getName());

            const jsonMaterial = {
                label: "Material Bind Group",
                layout: resourceManager.getBindGroupLayout(2),
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: material.getBuffer().getWebGPUBuffer() }
                    },
                    {
                        binding: 1,
                        resource: texture.getGPUTextureView()
                    },
                    {
                        binding: 2,
                        resource: sampler.getGPUSampler()
                    }
                ]
            };

            let idBindGroupMaterial = webGPUengine.createBindGroup(resourceManager.getCounter(), jsonMaterial);

            material.setIdBindGroup(idBindGroupMaterial);

            resourceManager.add(material.getName(), material);
        }

        let nameMaterial = name + "-default-material";
        if (iMaterial == 0) {
            let texture = createDummyTexture();

            let material = createDefaultMaterial(nameMaterial, false, false);
            material.setIdBuffer(idBufferMaterial);

            material.setDiffuseTextureIndex(texture.getName());
            material.setHasTexture(true);

            let sampler = createDogSampler(null, { magFilter: 'linear', minFilter: 'linear' });
            texture.setIdSampler(sampler.getName());

            const jsonMaterial = {
                label: "Material Bind Group",
                layout: resourceManager.getBindGroupLayout(2),
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: material.getBuffer().getWebGPUBuffer() }
                    },
                    {
                        binding: 1,
                        resource: texture.getGPUTextureView()
                    },
                    {
                        binding: 2,
                        resource: sampler.getGPUSampler()
                    }
                ]
            };

            let idBindGroupMaterial = webGPUengine.createBindGroup(resourceManager.getCounter(), jsonMaterial);

            material.setIdBindGroup(idBindGroupMaterial);
        }

        /** Load geometry */
        const bufferSizeMeshes = 16 * 4 * obj.geometries.length;
        let idBufferMeshes = createDogBuffer(name + "-buffer-meshes", BufferType.Data, null, bufferSizeMeshes, true);

        const jsonMeshes = {
            label: "Meshes Bind Group",
            layout: resourceManager.getBindGroupLayout(3),
            entries: [
                {
                    binding: 0,
                    resource: { buffer: resourceManager.get(idBufferMeshes).getWebGPUBuffer() }
                }
            ]
        };

        let idBindGroupMeshes = webGPUengine.createBindGroup(resourceManager.getCounter(), jsonMeshes);

        let vertices = [];
        for (let i = 0; i < obj.geometries.length; i++) {
            let numVertices = obj.geometries[i].data.position.length / 3;
            let baseVertex = (vertices.length > 0) ? vertices.length / 8 : 0;
            let iTex = 0;

            for (let j = 0; j < obj.geometries[i].data.position.length; j += 3) {
                vertices.push(obj.geometries[i].data.position[j]);
                vertices.push(obj.geometries[i].data.position[j + 1]);
                vertices.push(obj.geometries[i].data.position[j + 2]);
                vertices.push(obj.geometries[i].data.normal[j]);
                vertices.push(obj.geometries[i].data.normal[j + 1]);
                vertices.push(obj.geometries[i].data.normal[j + 2]);

                if (obj.geometries[i].data.texcoord !== undefined && obj.geometries[i].data.texcoord != null) {
                    vertices.push(obj.geometries[i].data.texcoord[iTex++]);
                    vertices.push(obj.geometries[i].data.texcoord[iTex++]);
                } else {
                    vertices.push(0.0);
                    vertices.push(0.0);
                }
            }

            let mesh = new DogMesh(obj.geometries[i].object, false, false);
            mesh.setNumVertices(numVertices);
            mesh.setBaseVertex(baseVertex);
            mesh.setFirstVertex(baseVertex);
            mesh.setIdMaterial(iMaterial == 0 ? nameMaterial : obj.geometries[i].material);
            mesh.setIdBuffer(idBufferMeshes);
            mesh.setIdBindGroup(idBindGroupMeshes);
            //submesh.setBoundingVolume(bounding);

            staticMesh.addMesh(mesh);
        }

        webGPUengine.createDogBuffer("Vb-" + name, BufferType.Vertex, new Float32Array(vertices), 0, true);

        staticMesh.setIdVertexBuffer("Vb-" + name);

        return staticMesh;
    }

    /**
     * Create a shader module from the provided shader source code.
     * @param {string} shaderSource Source of vextex and fragment shaders in WGSL.
     * @returns {GPUShaderModule} Shader module created from the provided source code.
     */
    function createShaderModule(name, shaderSource) {
        const shaderModule = pGraphics.device.createShaderModule({
            label: name,
            code: shaderSource
        });

        return shaderModule;
    }

    /**
     * Create a vertex buffer layout based on the provided vertex layout definition.
     * @param {GPUVertexBufferLayout} vertexLayout Layout definition for the vertex buffer, 
     * where each key is an attribute name and value is an object with a 'size' property indicating 
     * the number of components (e.g., { position: { size: 3 }, color: { size: 4 } }).
     * @returns {GPUVertexBufferLayout} Vertex buffer layout compatible with WebGPU pipeline creation.
     */
    function createVertexBufferLayout(vertexLayout) {
        var attributes = [];
        var offset = 0;
        var location = 0;
        var stride = 0;

        for (const [key, value] of Object.entries(vertexLayout)) {
            //console.log(`${key}: ${value}`);
            attributes.push({
                format: "float32x" + value,
                offset: offset,
                shaderLocation: location
            });

            location++;
            offset += value * 4; // offset in bytes (value * 4 bytes per float)
            stride += value;
        }

        const vertexBufferLayout = {
            arrayStride: stride * 4, // stride * 4 bytes per float
            attributes: attributes,
        };

        return vertexBufferLayout;
    }

    return {
        initWebGPU: initWebGPU,
        createBindGroupLayouts: createBindGroupLayouts,
        parseBindGroupLayouts: parseBindGroupLayouts,
        createBindGroup: createBindGroup,
        createDogBuffer: createDogBuffer,
        readTextFromFile: readTextFromFile,
        readFileAsJson: readFileAsJson,
        readFileAsText: readFileAsText,
        createDogTextureFromImage: createDogTextureFromImage,
        createDummyTexture: createDummyTexture,
        createDogTexture: createDogTexture,
        createDogSampler: createDogSampler,
        createDefaultMaterial: createDefaultMaterial,
        createMeshByObjFile: createMeshByObjFile,
        createShaderModule: createShaderModule,
        createVertexBufferLayout: createVertexBufferLayout
    }

})
);