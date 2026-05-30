
/**
 * it implements Phong shading technique
 * 
 * @author César Himura
 * @version 1.0
 */
class PhongShadingPipeline extends DogPipeline {
    /**
     * Creates a new PhongShadingPipeline instance.
     * @param {GPUBindGroupLayout[]} bindGroupLayouts List of bind group layouts to be used in the pipeline.
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
            };

            struct Material {
                diffuseColor : vec4<f32>,
                specularColor : vec4<f32>,
                ambientColor : vec4<f32>,
                emissiveColor : vec4<f32>,
                specularPower : f32,
                transparency : f32,
                opticalDensity : f32, 
                roughness : f32,
                metallness : f32,
                hasTexture : f32,
                padding : vec2<f32>
            };

            struct DirectionalLight {
                position : vec4<f32>,
                direction : vec4<f32>,
                color : vec4<f32>,
                enabled : f32,
                intensity : f32,
                padding : vec2<f32>
            };

            @group(0) @binding(0)
            var<uniform> camera: Camera;

            @group(1) @binding(0)
            var<uniform> model: Model;

            @group(2) @binding(0)
            var<uniform> directionalLight: DirectionalLight;

            @group(2) @binding(1)
            var<uniform> material: Material;

            @vertex
            fn vertexMain(
                @location(0) position: vec3f, 
                @location(1) normal: vec3f, 
                @location(2) texCoord: vec2f
            ) -> 
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
                return vec4f(directionalLight.color.rgb, 1.0);
                //return vec4f(1.0, 0.0, 0.0, 1.0);
            }
        `;

        let vertexLayout = { "position" : 3, "normal" : 3, "texCoord" : 2 };

        var descriptor = {
            vertexLayout: vertexLayout,
            bindGroupLayouts: bindGroupLayouts
        };

        super("PhongShading", shader, descriptor);
    }
}