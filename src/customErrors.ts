'use strict';

export class CancelError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}