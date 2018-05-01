"use strict";

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import * as constants from "./constants";
import { CancelError } from "./customErrors";
import { FileCreator } from "./fileCreator";
import { InputController } from "./inputController";
import { isArray } from "util";

export function activate(context: vscode.ExtensionContext) {

    const disposable = vscode.commands.registerCommand("extension.blueprint", (e: vscode.Uri) => {

        let directoryPath = (e && e.fsPath) ? e.fsPath : vscode.workspace.rootPath;

        if (!fs.statSync(directoryPath).isDirectory()) {
            directoryPath = path.dirname(directoryPath);
        }

        const config = vscode.workspace
            .getConfiguration("blueprint")
            .get("templatesPath") as object | string | string[];

        const templateFolders: {
            alias: string,
            path: string
        }[] = readConfig(config);

        const inputController = new InputController(templateFolders, directoryPath);

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

    /**
     * Normalizes the path by removing reserved keys and appending the necessary directory
     * 
     * @param configPath The configuration path
     */
    function normalizePath (configPath: string) {
        let global = true;

        // Validate whether the path has the root key
        if (configPath.substring(0, constants.WORKSPACE_KEY.length) === constants.WORKSPACE_KEY) {
            const localPath = configPath.substring(constants.WORKSPACE_KEY.length, configPath.length);
            configPath = path.join(vscode.workspace.rootPath, localPath);
            global = false;
        }

        let normalizedPath = path.normalize(configPath);

        return {
            path: normalizedPath,
            global: global
        };
    }

    /**
     * Loads the configuration data based on type and creates an array of {alias, path} for the paths
     * 
     * @param config Config data loaded from VSCode settings
     */
    function readConfig (config: string[] | string | object) {
        let data : {
            alias: string,
            path: string
        }[] = [];

        if(typeof config === 'string'){
            const normalized = normalizePath(config);
            data.push({
                alias: normalized.global ? 'Global' : 'Local',
                path: normalized.path
            });
        } else if(config instanceof Array){
            data = config.map((path) => {
                const normalized = normalizePath(path);
                return {
                    alias: normalized.global ? 'Global' : 'Local',
                    path: normalized.path
                }
            });
        } else if(config instanceof Object) {
            for(const k in config){
                data.push({
                    alias: k,
                    path: normalizePath(config[k]).path
                });
            }
        }

        return data;
    }

    context.subscriptions.push(disposable);
}

// export function deactivate() {}
