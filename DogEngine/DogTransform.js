/**
 * Class to store the transform, including position, scale and rotation. 
 * It also has a model matrix that is calculated from these properties. 
 * This class is used to keep track of the transform and to update it when the user interacts with the gizmos.
 * 
 * @author César Himura
 * @version 1.0
 */
class DogTransform {
    /**
     * Creates a new Transform with default values: position at the origin, no rotation and scale of 1. 
     * Also initializes the model matrix to the identity matrix.
     */
    constructor(){
        this.resetTransform();

        this.lastPosition = [0.0, 0.0, 0.0, 1.0];
        this.lastScale = [1.0, 1.0, 1.0, 1.0];
        this.lastRotation = [0.0, 0.0, 0.0, 1.0];

        this.balanceDeltas();

        var idCount = -1;
        
        try {
            const jsonTransform = bindGroupLayouts.get("DogTransform");
            idCount = resourceManager.getCounterID();

            this.idBuffer = webGPUengine.createDogBuffer("DogTransform" + idCount, BufferType.Data, null, jsonTransform.bufferSize, true);
            this.bindGroup = webGPUengine.createBindGroup("DogTransform", jsonTransform.binding, jsonTransform.bindGroupLayout, resourceManager.get(this.idBuffer));
            this.group = jsonTransform.group;
            this.binding = jsonTransform.binding;
        } catch(error) {
            console.log("The bind group layouts are automatically created");

            this.bindGroupLayout = null;
            this.bufferSize = 16 * 4 * 2;
            this.idBuffer = webGPUengine.createDogBuffer("DogTransform"  + idCount, BufferType.Data, null, this.bufferSize, true);
            this.bindGroup = null; 
            this.group = -1;
            this.binding = -1;
        }
    }

    /**
     * Balances the deltas by setting the last position, scale and rotation to the current values. 
     * This is used to optimize the calculation of the model matrix, so it is only recalculated when necessary.
     */
    balanceDeltas() {
        this.lastPosition[0] = this.position[0];
        this.lastPosition[1] = this.position[1];
        this.lastPosition[2] = this.position[2];
        this.lastScale[0] = this.scale[0];
        this.lastScale[1] = this.scale[1];
        this.lastScale[2] = this.scale[2];
        this.lastRotation[0] = this.xRotation;
        this.lastRotation[1] = this.yRotation;
        this.lastRotation[2] = this.zRotation;
    }

    /**
     * Resets the transform to the default values: position at the origin, no rotation and scale of 1. 
     * Also resets the model matrix to the identity matrix.
     */
    resetTransform() {
        this.position = [0.0, 0.0, 0.0, 1.0];
        this.scale = [1.0, 1.0, 1.0, 1.0];
        this.yRotation = 0.0;
        this.xRotation = 0.0;
        this.zRotation = 0.0;

        this.mModel = glMatrix.mat4.create();
    }

    /**
     * Translates the object to an absolute position.
     * @param {float} dx Displacement in the x-axis.
     * @param {float} dy Displacement in the y-axis.
     * @param {float} dz Displacement in the z-axis.
     */
    translateAbsolute(dx, dy, dz) {
        this.position[0] = dx;
        this.position[1] = dy;
        this.position[2] = dz;
    }

    /**
     * Translates the object by a relative amount.
     * @param {float} dx Displacement in the x-axis.
     * @param {float} dy Displacement in the y-axis.
     * @param {float} dz Displacement in the z-axis.
     */
    translateRelative(dx, dy, dz) {
        this.position[0] += dx;
        this.position[1] += dy;
        this.position[2] += dz;
    }

    /**
     * Rotates the object to an absolute orientation.
     * @param {float} x Rotation around the x-axis.
     * @param {float} y Rotation around the y-axis.
     * @param {float} z Rotation around the z-axis.
     */
    rotateAbsolute(x, y, z) {
        this.xRotation = x;
        this.yRotation = y;
        this.zRotation = z;
    }

