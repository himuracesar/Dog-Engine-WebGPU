
/**
 * Point Light
 * @author César Himura
 * @version 1.0
 */
class DogPointLight {
    /**
     * Make an instances of a point light.
     */
    constructor(){
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.range = 1.0;
        this.kc = 0.0;
        this.kl = 0.0;
        this.kq = 0.0;
        this.intensity = 1.0;
        this.enabled = true;

        try {
            const jsonObject = bindGroupLayouts.get("DogPointLight");

            this.idBuffer = webGPUengine.createDogBuffer("DogPointLight" + idCount, BufferType.Data, null, jsonObject.bufferSize, true);
            this.bindGroup = webGPUengine.createBindGroup("DogPointLight", jsonObject.binding, jsonObject.bindGroupLayout, resourceManager.get(this.idBuffer));
            this.group = jsonObject.group;
            this.binding = jsonObject.binding;
        } catch(error) {
            console.log("DogPointLight: The bind group layouts are automatically created");

            this.bindGroupLayout = null;
            this.bufferSize = 16 * 4;
            this.idBuffer = webGPUengine.createDogBuffer("DogPointLight"  + idCount, BufferType.Data, null, this.bufferSize, true);
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
     * Get the position of the light
     * @returns {Vector3} the position of the light
     */
    getPosition(){
        return this.position;
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
     * Set the position of the light
     * @param {Vector3} position Position of the light
     */
    setPosition(position){
        this.position = position;
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
     * Get the constant attenuation
     * @returns {float} Constant attenuation
     */
    getConstantAttenuation(){
        return this.kc;
    }

    /**
     * Get the lineal attenuation
     * @returns {float} Lineal attenuation
     */
    getLinealAttenuation(){
        return this.kl;
    }

    /**
     * Get the quadratic attenuation
     * @returns {float} Quadratic attenuation
     */
    getQuadraticAttenuation(){
        return this.kq;
    }

    /**
     * Set the constant attenuation
     * @param {float} kc 
     */
    setConstantAttenuation(kc){
        this.kc = kc;
    }

    /**
     * Set the lineal attenuation
     * @param {float} kl 
     */
    setLinealAttenuation(kl){
        this.kl = kl;
    }

    /**
     * Set the quadratic attenuation
     * @param {float} kq 
     */
    setQuadraticAttenuation(kq){
        this.kq = kq;
    }

    /**
     * Get the range
     * @returns {float} range
     */
    getRange(){
        return this.range;
    }

    /**
     * Set the range
     * @param {float} range 
     */
    setRange(range){
        this.range = range;
    }

    /**
     * Get the index buffer
     * @returns {int} Index Buffer
     */
    getIndexBuffer(){
        return this.indexBuffer;
    }

    //----------------------- WebGPU's methods -----------------------

    /**
     * Get the bind group for the point light.
     * @returns {GPUBindGroup} Bind group for the point light.
     */
    getBindGroup(){
        return this.bindGroup;
    }

    /**
     * Get the buffer of the point light.
     * @returns {GPUBuffer} Buffer of the point light.
     */
    getBuffer(){
        return resourceManager.get(this.idBuffer);
    }

    /**
     * Get the bind group layout of the point light.
     * @returns {GPUBindGroupLayout} Bind group layout of the point light.
     */
    getBindGroupLayout(){
        return this.bindGroupLayout;
    }
}