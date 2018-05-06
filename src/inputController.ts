"use strict";

import * as fs from "fs";
import * as _ from "lodash";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import * as constants from "./constants";

import { CancelError } from "./customErrors";
import { IFileCreatorInputData } from "./fileCreator";

interface ITemplateQuickPickItem extends vscode.QuickPickItem {
    filePath: string;
}

export class InputController {

    constructor(private templateFolderPaths: string[], private directoryPathToCreateAt: string) { }

    public run(): Promise<IFileCreatorInputData> {

        let templateDirectory: string;
        let inputName: string;

        return this.showTemplatePickerDialog(this.templateFolderPaths)
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

    private showTemplatePickerDialog(templateFolderPaths: string[]): Promise<string> {
        return new Promise((resolve, reject) => {

            const quickPickItems: ITemplateQuickPickItem[] = templateFolderPaths
                .map(folderPath => {
                    return this.quickPickItemsForFolder(folderPath);
                })
                .reduce((prev, curr) => {
                    return prev.concat(curr);
                }, []);

            if (quickPickItems.length === 0) {
                // tslint:disable-next-line:max-line-length
                reject(new Error(`${constants.ERROR_SETUP_MESSAGE_PREFIX} No templates found. Please see ${constants.README_URL} for information on setting up Blueprint in your project.`));
                return;
            }

            const placeHolder = "Which template would you like to use?";

            vscode.window.showQuickPick(quickPickItems, {
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

                    resolve(value.filePath);
                },
                (errorReason) => {
                    reject(errorReason);
                });
        });
    }

    private quickPickItemsForFolder(folderPath: string): ITemplateQuickPickItem[] {
        try {
            const expandedFolderPath = this.expandFolderPath(folderPath);
            const templateNames = this.availableTemplateNames(expandedFolderPath);

            const items: ITemplateQuickPickItem[] = templateNames.map((name, index) => {
                return {
                    description: index === 0 ? folderPath : "",
                    filePath: path.join(expandedFolderPath, name),
                    label: name,
                };
            });
            return items;

        } catch (error) {
            // tslint:disable-next-line
            console.log(`Error loading template path: ${folderPath}, error:  ${error}`);
            return [];
        }

    }

    private expandFolderPath(folderPath: string): string {

        const normalizedPath = path.normalize(folderPath);
        let result = folderPath;

        if (normalizedPath.substring(0, 1) === "~") {
            const home = os.homedir();
            const subPath = normalizedPath.substring(1, normalizedPath.length);
            result = path.join(home, subPath);
        } else {
            result = path.resolve(vscode.workspace.rootPath, folderPath);
        }

        return result;

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
