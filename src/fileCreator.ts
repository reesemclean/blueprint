'use strict';

import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as handlebars from 'handlebars';
import * as _ from 'lodash';

import * as constants from './constants';
import { getTemplateManifestAtTemplateDirectory } from './getTemplateManifest';

export interface FileCreatorInputData {
    templateFolderPath: string;
    pathToCreateAt: string;
    inputName: string;
    templateName: string;
}

interface ITemplateContext {
    nameKebabCase: string;
    nameSnakeCase: string;
    namePascalCase: string;
    nameCamelCase: string;
}

function getTemplateFileNamesAtTemplateDirectory(templateFolderPath: string): string[] {
    const files = fs
        .readdirSync(templateFolderPath)
        .filter(f => !fs.statSync(templateFolderPath + "/" + f).isDirectory())
        .filter(f => f !== constants.MANIFEST_FILE_NAME)
        .filter(f => !f.startsWith('.'));
    return files;
}

function getTemplateContext(name: string): ITemplateContext {
    return {
        nameKebabCase: _.kebabCase(name),
        nameCamelCase: _.camelCase(name),
        namePascalCase: _.chain(name).camelCase().upperFirst().value(),
        nameSnakeCase: _.snakeCase(name)
    }
}

export class FileCreator {

    constructor(private data: FileCreatorInputData) { }

    createFiles(): Promise<boolean> {

        return new Promise((resolve, reject) => {

            const templateDirectory = `${this.data.templateFolderPath}/${this.data.templateName}`;
            const options = getTemplateManifestAtTemplateDirectory(templateDirectory);

            let nameToUse = this.data.inputName;

            for (let suffixToIgnore of options.suffixesToIgnoreInInput) {
                if (nameToUse.toLowerCase().endsWith(suffixToIgnore.toLowerCase())) {
                    nameToUse = nameToUse.slice(0, nameToUse.length - suffixToIgnore.length);
                }
            }

            const templateContext = getTemplateContext(nameToUse);

            let directoryPathForFiles = this.data.pathToCreateAt;

            if (options.createFilesInFolderWithPattern) {
                const folderName = options.createFilesInFolderWithPattern
                    .replace('__namekebabcase__', templateContext.nameKebabCase)
                    .replace('__namepascalcase__', templateContext.namePascalCase)
                    .replace('__namesnakecase__', templateContext.nameSnakeCase)
                    .replace('__namecamalcase__', templateContext.nameCamelCase);
                directoryPathForFiles = this.data.pathToCreateAt + '/' + folderName;
            }

            const pathExists = fs.existsSync(directoryPathForFiles);

            if (!pathExists) {
                mkdirp.sync(directoryPathForFiles);
            }

            getTemplateFileNamesAtTemplateDirectory(templateDirectory).forEach(templateFileName => {

                const fileNameToUse = templateFileName
                    .replace('__namekebabcase__', templateContext.nameKebabCase)
                    .replace('__namepascalcase__', templateContext.namePascalCase)
                    .replace('__namesnakecase__', templateContext.nameSnakeCase)
                    .replace('__namecamalcase__', templateContext.nameCamelCase);
                const filePath = `${directoryPathForFiles}/${fileNameToUse}`;
                const rawTemplateContent = fs.readFileSync(`${this.data.templateFolderPath}/${this.data.templateName}/${templateFileName}`, "utf8");
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
