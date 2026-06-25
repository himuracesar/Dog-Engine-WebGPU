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

/**
 * Gets the attenuation factor for a given distance.
 * 
 * @param kc Constant attenuation factor.
 * @param kl Linear attenuation factor.
 * @param kq Quadratic attenuation factor.
 * @param distance Distance from the light source.
 * @returns The attenuation factor.
 */
fn GetAttenuation(kc: f32, kl: f32, kq: f32, distance: f32) -> f32
{
    return 1.0 / (kc + kl * distance + kq * distance * distance);
}

/**
 * Gets the ambient lighting for a given material and color.
 * 
 * @param color The color of the light.
 * @param ambientMaterial The ambient material properties.
 * @returns The ambient lighting.
 */
fn GetAmbientLighting(color: vec4<f32>, ambientMaterial: vec4<f32>) -> vec4<f32>
{
    return color * ambientMaterial;
}

/**
 * Gets the specular lighting for a given light, material, normal, and view direction.
 * 
 * @param light The direction of the light.
 * @param normal The normal of the surface.
 * @param viewDirection The direction of the view.
 * @param color The color of the light.
 * @param specularMaterial The specular material properties.
 * @param specularPower The specular power of the material.
 * @returns The specular lighting.
 */
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

/**
 * Gets the specular lighting for a given light, material, normal and view direction using Blinn-Phong shading.
 * 
 * @param light The direction of the light.
 * @param normal The normal of the surface.
 * @param viewDirection The direction of the view.
 * @param color The color of the light.
 * @param specularMaterial The specular material properties.
 * @param specularPower The specular power of the material.
 * @returns The specular lighting.
 */
fn GetSpecularBlinnLighting(light: vec3<f32>, normal: vec3<f32>, viewDirection: vec3<f32>, color: vec4<f32>, specularMaterial: vec4<f32>, specularPower: f32) -> vec4<f32>
{
	var h = normalize(light + normalize(viewDirection));

	var specFactor = pow(max(dot(normal, h), 0.0), specularPower);

	return specFactor * color * specularMaterial;
}

/**
 * Gets the diffuse lighting for a given light, material, and normal.
 * 
 * @param light The direction of the light.
 * @param normal The normal of the surface.
 * @param color The color of the light.
 * @param diffuseMaterial The diffuse material properties.
 * @returns The diffuse lighting.
 */
fn GetDiffuseLighting(light: vec3<f32>, normal: vec3<f32>, color: vec4<f32>, diffuseMaterial: vec4<f32>) -> vec4<f32>
{
    var normaln = normalize(normal);
    var geometryTerm = max(0.0, dot(light, normaln));

    return diffuseMaterial * geometryTerm * color;
}

/**
 * Computes the lighting for a given directional light.
 * 
 * @param dl The directional light.
 * @param material The material.
 * @param normal The normal of the surface.
 * @param viewDirection The direction of the view.
 * @returns The lighting that is the sum of diffuse, specular and ambient lighting.
 */
fn ComputeDirectionalLight(dl: DirectionalLight, material: Material, normal: vec3<f32>, viewDirection: vec3<f32>, blinnSpecular: bool) -> Lighting
{
    var lighting = Lighting(
        vec4<f32>(0.0, 0.0, 0.0, 1.0),
        vec4<f32>(0.0, 0.0, 0.0, 1.0),
        vec4<f32>(0.0, 0.0, 0.0, 1.0)
    );
    
    var mWorldView = camera.viewMatrix;// * model.modelMatrix;

    var light = mWorldView * -dl.direction;
    light = normalize(light);
    
    lighting.diffuse = dl.intensity * GetDiffuseLighting(light.xyz, normal, dl.color, material.diffuseColor);
    
    if(!blinnSpecular){
        lighting.specular = dl.intensity * GetSpecularLighting(light.xyz, normalize(normal), viewDirection, dl.color, material.specularColor, material.specularPower);
    }else{
        lighting.specular = dl.intensity * GetSpecularBlinnLighting(light.xyz, normalize(normal), viewDirection, dl.color, material.specularColor, material.specularPower);
    }
    
    lighting.ambient = GetAmbientLighting(dl.color, material.ambientColor);
    
    return lighting;
}

/**
 * Computes the lighting for a given point light.
 * 
 * @param pl The point light.
 * @param material The material.
 * @param position The position of the surface.
 * @param normal The normal of the surface.
 * @param viewDirection The direction of the view.
 * @returns The lighting that is the sum of diffuse, specular and ambient lighting.
 */
fn ComputePointLight(pl: PointLight, material: Material, position: vec3<f32>, normal: vec3<f32>, viewDirection: vec3<f32>, blinnSpecular: bool) -> Lighting
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
    lighting.diffuse = pl.intensity * GetDiffuseLighting(lightDirectionWV, normaln, pl.color, material.diffuseColor);

    if(!blinnSpecular){
        lighting.specular = pl.intensity * GetSpecularLighting(lightDirectionWV, normaln, normalize(viewDirection), pl.color, material.specularColor, material.specularPower);
    } else {
        lighting.specular = pl.intensity * GetSpecularBlinnLighting(lightDirectionWV, normaln, normalize(viewDirection), pl.color, material.specularColor, material.specularPower);
    }

    var attenuation = GetAttenuation(pl.kc, pl.kl, pl.kq, d);

    lighting.diffuse *= attenuation;
    lighting.specular *= attenuation;

    return lighting;
}

/**
 * Computes the lighting for a given spot light.
 * 
 * @param sl The spot light.
 * @param material The material.
 * @param position The position of the surface.
 * @param normal The normal of the surface.
 * @param viewDirection The direction of the view.
 * @returns The lighting that is the sum of diffuse, specular and ambient lighting.
 */
fn ComputeSpotLight(sl: SpotLight, material: Material, position: vec3<f32>, normal: vec3<f32>, viewDirection: vec3<f32>, blinnSpecular: bool) -> Lighting
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

    var normaln = normal; //normalize(normal);
    lighting.diffuse = sl.intensity * GetDiffuseLighting(lightDirectionWV, normaln, sl.color, material.diffuseColor);

    if(!blinnSpecular){
        lighting.specular = sl.intensity * GetSpecularLighting(lightDirectionWV, normaln, normalize(viewDirection), sl.color, material.specularColor, material.specularPower);
    } else {
        lighting.specular = sl.intensity * GetSpecularBlinnLighting(lightDirectionWV, normaln, normalize(viewDirection), sl.color, material.specularColor, material.specularPower);
    }

    //float spot = pow(max(dot(-light, normalize(sl.  )), 0.0f), sl.spotAngle);
    // Spot intensity
    //** Control del cono del spot con un solo angulo
    var minCos = cos(sl.spotAngle);
    var maxCos = (minCos + 1.0f) / 2.0f;

    //** Control con dos conos, uno interno y otro externo 
    //float minCos = cos(sl.spotExternAngle);
    //var maxCos = cos(sl.spotInnerAngle);

    var cosAngle = dot(spotLightDirectionWV.xyz, - lightDirectionWV);
    var spot = smoothstep(minCos, maxCos, cosAngle);

    var attenuation = spot / GetAttenuation(sl.kc, sl.kl, sl.kq, d);

    lighting.ambient *= spot;
    lighting.diffuse = lighting.diffuse * attenuation;
    lighting.specular = lighting.specular * attenuation;

    return lighting;
}