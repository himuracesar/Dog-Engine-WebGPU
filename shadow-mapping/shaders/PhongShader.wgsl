struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(1) normal : vec3<f32>,
    @location(2) texCoord : vec2<f32>,
    @location(3) positionWV : vec3<f32>,
    @location(4) posShadow : vec4<f32>,
    @location(5) positionW : vec3<f32>
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

/**
 * Calculate the shadow of the fragment using percentage-closer filtering (PCF).
 * 
 * @param fragPosLightSpace - The position of the fragment in light space.
 * @param positionW - The position of the fragment in world space.
 * @param normalW - The normal of the fragment in world space.
 * @return The shadow of the fragment.
 */
fn ShadowCalculation(fragPosLightSpace: vec4<f32>, positionW: vec3<f32>, normalW: vec3<f32>) -> f32
{
    var projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;

    projCoords.x = projCoords.x * 0.5f + 0.5f;
    projCoords.y = projCoords.y * -0.5f + 0.5f;

    if (projCoords.x < 0.0 || projCoords.x > 1.0 || 
        projCoords.y < 0.0 || projCoords.y > 1.0 || 
        projCoords.z > 1.0 || projCoords.z < 0.0) {
        return 0.0f; 
    }

    var shadow = 0.0f;
    let texelSize = 1.0f / 1024.0f; //vec2<f32>(textureDimensions(shadowMap, 0));
    
    // The bias avoid the shadow acne (you must adjust this value)
    //let bias = 0.005f; 
    let bias = 0.0f;
    //let bias = 0.0015f;
    let lightDir = normalize(directionalLight.position.xyz - positionW); 
    //let bias = max(0.001f, 0.005f * (1.0f - dot(normalW, lightDir)));
    // Usamos el dot product para obtener el coseno del ángulo
    //let cosTheta = clamp(dot(normalW, lightDir), 0.0f, 1.0f);
    // Calculamos el bias usando la función tangente para suavizar la transición en pendientes
    //let bias = clamp(0.05f * tan(acos(cosTheta)), 0.005f, 0.05f);

    let NdotL = dot(normalW, lightDir);
    /*
    The dot product is used to determine if the fragment is lit by the light.
    NdotL == 0.0f -> The light is orthogonal to the normal
    NdotL > 0.0f -> The light is in front of the normal or almost parallel to it. The angle is less than 90 degrees.
    NdotL < 0.0f -> The light is behind the normal. The angle is greater than 90 degrees.
    -- César Himura 22/07/2026
    */
    if (NdotL < 0.0f) {
        return 1.0f;
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
        }
    }

    return shadow / 9.0f;
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
    output.positionW = (model.modelMatrix * vec4f(position, 1.0)).xyz;

    output.texCoord = texCoord;

    return output;
}

@fragment
fn fragmentMain(
    @location(1) normal: vec3f,
    @location(2) texCoord: vec2f,
    @location(3) positionWV: vec3f,
    @location(4) posShadow: vec4f,
    @location(5) positionW: vec3f
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

    let shadow = ShadowCalculation(posShadow, positionW, normalW);

    if(directionalLight.enabled > 0){
        var l = ComputeDirectionalLight(directionalLight, material, normalize(normal), normalize(viewDirection.xyz), false);
        lighting.diffuse += l.diffuse;
        lighting.specular += l.specular;
        lighting.ambient += l.ambient;
    }

    return lighting.ambient + lighting.diffuse * shadow + lighting.specular * shadow;
}