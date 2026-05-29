/**
 * Class representing a resource manager for the Dog Engine.
 * It allows you to store and retrieve resources by name.
 * @author César Himura
 * @version 1.0
 */
class DogResourceManager {
    /**
     * Initializes a new instance of the DogResourceManager class.
     */
    constructor() {
        this.resources = {};
        this.counter = 0;
    }

    /**
     * Adds a resource to the manager.
     * @param {string} name Name of the resource.
     * @param {DogResource} resource The resource to add.
     */
    add(name, resource) {
        if (this.resources[name] === null || this.resources[name] === undefined) {
            this.resources[name] = resource;
        }
    }

    /**
     * Gets a resource from the manager.
     * @param {string} name Name of the resource.
     * @returns {DogResource} The requested resource, or undefined if not found.
     */
    get(name) {
        return this.resources[name];
    }

    /**
     * Gets the count to concatenate to the resource's ID and increment in one the counter.
     * @returns {int} The current count.
     */
    getCounterID() {
        return this.counter++;
    }
}