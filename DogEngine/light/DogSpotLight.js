/**
 * Spot Light
 * @author Cesar Himura
 * @version 1.0
 */
class DogSpotLight {
    /**
     * Create an instance of spot light.
     */
    constructor() {
        this.position = [0.0, 0.0, 0.0];
        this.direction = [0.0, -1.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.range = 1.0;
        this.kc = 0.0;
        this.kl = 0.0;
        this.kq = 0.0;
        this.spotAngle;
		this.spotInnerAngle;
		this.spotExternAngle;
		this.angleX = 0.0;
		this.angleY = 0.0;
		this.angleZ = 0.0;
        this.intensity = 1.0;
        this.enabled = true;

        try {
            const jsonObject = bindGroupLayouts.get("DogSpotLight");

            this.idBuffer = webGPUengine.createDogBuffer("DogSpotLight" + idCount, BufferType.Data, null, jsonObject.bufferSize, true);
            this.bindGroup = webGPUengine.createBindGroup("DogSpotLight", jsonObject.binding, jsonObject.bindGroupLayout, resourceManager.get(this.idBuffer));
            this.group = jsonObject.group;
            this.binding = jsonObject.binding;
        } catch(error) {
            console.log("DogSpotLight: The bind group layouts are automatically created");

            this.bindGroupLayout = null;
            this.bufferSize = 24 * 4;
            this.idBuffer = webGPUengine.createDogBuffer("DogSpotLight"  + idCount, BufferType.Data, null, this.bufferSize, true);
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
     * Get Spot angle
     * @returns {float} Spot angle
     */
    getSpotAngle(){
        return this.spotAngle;
    }

    /**
     * Get inner angle
     * @returns {float} Inner angle
     */
    getInnerAngle(){
        return this.spotInnerAngle;
    }

    /**
     * Get extern angle
     * @returns {float} Spot angle
     */
    getExternAngle(){
        return this.spotExternAngle;
    }

    /**
     * Get Angle in X axis
     * @returns {float} Angle in X axis
     */
    getAngleX(){
        return this.angleX;
    }

    /**
     * Get Angle in Y axis
     * @returns {float} Angle in YS axis
     */
    getAngleY(){
        return this.angleY;
    }

    /**
     * Get Angle in Z axis
     * @returns {float} Angle in Z axis
     */
    getAngleZ(){
        return this.angleZ;
    }

    /**
     * Set the spot angle
     * @param {float} angle Angle in radians
     */
    setSpotAngle(angle){
        this.spotAngle = angle;
    }

    /**
     * Set the inner angle
     * @param {float} angle Angle in radians
     */
    setInnerAngle(angle){
        this.spotAngle = angle;
    }

    /**
     * Set the extern angle
     * @param {float} angle Angle in radians
     */
    setExternAngle(angle){
        this.spotAngle = angle;
    }

    /**
     * Set the angle in X axis
     * @param {float} angle Angle in radians
     */
    setAngleX(angle){
        this.angleX = angle;
        this.rotate();
    }

    /**
     * Set the angle in Y axis
     * @param {float} angle Angle in radians
     */
    setAngleY(angle){
        this.angleY = angle;
        this.hasChange = true;
        this.rotate();
    }

    /**
     * Set the angle in Z axis
     * @param {float} angle Angle in radians
     */
    setAngleZ(angle){
        this.angleZ = angle;
        this.rotate();
    }

    rotate() {
        const mRot = glMatrix.mat4.create();

        glMatrix.mat4.rotateY(mRot, mRot, this.angleY);
        glMatrix.mat4.rotateX(mRot, mRot, this.angleX);
        glMatrix.mat4.rotateZ(mRot, mRot, this.angleZ);
        glMatrix.vec3.transformMat4(this.direction, this.direction);
        vec3.transformMat4(this.direction, this.direction, transformMatrix);
    }

     //----------------------- WebGPU's methods -----------------------

    /**
     * Get the bind group for the spot light.
     * @returns {GPUBindGroup} Bind group for the spot light.
     */
    getBindGroup(){
        return this.bindGroup;
    }

    /**
     * Get the buffer of the spot light.
     * @returns {GPUBuffer} Buffer of the spot light.
     */
    getBuffer(){
        return resourceManager.get(this.idBuffer);
    }

    /**
     * Get the bind group layout of the spot light.
     * @returns {GPUBindGroupLayout} Bind group layout of the spot light.
     */
    getBindGroupLayout(){
        return this.bindGroupLayout;
    }
}