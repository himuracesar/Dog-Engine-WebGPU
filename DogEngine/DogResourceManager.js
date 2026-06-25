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
        this.bindGroupLayouts = new Map();
        this.groupsAndBindings = new Map();
        this.bindGroups = new Map();
    }

    /**
     * Adds a bind group layout to the manager.
     * @param {int} group Number of the group that belongs the bind group layout.
     * @param {GPUBindGroupLayout} bindGroupLayout The bind group layout to add.
     */
    addBindGroupLayout(group, bindGroupLayout) {
        if (this.bindGroupLayouts.has(group)) {
            throw new Error(`DogResourceManager::addBindGroupLayout:: Bind group layout with group ${group} already exists`);
        }
        this.bindGroupLayouts.set(group, bindGroupLayout);
    }

    /**
     * Gets a bind group layout from the manager.
     * @param {int} group Number of the group that belongs the bind group layout.
     * @returns {GPUBindGroupLayout} The requested bind group layout, or undefined if not found.
     */
    getBindGroupLayout(group) {
        return this.bindGroupLayouts.get(group);
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
    getCounter() {
        return this.counter++;
    }

    /**
     * Adds a group and binding to the manager.
     * @param {string} name Name of the group and binding.
     * @param {JSON object} gb The group and binding to add.
     */
    addGroupAndBinding(name, gb) {
        this.groupsAndBindings.set(name, gb);
    }

    /**
     * Gets a group and binding from the manager.
     * @param {string} name Name of the group and binding.
     * @returns {JSON object} The requested group and binding, or undefined if not found.
     */
    getGroupAndBinding(name) {
        return this.groupsAndBindings.get(name);
    }

    /**
     * Adds a bind group to the manager.
     * @param {string} name Name of the bind group.
     * @param {GPUBindGroup} bindGroup The bind group to add.
     */
    addBindGroup(name, bindGroup) {
        this.bindGroups.set(name, bindGroup);
    }

    /**
     * Gets a bind group from the manager.
     * @param {string} name Name of the bind group.
     * @returns {GPUBindGroup} The requested bind group, or undefined if not found.
     */
    getBindGroup(name) {
        return this.bindGroups.get(name);
    }
}

let resourceManager = new DogResourceManager();