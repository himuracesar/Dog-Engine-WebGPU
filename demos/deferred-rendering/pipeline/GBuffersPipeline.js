/**
 * Pipeline to create G Buffers for deferred rendering.
 * 
 * @author César Himura
 * @version 1.0
 */
class GBUffersPipeline extends DogPipeline {

    /**
     * Creates a new GBUffersPipeline instance.
     * @param {string} name The name of the pipeline.
     * @param {GPUBindGroupLayout[]} bindGroupLayouts List of bind group layouts to be used in the pipeline.
     * @param {string[]} shaders Array of shader source code in WGSL format.
     */
    constructor(name, bindGroupLayouts = [], shaders = []) {
        const shader = `
            // Common
            ${shaders[0] ? shaders[0] : ""} 
            // Lights and Material
            ${shaders[1] ? shaders[1] : ""} 
            // G Buffer
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
                entryPoint: "vsGBuffers",
                buffers: [vertexBufferLayout]
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fsGBuffers",
                targets: [
                    // albedo
                    //{ format: 'bgra8unorm' },
                    { format: 'rgba8unorm' },
                    // normal
                    { format: 'rgba16float' },
                ],
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
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