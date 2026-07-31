/**
 * Mesh class represents a 3D model that can be rendered in the scene. It contains information about the transform,
 * bounding volume, and other properties related to the mesh. The DogMesh class is responsible for updating its transform
 * and rendering itself using the appropriate pipeline and resources.
 * @author César Himura
 * @version 1.0
 */
class DogMesh {
    /**
     * Create a new DogMesh instance. The constructor initializes the transform, number of 
     * indices and vertices, parent ID, bounding volume, material ID, and local axes (forward, up, right).
     */
    constructor(name = "", createBuffer = true, createBindGroup = true) {
        this.name = name;
        this.transform = new DogTransform(createBuffer, createBindGroup);
        this.numIndices = 0;
        this.numVertices = 0;
        this.idParent = -1;
        this.boundingVolume = null;
        this.idMaterial = -1;
        this.forward = [0.0, 0.0, -1.0, 0.0];
        this.up = [0.0, 1.0, 0.0, 0.0];
        this.right = [1.0, 0.0, 0.0, 0.0];
        this.firstVertex = 0;
        this.firstIndex = 0;
        this.baseVertex = 0;
    }

    /**
     * Update the mesh. This method can be used to update the transform of the mesh or any 
     * other property that needs to be updated every frame.
     * @param {float} deltaTime 
     */
    update(deltaTime) {
        if (this.boundingVolume != null) {
            const position = this.transform.getPosition();
            const rotation = this.transform.getRotation();
            const scale = this.transform.getScale();

            /*this.boundingVolume.getTransform().translateAbsolute(position[0], position[1], position[2]);
            this.boundingVolume.getTransform().rotateAbsolute(rotation[0], rotation[1], rotation[2]);
            this.boundingVolume.getTransform().scaleAbsolute(scale[0], scale[1], scale[2]);*/
        }
    }

    /**
     * Draw the mesh using the provided GPU encoder pass. This method assumes that the necessary
     * vertex and index buffers are already set up and that the appropriate pipeline is bound.
     * @param {GPUEncoderPass} pass 
     */
    render(pass) {
        //draw(vertexCount, instanceCount, firstVertex, firstInstance)
        pGraphics.device.queue.writeBuffer(this.transform.getBuffer().getWebGPUBuffer(), 0, this.transform.getTransformMatrix());

        let material = resourceManager.get(this.idMaterial);
        if (material !== undefined) {
            pGraphics.device.queue.writeBuffer(material.getBuffer().getWebGPUBuffer(), 0, material.getData());

            pass.setBindGroup(material.getGroup(), material.getBindGroup());
        }

        pass.setBindGroup(this.transform.getGroup(), this.transform.getBindGroup());

        if (this.numIndices > 0) {
            //pass.drawIndexed(indexCount, instanceCount, firstIndex, baseVertex, firstInstance);
            pass.drawIndexed(this.numIndices, 1, this.firstIndex, this.baseVertex, 0);
        } else {
            //draw(vertexCount, instanceCount, firstVertex, firstInstance)
            pass.draw(this.numVertices, 1, this.firstVertex, 0);
        }
    }

    /**
     * Get the transform of the mesh.
     * @returns {DogTransform} The transform of the mesh.
     */
    getTransform() {
        return this.transform;
    }

    /**
     * Set the transform of the mesh.
     * @param {DogTransform} transform - The new transform of the mesh.
     */
    setTransform(transform) {
        this.transform = transform;
    }

    /**
     * Get the bounding volume of the mesh.
     * @returns {DogBoundingVolume} The bounding volume of the mesh.
     */
    getBoundingVolume() {
        return this.boundingVolume;
    }

    /**
     * Set the bounding volume of the mesh.
     * @param {DogBoundingVolume} bounding - The new bounding volume of the mesh.
     */
    setBoundingVolume(bounding) {
        this.boundingVolume = bounding;
    }

    /**
     * Set the number of indices of the mesh.
     * @param {int} numIndices The new number of indices of the mesh.
     */
    setNumIndices(numIndices) {
        this.numIndices = numIndices;
    }

    /**
     * Get the number of indices of the mesh.
     * @returns {int} The number of indices of the mesh.
     */
    getNumIndices() {
        return this.numIndices;
    }

    /**
     * Set the number of vertices of the mesh.
     * @param {int} numVertices The new number of vertices of the mesh.
     */
    setNumVertices(numVertices) {
        this.numVertices = numVertices;
    }

    /**
     * Get the number of vertices of the mesh.
     * @returns {int} The number of vertices of the mesh.
     */
    getNumVertices() {
        return this.numVertices;
    }

    /**
     * Set the ID of the material of the mesh.
     * @param {string} idMaterial The ID of the material.
     */
    setIdMaterial(idMaterial) {
        this.idMaterial = idMaterial;
    }

    /**
     * Get the ID of the material of the mesh.
     * @returns {string} The ID of the material.
     */
    getIdMaterial() {
        return this.idMaterial;
    }

    /**
     * Get the material of the mesh.
     * @returns {DogMaterial} The material of the mesh.
     */
    getMaterial() {
        return resourceManager.get(this.idMaterial);
    }

    /**
     * Set the first vertex of the mesh.
     * @param {int} firstVertex The first vertex of the mesh.
     */
    setFirstVertex(firstVertex) {
        this.firstVertex = firstVertex;
    }

    /**
     * Set the first index of the mesh.
     * @param {int} firstIndex The first index of the mesh.
     */
    setFirstIndex(firstIndex) {
        this.firstIndex = firstIndex;
    }

    /**
     * Set the base vertex of the mesh.
     * @param {int} baseVertex The base vertex of the mesh.
     */
    setBaseVertex(baseVertex) {
        this.baseVertex = baseVertex;
    }

    /**
     * Sets the ID of the bind group that contains the transform matrix.
     * @param {int} idBindGroup The ID of the bind group that contains the transform matrix.
     */
    setIdBindGroup(idBindGroup) {
        this.transform.setIdBindGroup(idBindGroup);
    }

    /**
     * Sets the ID of the buffer that contains the transform matrix.
     * @param {int} idBuffer The ID of the buffer that contains the transform matrix.
     */
    setIdBuffer(idBuffer) {
        this.transform.setIdBuffer(idBuffer);
    }
}