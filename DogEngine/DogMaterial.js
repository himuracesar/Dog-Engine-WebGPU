/**
 * Material
 * @author César Himura
 * @version 1.0
 */
class DogMaterial extends DogResource {

    constructor(name, createBuffer = true, createBindGroup = true) {
        super(name);

        this.name = name;
        this.ambientColor = [0.0, 0.0, 0.0, 1.0];
        this.diffuseColor = [0.0, 0.0, 0.0, 1.0];
        this.specularColor = [0.0, 0.0, 0.0, 1.0];
        this.emissiveColor = [0.0, 0.0, 0.0, 1.0];
        this.specularPower = 32.0;
        this.transparency = 1;
        this.opticalDensity = 1; //Ni obj file
        this.diffuseTextureIndex = "";
        this.normalMapIndex = "";
        this.bumpMapIndex = "";
        this.roughness = 0.0;
        this.metallness = 0.0;
        this.fresnel = 0.0;
        this.has_Texture = false;

        this.idBuffer = -1;
        this.group = -1;
        this.binding = -1;
        this.idBindGroup = -1;

        let idCount = -1;

        if (createBuffer) {
            idCount = resourceManager.getCounter();
            const bufferSize = 24 * 4;

            this.idBuffer = webGPUengine.createDogBuffer("DogMaterial-Buffer" + idCount, BufferType.Data, null, bufferSize, true);
        }

        const jsonObj = resourceManager.getGroupAndBinding("DogMaterial");
        this.group = jsonObj.group;
        this.binding = jsonObj.binding;

        if (createBindGroup) {
            const bindGroupLayout = resourceManager.getBindGroupLayout(this.group);

            const objLayout = {
                label: "Material Bind Group",
                layout: bindGroupLayout,
                entries: [{
                    binding: this.binding,
                    resource: { buffer: resourceManager.get(this.idBuffer).getWebGPUBuffer() }
                }],
            };

            idCount = (idCount == -1) ? resourceManager.getCounter() : idCount;

            this.idBindGroup = webGPUengine.createBindGroup(idCount, objLayout);
        }
    }

    /**
     * Set ambient color
     * @param {Vector4} color Ambient color
     */
    setAmbientColor(color) {
        this.ambientColor = color;
    }

    /**
     * Set the diffuse color
     * @param {Vector4} color Diffuse color 
     */
    setDiffuseColor(color) {
        this.diffuseColor = color;
    }

    /**
     * Set the emissive color
     * @param {Vector4} color Emissive color
     */
    setEmissiveColor(color) {
        this.emissiveColor = color;
    }

    /**
     * Set the specular color
     * @param {Vector4} color 
     */
    setSpecularColor(color) {
        this.specularColor = color;
    }

    /**
     * Set the specular power
     * @param {float} power Exponent
     */
    setSpecularPower(power) {
        this.specularPower = power;
    }

    /**
     * Set the transparency
     * @param {float} tr 
     */
    setTransparency(tr) {
        this.transparency = tr;
    }

    /**
     * Set the optical density
     * @param {float} od 
     */
    setOpticalDensity(od) {
        this.opticalDensity = od;
    }

    /**
     * Set the index of the diffuse texture
     * @param {string} index Index
     */
    setDiffuseTextureIndex(index) {
        this.diffuseTextureIndex = index;
    }

    /**
     * Set the index of normal map
     * @param {string} index Index
     */
    setNormalMapIndex(index) {
        this.normalMapIndex = index;
    }

    /**
     * Set the index of bump map
     * @param {string} index Index
     */
    setBumpMapIndex(index) {
        this.bumpMapIndex = index;
    }

    /**
     * Set the roughness
     * @param {float} roughness 
     */
    setRoughness(roughness) {
        this.roughness = roughness;
    }

    /**
     * Set the metallness
     * @param {float} metallness 
     */
    setMetallness(metallness) {
        this.metallness = metallness;
    }

    /**
     * Set the fresnel
     * @param {float} fresnel 
     */
    setFresnel(fresnel) {
        this.fresnel = fresnel;
    }

    /**
     * Get the material name
     * @returns {string} material name
     */
    getName() {
        return this.name;
    }

    /**
     * Get the index buffer
     * @returns {int} The index buffer
     */
    getIndexBuffer() {
        return this.indexBuffer;
    }

    /**
     * Set if the material has texture
     * @returns {boolean} True if the material has texture
     */
    setHasTexture(b) {
        this.has_Texture = b;
    }

    /**
     * @returns true If the material has texture false in the other hand
     */
    hasTexture() {
        return this.has_Texture;
    }

    //----------------------- WebGPU's methods -----------------------

    /**
     * Get the bind group for the material.
     * @returns {GPUBindGroup} Bind group for the material.
     */
    getBindGroup() {
        return resourceManager.getBindGroup(this.idBindGroup);
    }

    /**
     * Get the buffer of the material.
     * @returns {GPUBuffer} Buffer of the material.
     */
    getBuffer() {
        return resourceManager.get(this.idBuffer);
    }

    /**
    * Gets the group to belong this component in the shaders.
    * @returns {int} group Group
    */
    getGroup() {
        return this.group;
    }

    /**
     * Get the binding of this component in the shaders.
     * @returns {int} binding Binding
     */
    getBinding() {
        return this.binding;
    }

    /**
     * Set the ID of the bind group.
     * @param {int} idBindGroup ID of the bind group.
     */
    setIdBindGroup(idBindGroup) {
        this.idBindGroup = idBindGroup;
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