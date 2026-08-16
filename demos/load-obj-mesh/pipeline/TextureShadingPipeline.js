/**
 * it implements Texture shading technique
 * 
 * @author César Himura
 * @version 1.0
 */
class TextureShadingPipeline extends DogPipeline {

    /**
     * Creates a new TextureShadingPipeline instance.
     * @param {GPUBindGroupLayout[]} bindGroupLayouts List of bind group layouts to be used in the pipeline.
     */
    constructor(bindGroupLayouts = [], shaders = []) {
        const shader = `
            // Common
            ${shaders[0]} 

            // Texture Shader
            ${shaders[1]} 
        `;

        let vertexLayout = { "position": 3, "normal": 3, "texCoord": 2 };

        let descriptor = {
            vertexLayout: vertexLayout,
            bindGroupLayouts: bindGroupLayouts
        };

        super("Texture-Shading", shader, descriptor);
    }
}