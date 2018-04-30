"use strict";

import * as fs from "fs";
import * as _ from "lodash";
import * as path from "path";
import * as vscode from "vscode";
import * as constants from "./constants";

import { CancelError } from "./customErrors";
import { IFileCreatorInputData } from "./fileCreator";

export class InputController {

    constructor(private templateFolderPath: string[], private directoryPathToCreateAt: string) { }

    public run(): Promise<IFileCreatorInputData> {

        let templateDirectory: string;
        let inputName: string;

        return this.showTemplatePickerDialog(this.templateFolderPath)
            .then((value) => {
                templateDirectory = value;
                return this.showNameInputDialog();
            })
            .then((value) => {
                inputName = value;
                return Promise.resolve();
            })
            .then((value) => {
                console.log({
                    inputName,
                    pathToCreateAt: this.directoryPathToCreateAt,
                    templateFolderPath: templateDirectory
                });

                const data: IFileCreatorInputData = {
                    inputName,
                    pathToCreateAt: this.directoryPathToCreateAt,
                    templateFolderPath: templateDirectory
                };
                return data;
            });

    }

    private showTemplatePickerDialog(templateFolderPath: string[]): Promise<string> {
        return new Promise((resolve, reject) => {
            let templates: string[] = [];

            for(var i = 0; i < templateFolderPath.length; i++){
                let templateNames: string[];
                try {
                    templateNames = this.availableTemplateNames(templateFolderPath[i]);

                    const templateObject: string[] = templateNames.map((str) => templateFolderPath[i] + '\\' + str);
                    
                    templates = templates.concat(templateObject);
                } catch (error) {
                    // reject(new Error(`${constants.ERROR_SETUP_MESSAGE_PREFIX} Could not find folder: ${templateFolderPath[i]}. Please see ${constants.README_URL} for information on setting up Blueprint in your project.`));
                    // return;
                    // tslint:disable-next-line:max-line-length
                    // return;
                }
            }

            if (templates.length === 0) {
                // tslint:disable-next-line:max-line-length
                reject(new Error(`${constants.ERROR_SETUP_MESSAGE_PREFIX} No templates found in: ${templateFolderPath[i]}. Please see ${constants.README_URL} for information on setting up Blueprint in your project.`));
                /// return;
            }

            const placeHolder = "Which template would you like to use?";

            vscode.window.showQuickPick(templates, {
                placeHolder,
                ignoreFocusOut: true,
            }).then(
                (value) => {
                    if (value === undefined) {
                        return Promise.reject(new CancelError("escape was pressed"));
                    }
                    if (!value) {
                        reject(new Error("Unable to create file(s): No Template Selected"));
                    }

                    resolve(value);
                },
                (errorReason) => {
                    reject(errorReason);
                });
        });
    }

    private showNameInputDialog(): Promise<string> {
        return new Promise((resolve, reject) => {

            vscode.window.showInputBox({
                                ignoreFocusOut: true,
                placeHolder: "Name",
                value: "",
            }).then(
                (value) => {
                    if (value === undefined) {
                        return Promise.reject(new CancelError("escape was pressed"));
                    }
                    if (!value) {
                        reject(new Error("Unable to create file(s): No Name Given"));
                    }
                    const pascalCaseValue = _.chain(value).camelCase().upperFirst().value();
                    resolve(pascalCaseValue);
                },
                (errorReason) => {
                    reject(errorReason);
                });
        });
    }

    private availableTemplateNames(templatesFolderPath: string): string[] {
        const templateDirectories = fs
            .readdirSync(templatesFolderPath)
            .filter((f) => {
                const templateFolderPath = path.join(templatesFolderPath, f);
                return fs.statSync(templateFolderPath).isDirectory();
            });
        return templateDirectories;
    }

}
