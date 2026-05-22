/**
 * Bounding sphere in other engines this is named "collider"
 * 
 * @author César Himura
 * @version 1.0
 */
class BoundingSphere extends BoundingVolume {
    /**
     * Create a sphere bounding according the configuration
     * @param {Object} config - The configuration object for the bounding sphere
     * @param {float} config.radio - The radio of the sphere (default: 0.0). If the radio is 0, it will be calculated automatically using vmin and vmax.
     * @param {Vector3} config.vmin - The minimum vertex of the bounding sphere (default: [0.0, 0.0, 0.0])
     * @param {Vector3} config.vmax - The maximum vertex of the bounding sphere (default: [0.0, 0.0, 0.0])
     */
    constructor(config = {}){
        super(config.vmin || [0.0, 0.0, 0.0], config.vmax || [0.0, 0.0, 0.0]);

        this.radio = config.radio || 0.0;
        //super.setPosition(config.position || [0.0, 0.0, 0.0]);

        this.type = BoundingVolumeType.Sphere;

        if(this.radio == 0.0)
            this.computeBoundingSphere();

        //Only for debug
        this.mesh = null;
    }

    /**
     * Compute the sphere bounding from minimum and maximum vectors
     */
    computeBoundingSphere(){
        var vmin = super.getVectorMin();
        var vmax = super.getVectorMax();
        
	    /*var position = [
            (vmin[0] + vmax[0]) / 2.0,
            (vmin[1] + vmax[1]) / 2.0,
            (vmin[2] + vmax[2]) / 2.0,
        ];*/

	    this.radio = (Math.abs(vmax[0]) + Math.abs(vmax[1]) + Math.abs(vmax[2])) / 3.0;

        //super.setPosition(position);
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

    /**
     * Render the bounding commonly is only for debug propose.
     * @param {Pipeline} pipeline 
     */
    /*render() {
        if(this.mesh == null) {
            var shape = new Shape();

            var descriptor = {};
            descriptor.radio = this.radio;
            descriptor.slices = 8;
            descriptor.stacks = 8;

            this.mesh = shape.createSphere(descriptor);
        }

        simplePipeline.use();
        simplePipeline.setColor([0.0, 1.0, 0.0, 1.0]);

        gl.uniformMatrix4fv(simplePipeline.getUniformLocation("u_mProj"), false, camera.getProjectionMatrix());
        gl.uniformMatrix4fv(simplePipeline.getUniformLocation("u_mView"), false, camera.getViewMatrix());
        gl.uniform3fv(simplePipeline.getUniformLocation("u_camera_position"), camera.getPosition());

        this.mesh.render(simplePipeline, RenderMode.LineLoop);
    }*/
}