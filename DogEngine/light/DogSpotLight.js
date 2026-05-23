/**
 * Spot Light
 * @author Cesar Himura
 * @version 1.0
 */
class SpotLight{
    constructor(){
        this.buffer = null;
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
        this.indexBuffer = -1;
        this.bindingPoint = -1;
        this.hasChange = false;
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
        this.hasChange = true;
    }

    /**
     * Set the position of the light
     * @param {Vector3} position Position of the light
     */
    setPosition(position){
        this.position = position;
        this.hasChange = true;
    }

    /**
     * Set the direction of the light
     * @param {Vector3} direction Direction of the light
     */
    setDirection(direction){
        this.direction = direction;
        this.hasChange = true;
    }

    /**
     * Turn on or off the light
     * @param {boolean} enabled True or false to turn on of off the light
     */
    setEnabled(enabled){
        this.enabled = enabled;
        this.hasChange = true;
    }

    /**
     * Set the intensity of the light
     * @param {float} intensity Intensity of the light
     */
    setIntensity(intensity){
        this.intensity = intensity;
        this.hasChange = true;
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
        this.hasChange = true;
    }

    /**
     * Set the lineal attenuation
     * @param {float} kl 
     */
    setLinealAttenuation(kl){
        this.kl = kl;
        this.hasChange = true;
    }

    /**
     * Set the quadratic attenuation
     * @param {float} kq 
     */
    setQuadraticAttenuation(kq){
        this.kq = kq;
        this.hasChange = true;
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
        this.hasChange = true;
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
        this.hasChange = true;
    }

    /**
     * Set the inner angle
     * @param {float} angle Angle in radians
     */
    setInnerAngle(angle){
        this.spotAngle = angle;
        this.hasChange = true;
    }

    /**
     * Set the extern angle
     * @param {float} angle Angle in radians
     */
    setExternAngle(angle){
        this.spotAngle = angle;
        this.hasChange = true;
    }

    /**
     * Set the angle in X axis
     * @param {float} angle Angle in radians
     */
    setAngleX(angle){
        this.angleX = angle;
        this.hasChange = true;
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
        this.hasChange = true;
        this.rotate();
    }

    /**
     * Get the index buffer
     * @returns {int} Index Buffer
     */
    getIndexBuffer(){
        return this.indexBuffer;
    }

    /**
     * Set the binding point for uniform buffer object
     * @param {int} bp binding point
     */
    setBindingPoint(bp){
        this.bindingPoint = bp;
    }

    /**
     * Get the binding point
     * @returns the binding point of the uniform buffer object
     */
    getBindingPoint(){
        return this.bindingPoint;
    }

    rotate(){
        var mRot = m4.identity();
        mRot = m4.multiply(mRot, m4.yRotation(this.angleY));
        mRot = m4.multiply(mRot, m4.xRotation(this.angleX));
        mRot = m4.multiply(mRot, m4.zRotation(this.angleZ));
        this.direction = m4.transformDirection(mRot, this.direction);
    }

    /**
     * Get a uniform buffer to send the information about material to shader
     * @param pipeline Pipeline where the uniform block is
     * @param nameUbo Name of the uniform block in the program of the pipeline
     * @returns {WebGLBuffer} Uniform buffer to send the information to shader
     */
    getBuffer(pipeline, nameUbo){
        if(this.bindingPoint == -1){
            console.log("binding point in point light = " + this.bindingPoint);
            return null;
        }

        if(this.buffer == null || this.hasChange){
            this.buffer = webGLengine.createBuffer(gl);
            gl.bindBufferBase(gl.UNIFORM_BUFFER, this.bindingPoint, this.buffer);
            gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array([
                this.position[0], this.position[1], this.position[2], 1.0,
                this.direction[0], this.direction[1], this.direction[2], 0.0,
                this.color[0], this.color[1], this.color[2], this.color[3],
                this.kc,
                this.kl,
                this.kq,
                this.range,
                this.enabled,
                this.spotAngle,
                this.spotInnerAngle,
                this.spotExternAngle,
                this.intensity,
                this.angleX,
                this.angleY,
                this.angleZ
            ]), gl.DYNAMIC_DRAW);

            this.indexBuffer = gl.getUniformBlockIndex(pipeline.getProgram(), nameUbo);
            gl.uniformBlockBinding(pipeline.getProgram(), this.indexBuffer, this.bindingPoint);

            gl.bindBuffer(gl.UNIFORM_BUFFER, null);

            this.hasChange = false;
        }

        return this.buffer;
    }
}