class DogStaticMesh {
    constructor() {
        this.transform = new DogTransform();
        this.meshes = [];
        this.vertexBase = 0;
        this.indexBase = 0;
        this.boundingVolume = null;
        this.idVertexBuffer = null;
        this.idIndexBuffer = null;
        this.forward = [0.0, 0.0, -1.0, 0.0];
        this.up = [0.0, 1.0, 0.0, 0.0];
        this.right = [1.0, 0.0, 0.0, 0.0];
    }

    update(deltaTime){
        for(var i = 0; i < this.meshes.length; i++){
            this.meshes[i].update(deltaTime);

            const deltaPosition = this.transform.getDeltaPosition();
            const deltaRotation = this.transform.getDeltaRotation();
            const deltaScale = this.transform.getDeltaScale();
            
            this.meshes[i].getTransform().translateRelative(deltaPosition[0], deltaPosition[1], deltaPosition[2]);
            this.meshes[i].getTransform().rotateRelative(deltaRotation[0], deltaRotation[1], deltaRotation[2]);
            this.meshes[i].getTransform().scaleRelative(deltaScale[0], deltaScale[1], deltaScale[2]);
        }

        this.getTransform().balanceDeltas();
    }

    render(pass){
        pass.setVertexBuffer(0, resourceManager.get(this.idVertexBuffer).getWebGPUBuffer());
        pass.setIndexBuffer(resourceManager.get(this.idIndexBuffer).getWebGPUBuffer(), 'uint16');

        for(var i = 0; i < this.meshes.length; i++){
            this.meshes[i].render(pass);
        }
    }

    /**
     * Add a mesh to the static mesh.
     * @param {DogMesh} mesh Mesh to add to the static mesh.
     */
    addMesh(mesh){
        this.meshes.push(mesh);
    }

    /**
     * Set the ID of the vertex buffer for the static mesh.
     * @param {string} idVertexBuffer The ID of the vertex buffer.
     */
    setIdVertexBuffer(idVertexBuffer){
        this.idVertexBuffer = idVertexBuffer;
    }

    /**
     * Set the ID of the index buffer for the static mesh.
     * @param {string} idIndexBuffer The ID of the index buffer.
     */
    setIdIndexBuffer(idIndexBuffer){
        this.idIndexBuffer = idIndexBuffer;
    }

    /**
     * Gets the transform of the static mesh.
     * @returns {DogTransform} The transform of the static mesh.
     */
    getTransform(){
        return this.transform;
    }
}