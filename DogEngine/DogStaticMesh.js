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

            if(this.getTransform().hasChanged()) {
                this.meshes[i].updateTransformation(this.transform.getTransformMatrix());
            }
        }
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