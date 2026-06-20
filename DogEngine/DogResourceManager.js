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
            throw new Error(`Bind group layout with group ${group} already exists`);
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

    addBindGroup(name, bindGroup) {
        this.bindGroups.set(name, bindGroup);
    }

    getBindGroup(name) {
        return this.bindGroups.get(name);
    }

    /**
     * Sets the configuration components for the scenes and shaders.
     * @param {Map<string, GeeksQueue>} bindings Contains the configuration components for the scenes and shaders, 
     * where the key is the name of the component and the value is a queue of JSON objects with the information to create the bind groups.
     */
    /*setConfigComponents(bindings) {
        this.configComponents = bindings;
    }*/

    /**
     * Gets a configuration component by its name. If the component is found, it returns the first JSON object in the queue. 
     * If the queue has more than one JSON object, it removes the first one from the queue. If the component is not found, it returns null.
     * The queue has to have al least one JSON object with the information to create the bind group and buffer for the component.
     * @param {string} name The name of the component. For example, "DogCamera" for the camera component.
     * @returns {JSON} The requested configuration component, or null if not found.
     */
    /*getConfigComponentByName(name) {
        var bind = null;
        if (this.configComponents.has(name)) {
            bind = Object.assign({}, this.configComponents.get(name).peek());

            this.configComponents.get(name).peek().bindGroup = null;
            this.configComponents.get(name).peek().idBuffer = -1;

            if (this.configComponents.get(name).getSize() > 1) {
                this.configComponents.get(name).dequeue();
            }
        }

        return bind;
    }*/
}

let resourceManager = new DogResourceManager();