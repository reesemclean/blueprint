'use strict';

import * as vscode from 'vscode';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as constants from './constants';

import { FileCreatorInputData } from './fileCreator';

export class InputController {

    constructor(private templateFolderPath: string, private directoryPathToCreateAt: string) { }

    public run(): Promise<FileCreatorInputData> {

        let templateName: string;
        let inputName: string;

        return this.showTemplatePickerDialog(this.templateFolderPath)
            .then(value => {
                templateName = value;
                return this.showNameInputDialog();
            })
            .then(value => {
                inputName = value;
                return Promise.resolve();
            })
            .then(value => {
                const data: FileCreatorInputData = {
                    templateFolderPath: this.templateFolderPath,
                    pathToCreateAt: this.directoryPathToCreateAt,
                    inputName: inputName,
                    templateName: templateName,
                }
                return data;
            });

    }

    private showTemplatePickerDialog(templateFolderPath: string): Promise<string> {
        return new Promise((resolve, reject) => {

            let templateNames: string[];
            try {
                templateNames = this.availableTemplateNames(templateFolderPath)
            } catch (error) {
                reject(new Error(`${constants.ERROR_SETUP_MESSAGE_PREFIX} Could not find folder: ${templateFolderPath}. Please see ${constants.README_URL} for information on setting up Blueprint in your project.`));
                return;
            }

            if (templateNames.length === 0) {
                reject(new Error(`${constants.ERROR_SETUP_MESSAGE_PREFIX} No templates found in: ${templateFolderPath}. Please see ${constants.README_URL} for information on setting up Blueprint in your project.`));
                return;
            }

            const placeHolder = "Which template would you like to use?";

            vscode.window.showQuickPick(templateNames, {
                placeHolder: placeHolder,
                ignoreFocusOut: true
            }).then(
                (value) => {
                    if (!value) return;
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
                placeHolder: 'Name',
                ignoreFocusOut: true,
                value: ''
            }).then(
                (value) => {
                    if (value === undefined) return;
                    if (value === '') {
                        reject(new Error('Unable to create file(s): No Name Given'));
                    }
                    const pascalCaseValue = _.chain(value).camelCase().upperFirst().value()
                    resolve(pascalCaseValue);
                },
                (errorReason) => {
                    reject(errorReason);
                });
        });
    }

    private availableTemplateNames(templatesFolderPath: string): string[] {
        const templateDirectories = fs.readdirSync(templatesFolderPath).filter(f => fs.statSync(templatesFolderPath + "/" + f).isDirectory())
        return templateDirectories;
    }

}