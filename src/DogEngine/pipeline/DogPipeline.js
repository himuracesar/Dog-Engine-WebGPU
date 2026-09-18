
/**
 * DogPipeline class encapsulates the creation and management of a WebGPU render pipeline,
 * including shader modules, vertex buffer layouts, and pipeline configuration.
 * It provides a structured way to define and use render pipelines in the Dog Engine.
 * 
 * @author César Himura
 * @version 1.0
 */
class DogPipeline {
    constructor(name, shadersSource, descriptor, pipelineDescriptor = {}) {
        this.name = name;
        this.vertexBufferLayout = webGPUengine.createVertexBufferLayout(descriptor.vertexLayout);
        this.shaderModule = webGPUengine.createShaderModule(name + "Shader", shadersSource);
        this.topology = descriptor.topology || TopologyMode.TriangleList;
        this.frontFace = descriptor.frontFace || FrontFaceMode.Ccw;
        this.cullMode = descriptor.cullMode || CullMode.Back;
        this.pipeline = this.createPipeline(descriptor.bindGroupLayouts, pipelineDescriptor);
    }

    /**
     * Create a render pipeline using the shader module and vertex buffer layout defined in the constructor.
     * If the bindGroupLayouts parameter is provided and not empty, it will be used to create a custom pipeline layout;
     * otherwise, the pipeline layout will be set to "auto", allowing WebGPU to infer it from the shader code.
     * @param {GPUBindGroupLayout[]} bindGroupLayouts Optional array of bind group layouts to be used in the pipeline layout.
     * @returns {GPURenderPipeline} Render pipeline created based on the shader module and vertex buffer layout.
     */
    createPipeline(bindGroupLayouts, pipelineDescriptor) {
        const layout = webGPUengine.createPipelineLayout(this.name, bindGroupLayouts);

        let gpuPipeline = null;

        if (pipelineDescriptor && Object.keys(pipelineDescriptor).length === 0 && pipelineDescriptor.constructor === Object) {
            gpuPipeline = pGraphics.device.createRenderPipeline({
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
                    topology: this.topology, // Options: 'point-list', 'line-list', 'triangle-list'
                    // Culling settings
                    cullMode: this.cullMode,    // Options: 'none', 'front', 'back'
                    frontFace: this.frontFace   // Options: 'ccw', 'cw'
                },
                // Enable depth testing so that the fragment closest to the camera is rendered in front.
                depthStencil: {
                    format: 'depth24plus', // options: 'depth24plus', 'depth32float'
                    depthWriteEnabled: true,
                    depthCompare: 'less', // Only draws if the new pixel is "closer" than the old one. options: 'never', 'less', 'equal', 'less-equal', 'greater', 'not-equal', 'greater-equal', 'always'
                }
            });
        } else {
            gpuPipeline = pGraphics.device.createRenderPipeline(pipelineDescriptor);
        }

        return gpuPipeline;
    }

    /**
     * Get the name of the pipeline.
     * @returns {string} Name of the pipeline.
     */
    getName() {
        return this.name;
    }

    /**
     * Get the WebGPU render pipeline object.
     * @returns {GPURenderPipeline} WebGPU render pipeline object encapsulated by this class.
     */
    getWebGPUPipeline() {
        return this.pipeline;
    }
}