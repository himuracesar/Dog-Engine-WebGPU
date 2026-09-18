@group(0) @binding(0) var<uniform> camera : Camera;

@group(2) @binding(0) var<uniform> material: Material;
@group(2) @binding(1) var texture: texture_2d<f32>;
@group(2) @binding(2) var samp: sampler;

@group(3) @binding(0) var<uniform> model : Model;

struct VertexOutput {
  @builtin(position) Position : vec4f,
  @location(0) fragNormal: vec3f,    // normal in world space
  @location(1) fragUV: vec2f,
}

@vertex
fn vsGBuffers(
  @location(0) position : vec3f,
  @location(1) normal : vec3f,
  @location(2) uv : vec2f
) -> VertexOutput {
  var output : VertexOutput;
  let worldPosition = (model.modelMatrix * vec4(position, 1.0)).xyz;
  output.Position = camera.projectionMatrix * camera.viewMatrix * vec4(worldPosition, 1.0);

  let normalModelMatrix = transpose(inverseMat4x4(model.modelMatrix));

  output.fragNormal = (normalModelMatrix * vec4(normal, 1.0)).xyz;
  output.fragUV = uv;

  return output;
}

struct GBufferOutput {
  // Textures: diffuse color, specular color, smoothness, emissive etc. could go here
  @location(0) albedo : vec4f,
  @location(1) normal : vec4f  
}

@fragment
fn fsGBuffers(
  @location(0) fragNormal: vec3f,
  @location(1) fragUV : vec2f
) -> GBufferOutput {
  // faking some kind of checkerboard texture
  let uv = floor(30.0 * fragUV);
  let c = 0.2 + 0.5 * ((uv.x + uv.y) - 2.0 * floor((uv.x + uv.y) / 2.0));

  var output : GBufferOutput;
  output.normal = vec4(normalize(fragNormal), 1.0);
  //output.albedo = vec4(c, c, c, 1.0);
  output.albedo = material.diffuseColor * textureSample(texture, samp, vec2<f32>(fragUV.x, 1.0f - fragUV.y));// + material.specularColor + material.ambientColor;

  return output;
}