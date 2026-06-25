//import { STRUCTS_LIGHTS_AND_MATERIAL } from '/DogEngine/pipeline/structs/LightsAndMaterial.js';

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
        const shader = `
            ${STRUCTS_LIGHTS_AND_MATERIAL}

            struct VertexOutput {
                @builtin(position) Position : vec4<f32>,
                @location(1) normal : vec3<f32>,
                @location(2) texCoord : vec2<f32>,
                @location(3) positionWV : vec3<f32>
            };

            struct Camera {
                viewMatrix : mat4x4<f32>,
                projectionMatrix : mat4x4<f32>,
            };

            struct Model {
                modelMatrix : mat4x4<f32>
            };

            @group(0) @binding(0)
            var<uniform> camera: Camera;

            @group(1) @binding(0)
            var<uniform> directionalLight: DirectionalLight;

            @group(1) @binding(1)
            var<uniform> pointLight: PointLight;

            @group(1) @binding(2)
            var<uniform> spotLight: SpotLight;

            @group(2) @binding(0)
            var<uniform> material: Material;

            @group(2) @binding(1)
            var texture: texture_2d<f32>;

            @group(2) @binding(2)
            var samp: sampler;

            @group(3) @binding(0)
            var<uniform> model: Model;

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
                //output.Normal = normal; //normalWorld.xyz;
                output.normal = (camera.viewMatrix * normalWorld).xyz; //transform the normal to view space
                output.positionWV = (camera.viewMatrix * model.modelMatrix * vec4f(position, 1.0)).xyz;

                output.texCoord = texCoord;

                return output;
            }

            @fragment
            fn fragmentMain(@location(1) normal: vec3f, @location(2) texCoord: vec2f, @location(3) positionWV: vec3f) -> @location(0) vec4f {
                var normalWV = normalize((camera.viewMatrix * vec4<f32>(normalize(normal), 0.0f)).xyz);

                // Camera's position in view space is always at the origin (0, 0, 0) because the view matrix transforms world space to view space.
                var cameraPosWV = vec4<f32>(0.0, 0.0, 0.0, 1.0);
	            var viewDirection = cameraPosWV - vec4<f32>(positionWV, 1.0f);

                var lighting = Lighting(
                    vec4<f32>(0.0, 0.0, 0.0, 1.0),
                    vec4<f32>(0.0, 0.0, 0.0, 1.0),
                    vec4<f32>(0.0, 0.0, 0.0, 1.0)
                );

                if(directionalLight.enabled > 0){
                    var l = ComputeDirectionalLight(directionalLight, material, normalize(normal), normalize(viewDirection.xyz));
                    lighting.diffuse += l.diffuse;
                    lighting.specular += l.specular;
                    lighting.ambient += l.ambient;
                }

                if(pointLight.enabled > 0){
                    var l = ComputePointLight(pointLight, material, positionWV, normalize(normal), normalize(viewDirection.xyz));
                    lighting.diffuse += l.diffuse;
                    lighting.specular += l.specular;
                    lighting.ambient += l.ambient;
                }

                if(spotLight.enabled > 0){
                    var l = ComputeSpotLight(spotLight, material, positionWV, normalize(normal), normalize(viewDirection.xyz));
                    lighting.diffuse += l.diffuse;
                    lighting.specular += l.specular;
                    lighting.ambient += l.ambient;
                }

                //return lighting.ambient + lighting.diffuse + lighting.specular;
                //return textureSample(texture, samp, texCoord);

                return lighting.ambient + lighting.diffuse + lighting.specular + textureSample(texture, samp, texCoord);
            }
        `;

        let vertexLayout = { "position": 3, "normal": 3, "texCoord": 2 };

        let descriptor = {
            vertexLayout: vertexLayout,
            bindGroupLayouts: bindGroupLayouts
        };

        super("Phong-Textures-Shading", shader, descriptor);
    }
}