"use strict";

import * as fs from "fs";
import * as handlebars from "handlebars";
import * as _ from "lodash";
import * as mkdirp from "mkdirp";
import * as path from "path";

import * as constants from "./constants";
import { getTemplateManifestAtTemplateDirectory } from "./getTemplateManifest";

export interface IFileCreatorInputData {
    templateFolderPath: string;
    pathToCreateAt: string;
    inputName: string;
    templateName: string;
}

interface ITemplateContext {
    name: string;
}

handlebars.registerHelper({
    camelCase: (input) => {
        return _.camelCase(input);
    },
    kebabCase: (input) => {
        return _.kebabCase(input);
    },
    pascalCase: (input) => {
        return _.chain(input).camelCase().upperFirst().value();
    },
    snakeCase: (input) => {
        return _.snakeCase(input);
    },
});

function escapeRegExp(str): string {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace): string {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}

function replaceName(stringToReplace: string, name: string): string {
    let result = replaceAll(stringToReplace, "__kebabCase_name__", _.kebabCase(name));
    result = replaceAll(result, "__pascalCase_name__", _.chain(name).camelCase().upperFirst().value());
    result = replaceAll(result, "__snakeCase_name__", _.snakeCase(name));
    result = replaceAll(result, "__camelCase_name__", _.camelCase(name));
    return result;
}

function getTemplateFileNamesAtTemplateDirectory(templateFolderPath: string): string[] {
    const files = fs
        .readdirSync(templateFolderPath)
        .filter((f) => {
            const folderPath = path.join(templateFolderPath, f);
            return !fs.statSync(folderPath).isDirectory();
        })
        .filter((f) => f !== constants.MANIFEST_FILE_NAME)
        .filter((f) => !f.startsWith("."));
    return files;
}

function getFolderNamesAtDirectory(directoryPath: string): string[] {
    const folderNames = fs
        .readdirSync(directoryPath)
        .filter((f) => {
            const folderPath = path.join(directoryPath, f);
            return fs.statSync(folderPath).isDirectory();
        })
        .filter((f) => f !== constants.MANIFEST_FILE_NAME)
        .filter((f) => !f.startsWith("."));
    return folderNames;
}

function getFolderPathsRecursively(directoryPath: string, existingPath: string = ""): string[] {
    const templatePath = path.join(directoryPath, existingPath);
    const templateFolderNames = getFolderNamesAtDirectory(templatePath);
    const folderPathsAtThisLevel = templateFolderNames.map((templateFolderName) => {
        if (existingPath) {
            return path.join(existingPath, templateFolderName);
        }
        return templateFolderName;
    });

    return folderPathsAtThisLevel.concat(_.flatMap(folderPathsAtThisLevel, (folderPath) => {
        return getFolderPathsRecursively(directoryPath, folderPath);
    }));
}

function getTemplateContext(name: string): ITemplateContext {
    return {
        name,
    };
}
export class FileCreator {

    constructor(private data: IFileCreatorInputData) { }

    public createFiles(): Promise<boolean> {

        return new Promise((resolve, reject) => {

            const templateDirectory = path.join(this.data.templateFolderPath, this.data.templateName);
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
                directoryPathForFiles = path.join(this.data.pathToCreateAt, folderName);

                const pathExists = fs.existsSync(directoryPathForFiles);

                if (pathExists) {
                    reject(new Error(`Folder already exists at path: ${directoryPathForFiles}`));
                    return;
                }
            }

            const templateFolderPaths = getFolderPathsRecursively(templateDirectory);
            const folderPathsToCreate = templateFolderPaths.map((templateFolderPath) => {
                return path.join(directoryPathForFiles, replaceName(templateFolderPath, templateContext.name));
            });

            let conflictingFolderPath: string;
            for (const folderPath of folderPathsToCreate) {
                if (fs.existsSync(path.join(directoryPathForFiles, folderPath))) {
                    conflictingFolderPath = folderPath;
                    break;
                }
            }

            if (conflictingFolderPath) {
                reject(new Error(`Folder already exists at path: ${conflictingFolderPath}`));
                return;
            }

            const templateFilePaths = _.flatMap(templateFolderPaths.concat([""]), (templateFolderPath) => {
                const fullTemplateFolderPath = path.join(templateDirectory, templateFolderPath);
                const templateFileNames = getTemplateFileNamesAtTemplateDirectory(fullTemplateFolderPath);
                return templateFileNames.map((templateFileName) => {
                    return path.join(templateFolderPath, templateFileName);
                });
            });
            const filePathsToCreate = templateFilePaths.map((templateFilePath) => {
                return path.join(directoryPathForFiles, replaceName(templateFilePath, templateContext.name));
            });

            let conflictingFilePath: string;
            for (const filePath of filePathsToCreate) {
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

            folderPathsToCreate.forEach((folderPath) => mkdirp.sync(folderPath));

            const templateFileNameToFilePathToCreateMapping = _.zipObject(templateFilePaths, filePathsToCreate);
            Object.keys(templateFileNameToFilePathToCreateMapping).forEach((templateFilePath) => {

                const rawTemplateContent = fs.readFileSync(
                    path.join(templateDirectory, templateFilePath),
                    "utf8",
                );
                const template = handlebars.compile(rawTemplateContent);
                const content = template(templateContext);

                fs.appendFile(templateFileNameToFilePathToCreateMapping[templateFilePath], content, (error) => {
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