    /**
     * Rotates the object by a relative amount.
     * @param {float} x Rotation around the x-axis.
     * @param {float} y Rotation around the y-axis.
     * @param {float} z Rotation around the z-axis.
     */
    rotateRelative(x, y, z) {
        this.xRotation += x;
        this.yRotation += y;
        this.zRotation += z;
    }

    /**
     * Scales the object to an absolute size.
     * @param {float} sx Scale in the x-axis.
     * @param {float} sy Scale in the y-axis.
     * @param {float} sz Scale in the z-axis.
     */
    scaleAbsolute(sx, sy, sz) {
        this.scale[0] = sx;
        this.scale[1] = sy;
        this.scale[2] = sz;
    }

    /**
     * Scales the object by a relative amount.
     * @param {float} sx Scale in the x-axis.
     * @param {float} sy Scale in the y-axis.
     * @param {float} sz Scale in the z-axis.
     */
    scaleRelative(sx, sy, sz) {
        this.scale[0] += sx;
        this.scale[1] += sy;
        this.scale[2] += sz;
    }

    /**
     * Get the current position.
     * @returns {Vector3} The current position of the object.
     */
    getPosition() {
        return this.position;
    }

    /**
     * Get the current rotation.
     * @returns {Vector3} The current rotation of the object in radians.
     */
    getRotation() {
        return [this.xRotation, this.yRotation, this.zRotation];
    }

    /**
     * Get the current scale.
     * @returns {Vector3} The current scale of the object.
     */
    getScale() {
        return this.scale;
    }

    /**
     * Gets whether the transform has changed since the last time the model matrix was calculated. 
     * This is used to optimize the calculation of the model matrix, so it is only recalculated when necessary.
     * @returns {Vector3} Delta position since the last time the model matrix was calculated.
     */
    getDeltaPosition() {
        var deltaPosition = glMatrix.vec3.create();
        glMatrix.vec3.subtract(deltaPosition, this.position, this.lastPosition);

        return deltaPosition;
    }

    /**
     * Gets the delta rotation since the last time the model matrix was calculated. This is used to 
     * optimize the calculation of the model matrix, so it is only recalculated when necessary.
     * @returns {Vector3} Delta rotation since the last time the model matrix was calculated.
     */
    getDeltaRotation() {
        var deltaRotation = glMatrix.vec3.create();
        glMatrix.vec3.subtract(deltaRotation, [this.xRotation, this.yRotation, this.zRotation], this.lastRotation);

        return deltaRotation;
    }

    /**
     * Gets the delta scale since the last time the model matrix was calculated. This is used to optimize the 
     * calculation of the model matrix, so it is only recalculated when necessary.
     * @returns {Vector3} Delta scale since the last time the model matrix was calculated.
     */
    getDeltaScale() {
        var deltaScale = glMatrix.vec3.create();
        glMatrix.vec3.subtract(deltaScale, this.scale, this.lastScale);

        return deltaScale;
    }

    /**
     * Get the transform matrix. Includes translation, rotation and scale. 
     * The order of transformations is: scale, then rotate, then translate.
     * @returns {Matrix4} The transform matrix of the object.
     */
    getTransformMatrix() {
        if(this.getDeltaPosition()[0] == 0.0 && this.getDeltaPosition()[1] == 0.0 && this.getDeltaPosition()[2] == 0.0 &&
           this.getDeltaRotation()[0] == 0.0 && this.getDeltaRotation()[1] == 0.0 && this.getDeltaRotation()[2] == 0.0 &&
           this.getDeltaScale()[0] == 0.0 && this.getDeltaScale()[1] == 0.0 && this.getDeltaScale()[2] == 0.0) {
            return this.mModel;
        }

        this.mModel = glMatrix.mat4.create();
        glMatrix.mat4.translate(this.mModel, this.mModel, this.position);
        glMatrix.mat4.rotateY(this.mModel, this.mModel, this.yRotation);
        glMatrix.mat4.rotateX(this.mModel, this.mModel, this.xRotation);
        glMatrix.mat4.rotateZ(this.mModel, this.mModel, this.zRotation);
        glMatrix.mat4.scale(this.mModel, this.mModel, this.scale);

        this.balanceDeltas();

        return this.mModel;
    }

