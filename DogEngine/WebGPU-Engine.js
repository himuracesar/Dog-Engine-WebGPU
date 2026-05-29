
(function() {
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
include("/DogEngine/DogResource.js");
include("/DogEngine/DogBuffer.js");
include("/DogEngine/DogTransform.js");
include("/DogEngine/DogMesh.js");


include("/DogEngine/DogResourceManager.js");
include("/DogEngine/bounding/DogBoundingVolume.js");
include("/DogEngine/bounding/DogBoundingSphere.js");
include("/DogEngine/bounding/DogBoundingBox.js");
include("/DogEngine/input/KeyCode.js");
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
    None : 0,
    Sphere : 1,
    Box : 2
});

/**
 * Visibility on GPU
 */
const GPUVisibility = Object.freeze({
    Vertex : GPUShaderStage.VERTEX,
    Fragment : GPUShaderStage.FRAGMENT
});

//------------------------------------------------------------

(function(root, factory){
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function() {
          return factory.call(root);
        });
      } else {
        // Browser globals
        root.webGPUengine = factory.call(root);
      }
    } (this, function() {
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

            return {
                device: device,
                context: context,
                canvasFormat: canvasFormat
            };
        }

        /**
         * Create the different bind group layouts.
         * @param {Array} descriptors Contains JSON objects to create the bind group layouts.
         * @returns {Array} Array of bind group layouts of WebGPU.
         */
        function createBindGroupLayouts(descriptors = []){
            var bindGroupsLayouts = new Map();

            const desc = [
                { name: "DogCamera", label:"Camera", group: 0, binding: 0, bufferSize: 16 * 4 * 2, visibility: GPUVisibility.Vertex },
                { name: "DogTransform", label: "Transform", group: 1, binding: 0, bufferSize: 16 * 4, visibility: GPUVisibility.Vertex }
            ]

            if(descriptors.length > 0)
                desc = descriptors;

            for(var i = 0; i < desc.length; i++){
                var bgl = desc[i];

                const bindGroupLayout = pGraphics.device.createBindGroupLayout({
                    label: bgl.label,
                    entries: [{
                        binding: bgl.binding,
                        visibility: bgl.visibility,
                        buffer: {
                            type: "uniform"
                        }
                    }]
                });
                
                bindGroupsLayouts.set(bgl.name, { group: bgl.group, binding: bgl.binding, bindGroupLayout: bindGroupLayout, bufferSize: bgl.bufferSize });
            }

            return bindGroupsLayouts;
        }

        /**
         * Create a bnd group layout.
         * @param {string} name Name of the bind group.
         * @param {int} binding Number of the binding in the shader.
         * @param {GPUBindGroupLayout} bindGroupLayout Bind group layout in WebGPU.
         * @param {DogBuffer} buffer Buffer to link the bind group.
         * @returns {Array} Group Bind Layouts
         */
        function createBindGroup(name, binding, bindGroupLayout, buffer) {
            const bindGroup = pGraphics.device.createBindGroup({
                label: name,
                layout: bindGroupLayout,
                entries: [{
                    binding: binding,
                    resource: { buffer: buffer.getWebGPUBuffer() }
                }],
            });

            return bindGroup;
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
                if(b != null) {
                    b.addReference();
                    
                    return name;
                }
            } catch(error) {
                console.log("createDogBuffer:: The resource manager is not initialized." + error);
            }

            const buffer = new DogBuffer(name, type, data, size);
            buffer.addReference();

            if(store) {
                try {
                    resourceManager.add(name, buffer);
                }
                catch(error) {
                    console.log("The resource " + name + " cannot add to resource manager." + error);
                    
                    return "-1";
                }
            }

            return name;
        }

        return {
            initWebGPU : initWebGPU,
            createBindGroupLayouts : createBindGroupLayouts,
            createBindGroup : createBindGroup,
            createDogBuffer : createDogBuffer
        }

    })
);