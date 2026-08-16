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

struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(1) @interpolate(flat) color : vec4<f32>
};

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
    var normalWV = (camera.viewMatrix * normalWorld).xyz; //transform the normal to view space
    normalWV = normalize(normalWV);

    var positionWV = (camera.viewMatrix * model.modelMatrix * vec4f(position, 1.0)).xyz;

    // Camera's position in view space is always at the origin (0, 0, 0) because the view matrix transforms world space to view space.
    var cameraPosWV = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    var viewDirection = cameraPosWV - vec4<f32>(positionWV, 1.0f);

    var lighting = Lighting(
        vec4<f32>(0.0, 0.0, 0.0, 1.0),
        vec4<f32>(0.0, 0.0, 0.0, 1.0),
        vec4<f32>(0.0, 0.0, 0.0, 1.0)
    );

    if(directionalLight.enabled > 0){
        var l = ComputeDirectionalLight(directionalLight, material, normalWV, normalize(viewDirection.xyz), 0);
        lighting.diffuse += l.diffuse;
        lighting.specular += l.specular;
        lighting.ambient += l.ambient;
    }

    if(pointLight.enabled > 0){
        var l = ComputePointLight(pointLight, material, positionWV, normalWV, normalize(viewDirection.xyz), 0);
        lighting.diffuse += l.diffuse;
        lighting.specular += l.specular;
        lighting.ambient += l.ambient;
    }

    if(spotLight.enabled > 0){
        var l = ComputeSpotLight(spotLight, material, positionWV, normalWV, normalize(viewDirection.xyz), 0);
        lighting.diffuse += l.diffuse;
        lighting.specular += l.specular;
        lighting.ambient += l.ambient;
    }

    output.color = lighting.ambient + lighting.diffuse + lighting.specular;

    return output;
}

@fragment
fn fragmentMain(@location(1) @interpolate(flat) color: vec4f) -> @location(0) vec4f {
    return color;
}