    /**
     * Sets the transform matrix directly. This can be used to set the transform matrix from an 
     * external source, such as a file or a network message.
     * @param {Matrix4x4} mModel Matrix4x4 to set as the transform matrix of the object.
     */
    /*setTransformMatrix(mModel) {
        this.mModel = mModel;

        glMatrix.mat4.getTranslation(this.translation, this.mModel);
        glMatrix.mat4.getScaling(this.scaling, this.mModel);
        glMatrix.mat4.getRotation(this.rotation, this.mModel);

        //this.translateRelative(this.translation[0], this.translation[1], this.translation[2]);
        //this.scaleRelative(this.scaling[0], this.scaling[1], this.scaling[2]);

        this.lastPosition[0] = this.position[0];
        this.lastPosition[1] = this.position[1];
        this.lastPosition[2] = this.position[2];
        this.lastScale[0] = this.scale[0];
        this.lastScale[1] = this.scale[1];
        this.lastScale[2] = this.scale[2];
        this.xRotation = this.rotation[0];
        this.yRotation = this.rotation[1];
        this.zRotation = this.rotation[2];
        this.lastRotation[0] = this.xRotation;
        this.lastRotation[1] = this.yRotation;
        this.lastRotation[2] = this.zRotation;

        //debugger;
        //glMatrix.quat.getEuler(this.rotationEuler, this.rotation);
    }*/

    //-------------------------- WebGPU related methods -------------------------//

    /**
     * Creates a uniform buffer for the model matrix. This buffer can be used to send the model matrix to the GPU.
     * @returns {GPUBuffer} A GPU buffer that can be used as a uniform buffer for the model matrix.
     */
    /*createUniformBuffer(){
        const bufferSize = 16 * 4; // Matrix4x4 has 16 floats, each float is 4 bytes
        const buffer = pGraphics.device.createBuffer({
            size: bufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        
        return buffer;
    }*/

    /**
     * Creates a bind group layout for the model matrix. This layout can be used to create a bind group that includes the model matrix uniform buffer.
     * @returns {GPUBindGroupLayout} A bind group layout for the model matrix uniform buffer.
     */
    /*createBindGroupLayout(){
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
    }*/

    /**
     * Creates a bind group for the model matrix. This bind group can be used to bind the model matrix 
     * uniform buffer to the shader.
     * @returns {GPUBindGroup} A bind group that binds the model matrix uniform buffer to the shader.
     */
    /*createBindGroup(){
        const bindGroup = pGraphics.device.createBindGroup({
            layout: this.bindGroupLayout,
            entries: [{
                binding: 0,
                resource: { buffer: this.uniformBuffer }
            }],
        });

        return bindGroup;
    }*/

    /**
     * Gets the uniform buffer for the model matrix. This buffer can be used to send the model matrix to the GPU.
     * @returns {GPUBuffer} The uniform buffer for the model matrix.
     */
    getBuffer(){
        return resourceManager.get(this.idBuffer);
    }

    /**
     * Gets the bind group for the model matrix. This bind group can be used to bind the model matrix 
     * uniform buffer to the shader.
     * @returns {GPUBindGroup} The bind group that binds the model matrix uniform buffer to the shader.
     */
    getBindGroup(){
        return this.bindGroup;
    }

    /**
     * Gets the group to belong this component in the shaders.
     * @returns {int} group Group
     */
    getGroup(){
        return this.group;
    }

    /**
     * Gets the bind group layout for the model matrix. This bind group layout can be used to create 
     * a bind group that includes the model matrix uniform buffer.
     * @returns {GPUBindGroupLayout} The bind group layout for the model matrix uniform buffer.
     */
    /*getBindGroupLayout(){
        return this.bindGroupLayout;
    }*/
}