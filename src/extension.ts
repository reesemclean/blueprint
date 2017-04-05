'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as handlebars from 'handlebars';

const MANIFEST_FILE_NAME = 'manifest.json';
const README_URL = 'https://github.com/reesemclean/blueprint';
const ERROR_SETUP_MESSAGE_PREFIX = '[Blueprint Setup]';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.blueprint', (e: vscode.Uri) => {

        let directoryPath = (e && e.fsPath) ? e.fsPath : vscode.workspace.rootPath;

        if (!fs.statSync(directoryPath).isDirectory()) {
            directoryPath = path.dirname(directoryPath);
        }

        const templateFolderPath = vscode.workspace.getConfiguration('blueprint').get('templatesPath');
        const controller = new TemplateController();

        const data: TemplateControllerData = {
            templateFolderPath: `${vscode.workspace.rootPath}/${templateFolderPath}`,
            pathToCreateAt: directoryPath,
            inputName: null,
            templateName: null,
        }

        controller
            .showTemplatePickerDialog(data)
            .then(value => controller.showNameInputDialog(value))
            .then(value => controller.createFiles(value))
            .catch(error => {
                const message: string = error.message ? error.message : 'There was a problem creating your file(s).';
                const isModal = message.startsWith(ERROR_SETUP_MESSAGE_PREFIX);
                vscode.window.showErrorMessage(error.message ? error.message : 'There was a problem creating your file(s).', { modal: isModal });
            });

    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

export interface TemplateContextInterface {
    nameKebabCase: string;
    nameSnakeCase: string;
    namePascalCase: string;
    nameCamelCase: string;
}

export interface TemplateControllerData {
    templateFolderPath: string;
    pathToCreateAt: string;
    inputName: string | null;
    templateName: string | null;
}

export interface TemplateManifestOptions {
    suffixesToIgnoreInInput: string[];
    createFilesInFolderWithPattern: string | null
}

const defaultManifestOptions = {
    suffixesToIgnoreInInput: [],
    createFilesInFolderWithPattern: null
}

export class TemplateController {

    public showTemplatePickerDialog(data: TemplateControllerData): Promise<TemplateControllerData> {
        return new Promise((resolve, reject) => {

            let templateNames: string[];
            try {
                templateNames = this.availableTemplateNames(data.templateFolderPath)
            } catch (error) {
                reject(new Error(`${ERROR_SETUP_MESSAGE_PREFIX} Could not find folder: ${data.templateFolderPath}. Please see ${README_URL} for information on setting up Blueprint in your project.`));
                return;
            }

            if (templateNames.length === 0) {
                reject(new Error(`${ERROR_SETUP_MESSAGE_PREFIX} No templates found in: ${data.templateFolderPath}. Please see ${README_URL} for information on setting up Blueprint in your project.`));
                return;
            }

            const prompt = "Which template would you like to use?";

            vscode.window.showQuickPick(templateNames).then(
                (value) => {
                    resolve(Object.assign({}, data, {
                        templateName: value,
                    }))
                },
                (errorReason) => {
                    reject(errorReason);
                }
            )
        });
    }

    public showNameInputDialog(data: TemplateControllerData): Promise<TemplateControllerData> {
        return new Promise((resolve, reject) => {

            const prompt = 'Name';

            vscode.window.showInputBox({
                prompt: prompt,
                value: ''
            }).then(
                (value) => {
                    if (!value) {
                        reject(new Error('Unable to create file(s): No Name Given'));
                    }
                    const pascalCaseValue = _.chain(value).camelCase().upperFirst().value()
                    resolve(Object.assign({}, data, {
                        inputName: pascalCaseValue
                    }));
                },
                (errorReason) => {
                    reject(errorReason);
                });
        });

    }

    public availableTemplateNames(templatesFolderPath: string): string[] {
        const templateDirectories = fs.readdirSync(templatesFolderPath).filter(f => fs.statSync(templatesFolderPath + "/" + f).isDirectory())
        return templateDirectories;
    }

    public templateFileNames(templateFolderPath: string): string[] {
        const files = fs
            .readdirSync(templateFolderPath)
            .filter(f => !fs.statSync(templateFolderPath + "/" + f).isDirectory())
            .filter(f => f !== MANIFEST_FILE_NAME);
        return files;
    }

    public templateManifest(templateFolderPath: string): TemplateManifestOptions | null {

        try {
            const rawManifestContent = fs.readFileSync(`${templateFolderPath}/${MANIFEST_FILE_NAME}`, "utf8");

            if (!rawManifestContent) { return defaultManifestOptions; }

            const object = JSON.parse(rawManifestContent);
            if (object) {
                return Object.assign({}, defaultManifestOptions, object);
            }

            return defaultManifestOptions;
        } catch (e) {
            return defaultManifestOptions;
        }
    }

    public templateContext(name: string): TemplateContextInterface {
        return {
            nameKebabCase: _.kebabCase(name),
            nameCamelCase: _.camelCase(name),
            namePascalCase: _.chain(name).camelCase().upperFirst().value(),
            nameSnakeCase: _.snakeCase(name)
        }
    }

    public createFiles(data: TemplateControllerData): Promise<boolean> {

        return new Promise((resolve, reject) => {

            const templateDirectory = `${data.templateFolderPath}/${data.templateName}`;
            const options = this.templateManifest(templateDirectory);

            let nameToUse = data.inputName;

            for (let suffixToIgnore of options.suffixesToIgnoreInInput) {
                if (nameToUse.toLowerCase().endsWith(suffixToIgnore.toLowerCase())) {
                    nameToUse = nameToUse.slice(0, nameToUse.length - suffixToIgnore.length);
                }
            }

            const templateContext = this.templateContext(nameToUse);

            let directoryPathForFiles = data.pathToCreateAt;

            if (options.createFilesInFolderWithPattern) {
                const folderName = options.createFilesInFolderWithPattern
                    .replace('__kebabcasename__', templateContext.nameKebabCase)
                    .replace('__pascalcasename__', templateContext.namePascalCase)
                    .replace('__snakecasename__', templateContext.nameSnakeCase)
                    .replace('__camalcasename__', templateContext.nameCamelCase);
                directoryPathForFiles = data.pathToCreateAt + '/' + folderName;
            }

            const pathExists = fs.existsSync(directoryPathForFiles);

            if (!pathExists) {
                mkdirp.sync(directoryPathForFiles);
            }

            this.templateFileNames(templateDirectory).forEach(templateFileName => {

                const fileNameToUse = templateFileName
                    .replace('__kebabcasename__', templateContext.nameKebabCase)
                    .replace('__pascalcasename__', templateContext.namePascalCase)
                    .replace('__snakecasename__', templateContext.nameSnakeCase)
                    .replace('__camalcasename__', templateContext.nameCamelCase);
                const filePath = `${directoryPathForFiles}/${fileNameToUse}`;
                const rawTemplateContent = fs.readFileSync(`${data.templateFolderPath}/${data.templateName}/${templateFileName}`, "utf8");
                const template = handlebars.compile(rawTemplateContent);
                const content = template(templateContext);

                fs.appendFile(filePath, content, (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(true);
                    return;
                });

            });

        });

    }

}
