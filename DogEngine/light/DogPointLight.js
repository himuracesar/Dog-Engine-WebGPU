
/**
 * Point Light
 * @author César Himura
 * @version 1.0
 */
class DogPointLight {
    /**
     * Make an instances of a point light.
     */
    constructor(createBuffer = true, createBindGroup = true) {
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.range = 1.0;
        this.kc = 0.0;
        this.kl = 0.0;
        this.kq = 0.0;
        this.intensity = 1.0;
        this.enabled = true;

        let idCount = -1;

        if (createBuffer) {
            idCount = resourceManager.getCounter();
            const bufferSize = 16 * 4;

            this.idBuffer = webGPUengine.createDogBuffer("DogPointLight" + idCount, BufferType.Data, null, bufferSize, true);
        }

        const jsonObj = resourceManager.getGroupAndBinding("DogPointLight");
        this.group = jsonObj.group;
        this.binding = jsonObj.binding;

        if (createBindGroup) {
            const bindGroupLayout = resourceManager.getBindGroupLayout(this.group);

            const objLayout = {
                label: "Point Light Bind Group",
                layout: bindGroupLayout,
                entries: [{
                    binding: this.binding,
                    resource: { buffer: resourceManager.get(this.idBuffer).getWebGPUBuffer() }
                }],
            };

            idCount = (idCount == -1) ? resourceManager.getCounter() : idCount;

            this.idBindGroup = webGPUengine.createBindGroup(idCount, objLayout);
        }

        /*var idCount = -1;

        try {
            const jsonObject = resourceManager.getConfigComponentByName("DogPointLight");
            idCount = resourceManager.getCounter();

            this.group = jsonObject.group;
            this.binding = jsonObject.binding;

            if(jsonObject.idBuffer == -1) {
                idCount = resourceManager.getCounter();
                this.idBuffer = webGPUengine.createDogBuffer("DogPointLight" + idCount, BufferType.Data, null, jsonObject.bufferSize, true);
                this.bindGroup = webGPUengine.createBindGroup("DogPointLight", jsonObject.binding, jsonObject.bindGroupLayout, resourceManager.get(this.idBuffer));
            } else {
                this.idBuffer = jsonObject.idBuffer;
                this.bindGroup = jsonObject.bindGroup;
            }
        } catch(error) {
            console.log("DogPointLight: The bind group layouts are automatically created " + error);

            const bufferSize = 16 * 4;
            this.idBuffer = webGPUengine.createDogBuffer("DogPointLight"  + idCount, BufferType.Data, null, bufferSize, true);
            this.bindGroup = null; 
            this.group = -1;
            this.binding = -1;
        }*/
    }

    /**
     * Get the color of the light
     * @returns {Vector4} Color of the light
     */
    getColor() {
        return this.color;
    }

    /**
     * Get the position of the light
     * @returns {Vector3} the position of the light
     */
    getPosition() {
        return this.position;
    }

    /**
     * Get if the light is on or off
     * @returns {boolean} On of off light
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Get the intensity of the light
     * @returns {float} The intensity of the light
     */
    getIntensity() {
        return this.intensity;
    }

    /**
     * Set the color of the light
     * @param {Vector4} color Color of the light
     */
    setColor(color) {
        this.color = color;
    }

    /**
     * Set the position of the light
     * @param {Vector3} position Position of the light
     */
    setPosition(position) {
        this.position = position;
    }

    /**
     * Turn on or off the light
     * @param {boolean} enabled True or false to turn on of off the light
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Set the intensity of the light
     * @param {float} intensity Intensity of the light
     */
    setIntensity(intensity) {
        this.intensity = intensity;
    }

    /**
     * Get the constant attenuation
     * @returns {float} Constant attenuation
     */
    getConstantAttenuation() {
        return this.kc;
    }

    /**
     * Get the lineal attenuation
     * @returns {float} Lineal attenuation
     */
    getLinealAttenuation() {
        return this.kl;
    }

    /**
     * Get the quadratic attenuation
     * @returns {float} Quadratic attenuation
     */
    getQuadraticAttenuation() {
        return this.kq;
    }

    /**
     * Set the constant attenuation
     * @param {float} kc 
     */
    setConstantAttenuation(kc) {
        this.kc = kc;
    }

    /**
     * Set the lineal attenuation
     * @param {float} kl 
     */
    setLinealAttenuation(kl) {
        this.kl = kl;
    }

    /**
     * Set the quadratic attenuation
     * @param {float} kq 
     */
    setQuadraticAttenuation(kq) {
        this.kq = kq;
    }

    /**
     * Get the range
     * @returns {float} range
     */
    getRange() {
        return this.range;
    }

    /**
     * Set the range
     * @param {float} range 
     */
    setRange(range) {
        this.range = range;
    }

    //----------------------- WebGPU's methods -----------------------

    /**
     * Get the bind group for the point light.
     * @returns {GPUBindGroup} Bind group for the point light.
     */
    getBindGroup() {
        return resourceManager.getBindGroup(this.idBindGroup);
    }

    /**
     * Get the buffer of the point light.
     * @returns {GPUBuffer} Buffer of the point light.
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
     * Get the binding to belong this component in the shaders.
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
     * Get the data of the point light in an array of float32. The spread (...) is necessary to
     * flat the data correctly in float.
     * @returns {Float32Array} Data to send to shader.
     */
    getData() {
        return new Float32Array([
            ...this.position,
            ...this.color,
            this.kc,
            this.kl,
            this.kq,
            this.range,
            this.enabled ? 1 : 0,
            this.intensity,
            0, 0 //padding
        ]);
    }
}