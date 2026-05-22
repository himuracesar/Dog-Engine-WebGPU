class DogMesh {
    constructor() {
        this.transform = new DogTransform();
        this.numIndices = 0;
        this.numVertices = 0;
        this.idParent = -1;
        this.boundingVolume = null;
        this.idMaterial = -1;
        this.forward = [0.0, 0.0, -1.0, 0.0];
        this.up = [0.0, 1.0, 0.0, 0.0];
        this.right = [1.0, 0.0, 0.0, 0.0];
    }

    /**
     * Update the mesh. This method can be used to update the transform of the mesh or any 
     * other property that needs to be updated every frame.
     * @param {float} deltaTime 
     */
    update(deltaTime){
        
    }

    render(pass){
        pGraphics.device.queue.writeBuffer(this.transform.getUniformBuffer(), 0, this.transform.getTransformMatrix());

        pass.setBindGroup(1, this.transform.getBindGroup());
         //pass.drawIndexed(indexCount, instanceCount, firstIndex, baseVertex, firstInstance);
        pass.drawIndexed(this.numIndices, 1, 0, 0, 0);
    }

    /**
     * Get the transform of the mesh.
     * @returns {DogTransform} The transform of the mesh.
     */
    getTransform(){
        return this.transform;
    }

    /**
     * Set the transform of the mesh.
     * @param {DogTransform} transform - The new transform of the mesh.
     */
    setTransform(transform){
        this.transform = transform;
    }

    /**
     * Get the bounding volume of the mesh.
     * @returns {BoundingVolume} The bounding volume of the mesh.
     */
    getBoundingVolume(){
        return this.boundingVolume;
    }

    /**
     * Set the bounding volume of the mesh.
     * @param {BoundingVolume} boundingVolume - The new bounding volume of the mesh.
     */
    setBoundingVolume(boundingVolume){
        this.boundingVolume = boundingVolume;
    }

    /**
     * Set the number of indices of the mesh.
     * @param {int} numIndices The new number of indices of the mesh.
     */
    setNumIndices(numIndices){
        this.numIndices = numIndices;
    }

    /**
     * Get the number of indices of the mesh.
     * @returns {int} The number of indices of the mesh.
     */
    getNumIndices(){
        return this.numIndices;
    }

    /**
     * Set the number of vertices of the mesh.
     * @param {int} numVertices The new number of vertices of the mesh.
     */
    setNumVertices(numVertices){
        this.numVertices = numVertices;
    }

    /**
     * Get the number of vertices of the mesh.
     * @returns {int} The number of vertices of the mesh.
     */
    getNumVertices(){
        return this.numVertices;
    }
}