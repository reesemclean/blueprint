"use strict";

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import * as constants from "./constants";
import { CancelError } from "./customErrors";
import { FileCreator } from "./fileCreator";
import { InputController } from "./inputController";

export function activate(context: vscode.ExtensionContext) {

    const disposable = vscode.commands.registerCommand("extension.blueprint", (e: vscode.Uri) => {

        let directoryPath = (e && e.fsPath) ? e.fsPath : vscode.workspace.rootPath;

        if (!fs.statSync(directoryPath).isDirectory()) {
            directoryPath = path.dirname(directoryPath);
        }

        const templateFolderRelativePath = vscode.workspace
            .getConfiguration("blueprint")
            .get("templatesPath") as string[];

        const templateFolderPath: string[] = [];
        for (const templatePath of templateFolderRelativePath){
            let normalizedPath = path.normalize(templatePath);

            if (normalizedPath.substring(0, constants.WORKSPACE_KEY.length) === constants.WORKSPACE_KEY) {
                const subPath = normalizedPath.substring(constants.WORKSPACE_KEY.length, normalizedPath.length);
                normalizedPath = path.join(vscode.workspace.rootPath, subPath);
            }

            templateFolderPath.push(normalizedPath);
        }

        const inputController = new InputController(templateFolderPath, directoryPath);

        inputController.run()
            .then((data) => {
                const fileCreator = new FileCreator(data);
                return fileCreator.createFiles();
            })
            .catch((error) => {
                if (error instanceof CancelError) { return; }

                const message: string = error.message ? error.message : "There was a problem creating your file(s).";
                const isModal = message.startsWith(constants.ERROR_SETUP_MESSAGE_PREFIX);

                const errorMessage = error.message ? error.message : "There was a problem creating your file(s).";
                vscode.window.showErrorMessage(errorMessage, { modal: isModal });
            });
    });

    context.subscriptions.push(disposable);
}

// export function deactivate() {}
