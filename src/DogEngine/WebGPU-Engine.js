
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
include("/src/DogEngine/dataStructures/GeeksNode.js");
include("/src/DogEngine/dataStructures/GeeksQueue.js");

include("/src/DogEngine/DogResource.js");
include("/src/DogEngine/DogBuffer.js");
include("/src/DogEngine/DogTexture.js");
include("/src/DogEngine/DogSampler.js");
include("/src/DogEngine/DogMaterial.js");
include("/src/DogEngine/DogTransform.js");
include("/src/DogEngine/DogMesh.js");

include("/src/DogEngine/DogResourceManager.js");
include("/src/DogEngine/bounding/DogBoundingVolume.js");
include("/src/DogEngine/bounding/DogBoundingSphere.js");
include("/src/DogEngine/bounding/DogBoundingBox.js");
include("/src/DogEngine/input/KeyCode.js");

include("/src/DogEngine/WebGPU-API-Private.js");
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

        /******
         // Get the device pixel ratio (default to 1 if undefined)
            const dpr = window.devicePixelRatio || 1;

            // Calculate actual screen pixel dimensions
            const width = Math.floor(canvas.clientWidth * dpr);
            const height = Math.floor(canvas.clientHeight * dpr);

            // Update canvas internal drawing buffer size
            canvas.width = width;
            canvas.height = height;

            // Configure your WebGPU context texture size
            const context = canvas.getContext("webgpu");
            context.configure({
                device: device,
                format: navigator.gpu.getPreferredCanvasFormat(),
                alphaMode: 'opaque',
                size: [width, height], // Must match canvas.width/height
            });

            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    // Math.floor prevents subpixel rounding bugs
                    const dpr = window.devicePixelRatio || 1;
                    const width = Math.floor(entry.contentRect.width * dpr);
                    const height = Math.floor(entry.contentRect.height * dpr);
        
                    // Trigger your WebGPU canvas.width/height update 
                    // and re-run context.configure() with the new size
                    resizeCanvasAndStorageTextures(width, height);
                }
            });

            // Watch your canvas element
            resizeObserver.observe(canvas);
         */

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
     * @param {string} id - Name or Id of the bind group.
     * @param {JSON Object} descriptor - Descriptor for creating the bind group.
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
    async function createDogTextureFromImage(fileName, flipY = false) {
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
            { source: imageBitmap, flipY: flipY },
            { texture: gpuTexture },
            [imageBitmap.width, imageBitmap.height]
        );

        texture = new DogTexture(name);
        texture.setWebGPUTexture(gpuTexture);
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
        texture.setWebGPUTexture(gpuTexture);
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
        texture.setWebGPUTexture(gpuTexture);
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
     * @param {object} descriptor Configuration of the sampler. 
     *                      The descriptor object has the following properties:
     * @param descriptor.addressModeU {string} Address mode for the U coordinate. (default: "")
     * @param descriptor.addressModeV {string} Address mode for the V coordinate. (default: "")
     * @param descriptor.magFilter {string} Magnification filter. (default: "")
     * @param descriptor.minFilter {string} Minification filter. (default: "")
     * @param descriptor.mipmapFilter {string} Mipmap filter. (default: "")
     * @param descriptor.compare {string} Comparison function. (default: undefined)
     * @returns {DogSampler} The sampler if the creation and stores in the resource manager is ok, null otherwise.
     */
    function createDogSampler(name, descriptor = {}) {
        const amu = descriptor.addressModeU || "";
        const amv = descriptor.addressModeV || "";
        const maf = descriptor.magFilter || "";
        const mif = descriptor.minFilter || "";
        const mm = descriptor.mipmapFilter || "";
        const compare = descriptor.compare || "";

        if (name === undefined || name == null || name == "") {
            name = "";
            if (amu != "")
                name += "amu-" + amu.substring(0, 2);
            if (amv != "")
                name += "amv-" + amv.substring(0, 2);
            if (maf != "")
                name += "maf-" + maf.substring(0, 2);
            if (mif != "")
                name += "mif-" + mif.substring(0, 2);
            if (mm != "")
                name += "mm-" + mm.substring(0, 2);
            if (compare != "")
                name += "cmp-" + compare;
        }

        if (resourceManager.get(name) !== undefined && resourceManager.get(name) !== null) {
            const sampler = resourceManager.get(name);
            sampler.addReference();

            return sampler;
        }

        const sampler = new DogSampler(name, descriptor);
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
                        resource: texture.getWebGPUTextureView()
                    },
                    {
                        binding: 2,
                        resource: sampler.getWebGPUSampler()
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
                        resource: texture.getWebGPUTextureView()
                    },
                    {
                        binding: 2,
                        resource: sampler.getWebGPUSampler()
                    }
                ]
            };

            let idBindGroupMaterial = webGPUengine.createBindGroup(resourceManager.getCounter(), jsonMaterial);

            material.setIdBindGroup(idBindGroupMaterial);
        }

        /** Bind group for transformation matrix */
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
     * Create a static mesh from a glTF or glb file.
     * @param {string} name Name of the mesh. This will be the ID to refer the mesh.
     * @param {string} fileName File name of the mesh.
     * @returns {DogStaticMesh} The static mesh.
     */
    async function createMeshByGltfFile(name, fileName) {
        let index = fileName.length;
        while (fileName[index] != "/")
            index--;

        let basePath = fileName.substring(0, index + 1);
        let namef = fileName.substring(index + 1, fileName.length);
        let extensionFile = namef.substring(namef.length - 4, namef.length);

        const { WebIO } = await import('@gltf-transform/core');

        const io = new WebIO();
        const document = await io.read(fileName);
        const root = document.getRoot();

        let vertices = [];
        let indices = [];

        let staticMesh = new DogStaticMesh();
        let countMeshes = 0;
        let indexFormat = '';

        /** Bind group for transformation matrix */
        const bufferSizeMeshes = 16 * 4 * root.listMeshes().length;
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

        // Recorrer las mallas del archivo glTF
        for (const mesh of root.listMeshes()) {
            for (const primitive of mesh.listPrimitives()) {
                // 1. Extraer los datos de Atributos de Vértices
                const positionAttr = primitive.getAttribute('POSITION');
                const normalAttr = primitive.getAttribute('NORMAL');
                const uvAttr = primitive.getAttribute('TEXCOORD_0');

                const positionArray = positionAttr.getArray(); // Float32Array
                const normalArray = normalAttr ? normalAttr.getArray() : null; // Float32Array
                const uvArray = uvAttr ? uvAttr.getArray() : null; // Float32Array

                let baseVertex = (vertices.length > 0) ? vertices.length / 8 : 0;
                let iTex = 0;

                for (let i = 0; i < positionArray.length; i += 3) {
                    vertices.push(positionArray[i]);
                    vertices.push(positionArray[i + 1]);
                    vertices.push(positionArray[i + 2]);
                    vertices.push(normalArray[i]);
                    vertices.push(normalArray[i + 1]);
                    vertices.push(normalArray[i + 2]);

                    if (uvArray != null && typeof uvArray != undefined && uvArray.length > 0) {
                        vertices.push(uvArray[iTex++]);
                        vertices.push(uvArray[iTex++]);
                    } else {
                        vertices.push(0.0);
                        vertices.push(0.0);
                    }
                }

                let numVertices = positionArray.length / 3;

                let numIndices = 0;
                let firstIndex = 0;

                // 3. Extraer Índices (si la geometría está indexada)
                const indicesAttr = primitive.getIndices();

                if (indicesAttr) {
                    const indicesArray = indicesAttr.getArray(); // Uint16Array o Uint32Array
                    indexFormat = indicesArray instanceof Uint16Array ? 'uint16' : 'uint32';

                    numIndices = indicesArray.length;
                    firstIndex = indices.length;
                    for (let i = 0; i < indicesArray.length; i++) {
                        indices.push(indicesArray[i]);
                    }
                }

                let material = null;
                let nameMaterial = "";
                const materialGltf = primitive.getMaterial();
                if (materialGltf) {
                    nameMaterial = (materialGltf && materialGltf.getName()) ? materialGltf.getName() : name + "-material";
                    // 1. Propiedades PBR básicas (Metallic-Roughness)
                    const baseColorFactor = materialGltf.getBaseColorFactor(); // [R, G, B, A] (0.0 a 1.0)
                    const roughnessFactor = materialGltf.getRoughnessFactor(); // 0.0 (liso) a 1.0 (rugoso)
                    const metallicFactor = materialGltf.getMetallicFactor();   // 0.0 (dieléctrico) a 1.0 (metálico)
                    const emissiveFactor = materialGltf.getEmissiveFactor();   // [R, G, B]

                    material = new DogMaterial(nameMaterial, true, false);
                    material.setDiffuseColor([baseColorFactor[0], baseColorFactor[1], baseColorFactor[2], baseColorFactor[3]]);
                    material.setSpecularColor([1.0, 1.0, 1.0, 1.0]);
                    material.setAmbientColor([baseColorFactor[0] / 10.0, baseColorFactor[1] / 10.0, baseColorFactor[2] / 10.0, 1.0]);
                    material.setRoughness(roughnessFactor);
                    material.setMetallic(metallicFactor);
                    material.setEmissiveColor([emissiveFactor[0], emissiveFactor[1], emissiveFactor[2], 1.0]);

                    // 2. Extracción de Texturas asociadas a este material
                    // Cada textura en glTF-Transform se obtiene mediante slots específicos:
                    const baseColorTex = materialGltf.getBaseColorTexture();
                    if (baseColorTex) {
                        if (extensionFile == "gltf") {
                            const uri = baseColorTex.getURI();
                            baseColorTex.setURI(basePath + uri);

                            let albedoTexture = await webGPUengine.createDogTextureFromImage(basePath + uri);

                            material.setDiffuseTextureIndex(albedoTexture.getName());
                            material.setHasTexture(true);

                            let sampler = createDogSampler(null, { magFilter: 'linear', minFilter: 'linear' });
                            albedoTexture.setIdSampler(sampler.getName());

                            let idBindGroupMaterial = createBGMaterialTexSamp(material, albedoTexture, sampler, 2);
                            material.setIdBindGroup(idBindGroupMaterial);
                        } else { //glb file
                            let albedoTexture = await createDogTextureFromBytes(name + "-albedo", baseColorTex);
                            material.setDiffuseTextureIndex(albedoTexture.getName());
                            //material.setHasTexture(true);

                            let sampler = createDogSampler(null, { magFilter: 'linear', minFilter: 'linear' });
                            albedoTexture.setIdSampler(sampler.getName());

                            let idBindGroupMaterial = createBGMaterialTexSamp(material, albedoTexture, sampler, 2);
                            material.setIdBindGroup(idBindGroupMaterial);

                            console.log("Albedo GLB:: " + countMeshes + " idBindGroup: " + idBindGroupMaterial);
                        }
                    } else {
                        let texture = createDummyTexture();
                        let sampler = createDogSampler(null, { magFilter: 'linear', minFilter: 'linear' });

                        material.setDiffuseTextureIndex(texture.getName());
                        material.setHasTexture(true);

                        texture.setIdSampler(sampler.getName());
                        let idBindGroupMaterial = createBGMaterialTexSamp(material, texture, sampler, 2);
                        material.setIdBindGroup(idBindGroupMaterial);
                    }
                } else {
                    nameMaterial = name + "-default-material";
                    const bufferSizeMaterial = 24 * 4 * 1; //lenMaterials;
                    let idBufferMaterial = createDogBuffer(name + "-buffer-material", BufferType.Data, null, bufferSizeMaterial, true);
                    let texture = createDummyTexture();

                    material = createDefaultMaterial(nameMaterial, false, false);
                    material.setIdBuffer(idBufferMaterial);

                    material.setDiffuseTextureIndex(texture.getName());
                    material.setHasTexture(true);

                    let sampler = createDogSampler(null, { magFilter: 'linear', minFilter: 'linear' });
                    texture.setIdSampler(sampler.getName());

                    let idBindGroupMaterial = createBGMaterialTexSamp(material, texture, sampler, 2);

                    material.setIdBindGroup(idBindGroupMaterial);
                }

                resourceManager.add(material.getName(), material);

                let mesh = new DogMesh(name + countMeshes++, false, false);
                mesh.setNumVertices(numVertices);
                mesh.setBaseVertex(baseVertex);
                mesh.setFirstVertex(baseVertex);
                mesh.setNumIndices(numIndices);
                mesh.setFirstIndex(firstIndex);
                mesh.setIdMaterial(nameMaterial);
                mesh.setIdBuffer(idBufferMeshes);
                mesh.setIdBindGroup(idBindGroupMeshes);

                staticMesh.addMesh(mesh);
            }
        }

        webGPUengine.createDogBuffer("Vb-" + name, BufferType.Vertex, new Float32Array(vertices), 0, true);

        if (indexFormat == 'uint32')
            webGPUengine.createDogBuffer("Ib-" + name, BufferType.Index, new Uint32Array(indices), 0, true);
        else if (indexFormat == 'uint16')
            webGPUengine.createDogBuffer("Ib-" + name, BufferType.Index, new Uint16Array(indices), 0, true);

        staticMesh.setIdVertexBuffer("Vb-" + name);
        staticMesh.setIdIndexBuffer("Ib-" + name);

        return staticMesh;
    }

    /**
     * Creates a DogStaticMesh from a glTF or glb file.
     * @param {string} name The name of the mesh.
     * @param {string} fileName The path to the glTF or glb file.
     * @returns {DogStaticMesh} The created DogStaticMesh.
     */
    async function createMeshByGltfFileV2(name, fileName) {
        let index = fileName.length;
        while (fileName[index] != "/")
            index--;

        let namef = fileName.substring(index + 1, fileName.length);

        const { WebIO } = await import('@gltf-transform/core');

        const io = new WebIO();
        const document = await io.read(fileName);
        const root = document.getRoot();

        const scene = root.getDefaultScene();

        if (!scene) {
            console.log("The file " + name + " doesn't have a default scene.");
            return;
        }

        // The root nodes of the scene
        const rootNodes = scene.listChildren();

        const staticMesh = new DogStaticMesh();
        const helperObj = {};
        helperObj.vertices = [];
        helperObj.indices = [];
        helperObj.indexFormat = '';
        helperObj.countMeshes = 0;
        helperObj.extensionFile = namef.substring(namef.length - 4, namef.length);
        helperObj.basePath = fileName.substring(0, index + 1);

        /** Bind group for transformation matrix */
        const bufferSizeMeshes = 16 * 4 * root.listMeshes().length;
        helperObj.idBufferMeshes = createDogBuffer(name + "-buffer-meshes", BufferType.Data, null, bufferSizeMeshes, true);

        const jsonMeshes = {
            label: "Meshes Bind Group",
            layout: resourceManager.getBindGroupLayout(3),
            entries: [
                {
                    binding: 0,
                    resource: { buffer: resourceManager.get(helperObj.idBufferMeshes).getWebGPUBuffer() }
                }
            ]
        };

        helperObj.idBindGroupMeshes = webGPUengine.createBindGroup(resourceManager.getCounter(), jsonMeshes);

        for (const rootNode of rootNodes) {
            await traverseNode(name, rootNode, -1, staticMesh, helperObj); // RecurSIvidad para el árbol
        }

        webGPUengine.createDogBuffer("Vb-" + name, BufferType.Vertex, new Float32Array(helperObj.vertices), 0, true);

        if (helperObj.indexFormat == 'uint32')
            webGPUengine.createDogBuffer("Ib-" + name, BufferType.Index, new Uint32Array(helperObj.indices), 0, true);
        else if (helperObj.indexFormat == 'uint16')
            webGPUengine.createDogBuffer("Ib-" + name, BufferType.Index, new Uint16Array(helperObj.indices), 0, true);

        staticMesh.setIdVertexBuffer("Vb-" + name);
        staticMesh.setIdIndexBuffer("Ib-" + name);

        return staticMesh;
    }

    /**
     * Traverses a node in the glTF file and creates a DogStaticMesh from it.
     * @param {string} name The name of the mesh.
     * @param {Object} node The node to traverse.
     * @param {number} parent The ID of the parent node.
     * @param {DogStaticMesh} staticMesh The DogStaticMesh to add the mesh to.
     * @param {Object} helperObj The helper object containing the mesh data.
     */
    async function traverseNode(name, node, parent, staticMesh, helperObj) {
        const nodeName = node.getName() || name + '-node';

        helperObj.translation = node.getTranslation();
        helperObj.scale = node.getScale();

        const quaternion = node.getRotation();
        helperObj.rotation = glMatrix.vec3.create();
        quaternionToEuler(helperObj.rotation, quaternion);

        const mesh = node.getMesh();
        if (mesh) {
            await inspectMeshGeometry(name, mesh, parent, staticMesh, helperObj);
            parent = staticMesh.getNumMeshes() - 1;
        }

        for (const child of node.listChildren()) {
            await traverseNode(name, child, parent, staticMesh, helperObj);
        }
    }

    /**
     * Inspects the geometry of a mesh and creates a DogStaticMesh from it.
     * @param {string} name The name of the mesh.
     * @param {Object} mesh The mesh to inspect.
     * @param {number} parent The ID of the parent node.
     * @param {DogStaticMesh} staticMesh The DogStaticMesh to add the mesh to.
     * @param {Object} helperObj The helper object containing the mesh data.
     */
    async function inspectMeshGeometry(name, mesh, parent, staticMesh, helperObj) {
        for (const primitive of mesh.listPrimitives()) {
            const positionAttr = primitive.getAttribute('POSITION');
            const normalAttr = primitive.getAttribute('NORMAL');
            const uvAttr = primitive.getAttribute('TEXCOORD_0');

            const positionArray = positionAttr.getArray(); // Float32Array
            const normalArray = normalAttr ? normalAttr.getArray() : null; // Float32Array
            const uvArray = uvAttr ? uvAttr.getArray() : null; // Float32Array

            let baseVertex = (helperObj.vertices.length > 0) ? helperObj.vertices.length / 8 : 0;
            let iTex = 0;

            for (let i = 0; i < positionArray.length; i += 3) {
                helperObj.vertices.push(positionArray[i]);
                helperObj.vertices.push(positionArray[i + 1]);
                helperObj.vertices.push(positionArray[i + 2]);
                helperObj.vertices.push(normalArray[i]);
                helperObj.vertices.push(normalArray[i + 1]);
                helperObj.vertices.push(normalArray[i + 2]);

                if (uvArray != null && typeof uvArray != undefined && uvArray.length > 0) {
                    helperObj.vertices.push(uvArray[iTex++]);
                    helperObj.vertices.push(uvArray[iTex++]);
                } else {
                    helperObj.vertices.push(0.0);
                    helperObj.vertices.push(0.0);
                }
            }

            let numVertices = positionArray.length / 3;

            let numIndices = 0;
            let firstIndex = 0;

            const indicesAttr = primitive.getIndices();

            if (indicesAttr) {
                const indicesArray = indicesAttr.getArray();
                helperObj.indexFormat = indicesArray instanceof Uint16Array ? 'uint16' : 'uint32';

                numIndices = indicesArray.length;
                firstIndex = helperObj.indices.length;
                for (let i = 0; i < indicesArray.length; i++) {
                    helperObj.indices.push(indicesArray[i]);
                }
            }

            let material = null;
            let nameMaterial = "";
            const materialGltf = primitive.getMaterial();
            if (materialGltf) {
                nameMaterial = (materialGltf && materialGltf.getName()) ? materialGltf.getName() : name + "-material";

                const baseColorFactor = materialGltf.getBaseColorFactor(); // [R, G, B, A] (0.0 a 1.0)
                const roughnessFactor = materialGltf.getRoughnessFactor(); // 0.0 (liso) a 1.0 (rough)
                const metallicFactor = materialGltf.getMetallicFactor();   // 0.0 (dielectric) a 1.0 (metal)
                const emissiveFactor = materialGltf.getEmissiveFactor();   // [R, G, B]

                material = new DogMaterial(nameMaterial, true, false);
                material.setDiffuseColor([baseColorFactor[0], baseColorFactor[1], baseColorFactor[2], baseColorFactor[3]]);
                material.setSpecularColor([1.0, 1.0, 1.0, 1.0]);
                material.setAmbientColor([baseColorFactor[0] / 10.0, baseColorFactor[1] / 10.0, baseColorFactor[2] / 10.0, 1.0]);
                material.setRoughness(roughnessFactor);
                material.setMetallic(metallicFactor);
                material.setEmissiveColor([emissiveFactor[0], emissiveFactor[1], emissiveFactor[2], 1.0]);

                const baseColorTex = materialGltf.getBaseColorTexture();
                if (baseColorTex) {
                    if (helperObj.extensionFile == "gltf") {
                        const uri = baseColorTex.getURI();
                        baseColorTex.setURI(helperObj.basePath + uri);

                        let albedoTexture = await webGPUengine.createDogTextureFromImage(helperObj.basePath + uri);

                        material.setDiffuseTextureIndex(albedoTexture.getName());
                        material.setHasTexture(true);

                        let sampler = createDogSampler(null, { magFilter: 'linear', minFilter: 'linear' });
                        albedoTexture.setIdSampler(sampler.getName());

                        let idBindGroupMaterial = createBGMaterialTexSamp(material, albedoTexture, sampler, 2);
                        material.setIdBindGroup(idBindGroupMaterial);
                    } else { //glb file
                        let albedoTexture = await createDogTextureFromBytes(name + "-albedo", baseColorTex);
                        material.setDiffuseTextureIndex(albedoTexture.getName());
                        //material.setHasTexture(true);

                        let sampler = createDogSampler(null, { magFilter: 'linear', minFilter: 'linear' });
                        albedoTexture.setIdSampler(sampler.getName());

                        let idBindGroupMaterial = createBGMaterialTexSamp(material, albedoTexture, sampler, 2);
                        material.setIdBindGroup(idBindGroupMaterial);

                        //console.log("Albedo GLB:: " + countMeshes + " idBindGroup: " + idBindGroupMaterial);
                    }
                } else {
                    let texture = createDummyTexture();
                    let sampler = createDogSampler(null, { magFilter: 'linear', minFilter: 'linear' });

                    material.setDiffuseTextureIndex(texture.getName());
                    //material.setHasTexture(true);

                    texture.setIdSampler(sampler.getName());
                    let idBindGroupMaterial = createBGMaterialTexSamp(material, texture, sampler, 2);
                    material.setIdBindGroup(idBindGroupMaterial);
                }
            } else {
                nameMaterial = name + "-default-material";
                const bufferSizeMaterial = 24 * 4 * 1;
                let idBufferMaterial = createDogBuffer(name + "-buffer-material", BufferType.Data, null, bufferSizeMaterial, true);
                let texture = createDummyTexture();

                material = createDefaultMaterial(nameMaterial, false, false);
                material.setIdBuffer(idBufferMaterial);

                material.setDiffuseTextureIndex(texture.getName());
                material.setHasTexture(true);

                let sampler = createDogSampler(null, { magFilter: 'linear', minFilter: 'linear' });
                texture.setIdSampler(sampler.getName());

                let idBindGroupMaterial = createBGMaterialTexSamp(material, texture, sampler, 2);

                material.setIdBindGroup(idBindGroupMaterial);
            }

            resourceManager.add(material.getName(), material);

            let dogMesh = new DogMesh(name + helperObj.countMeshes++, false, false);
            dogMesh.setNumVertices(numVertices);
            dogMesh.setBaseVertex(baseVertex);
            dogMesh.setFirstVertex(baseVertex);
            dogMesh.setNumIndices(numIndices);
            dogMesh.setFirstIndex(firstIndex);
            dogMesh.setIdMaterial(nameMaterial);
            dogMesh.setIdBuffer(helperObj.idBufferMeshes);
            dogMesh.setIdBindGroup(helperObj.idBindGroupMeshes);
            dogMesh.setIdParent(parent);

            dogMesh.getTransform().translateAbsolute(helperObj.translation[0], helperObj.translation[1], helperObj.translation[2]);
            dogMesh.getTransform().scaleAbsolute(helperObj.scale[0], helperObj.scale[1], helperObj.scale[2]);
            dogMesh.getTransform().rotateAbsolute(helperObj.rotation[0], helperObj.rotation[1], helperObj.rotation[2]);

            staticMesh.addMesh(dogMesh);
        }
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

    /**
     * Create a pipeline layout based on the provided bind group layouts.
     * @param {string} name Name of the pipeline layout.
     * @param {GPUBindGroupLayout[]} bindGroupLayouts Array of bind group layouts to be used in the pipeline layout.
     * @returns {GPUPipelineLayout} Pipeline layout created based on the bind group layouts.
     */
    function createPipelineLayout(name, bindGroupLayouts) {
        var layout = "auto";

        if (bindGroupLayouts != null && bindGroupLayouts.length > 0 && bindGroupLayouts[0] != 'auto') {
            layout = pGraphics.device.createPipelineLayout({
                label: name + " Pipeline Layout",
                bindGroupLayouts: bindGroupLayouts
            });
        }

        return layout;
    }

    /**
     * Get all min and max vector in the boundings belong to the meshes.
     * @param {DogStaticMesh[]} meshList Array of meshes.
     * @returns {Array of Vector3} Array of vectors.
     */
    function getAllMinAndMaxVectorInMeshes(meshList) {
        let vectors = [];

        for (var i = 0; i < meshList.length; i++) {
            const mesh = meshList[i];
            for (var j = 0; j < mesh.getNumMeshes(); j++) {
                let bounding = mesh.getMesh(j).getBoundingVolume();

                vectors.push(bounding.getVectorMin());
                vectors.push(bounding.getVectorMax());
            }
        }

        return vectors;
    }

    /**
     * Calculates dynamically the view matrix and the orthogonal matrix for the light.
     * @param {Vector3} lightPos - Position of the light in the world.
     * @param {Vector3} lightTarget - Point to which the light looks at.
     * @param {Array} sceneBounds - List of minimum and maximum points of the objects in the world.
     * @param {number} padding - Padding to be added to the scene bounds.
     */
    function calculateDynamicLightMatrices(lightPos, lightTarget, sceneBounds, padding) {
        // 1. Calculate the dynamic UP vector to avoid singularities
        let lightDir = glMatrix.vec3.create();
        glMatrix.vec3.sub(lightDir, lightTarget, lightPos);
        glMatrix.vec3.normalize(lightDir, lightDir);

        let lightUp = glMatrix.vec3.fromValues(0, 1, 0);
        // If the light points almost vertically downwards or upwards, we change the UP to the Z axis
        if (Math.abs(lightDir[0]) < 0.001 && Math.abs(lightDir[2]) < 0.001) {
            lightUp = glMatrix.vec3.fromValues(0, 0, -1);
        }

        // 2. Build the View Matrix of the Light
        let lightViewMatrix = glMatrix.mat4.create();
        glMatrix.mat4.lookAt(lightViewMatrix, lightPos, lightTarget, lightUp);

        // 3. Find the bounds in the light's space
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        // Transform the corners of the objects to the light's space
        for (const worldPoint of sceneBounds) {
            let lightSpacePoint = glMatrix.vec3.create();
            glMatrix.vec3.transformMat4(lightSpacePoint, worldPoint, lightViewMatrix);

            // Actualizamos los extremos de nuestra caja ortogonal
            if (lightSpacePoint[0] < minX)
                minX = lightSpacePoint[0];
            if (lightSpacePoint[0] > maxX)
                maxX = lightSpacePoint[0];

            if (lightSpacePoint[1] < minY)
                minY = lightSpacePoint[1];
            if (lightSpacePoint[1] > maxY)
                maxY = lightSpacePoint[1];

            if (lightSpacePoint[2] < minZ)
                minZ = lightSpacePoint[2];
            if (lightSpacePoint[2] > maxZ)
                maxZ = lightSpacePoint[2];
        }

        // 4. Add a small safety margin (Padding)
        // This prevents shadows from being cut off abruptly at the edges due to numerical bias
        let left = minX - padding;
        let right = maxX + padding;
        let bottom = minY - padding;
        let top = maxY + padding;

        // WebGPU requires Z between 0 and 1.
        // In glMatrix light space, looking "forward" enters the negative Z axis.
        // Therefore, the object closest to the light will have the highest Z value (least negative),
        // and the furthest will have the lowest Z value (most negative).
        let near = -maxZ - padding;
        let far = -minZ + padding;

        // Force a minimum near to avoid errors if the light is above an object
        if (near < 0.1) near = 0.1;

        // 5. Construct the Orthogonal Matrix for WebGPU (Zero-to-One)
        let lightProjectionMatrix = glMatrix.mat4.create();
        glMatrix.mat4.orthoZO(lightProjectionMatrix, left, right, bottom, top, near, far);

        return {
            viewMatrix: lightViewMatrix,
            projectionMatrix: lightProjectionMatrix
        };
    }

    /**
     * Converts a quaternion to Euler angles.
     * @param {Vector3} out - Array to store the Euler angles.
     * @param {Quaternion} q - Quaternion to convert.
     * @returns {Vector3} Array of Euler angles.
     */
    function quaternionToEuler(out, q) {
        let x = q[0], y = q[1], z = q[2], w = q[3];
        let x2 = x * x, y2 = y * y, z2 = z * z, w2 = w * w;
        let unit = x2 + y2 + z2 + w2;
        let test = x * w - y * z;

        if (test > 0.499995 * unit) {
            // Singularity at north pole
            out[0] = Math.PI / 2;
            out[1] = 2 * Math.atan2(y, x);
            out[2] = 0;
        } else if (test < -0.499995 * unit) {
            // Singularity at south pole
            out[0] = -Math.PI / 2;
            out[1] = 2 * Math.atan2(y, x);
            out[2] = 0;
        } else {
            out[0] = Math.asin(2 * (x * z - w * y));
            out[1] = Math.atan2(2 * (x * w + y * z), 1 - 2 * (z2 + w2));
            out[2] = Math.atan2(2 * (x * y + z * w), 1 - 2 * (y2 + z2));
        }

        return out;
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
        createMeshByGltfFile: createMeshByGltfFile,
        createMeshByGltfFileV2: createMeshByGltfFileV2,
        createShaderModule: createShaderModule,
        createVertexBufferLayout: createVertexBufferLayout,
        createPipelineLayout: createPipelineLayout,
        getAllMinAndMaxVectorInMeshes: getAllMinAndMaxVectorInMeshes,
        calculateDynamicLightMatrices: calculateDynamicLightMatrices,
        quaternionToEuler: quaternionToEuler
    }

})
);