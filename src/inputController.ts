"use strict";

import * as fs from "fs";
import * as _ from "lodash";
import * as path from "path";
import * as vscode from "vscode";
import * as constants from "./constants";

import { CancelError } from "./customErrors";
import { IFileCreatorInputData } from "./fileCreator";

export class InputController {

    constructor(private templateFolders: {
        alias: string,
        path: string
    }[], private directoryPathToCreateAt: string) { }

    public run(): Promise<IFileCreatorInputData> {

        let templateDirectory: string;
        let inputName: string;

        return this.showTemplatePickerDialog(this.templateFolders)
            .then((value) => {
                templateDirectory = value;
                return this.showNameInputDialog();
            })
            .then((value) => {
                inputName = value;
                return Promise.resolve();
            })
            .then((value) => {
                const data: IFileCreatorInputData = {
                    inputName,
                    pathToCreateAt: this.directoryPathToCreateAt,
                    templateFolderPath: templateDirectory,
                };
                return data;
            });

    }

    private showTemplatePickerDialog(templateFolders: {
        alias: string,
        path: string
    }[]): Promise<string> {
        return new Promise((resolve, reject) => {
            let templates: string[] = [];

            for (const folder of templateFolders){
                let templateNames: string[];
                try {
                    templateNames = this.availableTemplateNames(folder.path);

                    const templateObject: string[] = templateNames.map((str) => folder.alias + " : " + str);
                    templates = templates.concat(templateObject);
                } catch (error) {
                    //TODO: Add logging
                }
            }

            if (templates.length === 0) {
                // tslint:disable-next-line:max-line-length
                const directories = templateFolders.map((obj) => obj.path);

                reject(new Error(`${constants.ERROR_SETUP_MESSAGE_PREFIX} No templates found at the below directories: \n\n ${directories.join('\n')} \n\n Please see ${constants.README_URL} for information on setting up Blueprint in your project.`));
                return;
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

    private availableTemplateNames(templatespath: string): string[] {
        const templateDirectories = fs
            .readdirSync(templatespath)
            .filter((f) => {
                const templatepath = path.join(templatespath, f);
                return fs.statSync(templatepath).isDirectory();
            });
        return templateDirectories;
    }

}
