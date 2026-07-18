struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(1) normal : vec3<f32>,
    @location(2) texCoord : vec2<f32>,
    @location(3) positionWV : vec3<f32>,
    @location(4) posShadow : vec4<f32>
};

struct Light {
    viewMatrix : mat4x4<f32>,
    projectionMatrix : mat4x4<f32>
};

@group(0) @binding(0)
var<uniform> camera: Camera;

@group(1) @binding(0)
var<uniform> directionalLight: DirectionalLight;
@group(1) @binding(1)
var<uniform> light: Light;
@group(1) @binding(2)
var shadowMap: texture_depth_2d;
@group(1) @binding(3)
var shadowSampler: sampler_comparison;

@group(2) @binding(0)
var<uniform> material: Material;

@group(2) @binding(1)
var texture: texture_2d<f32>;

@group(2) @binding(2)
var samp: sampler;

@group(3) @binding(0)
var<uniform> model: Model;

fn ShadowCalculation(fragPosLightSpace: vec4<f32>, normalW: vec3<f32>) -> f32
{
    var projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;

    projCoords.x = projCoords.x * 0.5f + 0.5f;
    projCoords.y = projCoords.y * -0.5f + 0.5f;

    if (projCoords.x < 0.0 || projCoords.x > 1.0 || 
        projCoords.y < 0.0 || projCoords.y > 1.0 || 
        projCoords.z > 1.0 || projCoords.z < 0.0) {
        return 0.0; 
    }

    var shadow = 0.0f;
    let texelSize = 1.0f / vec2<f32>(textureDimensions(shadowMap, 0));
    
    // The bias avoid the shadow acne (you must adjust this value)
    //let bias = 0.005f; 
    let bias = 0.0015f;
    let lightDir = normalize(directionalLight.direction.xyz); 
    //let bias = max(0.001f, 0.005f * (1.0f - dot(normalW, lightDir)));
    // Usamos el dot product para obtener el coseno del ángulo
    //let cosTheta = clamp(dot(normalize(normalW), normalize(lightDir)), 0.0, 1.0);
    // Calculamos el bias usando la función tangente para suavizar la transición en pendientes
    //let bias = clamp(0.05 * tan(acos(cosTheta)), 0.005, 0.05);

    let NdotL = dot(normalize(normalW), normalize(lightDir));
    // Si la cara mira a la luz, forzamos que no haya sombra
    if (NdotL > 0.0) {
        return 0.0; // O simplemente reduce la influencia de la sombra
    }

    let currentDepth = projCoords.z - bias;

    // PCF Loop
    for(var x = -1; x <= 1; x++)
    {
        for(var y = -1; y <= 1; y++)
        {
            let offset = vec2<f32>(f32(x), f32(y)) * texelSize;
            // La GPU compara projCoords.z (con bias) contra el valor en la textura
            shadow += textureSampleCompareLevel(shadowMap, shadowSampler, projCoords.xy + offset, currentDepth);
            //shadow += textureSampleCompareLevel(shadowMap, shadowSampler, projCoords.xy, currentDepth);
        }
    }

    return shadow / 9.0f;
    //return currentDepth;
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

    output.normal = (model.modelMatrix * vec4f(normal, 0.0)).xyz;
    output.positionWV = (camera.viewMatrix * model.modelMatrix * vec4f(position, 1.0)).xyz;
    output.posShadow = light.projectionMatrix * light.viewMatrix * model.modelMatrix * vec4(position, 1.0);
    //output.posShadow = vec4<f32>(output.posShadow.xy * vec2<f32>(0.5, -0.5) + vec2<f32>(0.5), output.posShadow.z,  1.0f);

    output.texCoord = texCoord;

    return output;
}

@fragment
fn fragmentMain(
    @location(1) normal: vec3f,
    @location(2) texCoord: vec2f,
    @location(3) positionWV: vec3f,
    @location(4) posShadow: vec4f
) -> @location(0) vec4f {
    var normalWV = normalize((camera.viewMatrix * vec4<f32>(normalize(normal), 0.0f)).xyz);
    var normalW = normalize(normal);

    // Camera's position in view space is always at the origin (0, 0, 0) because the view matrix transforms world space to view space.
    var cameraPosWV = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    var viewDirection = cameraPosWV - vec4<f32>(positionWV, 1.0f);

    var lighting = Lighting(
        vec4<f32>(0.0, 0.0, 0.0, 1.0),
        vec4<f32>(0.0, 0.0, 0.0, 1.0),
        vec4<f32>(0.0, 0.0, 0.0, 1.0)
    );

    let shadow = ShadowCalculation(posShadow, normalW);
    //color = lighting.diffuse + lighting.specular + (u_shadowIntensity - shadow) *  lighting.ambient;
    //color = (2.0f - shadow) * (lighting.diffuse + lighting.specular) + lighting.ambient;

    if(directionalLight.enabled > 0){
        var l = ComputeDirectionalLight(directionalLight, material, normalize(normal), normalize(viewDirection.xyz), false);
        lighting.diffuse += l.diffuse;
        lighting.specular += l.specular;
        lighting.ambient += l.ambient;
    }

    return lighting.ambient + lighting.diffuse * shadow + lighting.specular;
    
    //let proj = (posShadow.xyz / posShadow.w) * 0.5 + 0.5;
    //return vec4f(proj, 1.0);

    //return vec4f(vec3f(shadow), 1.0);
}