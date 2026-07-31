/**
 * It is a sampler for textures
 * @author César Himura
 * @version 1.0
 */
class DogSampler extends DogResource {

    /**
     * Initializes a new instance of the DogSampler class.
     * @param {object} descriptor Configuration object for the sampler.
     * @param {string} descriptor.addressModeU Address mode for the U-axis.
     * @param {string} descriptor.addressModeV Address mode for the V-axis.
     * @param {string} descriptor.magFilter Magnification filter.
     * @param {string} descriptor.minFilter Minification filter.
     * @param {string} descriptor.mipmapFilter Mipmap filter.
     * @param {string} descriptor.compare Compare mode.
     */
    constructor(name, descriptor) {
        super(name);

        this.name = name;

        descriptor.label = name;

        this.sampler = pGraphics.device.createSampler(descriptor);
    }

    /**
     * Gets the name of the sampler.
     * @returns {string} The name of the sampler.
     */
    getName() {
        return this.name;
    }

    /**
     * Sets the name of the sampler.
     * @param {string} name The name of the sampler.
     */
    setName(name) {
        this.name = name;
    }

    /**
     * Gets the sampler.
     * @returns {GPUSampler} The sampler.
     */
    getWebGPUSampler() {
        return this.sampler;
    }
}