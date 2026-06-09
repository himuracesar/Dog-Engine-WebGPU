/**
 * Directional Light
 * @author César Himura
 * @version 1.0
 */
class DogDirectionalLight {
    /**
     * Creates an instance of directional light.
     */
    constructor(){
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.position = [1.0, -1.0, -1.0, 1.0];
	    this.direction = [1.0, -1.0, -1.0, 0.0];
	    this.enabled = true;
	    this.intensity = 1.0;

        var idCount = -1;

        try {
            const jsonObject = resourceManager.getConfigComponentByName("DogDirectionalLight");
            idCount = resourceManager.getCounter();

            this.group = jsonObject.group;
            this.binding = jsonObject.binding;

            if(jsonObject.idBuffer == -1) {
                idCount = resourceManager.getCounter();
                this.idBuffer = webGPUengine.createDogBuffer("DogDirectionalLight" + idCount, BufferType.Data, null, jsonObject.bufferSize, true);
                this.bindGroup = webGPUengine.createBindGroup("DogDirectionalLight", jsonObject.binding, jsonObject.bindGroupLayout, resourceManager.get(this.idBuffer));
            } else {
                this.idBuffer = jsonObject.idBuffer;
                this.bindGroup = jsonObject.bindGroup;
            }
        } catch(error) {
            console.log("DogDirectionalLight: The bind group layouts are automatically created");

            const bufferSize = 16 * 4;
            this.idBuffer = webGPUengine.createDogBuffer("DogDirectionalLight"  + idCount, BufferType.Data, null, bufferSize, true);
            this.bindGroup = null; 
            this.group = -1;
            this.binding = -1;
        }
    }

    /**
     * Get the color of the light
     * @returns {Vector4} Color of the light
     */
    getColor(){
        return this.color;
    }

    /**
     * Get the direction of the light
     * @returns {Vector3} the direction of the light
     */
    getDirection(){
        return this.direction;
    }

    /**
     * Get if the light is on or off
     * @returns {boolean} On of off light
     */
    isEnabled(){
        return this.enabled;
    }

    /**
     * Get the intensity of the light
     * @returns {float} The intensity of the light
     */
    getIntensity(){
        return this.intensity;
    }

    /**
     * Set the color of the light
     * @param {Vector4} color Color of the light
     */
    setColor(color){
        this.color = color;
    }

    /**
     * Set the direction of the light
     * @param {Vector3} direction Direction of the light
     */
    setDirection(direction){
        this.direction = direction;
    }

    /**
     * Turn on or off the light
     * @param {boolean} enabled True or false to turn on of off the light
     */
    setEnabled(enabled){
        this.enabled = enabled;
    }

    /**
     * Set the intensity of the light
     * @param {float} intensity Intensity of the light
     */
    setIntensity(intensity){
        this.intensity = intensity;
    }

    /**
     * Get the position of the light.
     * @returns {Vector4} position
     */
    getPosition(){
        return this.position;
    }

    /**
     * Position of the light.
     * @param {Vector4} position 
     */
    setPosition(position){
        this.position = position;
    }

    //----------------------- WebGPU's methods -----------------------

    /**
     * Get the bind group for the directional light.
     * @returns {GPUBindGroup} Bind group for the directional light.
     */
    getBindGroup(){
        return this.bindGroup;
    }

    /**
     * Get the buffer of the directional light.
     * @returns {GPUBuffer} Buffer of the directional light.
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
     * Get the data of the directional light in an array of float32. The spread (...) is necessary to
     * flat the data correctly in float.
     * @returns {Float32Array} Data to send to shader.
     */
    getData() {
        return new Float32Array([
            ...this.position,
            ...this.direction,
            ...this.color,
            this.enabled ? 1 : 0,
            this.intensity,
            0, 0 //padding
        ]);
    }
}