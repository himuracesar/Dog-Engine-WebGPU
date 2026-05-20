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
    }

    /**
     * Resets the transform to the default values: position at the origin, no rotation and scale of 1. 
     * Also resets the model matrix to the identity matrix.
     */
    resetTransform() {
        this.position = [0.0, 0.0, 0.0];
        this.scale = [1.0, 1.0, 1.0];
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
     * Get the transform matrix. Includes translation, rotation and scale. 
     * The order of transformations is: scale, then rotate, then translate.
     * @returns {Matrix4} The transform matrix of the object.
     */
    getTransformMatrix() {
        this.mModel = glMatrix.mat4.create();
        glMatrix.mat4.translate(this.mModel, this.mModel, this.position);
        glMatrix.mat4.rotateY(this.mModel, this.mModel, this.yRotation);
        glMatrix.mat4.rotateX(this.mModel, this.mModel, this.xRotation);
        glMatrix.mat4.rotateZ(this.mModel, this.mModel, this.zRotation);
        glMatrix.mat4.scale(this.mModel, this.mModel, this.scale);

        return this.mModel;
    }
}