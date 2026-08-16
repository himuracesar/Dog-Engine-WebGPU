/**
 * DogBuffer class represents a GPU buffer resource in the Dog Engine. 
 * It extends the DogResource class and provides functionality to create and manage GPU buffers for vertex and index data.
 * @author César Himura
 * @version 1.0
 */
class DogBuffer extends DogResource {
    /**
     * Creates a new DogBuffer instance.
     * @param {string} name The name of the buffer.
     * @param {BufferType} type The type of the buffer.
     * @param {Float32Array | Uint16Array} data The data for the buffer.
     * @param {int} size Size of the buffer. 0 (zero) is the default value.
     */
    constructor(name, type, data, size = 0){
        super(name);
        var usage = (type === BufferType.Vertex) ? GPUBufferUsage.VERTEX : GPUBufferUsage.INDEX;

        if(type === BufferType.Vertex || type === BufferType.Index){
            this.buffer = pGraphics.device.createBuffer({
                label: name,
                size: data.byteLength,
                usage: usage | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true, // Ask access immediately to the memory
            });

            if(type === BufferType.Vertex){
                new Float32Array(this.buffer.getMappedRange()).set(data);
            } else {
                new Uint16Array(this.buffer.getMappedRange()).set(data);
            }

            this.buffer.unmap();
        } else if(type === BufferType.Data){
            this.buffer = pGraphics.device.createBuffer({
                size: size,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
        }
    }

    /**
     * Gets the GPU buffer.
     * @returns {GPUBuffer} The GPU buffer.
     */
    getWebGPUBuffer(){
        return this.buffer;
    }
}