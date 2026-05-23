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
        this.indexBuffer = -1;
        this.bindingPoint = -1;

        this.uniformBuffer = this.createUniformBuffer();
        this.bindGroupLayout = this.createBindGroupLayout();
        this.bindGroup = this.createBindGroup();
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
     * Create the uniform buffer for the directional light.
     * @returns {GPUBuffer} Uniform buffer for the light.
     */
    createUniformBuffer(){
        const bufferSize = 16 * 4; // Matrix4x4 has 16 floats, each float is 4 bytes.
        const buffer = pGraphics.device.createBuffer({
            size: bufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        
        return buffer;
    }

    /**
     * Create the bind group layout for the camera. The bind group layout defines the layout of the bind group, 
     * which is used to bind the uniform buffer to the shader.
     * @returns {GPUBindGroupLayout} Bind group layout for the directional light.
     */
    createBindGroupLayout(){
        const bindGroupLayout = pGraphics.device.createBindGroupLayout({
            entries: [{
                binding: 0,                           // Same index as in the bindGroup
                visibility: GPUShaderStage.VERTEX,    // In which stages is visible
                buffer: {
                    type: "uniform"                     // uniform buffer (default)
                }
            }]
        });

        return bindGroupLayout;
    }

    /**
     * Create the bind group for the directional light. First create the bind group layout and then create 
     * the bind group with the uniform buffer of the directional light.
     * @returns {GPUBindGroup} Bind group for the camera.
     */
    createBindGroup(){
        const bindGroup = pGraphics.device.createBindGroup({
            layout: this.bindGroupLayout,
            entries: [{
                binding: 0,
                resource: { buffer: this.uniformBuffer }
            }],
        });

        return bindGroup;
    }

    /**
     * Get the bind group for the camera.
     * @returns {GPUBindGroup} Bind group for the camera.
     */
    getBindGroup(){
        return this.bindGroup;
    }

    /**
     * Get the uniform buffer of the camera.
     * @returns {GPUBuffer} Uniform buffer of the camera.
     */
    getUniformBuffer(){
        return this.uniformBuffer;
    }

    /**
     * Get the bind group layout of the camera.
     * @returns {GPUBindGroupLayout} Bind group layout of the camera.
     */
    getBindGroupLayout(){
        return this.bindGroupLayout;
    }

    /*
    gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array([
        this.position[0], this.position[1], this.position[2], this.position[3], --> 4
        this.direction[0], this.direction[1], this.direction[2], this.direction[3], --> 4
        this.color[0], this.color[1], this.color[2], this.color[3], --> 4
        this.enabled ? 1 : 0, --> 1
        this.intensity, --> 1
        0, 0 //padding
    ]), gl.DYNAMIC_DRAW);
    */
}