/**
 * it implements Phong shading technique
 * 
 * @author César Himura
 * @version 1.0
 */
class BlinnPhongShadingPipeline extends DogPipeline {

    /**
     * Creates a new PhongShadingPipeline instance.
     * @param {GPUBindGroupLayout[]} bindGroupLayouts List of bind group layouts to be used in the pipeline.
     */
    constructor(bindGroupLayouts = [], shaders = []) {
        const shader = `
            // Common
            ${shaders[0]} 

            // Lights and Materials
            ${shaders[1]} 

            // Blinn-Phong Shader
            ${shaders[2]} 
        `;

        let vertexLayout = { "position": 3, "normal": 3, "texCoord": 2 };

        let descriptor = {
            vertexLayout: vertexLayout,
            bindGroupLayouts: bindGroupLayouts
        };

        super("Blin-Phong-Textures-Shading", shader, descriptor);
    }
}