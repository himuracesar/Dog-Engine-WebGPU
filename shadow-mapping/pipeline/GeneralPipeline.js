/**
 * This is only the armor pipeline the shading technique depends on the the shader in WGSL.
 * 
 * @author César Himura
 * @version 1.0
 */
class GeneralPipeline extends DogPipeline {

    /**
     * Creates a new GeneralPipeline instance.
     * @param {GPUBindGroupLayout[]} bindGroupLayouts List of bind group layouts to be used in the pipeline.
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

        super(name, shader, descriptor);
    }
}