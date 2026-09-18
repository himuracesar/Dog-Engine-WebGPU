/**
 * Pipeline to create deffered rendering, the final pass.
 * 
 * @author César Himura
 * @version 1.0
 */
class DeferredRenderingPipeline extends DogPipeline {

    /**
     * Creates a new DeferredRenderingPipeline instance.
     * @param {string} name The name of the pipeline.
     * @param {GPUBindGroupLayout[]} bindGroupLayouts List of bind group layouts to be used in the pipeline.
     * @param {string[]} shaders Array of shader source code in WGSL format.
     */
    constructor(name, bindGroupLayouts = [], shaders = []) {
        const shader = `
            // Common
            ${shaders[0] ? shaders[0] : ""} 
            // Lights & material
            ${shaders[1] ? shaders[1] : ""} 
            // Deferred Rendering
            ${shaders[2] ? shaders[2] : ""} 
        `;

        let vertexLayout = { "position": 3, "normal": 3, "texCoord": 2 };

        let descriptor = {
            vertexLayout: vertexLayout,
            bindGroupLayouts: bindGroupLayouts
        };

        const shaderModule = webGPUengine.createShaderModule(name + "Shader", shader);
        const vertexBufferLayout = webGPUengine.createVertexBufferLayout(vertexLayout);

        const layout = webGPUengine.createPipelineLayout(name, bindGroupLayouts);

        let pipelineDescriptor = {
            label: name + " Pipeline",
            layout: layout,
            vertex: {
                module: shaderModule,
                entryPoint: "vsMain"
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fsMain",
                targets: [{
                    format: pGraphics.canvasFormat,
                    /*blend: {
                        color: {
                            srcFactor: 'one',
                            dstFactor: 'one',
                            operation: 'add',
                        },
                        alpha: {
                            srcFactor: 'one',
                            dstFactor: 'one',
                            operation: 'add',
                        },
                    },*/
                }],
            },
            primitive: {
                topology: "triangle-list", // Options: 'point-list', 'line-list', 'triangle-list'
                // Culling settings
                cullMode: "back",    // Options: 'none', 'front', 'back'
                frontFace: "ccw"   // Options: 'ccw', 'cw'
            }
        };

        super(name, shader, descriptor, pipelineDescriptor);
    }
}