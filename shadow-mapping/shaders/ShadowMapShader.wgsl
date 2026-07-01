struct Light {
    viewMatrix : mat4x4<f32>,
    projectionMatrix : mat4x4<f32>
};

struct Model {
    modelMatrix : mat4x4<f32>
};

@group(0) @binding(0) var<uniform> light : Light;
@group(3) @binding(0) var<uniform> model : Model;

@vertex
fn vertexMain(@location(0) position: vec3f) -> @builtin(position) vec4f {
  return light.projectionMatrix * light.viewMatrix * model.modelMatrix * vec4(position, 1.0);
}