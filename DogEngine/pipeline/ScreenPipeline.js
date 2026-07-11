/**
 * To draw textures in orthographics projection
 * @author César Himura
 * @version 1.0
 */
class ScreenPipeline extends DogPipeline {

    constructor(bindGroupLayouts = [], type) {
        let textureSample = "";
        let format = "";
        if (type == "albedo") {
            textureSample = "textureSample(texture, samp, texCoord);";
            format = `
                @group(2) @binding(0)
                var texture: texture_2d<f32>; 

                @group(2) @binding(1)
                var samp: sampler;`;
        } else if (type == "depth") {
            textureSample = "vec4f(textureSampleCompare(texture, samp, texCoord, 0.5), 0.0f, 0.0f, 1.0f);";
            format = `
                @group(2) @binding(0)
                var texture: texture_depth_2d; 

                @group(2) @binding(1)
                var samp: sampler_comparison;`;
        }


        const shader = `
            struct VertexOutput {
                @builtin(position) Position : vec4<f32>,
                @location(1) texCoord : vec2<f32>
            };

            struct Camera {
                orthoMatrix : mat4x4<f32>
            };

            struct Model {
                modelMatrix : mat4x4<f32>
            };

            @group(0) @binding(0)
            var<uniform> camera: Camera;

            ${format}

            @group(3) @binding(0)
            var<uniform> model: Model;

            @vertex
            fn vertexMain(
                @location(0) position: vec3f, 
                @location(1) texCoord: vec2f
            ) -> 
            VertexOutput {
                var output: VertexOutput;

                output.Position = camera.orthoMatrix * model.modelMatrix * vec4f(position, 1.0);

                output.texCoord = texCoord;

                return output;
            }

            @fragment
            fn fragmentMain(@location(1) texCoord: vec2f) -> @location(0) vec4f {
                return ${textureSample};
            }
        `;

        let vertexLayout = { "position": 3, "texCoord": 2 };

        let descriptor = {
            vertexLayout: vertexLayout,
            bindGroupLayouts: bindGroupLayouts
        };

        super("ScreenShading", shader, descriptor);
    }
}