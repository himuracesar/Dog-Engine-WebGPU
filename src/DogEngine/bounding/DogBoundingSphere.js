/**
 * Bounding sphere in other engines this is named "collider"
 * 
 * @author César Himura
 * @version 1.0
 */
class DogBoundingSphere extends DogBoundingVolume {
    /**
     * Create a sphere bounding according the configuration
     * @param {Object} config - The configuration object for the bounding sphere
     * @param {float} config.radio - The radio of the sphere (default: 0.0). If the radio is 0, it will be calculated automatically using vmin and vmax.
     * @param {Vector3} config.vmin - The minimum vertex of the bounding sphere (default: [0.0, 0.0, 0.0])
     * @param {Vector3} config.vmax - The maximum vertex of the bounding sphere (default: [0.0, 0.0, 0.0])
     * @param {Vector3} config.position - The position of the bounding sphere (default: [0.0, 0.0, 0.0])
     */
    constructor(config = {}){
        super(config.vmin || [0.0, 0.0, 0.0], config.vmax || [0.0, 0.0, 0.0]);

        this.radio = config.radio || 0.0;
        super.setPosition(config.position || [0.0, 0.0, 0.0]);

        this.type = BoundingVolumeType.Sphere;

        if(this.radio == 0.0)
            this.computeDogBoundingSphere();
    }

    /**
     * Compute the sphere bounding from minimum and maximum vectors
     */
    computeDogBoundingSphere(){
        var vmin = super.getVectorMin();
        var vmax = super.getVectorMax();
        
	    var position = [
            (vmin[0] + vmax[0]) / 2.0,
            (vmin[1] + vmax[1]) / 2.0,
            (vmin[2] + vmax[2]) / 2.0,
        ];

	    this.radio = (Math.abs(vmax[0] - position[0]) + Math.abs(vmax[1] - position[1]) + Math.abs(vmax[2] - position[2])) / 3.0;

        super.setPosition(position);
    }

    /**
     * Get the radio of the sphere
     * @returns {float} Radio
     */
    getRadio(){
        return this.radio;
    }

    /**
     * Set the radio of the sphere
     * @param {float} radio 
     */
    setRadio(radio){
        this.radio = radio;
    }
}