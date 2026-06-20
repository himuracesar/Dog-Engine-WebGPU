
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
            console.log("createDogBuffer:: The resource manager is not initialized." + error);
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

    async function loadConfig(fileName) {
        try {
            // 1. Fetch the file relative to your script location
            const response = await fetch(fileName);

            // 2. Direct conversion from file stream to JavaScript object
            const config = await response.json();

            return config;
        } catch (error) {
            console.error("Could not load configuration:", error);
        }
    }


    return {
        initWebGPU: initWebGPU,
        createBindGroupLayouts: createBindGroupLayouts,
        createBindGroup: createBindGroup,
        createDogBuffer: createDogBuffer,
        readTextFromFile: readTextFromFile,
        loadConfig: loadConfig
    }

})
);