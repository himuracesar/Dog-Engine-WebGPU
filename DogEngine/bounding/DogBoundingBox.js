
/**
 * DogBoundingBox class represents an axis-aligned bounding box (AABB) and oriented-aligned bounding box (OBB) in 3D space.
 * It extends the DogBoundingVolume class and provides methods to compute the AABB based on minimum and maximum vertices.
 * The bounding box is defined by its width, height, and depth, which are calculated from the minimum and maximum vertices.
 * It also includes a method to convert Euler angles to local axes vectors for orientation purposes.
 * @author César Himura
 * @version 1.0
 */
class DogBoundingBox extends DogBoundingVolume {
    /**
     * Create a box bounding according the configuration
     * @param {Object} config - The configuration object for the bounding box
     * @param {Vector3} config.vmin - The minimum vertex of the bounding box (default: [0.0, 0.0, 0.0])
     * @param {Vector3} config.vmax - The maximum vertex of the bounding box (default: [0.0, 0.0, 0.0])
     * @param {Vector3} config.position - The position of the bounding box (default: [0.0, 0.0, 0.0])
     */
    constructor(config = {}){
        super(config.vmin || [0.0, 0.0, 0.0], config.vmax || [0.0, 0.0, 0.0]);
        super.setPosition(config.position || [0.0, 0.0, 0.0]); 

        this.width = 0.0;
        this.height = 0.0;
        this.depth = 0.0;
        this.orientation = {u: [1.0, 0.0, 0.0], v: [0.0, 1.0, 0.0], w: [0.0, 0.0, 1.0]}; // Ejes locales iniciales (sin rotación)

        this.type = BoundingVolumeType.Box;

        this.computeAABB();
    }

    /**
     * Compute the axis-aligned bounding box (AABB) based on the minimum and maximum vertices.
     */
    computeAABB(){
        this.position = [
            (this.vmin[0] + this.vmax[0]) / 2.0,
            (this.vmin[1] + this.vmax[1]) / 2.0,
            (this.vmin[2] + this.vmax[2]) / 2.0
        ];

        this.width = Math.abs(this.vmax[0] - this.position[0]) * 2.0;
        this.height = Math.abs(this.vmax[1] - this.position[1]) * 2.0;
        this.depth = Math.abs(this.vmax[2] - this.position[2]) * 2.0;
    }

    /**
     * Converts Euler angles to local axes vectors (Local Axes)
     * @param {float} x - Rotation around X axis (Pitch) in radians
     * @param {float} y - Rotation around Y axis (Yaw) in radians
     * @param {float} z - Rotation around Z axis (Roll) in radians
     * @returns {Object} - The three local axes {u, v, w}
     */
    computeAxesFromEuler(x, y, z) {
        const cx = Math.cos(x), sx = Math.sin(x);
        const cy = Math.cos(y), sy = Math.sin(y);
        const cz = Math.cos(z), sz = Math.sin(z);

        if(x != 0 || y != 0 || z != 0){
            this.orientation = {
                u: {
                    x: cy * cz + sy * sx * sz,
                    y: cx * sz,
                    z: -sy * cz + cy * sx * sz
                },
                v: {
                    x: -cy * sz + sy * sx * cz,
                    y: cx * cz,
                    z: sy * sz + cy * sx * cz
                },
                w: {
                    x: sy * cx,
                    y: -sx,
                    z: cy * cx
                }
            };
            glMatrix.vec3.normalize(this.orientation.u, [this.orientation.u.x, this.orientation.u.y, this.orientation.u.z]);
            glMatrix.vec3.normalize(this.orientation.v, [this.orientation.v.x, this.orientation.v.y, this.orientation.v.z]);
            glMatrix.vec3.normalize(this.orientation.w, [this.orientation.w.x, this.orientation.w.y, this.orientation.w.z]);
        }

        return this.orientation;
    }

    /**
     * Get the width of the bounding box.
     * @returns {float} The width of the bounding box.
     */
    getWidth(){
        return this.width;
    }

    /**
     * Get the height of the bounding box.
     * @returns {float} The height of the bounding box.
     */
    getHeight(){
        return this.height;
    }

    /**
     * Get the depth of the bounding box.
     * @returns {float} The depth of the bounding box.
     */
    getDepth(){
        return this.depth;
    }

    /**
     * Get the orientation of the bounding box as local axes vectors.
     * @returns {Object} The orientation of the bounding box {u, v, w}.
     */
    getOrientation(){
        return this.orientation;
    }
}
