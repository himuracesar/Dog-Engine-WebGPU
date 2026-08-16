/**
 * Class representing a resource in the Dog Engine. This class is used to keep track 
 * of the number of references to a resource, so that it can be unloaded when it is no longer needed.
 * @author César Himura
 * @version 1.0
 */
class DogResource {
    constructor(id){
        this.id = id;
        this.numberOfReferences = 0;
    }

    /**
     * Get the id of the resource
     * @returns {string} The id of the resource
     */
    getId(){
        return this.id;
    }

    /**
     * Add a reference to the resource
     */
    addReference(){
        this.numberOfReferences++;
    }

    /**
     * Remove a reference from the resource
     */
    removeReference(){
        this.numberOfReferences--;
    }

    /**
     * Get the number of references to the resource
     * @returns {int} The number of references to the resource
     */
    getNumberOfReferences(){
        return this.numberOfReferences;
    }
}