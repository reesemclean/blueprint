'use strict'; //what does this mean?

export class CancelError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}