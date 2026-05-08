
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

//----------- Include other js files here----------------
include("/DogEngine/input/KeyCode.js");
//-------------------------------------------------------


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
                context: context
            };
        }

        return {
            initWebGPU: initWebGPU
        }

    })
);