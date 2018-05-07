"use strict";

import * as fs from "fs-extra";
import * as handlebars from "handlebars";
import * as _ from "lodash";
import * as os from "os";
import * as path from "path";

import * as constants from "../constants";
import { getTemplateManifestAtTemplateDirectory } from "../getTemplateManifest";

import { IUserInput } from '../inputs';

handlebars.registerHelper({
  camelCase: (input) => {
    return _.camelCase(input);
  },
  kebabCase: (input) => {
    return _.kebabCase(input);
  },
  lowerCase: (input) => {
    return _.lowerCase(input);
  },
  lowerDotCase: (input) => {
    return _.snakeCase(input).replace(/_/g, ".");
  },
  pascalCase: (input) => {
    return _.chain(input).camelCase().upperFirst().value();
  },
  snakeCase: (input) => {
    return _.snakeCase(input);
  },
  upperCase: (input) => {
    return _.upperCase(input);
  },
});

export async function createFiles(userInput: IUserInput, inDirectory: string) {

  const options = getTemplateManifestAtTemplateDirectory(userInput.selectedTemplatePath);

  const name = sanitizedName(userInput.inputName, options.suffixesToIgnoreInInput);

  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'blueprint-'));

  createFilesFromTemplateInDirectory(
    userInput.selectedTemplatePath,
    temporaryDirectory,
    userInput.inputName
  );

  let containerFolderName = "";
  if (options.createFilesInFolderWithPattern) {
    containerFolderName = replaceName(options.createFilesInFolderWithPattern, name);
  }

  const pathToMoveTo = path.join(inDirectory, containerFolderName);
  const foldersToMove = getFolderNamesAtDirectory(temporaryDirectory);

  const folderNames = fs.readdirSync(temporaryDirectory).forEach(fileOrFolderName => {
    const pathToContents = path.join(temporaryDirectory, fileOrFolderName);
    const finalPath = path.join(pathToMoveTo, fileOrFolderName);

    try {
      fs.copySync(pathToContents, finalPath, { overwrite: false, errorOnExist: true, recursive: true });
    } catch (e) {
      if (e.code === 'EEXIST') {
        throw new Error(`File already exists at path: ${finalPath}`);
      }

      throw e;
    } finally {
      fs.removeSync(temporaryDirectory);
    }
  });

}

function createFilesFromTemplateInDirectory(templatePath: string, inDirectory: string, name: string) {

  createFilesForTemplateFolder(templatePath, inDirectory, name);

  const templateFoldersInFolder = getFolderNamesAtDirectory(templatePath);

  templateFoldersInFolder.forEach((templateFolderName) => {

    const folderName = replaceName(templateFolderName, name);
    const fullFolderPath = path.join(templatePath, templateFolderName);
    const directoryToCreateIn = path.join(inDirectory, folderName);
    fs.mkdirSync(directoryToCreateIn);
    createFilesFromTemplateInDirectory(fullFolderPath, directoryToCreateIn, name);

  });

}

async function createFilesForTemplateFolder(templateFolderPath: string, inDirectory: string, name: string) {

  const templateFilesInFolder = getTemplateFileNamesAtTemplateDirectory(templateFolderPath);

  templateFilesInFolder.forEach(templateFilePath => {

    const rawTemplateContent = fs.readFileSync(
      path.join(templateFolderPath, templateFilePath),
      "utf8",
    );
    const template = handlebars.compile(rawTemplateContent);

    const context = {
      name
    };

    const content = template(context);

    const fileName = replaceName(templateFilePath, name);
    fs.writeFileSync(path.join(inDirectory, fileName), content);

  });

}

function sanitizedName(name: string, ignoreSuffixes: string[]): string {

  let nameToUse = name;

  for (const suffixToIgnore of ignoreSuffixes) {
    if (nameToUse.toLowerCase().endsWith(suffixToIgnore.toLowerCase())) {
      nameToUse = nameToUse.slice(0, nameToUse.length - suffixToIgnore.length);
    }
  }

  return nameToUse;
}

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
  result = replaceAll(result, "__lowerDotCase_name__", _.snakeCase(name).replace(/_/g, "."));
  result = replaceAll(result, "__camelCase_name__", _.camelCase(name));
  result = replaceAll(result, "__upperCase_name__", _.upperCase(name));
  result = replaceAll(result, "__lowerCase_name__", _.lowerCase(name));
  return result;
}

function getFolderNamesAtDirectory(directoryPath: string): string[] {
  const folderNames = fs
    .readdirSync(directoryPath)
    .filter((f) => {
      const folderPath = path.join(directoryPath, f);
      return fs.statSync(folderPath).isDirectory();
    })
    .filter((f) => f !== constants.MANIFEST_FILE_NAME);
  return folderNames;
}

function getTemplateFileNamesAtTemplateDirectory(templateFolderPath: string): string[] {
  const files = fs
    .readdirSync(templateFolderPath)
    .filter((f) => {
      const folderPath = path.join(templateFolderPath, f);
      return !fs.statSync(folderPath).isDirectory();
    })
    .filter((f) => f !== constants.MANIFEST_FILE_NAME)
    .filter((f) => !shouldIgnoreFileName(f));
  return files;
}

function shouldIgnoreFileName(fileName: string): boolean {

  const ignoredFileNames = [
    ".DS_Store",
    ".DS_Store?",
    "._*",
    ".Spotlight-V100",
    ".Trashes",
    "ehthumbs.db",
    "Thumbs.db",
  ];

  return ignoredFileNames.some(ignoredFileName => fileName.startsWith(ignoredFileName));

}