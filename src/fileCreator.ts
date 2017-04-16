"use strict";

import * as fs from "fs";
import * as handlebars from "handlebars";
import * as _ from "lodash";
import * as mkdirp from "mkdirp";

import * as constants from "./constants";
import { getTemplateManifestAtTemplateDirectory } from "./getTemplateManifest";

export interface FileCreatorInputData {
    templateFolderPath: string;
    pathToCreateAt: string;
    inputName: string;
    templateName: string;
}

interface ITemplateContext {
    name: string;
}

handlebars.registerHelper({
    kebabCase: function(string) {
        return _.kebabCase(string);
    },
    camelCase: function(string) {
        return _.camelCase(string);
    },
    pascalCase: function(string) {
        return _.chain(string).camelCase().upperFirst().value();
    },
    snakeCase: function(string) {
        return _.snakeCase(string);
    },
});

function replaceName(stringToReplace: string, name: string) {
    return stringToReplace
        .replace("__kebabCase_name__", _.kebabCase(name))
        .replace("__pascalCase_name__", _.chain(name).camelCase().upperFirst().value())
        .replace("__snakeCase_name__", _.snakeCase(name))
        .replace("__camelCase_name__", _.camelCase(name));
}

function getTemplateFileNamesAtTemplateDirectory(templateFolderPath: string): string[] {
    const files = fs
        .readdirSync(templateFolderPath)
        .filter((f) => !fs.statSync(templateFolderPath + "/" + f).isDirectory())
        .filter((f) => f !== constants.MANIFEST_FILE_NAME)
        .filter((f) => !f.startsWith("."));
    return files;
}

function getTemplateContext(name: string): ITemplateContext {
    return {
        name,
    };
}
export class FileCreator {

    constructor(private data: FileCreatorInputData) { }

    createFiles(): Promise<boolean> {

        return new Promise((resolve, reject) => {

            const templateDirectory = `${this.data.templateFolderPath}/${this.data.templateName}`;
            const options = getTemplateManifestAtTemplateDirectory(templateDirectory);

            let nameToUse = this.data.inputName;

            for (const suffixToIgnore of options.suffixesToIgnoreInInput) {
                if (nameToUse.toLowerCase().endsWith(suffixToIgnore.toLowerCase())) {
                    nameToUse = nameToUse.slice(0, nameToUse.length - suffixToIgnore.length);
                }
            }

            const templateContext = getTemplateContext(nameToUse);

            let directoryPathForFiles = this.data.pathToCreateAt;

            if (options.createFilesInFolderWithPattern) {
                const folderName = replaceName(options.createFilesInFolderWithPattern, templateContext.name);
                directoryPathForFiles = this.data.pathToCreateAt + "/" + folderName;

                const pathExists = fs.existsSync(directoryPathForFiles);

                if (pathExists) {
                    reject(new Error(`Folder already exists at path: ${directoryPathForFiles}`));
                    return;
                }
            }

            const templateFileNames = getTemplateFileNamesAtTemplateDirectory(templateDirectory);
            const filePaths = templateFileNames.map((templateFileName) => {
                const fileNameToUse = replaceName(templateFileName, templateContext.name);
                return `${directoryPathForFiles}/${fileNameToUse}`;
            });

            let conflictingFilePath: string;
            for (const filePath of filePaths) {
                if (fs.existsSync(filePath)) {
                    conflictingFilePath = filePath;
                    break;
                }
            }

            if (conflictingFilePath) {
                reject(new Error(`File already exists at path: ${conflictingFilePath}`));
                return;
            }

            mkdirp.sync(directoryPathForFiles);

            const templateFileNameToFilePathToCreateMapping = _.zipObject(templateFileNames, filePaths);
            Object.keys(templateFileNameToFilePathToCreateMapping).forEach((templateFileName) => {

                const rawTemplateContent = fs.readFileSync(`${this.data.templateFolderPath}/${this.data.templateName}/${templateFileName}`, "utf8");
                const template = handlebars.compile(rawTemplateContent);
                const content = template(templateContext);

                fs.appendFile(templateFileNameToFilePathToCreateMapping[templateFileName], content, (error) => {
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
