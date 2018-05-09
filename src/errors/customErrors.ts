"use strict";

import * as constants from "../constants";

export class AppError extends Error {
    public readonly silent?: boolean;
    public readonly modal?: boolean;
}

export class CancelError extends AppError {

    public readonly silent = true;

    constructor() {
        super("canceled");
    }
}

export class SetupError extends AppError {

    public readonly modal = true;

    constructor() {
        // tslint:disable-next-line
        super(`No templates found. Please see ${constants.README_URL} for information on setting up Blueprint in your project.`);
    }
}

export class NoNameGivenError extends AppError {
    constructor() {
        const message = "Unable to create file(s): No Name Given";
        super(message);
    }
}

export class NoTemplateSelectedError extends AppError {
    constructor() {
        const message = "Unable to create file(s): No Template Selected";
        super(message);
    }
}

export class WriteConflictError extends AppError {
    constructor(atPath: string) {
        const message = `File already exists at path: ${atPath}`;
        super(message);
    }
}
