/**
 * Camera 3D to move in a scene
 * @author César Himura
 * @version 1.0
 */
class DogCamera {
    /**
     * Create a camera with default values. The camera is located in the origin of the world and looks to the negative z axis. 
     * The up vector is the positive y axis and the right vector is the positive x axis. The field of view is 60 degrees, 
     * the aspect ratio is the width of the canvas divided by the height of the canvas, the near plane is 0.1 and the far plane 
     * is 1000. The speed to move is 0.1 and the speed to rotate is 0.005.
     * The camera also creates a uniform buffer to store the view and projection matrices, a bind group layout and a bind group 
     * to bind the uniform buffer to the shader.
     */
    constructor(){
        this.position = [0.0, 0.0, 0.0];
        this.up = [0.0, 1.0, 0.0, 0.0];
        this.lookAt = [0.0, 0.0, 0.0];
        this.forward = [0.0, 0.0, -1.0, 0.0];
        this.right = [1.0, 0.0, 0.0, 0.0];
        this.yawAngle = 0.0;
        this.pitchAngle = 0.0;
        this.fov = glMatrix.glMatrix.toRadian(60.0);
        this.aspectRatio = canvas.clientWidth / canvas.clientHeight;
        this.nearPlane = 0.1;
        this.farPlane = 1000.0;
        this.speed = 0.1;
        this.speedRotation = 0.005;
        this.velocity = [0.0, 0.0, 0.0];

        this.uniformBuffer = this.createUniformBuffer();
        this.bindGroupLayout = this.createBindGroupLayout();
        this.bindGroup = this.createBindGroup();
    }

    /**
     * Create the projection matrix
     * @returns {Matrix4} Projection Matrix
     */
    getProjectionMatrix(){
        var projectionMatrix = glMatrix.mat4.create();
        glMatrix.mat4.perspective(projectionMatrix, this.fov, this.aspectRatio, this.nearPlane, this.farPlane);

        return projectionMatrix;
    }

    /**
     * Compute the view matrix o view space. This space is the camera space
     * @returns {Matrix4} View Matrix or Camera Matrix.
     */
    getViewMatrix(){
        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];
        this.position[2] += this.velocity[2];

        var mView = glMatrix.mat4.create();
        glMatrix.mat4.translate(mView, mView, this.position);

        var mYRotation = glMatrix.mat4.create();
        glMatrix.mat4.rotateY(mYRotation, mYRotation, this.yawAngle);

        var mXRotation = glMatrix.mat4.create();
        glMatrix.mat4.rotateX(mXRotation, mXRotation, this.pitchAngle);

        var mRotation = glMatrix.mat4.create();
        glMatrix.mat4.multiply(mRotation, mYRotation, mXRotation);

        glMatrix.mat4.multiply(mView, mView, mRotation);

        glMatrix.vec4.transformMat4(this.forward, [0.0, 0.0, -1.0, 0.0], mView);
        glMatrix.vec4.transformMat4(this.right, [1.0, 0.0, 0.0, 0.0], mView);
        glMatrix.vec4.transformMat4(this.up, [0.0, 1.0, 0.0, 0.0], mView);

        this.velocity = [0.0, 0.0, 0.0];

        var mInverse = glMatrix.mat4.create();
        glMatrix.mat4.invert(mInverse, mView);

        return mInverse;
    }

    /**
     * Get the near plane
     * @returns {float} near plane
     */
    getNearPlane(){
        return this.nearPlane;
    }

    /**
     * Get the far plane
     * @returns {float} far plane
     */
    getFarPlane(){
        return this.farPlane;
    }
    
    /**
     * Get the position
     * @returns {Vector3} position
     */
    getPosition(){
        return this.position;
    }

    /**
     * Set the position
     * @param {Vector3} position 
     */
    setPosition(position){
        this.position = position;
    }

    /**
     * Set the look at. It's the target where the camera sees
     * @param {Vector4} look 
     */
    setLookAt(look){
        this.lookAt = look;
    }

    /**
     * Get the speed of the camera to move
     * @returns {float} speed
     */
    getSpeed(){
        return this.speed;
    }

    /**
     * Set the speed of the camera to move
     * @param {float} speed Speed
     */
    setSpeed(speed){
        this.speed = speed;
    }

    /**
     * Angle for the field of view
     * @param {float} fov Angle in degrees
     */
    setFieldOfView(fov){
        this.fov = webGLengine.degreeToRadian(fov);
    }

    /**
     * Set the aspect ratio
     * @param {float} aspect It's width/height
     */
    setAspectRatio(aspect){
        this.aspectRatio = aspect;
    }

    /**
     * Set the near plane
     * @param {float} near Near plane
     */
    setNearPlane(near){
        this.nearPlane = near;
    }

    /**
     * Set the far plane
     * @param {float} far Far plane
     */
    setFarPlane(far){
        this.farPlane = far;
    }

    /**
     * Set the speed rotation
     * @param {float} v Velocity of speed
     */
    setSpeedRotation(v){
        this.speedRotation = v;
    }

    /**
     * Get the speed rotation of the camera
     * @returns the speed rotation
     */
    getSpeedRotation(){
        return this.speedRotation;
    }

    /**
     * Move units to forward with the speed of the camera
     * @param {float} units Unito to move 
     */
    moveForward(units){
        this.velocity[0] += this.forward[0] * this.speed * units;
        this.velocity[1] += this.forward[1] * this.speed * units;
        this.velocity[2] += this.forward[2] * this.speed * units;
    }

    /**
     * Move the camera units sideways
     * @param {float} units Units to move
     */
    strafe(units){
        this.velocity[0] += this.right[0] * this.speed * units;
        this.velocity[1] += this.right[1] * this.speed * units;
        this.velocity[2] += this.right[2] * this.speed * units;
    }

    /**
     * Move to up or down
     * @param {float} units Units to move
     */
    moveUp(units){
        this.velocity[1] += units * this.speed;
    }

    /**
     * Rotate in yaw
     * @param {float} units Units to rotate
     */
    yaw(units){
        this.yawAngle += units;
    }

    /**
     * Rotate in pitch
     * @param {float} units Units to rotate
     */
    pitch(units){
        this.pitchAngle += units;
    }

    /**
     * Create the uniform buffer for the camera.
     * @returns {GPUBuffer} Uniform buffer for the camera.
     */
    createUniformBuffer(){
        const cameraBufferSize = 16 * 4 * 2; // Matrix4x4 has 16 floats, each float is 4 bytes, and we have 2 matrices (view and projection)
        const cameraBuffer = pGraphics.device.createBuffer({
            size: cameraBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        
        return cameraBuffer;
    }

    /**
     * Create the bind group layout for the camera. The bind group layout defines the layout of the bind group, 
     * which is used to bind the uniform buffer to the shader.
     * @returns {GPUBindGroupLayout} Bind group layout for the camera.
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
     * Create the bind group for the camera. First create the bind group layout and then create 
     * the bind group with the uniform buffer of the camera.
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
}