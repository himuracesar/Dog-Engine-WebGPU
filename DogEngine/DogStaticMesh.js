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

    render(pass){
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
}