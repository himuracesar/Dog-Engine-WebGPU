/**
 * It's an armor to create a complete custom pipeline. The shaders depends on the shader files in WGSL.
 * 
 * @author César Himura
 * @version 1.0
 */
class CustomPipeline extends DogPipeline {

    /**
     * Creates a new CustomPipeline instance.
     * @param {string} name The name of the pipeline.
     * @param {GPUBindGroupLayout[]} bindGroupLayouts List of bind group layouts to be used in the pipeline.
     * @param {string[]} shaders Array of shader source code in WGSL format.
     */
    constructor(name, bindGroupLayouts = [], shaders = []) {
        const shader = `
            // Common
            ${shaders[0] ? shaders[0] : ""} 

            // Light & Material
            ${shaders[1] ? shaders[1] : ""} 

            // Shader
            ${shaders[2] ? shaders[2] : ""} 
        `;

        let vertexLayout = { "position": 3, "normal": 3, "texCoord": 2 };

        let descriptor = {
            vertexLayout: vertexLayout,
            bindGroupLayouts: bindGroupLayouts
        };

        let pipelineDescriptor = {
            label: this.name + " Pipeline",
            layout: layout,
            vertex: {
                module: this.shaderModule,
                entryPoint: "vertexMain",
                buffers: [this.vertexBufferLayout]
            },
            fragment: {
                module: this.shaderModule,
                entryPoint: "fragmentMain",
                targets: [{
                    format: pGraphics.canvasFormat
                }]
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