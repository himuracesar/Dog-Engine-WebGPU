/**
 * DogTexture class represents a texture resource in the Dog Engine. 
 * It extends the DogResource class and provides functionality to create and manage textures for rendering.
 * @author César Himura
 * @version 1.0
 */
class DogTexture extends DogResource {
    /**
     * Creates a new DogTexture instance.
     * @param {string} name The name of the texture.
     */
    constructor(name) {
        super(name);

        this.name = name;
        this.texture = null;
        this.textureView = null;
        this.idSampler = "";
        this.width = 0;
        this.height = 0;
        this.format = "";
    }

    /**
     * Sets the GPU texture.
     * @param {GPUTexture} texture The GPU texture to set.
     */
    setGPUTexture(texture) {
        this.texture = texture;
        this.textureView = texture.createView();
    }

    /**
     * Gets the GPU texture.
     * @returns {GPUTexture} The GPU texture.
     */
    getGPUTexture() {
        return this.texture;
    }

    /**
     * Gets the GPU texture view.
     * @returns {GPUTextureView} The GPU texture view.
     */
    getGPUTextureView() {
        return this.textureView;
    }

    /**
     * Sets the ID of the sampler.
     * @param {string} idSampler The ID of the sampler.
     */
    setIdSampler(idSampler) {
        this.idSampler = idSampler;
    }

    /**
     * Gets the ID of the sampler.
     * @returns {string} The ID of the sampler.
     */
    getIdSampler() {
        return this.idSampler;
    }

    /**
     * Gets the name of the texture.
     * @returns {string} The name of the texture.
     */
    getName() {
        return this.name;
    }

    /**
     * Sets the width and height of the texture.
     * @param {number} width The width of the texture.
     * @param {number} height The height of the texture.
     */
    setWidthAndHeight(width, height) {
        this.width = width;
        this.height = height;
    }

    /**
     * Gets the width of the texture.
     * @returns {number} The width of the texture.
     */
    getWidth() {
        return this.width;
    }

    /**
     * Gets the height of the texture.
     * @returns {number} The height of the texture.
     */
    getHeight() {
        return this.height;
    }

    /**
     * Sets the format of the texture.
     * @param {string} format The format of the texture.
     */
    setFormat(format) {
        this.format = format;
    }

    /**
     * Gets the format of the texture.
     * @returns {string} The format of the texture.
     */
    getFormat() {
        return this.format;
    }
}