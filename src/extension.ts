'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "constructor-angular" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.newAngularComponent', (e: vscode.Uri) => {
        // The code you place here will be executed every time your command is executed

        let directoryPath = e.fsPath ? e.fsPath : vscode.workspace.rootPath;

        if (!fs.statSync(directoryPath).isDirectory()) {
            directoryPath = path.dirname(directoryPath);
        }

        const controller = new TemplateController();

        controller.showComponentNameDialog()
            .then(value => controller.createComponentFolder(value, directoryPath))
            .catch(error => vscode.window.showErrorMessage(error.message ? error.message : 'There was a problem creating your component.'));

    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

export class TemplateController {

    public showComponentNameDialog(): Promise<string> {
        return new Promise((resolve, reject) => {

            const prompt = 'What is the name of the new component?';

            vscode.window.showInputBox({
                prompt: prompt,
                value: ''
            }).then(
                (value) => {
                    if (!value) {
                        reject('No Component Name Given');
                    }
                    const pascalCaseValue = _.chain(value).camelCase().upperFirst().value()
                    resolve(pascalCaseValue);
                },
                (errorReason) => {
                    reject(errorReason);
                });
        });

    }

    public createComponentFolder(componentName: string, directoryPath: string): Promise<boolean> {

        return new Promise((resolve, reject) => {

            let nameWithoutComponent = componentName;

            const componentString = 'Component';
            if (componentName.endsWith(componentString)) {
                nameWithoutComponent.slice(0, nameWithoutComponent.length - componentString.length);
            }

            const componentDirectoryPath = directoryPath + '/' + nameWithoutComponent;

            const pathExists = fs.existsSync(componentDirectoryPath);

            if (!pathExists) {
                mkdirp.sync(componentDirectoryPath);
            }

            fs.appendFile(componentDirectoryPath + '/test.js', 'Test ContentMAno', (error) => {
                if (error) { 
                    reject(error);
                    return;
                }

                resolve(true);
                return;
            });

        });

    }

}