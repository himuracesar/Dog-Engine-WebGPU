/**
 * Interface to create scenes in Dog Engine.
 * @author César Himura
 * @version 1.0
 */
class DogScene {
    constructor() {
        if (new.target === DogScene) {
            throw new TypeError("DogScene can't be instantiated directly");
        }
    }

    /**
     * Initializes the scene.
     * @returns {Promise<void>}
     */
    async init() {
        throw new Error("init function must be implemented by the subclass");
    }

    /**
     * Updates the scene.
     * @param {float} deltaTime Delta time.
     */
    update(deltaTime) {
        throw new Error("update function must be implemented by the subclass");
    }

    /**
     * Renders the scene.
     */
    render() {
        throw new Error("render function must be implemented by the subclass");
    }

    /**
     * Handles mouse up events.
     * @param {MouseEvent} event Mouse up event.
     */
    onMouseUp(event) {
        throw new Error("onMouseUp function must be implemented by the subclass");
    }

    /**
     * Handles mouse over events.
     * @param {MouseEvent} event Mouse over event.
     */
    onMouseOver(event) {
        throw new Error("onMouseOver function must be implemented by the subclass");
    }

    /**
     * Handles mouse out events.
     * @param {MouseEvent} event Mouse out event.
     */
    onMouseOut(event) {
        throw new Error("onMouseOut function must be implemented by the subclass");
    }

    /**
     * Handles mouse down events.
     * @param {MouseEvent} event Mouse down event.
     */
    onMouseDown(event) {
        throw new Error("onMouseDown function must be implemented by the subclass");
    }

    /**
     * Handles key down events.
     * @param {KeyboardEvent} event Key down event.
     */
    onKeyDown(event) {
        throw new Error("onKeyDown function must be implemented by the subclass");
    }

    /**
     * Handles key up events.
     * @param {KeyboardEvent} event Key up event.
     */
    onKeyUp(event) {
        throw new Error("onKeyUp function must be implemented by the subclass");
    }
}