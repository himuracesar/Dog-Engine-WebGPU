
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
                fresnel : f32,
                padding : f32
            };

            struct DirectionalLight {
                position : vec4<f32>,
                direction : vec4<f32>,
                color : vec4<f32>,
                enabled : f32,
                intensity : f32,
                padding : vec2<f32>
            };

            struct PointLight {
                position : vec4<f32>,
                color : vec4<f32>,
                kc : f32, //Constant Attenuation
                kl : f32, //Linear Attenuation
                kq : f32, //Quadratic Attenuation
                range : f32,
                enabled : f32,
                intensity : f32,
                padding : vec2<f32>
            };

            struct SpotLight {
                position : vec4<f32>,
                direction : vec4<f32>,
                color : vec4<f32>,
                kc : f32, //Constant Attenuation
                kl : f32, //Linear Attenuation
                kq : f32, //Quadratic Attenuation
                range : f32,
                enabled : f32,
                spotAngle : f32,
                spotInnerAngle : f32,
                spotExternAngle : f32,
                intensity : f32,
                angleX : f32,
                angleY : f32,
                angleZ : f32
            };

            struct Lighting
            {
                ambient : vec4<f32>,
                diffuse : vec4<f32>,
                specular : vec4<f32>
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

            @group(3) @binding(0)
            var<uniform> model: Model;

            fn GetAttenuation(kc: f32, kl: f32, kq: f32, distance: f32) -> f32
            {
                return 1.0 / (kc + kl * distance + kq * distance * distance);
            }

            fn GetAmbientLighting(color: vec4<f32>, ambientMaterial: vec4<f32>) -> vec4<f32>
            {
                return color * ambientMaterial;
            }

            fn GetSpecularLighting(light: vec3<f32>, normal: vec3<f32>, viewDirection: vec3<f32>, color: vec4<f32>, specularMaterial: vec4<f32>, specularPower: f32) -> vec4<f32>
            {
                var R = reflect(-light, normal);
                
                var specFactor = 0.0f;
                
                if(specularPower > 1.0){
                    specFactor = pow(max(dot(R.xyz, viewDirection), 0.0), specularPower);
                }

                var specLighting = color * specularMaterial * specFactor;
                
                return vec4<f32>(specLighting.xyz, 1.0);
            }

            fn GetDiffuseLighting(light: vec3<f32>, normal: vec3<f32>, color: vec4<f32>, diffuseMaterial: vec4<f32>) -> vec4<f32>
            {
                var normaln = normalize(normal);
                var geometryTerm = max(0.0, dot(light, normaln));

                return diffuseMaterial * geometryTerm * color;
            }

            fn ComputeDirectionalLight(dl: DirectionalLight, material: Material, normal: vec3<f32>, viewDirection: vec3<f32>) -> Lighting
            {
                var lighting = Lighting(
                    vec4<f32>(0.0, 0.0, 0.0, 1.0),
                    vec4<f32>(0.0, 0.0, 0.0, 1.0),
                    vec4<f32>(0.0, 0.0, 0.0, 1.0)
                );
                
                var mWorldView = camera.viewMatrix * model.modelMatrix;

                var light = mWorldView * -dl.direction;
                light = normalize(light);
                
                lighting.diffuse = dl.intensity * GetDiffuseLighting(light.xyz, normal, dl.color, material.diffuseColor);
                
                lighting.specular = dl.intensity * GetSpecularLighting(light.xyz, normalize(normal), viewDirection, dl.color, material.specularColor, material.specularPower);
                
                lighting.ambient = GetAmbientLighting(dl.color, material.ambientColor);
                
                return lighting;
            }

            fn ComputePointLight(pl: PointLight, material: Material, position: vec3<f32>, normal: vec3<f32>, viewDirection: vec3<f32>) -> Lighting
            {
                var lighting = Lighting(
                    vec4<f32>(0.0, 0.0, 0.0, 1.0),
                    vec4<f32>(0.0, 0.0, 0.0, 1.0),
                    vec4<f32>(0.0, 0.0, 0.0, 1.0)
                );

                var lightPosWV = (camera.viewMatrix * pl.position).xyz;

                var lightDirectionWV = lightPosWV - position;

                var d = length(lightDirectionWV);

                if (d > pl.range)
                {
                    return lighting;
                }

                lightDirectionWV /= d;
                //lightDirectionWV = normalize(lightDirectionWV);

                lighting.ambient = GetAmbientLighting(pl.color, material.ambientColor);

                var normaln = normalize(normal);
                lighting.diffuse = GetDiffuseLighting(lightDirectionWV, normaln, pl.color * pl.intensity, material.diffuseColor);

                lighting.specular = GetSpecularLighting(lightDirectionWV, normaln, normalize(viewDirection), pl.color * pl.intensity, material.specularColor, material.specularPower);

                var attenuation = GetAttenuation(pl.kc, pl.kl, pl.kq, d);

                lighting.diffuse *= attenuation;
                lighting.specular *= attenuation;

                return lighting;
            }

            fn ComputeSpotLight(sl: SpotLight, material: Material, position: vec3<f32>, normal: vec3<f32>, viewDirection: vec3<f32>) -> Lighting
            {
                var lighting = Lighting(
                    vec4<f32>(0.0, 0.0, 0.0, 1.0),
                    vec4<f32>(0.0, 0.0, 0.0, 1.0),
                    vec4<f32>(0.0, 0.0, 0.0, 1.0)
                );

                var lightPosWV = camera.viewMatrix * sl.position;
                var spotLightDirectionWV = camera.viewMatrix * sl.direction;

                var lightDirectionWV = lightPosWV.xyz - position;

                var d = length(lightDirectionWV);

                if (d > sl.range)
                {
                    return lighting;
                }

                lightDirectionWV /= d;

                lighting.ambient = GetAmbientLighting(sl.color, material.ambientColor);

                //normal = normalize(normal);
                lighting.diffuse = GetDiffuseLighting(lightDirectionWV, normal, sl.color * sl.intensity, material.diffuseColor);
                lighting.specular = GetSpecularLighting(lightDirectionWV, normal, viewDirection, sl.color, material.specularColor, material.specularPower);

                //float spot = pow(max(dot(-light, normalize(sl.  )), 0.0f), sl.spotAngle);
                // Spot intensity
                /** Control del cono del spot con un solo angulo */
                var minCos = cos(sl.spotAngle);
                var maxCos = (minCos + 1.0f) / 2.0f;

                /** Control con dos conos, uno interno y otro externo */
                /*float minCos = cos(sl.spotExternAngle);
                var maxCos = cos(sl.spotInnerAngle);*/

                var cosAngle = dot(spotLightDirectionWV.xyz, - lightDirectionWV);
                var spot = smoothstep(minCos, maxCos, cosAngle);

                var attenuation = spot / GetAttenuation(sl.kc, sl.kl, sl.kq, d);

                lighting.ambient *= spot;
                lighting.diffuse = lighting.diffuse * attenuation;
                lighting.specular = lighting.specular * attenuation;

                return lighting;
            }

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

                //return vec4f(directionalLight.color.rgb, 1.0);
                //return vec4f(1.0, 0.0, 0.0, 1.0);
                //return vec4f(material.diffuseColor.rgb, 1.0);

                return lighting.ambient + lighting.diffuse + lighting.specular;
                //return lighting.diffuse + lighting.specular;
                //return vec4<f32>(normal, 1.0); //debug normal
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