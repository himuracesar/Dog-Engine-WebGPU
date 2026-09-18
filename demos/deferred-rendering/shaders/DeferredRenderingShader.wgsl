struct LightData {
  position : vec4f,
  color : vec3f,
  radius : f32,
}
struct LightsBuffer {
  lights: array<LightData>,
}

struct Config {
  numLights : u32,
}

@group(0) @binding(0) var<uniform> camera : Camera;

@group(1) @binding(0) var gBufferAlbedo: texture_2d<f32>;
@group(1) @binding(1) var gBufferNormal: texture_2d<f32>;
@group(1) @binding(2) var gBufferDepth: texture_2d<f32>;

@group(2) @binding(0) var<uniform> directionalLight: DirectionalLight;

@group(3) @binding(0) var<storage, read> lightsBuffer: LightsBuffer;
@group(3) @binding(1) var<uniform> config: Config;

fn world_from_screen_coord(coord : vec2f, depth_sample: f32) -> vec3f {
  // reconstruct world-space position from the screen coordinate.
  let posClip = vec4(coord.x * 2.0 - 1.0, (1.0 - coord.y) * 2.0 - 1.0, depth_sample, 1.0);
  let posWorldW = inverseMat4x4(camera.projectionMatrix * camera.viewMatrix) * posClip;
  let posWorld = posWorldW.xyz / posWorldW.www;

  return posWorld;
}

@vertex
fn vsMain(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4f {
  const pos = array(
    vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0),
    vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0),
  );

  return vec4f(pos[VertexIndex], 0.0, 1.0);
}

@fragment
fn fsMain(
  @builtin(position) coord : vec4f
) -> @location(0) vec4f {
  var result : vec3f;

  let depth = textureLoad(
    gBufferDepth,
    vec2i(floor(coord.xy)),
    0
  ).x;

  // Don't light the sky.
  if (depth >= 1.0) {
    discard;
  }

  let bufferSize = textureDimensions(gBufferDepth);
  let coordUV = coord.xy / vec2f(bufferSize);
  let position = world_from_screen_coord(coordUV, depth);

  let normal = textureLoad(
    gBufferNormal,
    vec2i(floor(coord.xy)),
    0
  ).xyz;

  let albedo = textureLoad(
    gBufferAlbedo,
    vec2i(floor(coord.xy)),
    0
  ).rgb;

  var lighting = Lighting(
      vec4<f32>(0.0, 0.0, 0.0, 1.0),
      vec4<f32>(0.0, 0.0, 0.0, 1.0),
      vec4<f32>(0.0, 0.0, 0.0, 1.0)
  );

  for (var i = 0u; i < config.numLights; i++) {
    let L = lightsBuffer.lights[i].position.xyz - position;
    let distance = length(L);

    if (distance > lightsBuffer.lights[i].radius) {
      continue;
    }

    let lambert = max(dot(normal, normalize(L)), 0.0);
    result += vec3f(
      lambert * pow(1.0 - distance / lightsBuffer.lights[i].radius, 2.0) * lightsBuffer.lights[i].color * albedo
    );

    lighting.diffuse = vec4<f32>(result, 1.0f);
  }

  // some manual ambient
  //result += vec3(0.2);
  lighting.ambient = vec4<f32>(vec3(0.2f), 1.0f);

  let posWV = camera.viewMatrix * vec4<f32>(position.xyz, 1.0f);
  let viewDirection = vec4<f32>(-posWV.xyz, 0.0f);
  let normalWV = camera.viewMatrix * vec4<f32>(normal, 0.0f);

  var light = camera.viewMatrix * -directionalLight.direction;
  light = normalize(light);

  if(directionalLight.enabled > 0){
      //var l = ComputeDirectionalLight(directionalLight, material, normalize(normalWV.xyz), normalize(viewDirection.xyz), 0);
      // phong shading
      lighting.diffuse += directionalLight.intensity * GetDiffuseLighting(light.xyz, normalize(normalWV.xyz), directionalLight.color, vec4<f32>(albedo, 1.0)); 
      lighting.specular += directionalLight.intensity * GetSpecularLighting(light.xyz, normalize(normalWV.xyz), normalize(viewDirection.xyz), directionalLight.color, vec4<f32>(0.7f, 0.7f, 0.7f, 1.0), 32.0f);
      lighting.ambient += GetAmbientLighting(directionalLight.color, vec4<f32>(albedo / 10.0f, 1.0));
  }

  //return vec4(normal, 1.0);
  let color = lighting.diffuse + lighting.specular + lighting.ambient;

  return color;
}