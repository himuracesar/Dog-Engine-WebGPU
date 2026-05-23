/**
 * Bounding Volume
 * @author César Himura
 * @version 1.0
 */
class DogBoundingVolume {

    /**
     * Creates a new bounding volume
     * @param {Vector3} vmin Min vector representing the minimum corner of the bounding volume (default: [0.0, 0.0, 0.0]) 
     * @param {Vector3} vmax Max vector representing the maximum corner of the bounding volume (default: [0.0, 0.0, 0.0])
     */
    constructor(vmin, vmax){
        this.vmin = vmin;
        this.vmax = vmax;
        this.transform = new DogTransform();
        this.type = BoundingVolumeType.None;
    }

    /**
     * Gets the transform of the bounding volume     
     * @returns {DogTransform} Transform of the bounding volume
     */
     getTransform(){
        return this.transform;
    }

    /**
     * Sets the transform of the bounding volume.
     * @param {DogTransform} transform Transform to be set for the bounding volume.
     */
    setTransform(transform){
        this.transform = transform;
    }

    /**
     * Get the vector min of the bounding
     * @returns {Vector3} Vector min of the bounding
     */
    getVectorMin(){
        return this.vmin;
    }

    /**
     * Get the vector max of the bounding
     * @returns {Vector3} Vector max of the bounding
     */
    getVectorMax(){
        return this.vmax;
    }

    /**
     * Get the type of the bounding volume
     * @returns {BoundingVolumeType} Type of the bounding volume
     */
    getType(){
        return this.type;
    }

    /**
     * Set vector min
     * @param {Vector3} vmin Vector min
     */
    setVectorMin(vmin){
        this.vmin = vmin;
    }

    /**
     * Set vector max
     * @param {Vector3} vmax Vector max
     */
    setVectorMax(vmax){
        this.vmax = vmax;
    }

    /**
     * Set the type of the bounding volume
     * @param {BoundingVolumeType} type Type of the bounding volume
     */
    setType(type){
        this.type = type;
    }
}