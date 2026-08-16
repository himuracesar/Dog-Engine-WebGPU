
/**
 * NormalColorPipeline is a simple pipeline that renders a mesh with a custom color. 
 * It uses a vertex shader to transform the vertex positions and pass the color to the fragment shader, 
 * which then outputs the final color of each pixel.
 * 
 * @author César Himura
 * @version 1.0
 */
class NormalColorPipeline extends DogPipeline {
    /**
     * Creates a new NormalColorPipeline instance.
     * @param {GPUBindGroupLayout[]} bindGroupLayouts List of bind group layouts to be used in the pipeline. 
     * The first layout should be for the camera uniform buffer,
     */
    constructor(bindGroupLayouts = []) {
        const shader =  `
            struct VertexOutput {
                @builtin(position) Position : vec4<f32>,
                @location(1) Normal : vec3<f32>,
                @location(2) TexCoord : vec2<f32>,
            };

            struct Camera {
                viewMatrix : mat4x4<f32>,
                projectionMatrix : mat4x4<f32>,
            };

            struct Model {
                modelMatrix : mat4x4<f32>
                //color : vec4<f32>
            };

            @group(0) @binding(0)
            var<uniform> camera: Camera;

            @group(3) @binding(0)
            var<uniform> model: Model;

            @vertex
            fn vertexMain(@location(0) position: vec3f, @location(1) normal: vec3f, @location(2) texCoord: vec2f) -> 
            VertexOutput {
                var output: VertexOutput;

                output.Position = camera.projectionMatrix * camera.viewMatrix * model.modelMatrix * vec4f(position, 1.0);

                var normalWorld = model.modelMatrix * vec4f(normal, 0.0);
                output.Normal = normalWorld.xyz;

                output.TexCoord = texCoord;

                return output;
            }

            @fragment
            fn fragmentMain(@location(1) normal: vec3f, @location(2) texCoord: vec2f) -> @location(0) vec4f {
                return vec4f(abs(normal), 1.0);
            }
        `;

        let vertexLayout = { "position" : 3, "normal" : 3, "texCoord" : 2 };

        var descriptor = {
            vertexLayout: vertexLayout,
            bindGroupLayouts: bindGroupLayouts
        };

        super("NormalColor", shader, descriptor);
    }
}