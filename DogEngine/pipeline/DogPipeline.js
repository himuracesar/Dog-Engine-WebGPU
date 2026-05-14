
/**
 * DogPipeline class encapsulates the creation and management of a WebGPU render pipeline,
 * including shader modules, vertex buffer layouts, and pipeline configuration.
 * It provides a structured way to define and use render pipelines in the Dog Engine.
 * 
 * @author César Himura
 * @version 1.0
 */
class DogPipeline {
    constructor(name, shadersSource, vertexLayout) {
        this.name = name;
        this.vertexBufferLayout = this.createVertexBufferLayout(vertexLayout);
        this.shaderModule = this.createShaderModule(shadersSource);
        this.topology = TopologyMode.TriangleList;
        this.frontFace = FrontFaceMode.Ccw;
        this.cullMode = CullMode.Back;
        this.pipeline = this.createPipeline();
        this.bindGroups = [];
    }

    /**
     * Create a vertex buffer layout based on the provided vertex layout definition.
     * @param {GPUVertexBufferLayout} vertexLayout Layout definition for the vertex buffer, 
     * where each key is an attribute name and value is an object with a 'size' property indicating 
     * the number of components (e.g., { position: { size: 3 }, color: { size: 4 } }).
     * @returns {GPUVertexBufferLayout} Vertex buffer layout compatible with WebGPU pipeline creation.
     */
    createVertexBufferLayout(vertexLayout) {
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
     * Create a shader module from the provided shader source code.
     * @param {string} shaderSource Source of vextex and fragment shaders in WGSL.
     * @returns {GPUShaderModule} Shader module created from the provided source code.
     */
    createShaderModule(shaderSource) {
        const shaderModule = pGraphics.device.createShaderModule({
            label: this.name + ' Shader',
            code: shaderSource
        });

        return shaderModule;
    }

    /**
     * Create a render pipeline using the shader module and vertex buffer layout defined in the constructor.
     * @returns {GPURenderPipeline} Render pipeline created based on the shader module and vertex buffer layout.
     */
    createPipeline() {
        const pipeline = pGraphics.device.createRenderPipeline({
            label: this.name + " Pipeline",
            layout: "auto",
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
            // Enable depth testing so that the fragment closest to the camera
            // is rendered in front.
            /*depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            }*/
        });
        
        return pipeline;
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