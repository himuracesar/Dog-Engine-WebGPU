struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(1) normal : vec3<f32>,
    @location(2) texCoord : vec2<f32>
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

@group(0) @binding(0)
var<uniform> camera: Camera;

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

    output.texCoord = texCoord;

    return output;
}

@fragment
fn fragmentMain(@location(1) normal: vec3f, @location(2) texCoord: vec2f) -> @location(0) vec4f {
    return textureSample(texture, samp, texCoord) + material.diffuseColor;
}