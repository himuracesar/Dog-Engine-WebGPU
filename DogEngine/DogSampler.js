/**
 * It is a sampler for textures
 * @author César Himura
 * @version 1.0
 */
class DogSampler extends DogResource {
    /**
     * Initializes a new instance of the DogSampler class.
     * @param {object} config Configuration object for the sampler.
     * @param {string} config.addressModeU Address mode for the U-axis.
     * @param {string} config.addressModeV Address mode for the V-axis.
     * @param {string} config.magFilter Magnification filter.
     * @param {string} config.minFilter Minification filter.
     * @param {string} config.mipmapFilter Mipmap filter.
     */
    constructor(config = {}) {
        const amu = config.addressModeU || "";
        const amv = config.addressModeV || "";
        const maf = config.magFilter || "";
        const mif = config.minFilter || "";
        const mm = config.mipmapFilter || "";

        let name = ""
        if (config.name === undefined)
            name = "amu-" + amu.substring(0, 2) +
                "amv-" + amv.substring(0, 2) +
                "maf-" + maf.substring(0, 2) +
                "mif-" + mif.substring(0, 2) +
                "mm-" + mm.substring(0, 2);
        else
            name = config.name;

        super(name);

        this.name = name;

        this.sampler = pGraphics.device.createSampler({
            addressModeU: config.addressModeU || 'repeat',
            addressModeV: config.addressModeV || 'repeat',
            magFilter: config.magFilter || 'linear',
            minFilter: config.minFilter || 'linear',
            mipmapFilter: config.mipmapFilter || 'linear',
        });
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
    getGPUSampler() {
        return this.sampler;
    }
}