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
    name: string;
}

handlebars.registerHelper({
    kebabCase: function (string) {
        return _.kebabCase(string);
    },
    camelCase: function (string) {
        return _.camelCase(string);
    },
    pascalCase: function (string) {
        return _.chain(string).camelCase().upperFirst().value();
    },
    snakeCase: function (string) {
        return _.snakeCase(string);
    }
})

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
        name: name
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
                //is this the right place to be doing the string conversions?
                    .replace('__kebabCase_name__', _.kebabCase(templateContext.name))
                    .replace('__pascalCase_name__', _.chain(templateContext.name).camelCase().upperFirst().value())
                    .replace('__snakeCase_name__', _.snakeCase(templateContext.name))
                    .replace('__camelCase_name__', _.camelCase(templateContext.name));
                directoryPathForFiles = this.data.pathToCreateAt + '/' + folderName;
            }

            const pathExists = fs.existsSync(directoryPathForFiles);

            if (!pathExists) {
                mkdirp.sync(directoryPathForFiles);
            }

            getTemplateFileNamesAtTemplateDirectory(templateDirectory).forEach(templateFileName => {

                const fileNameToUse = templateFileName
                //should we create a function to do the conversions since this is the same code used above?
                    .replace('__kebabCase_name__', _.kebabCase(templateContext.name))
                    .replace('__pascalCase_name__', _.chain(templateContext.name).camelCase().upperFirst().value())
                    .replace('__snakeCase_name__', _.snakeCase(templateContext.name))
                    .replace('__camelCase_name__', _.camelCase(templateContext.name));
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
