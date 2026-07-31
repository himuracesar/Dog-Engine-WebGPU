/**
 * A Queue is a linear data structure that follows the First In First Out (FIFO) principle.
 * It has two main operations: enqueue (adding an element to the rear of the queue) and dequeue (removing an element from the front of the queue).
 * The Queue class provides methods to perform these operations, as well as additional utility methods like peek, isEmpty, getSize, and print.
 * 
 * https://www.geeksforgeeks.org/javascript/implementation-queue-javascript/
 * 
 * Big O Notation:
 * - enqueue(): O(1) (insert at tail)
 * - dequeue(): O(1) (remove head)
 * - peek(): O(1)
 * - isEmpty(): O(1)
 * - getSize(): O(1) (you maintained a size variable)
 * - print(): O(n) (traverse all nodes)
 * 
 * @author GeeksforGeeks
 * @version 1.0
 */
class GeeksQueue {
    /**
     * Creates an empty queue.
     */
    constructor() {
        this.front = null;  
        this.rear = null; 
        this.size = 0; 
    }

    /**
     * Adds an element to the rear of the queue.
     * @param {Object} data - The data to be added to the queue.
     */
    enqueue(data) {
        const newNode = new GeeksNode(data);
        if (this.isEmpty()) {
            this.front = newNode;
            this.rear = newNode;
        } else {
            this.rear.next = newNode;
            this.rear = newNode;
        }
        this.size++;
    }

    /**
     * Removes an element from the front of the queue.
     * @returns {Object|null} - The data of the removed element, or null if the queue is empty.
     */
    dequeue() {
        if (this.isEmpty()) {
            return null; 
        }
        const removedNode = this.front;
        this.front = this.front.next;
        if (this.front === null) {
            this.rear = null;
        }
        this.size--;
        
        return removedNode.data;
    }

    /**
     * Returns the element at the front of the queue without removing it.
     * @returns {Object|null} - The data of the front element, or null if the queue is empty.
     */
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.front.data;
    }

    /**
     * Checks if the queue is empty.
     * @returns {boolean} - True if the queue is empty, false otherwise.
     */
    isEmpty() {
        return this.size === 0;
    }

    /**
     * Gets the number of elements in the queue.
     * @returns {int} - The size of the queue.
     */
    getSize() {
        return this.size;
    }

    /**
     * Prints the elements of the queue from front to rear.
     */
    print() {
        let current = this.front;
        const elements = [];
        while (current) {
            elements.push(current.data);
            current = current.next;
        }

        console.log(elements.join(' -> '));
    }
}