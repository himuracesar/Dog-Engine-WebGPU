/**
 * Pipeline to create shadow maps.
 * 
 * @author César Himura
 * @version 1.0
 */
class ShadowMapPipeline extends DogPipeline {

    /**
     * Creates a new ShadowMapPipeline instance.
     * @param {string} name The name of the pipeline.
     * @param {GPUBindGroupLayout[]} bindGroupLayouts List of bind group layouts to be used in the pipeline.
     * @param {string[]} shaders Array of shader source code in WGSL format.
     */
    constructor(name, bindGroupLayouts = [], shaders = []) {
        const shader = `
            // Shader
            ${shaders[0] ? shaders[0] : ""} 
        `;

        let vertexLayout = { "position": 3 };

        let descriptor = {
            vertexLayout: vertexLayout,
            bindGroupLayouts: bindGroupLayouts
        };

        const shaderModule = webGPUengine.createShaderModule(name + "Shader", shader);
        const vertexBufferLayout = webGPUengine.createVertexBufferLayout(vertexLayout);

        let pipelineDescriptor = {
            label: name + " Pipeline",
            layout: layout,
            vertex: {
                module: shaderModule,
                entryPoint: "vertexMain",
                buffers: [vertexBufferLayout]
            },
            primitive: {
                topology: "triangle-list", // Options: 'point-list', 'line-list', 'triangle-list'
                // Culling settings
                cullMode: "back",    // Options: 'none', 'front', 'back'
                frontFace: "ccw"   // Options: 'ccw', 'cw'
            },
            // Enable depth testing so that the fragment closest to the camera is rendered in front.
            depthStencil: {
                format: 'depth24plus', // options: 'depth24plus', 'depth32float'
                depthWriteEnabled: true,
                depthCompare: 'less', // Only draws if the new pixel is "closer" than the old one. options: 'never', 'less', 'equal', 'less-equal', 'greater', 'not-equal', 'greater-equal', 'always'
            }
        };

        super(name, shader, descriptor, pipelineDescriptor);
    }
}