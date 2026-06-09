/**
 * Material
 * @author César Himura
 * @version 1.0
 */
class DogMaterial {

    constructor() {
        this.name = "";
        this.ambientColor = [0.0, 0.0, 0.0, 1.0];
        this.diffuseColor = [0.0, 0.0, 0.0, 1.0];
        this.specularColor = [0.0, 0.0, 0.0, 1.0];
        this.emissiveColor = [0.0, 0.0, 0.0, 1.0];
        this.specularPower = 0.0;
        this.transparency = 1;
        this.opticalDensity = 1; //Ni obj file
        this.diffuseTextureIndex = -1;
        this.normalMapIndex = -1;
        this.bumpMapIndex = -1;
        this.roughness = 0.0;
        this.metallness = 0.0;
        this.fresnel = 0.0;
        this.has_Texture = false;

        var idCount = -1;

        try {
            const jsonObject = resourceManager.getConfigComponentByName("DogMaterial");
            idCount = resourceManager.getCounter();

            this.group = jsonObject.group;
            this.binding = jsonObject.binding;

            if(jsonObject.idBuffer == -1) {
                idCount = resourceManager.getCounter();
                this.idBuffer = webGPUengine.createDogBuffer("DogMaterial" + idCount, BufferType.Data, null, jsonObject.bufferSize, true);
                this.bindGroup = webGPUengine.createBindGroup("DogMaterial", jsonObject.binding, jsonObject.bindGroupLayout, resourceManager.get(this.idBuffer));
            } else {
                this.idBuffer = jsonObject.idBuffer;
                this.bindGroup = jsonObject.bindGroup;
            }
        } catch(error) {
            console.log("DogMaterial: The bind group layouts are automatically created");

            const bufferSize = 24 * 4;
            this.idBuffer = webGPUengine.createDogBuffer("DogMaterial"  + idCount, BufferType.Data, null, bufferSize, true);
            this.bindGroup = null; 
            this.group = -1;
            this.binding = -1;
        }
    }

    /**
     * Set the name 
     * @param {string} name Name
     */
    setName(name){
        this.name = name;
    }

    /**
     * Set ambient color
     * @param {Vector4} color Ambient color
     */
    setAmbientColor(color){
        this.ambientColor = color;
    }

    /**
     * Set the diffuse color
     * @param {Vector4} color Diffuse color 
     */
    setDiffuseColor(color){
        this.diffuseColor = color;
    }

    /**
     * Set the emissive color
     * @param {Vector4} color Emissive color
     */
    setEmissiveColor(color){
        this.emissiveColor = color;
    }

    /**
     * Set the specular color
     * @param {Vector4} color 
     */
    setSpecularColor(color){
        this.specularColor = color;
    }

    /**
     * Set the specular power
     * @param {float} power Exponent
     */
    setSpecularPower(power){
        this.specularPower = power;
    }

    /**
     * Set the transparency
     * @param {float} tr 
     */
    setTransparency(tr){
        this.transparency = tr;
    }

    /**
     * Set the optical density
     * @param {float} od 
     */
    setOpticalDensity(od){
        this.opticalDensity = od;
    }

    /**
     * Set the index of the diffuse texture
     * @param {int} index Index
     */
    setDiffuseTextureIndex(index){
        this.diffuseTextureIndex = index;
    }

    /**
     * Set the index of normal map
     * @param {int} index Index
     */
    setNormalMapIndex(index){
        this.normalMapIndex = index;
    }

    /**
     * Set the index of bump map
     * @param {int} index Index
     */
    setBumpMapIndex(index){
        this.bumpMapIndex = index;
    }

    /**
     * Set the roughness
     * @param {float} roughness 
     */
    setRoughness(roughness){
        this.roughness = roughness;
    }

    /**
     * Set the metallness
     * @param {float} metallness 
     */
    setMetallness(metallness){
        this.metallness = metallness;
    }

    /**
     * Set the fresnel
     * @param {float} fresnel 
     */
    setFresnel(fresnel){
        this.fresnel = fresnel;
    }

    /**
     * Get the material name
     * @returns {string} material name
     */
    getName(){
        return this.name;
    }

    /**
     * Get the index buffer
     * @returns {int} The index buffer
     */
    getIndexBuffer(){
        return this.indexBuffer;
    }

    /**
     * Set if the material has texture
     * @returns {boolean} True if the material has texture
     */
    setHasTexture(b){
        this.has_Texture = b;
    }

    /**
     * @returns true If the material has texture false in the other hand
     */
    hasTexture(){
        return this.has_Texture;
    }

    //----------------------- WebGPU's methods -----------------------

    /**
     * Get the bind group for the material.
     * @returns {GPUBindGroup} Bind group for the material.
     */
    getBindGroup(){
        return this.bindGroup;
    }

    /**
     * Get the buffer of the material.
     * @returns {GPUBuffer} Buffer of the material.
     */
    getBuffer(){
        return resourceManager.get(this.idBuffer);
    }

     /**
     * Gets the group to belong this component in the shaders.
     * @returns {int} group Group
     */
    getGroup(){
        return this.group;
    }

    /**
     * Get the data of the material in an array of float32. The spread (...) is necessary to
     * flat the data correctly in float.
     * @returns {Float32Array} Data to send to shader.
     */
    getData() {
        return new Float32Array([
            ...this.diffuseColor,
            ...this.specularColor,
            ...this.ambientColor,
            ...this.emissiveColor,
            this.specularPower,
            this.transparency,
            this.opticalDensity, 
            this.roughness,
            this.metallness,
            this.fresnel, 
            this.has_Texture ? 1 : 0, 
            0 //padding
        ]);
    }
}