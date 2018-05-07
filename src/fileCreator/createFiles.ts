"use strict";

import * as fs from "fs";
import * as handlebars from "handlebars";
import * as _ from "lodash";
import * as mkdirp from "mkdirp";
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

  let directoryToCreateIn = inDirectory;
  if (options.createFilesInFolderWithPattern) {
    directoryToCreateIn = await createContainerFolder(options.createFilesInFolderWithPattern, name, inDirectory);
  }

  const folderPaths = await folderPathsToCreate(userInput.selectedTemplatePath, directoryToCreateIn, name);
  const filePaths = await filePathsToCreate(folderPaths, userInput.selectedTemplatePath, directoryToCreateIn, name);

  await createFolders(folderPaths, directoryToCreateIn);
  await createFilesFromTemplateFiles(
    templateFilePaths(folderPaths, userInput.selectedTemplatePath),
    userInput.selectedTemplatePath,
    filePaths,
    directoryToCreateIn,
    name
  );
}

async function createFolders(folderPaths: string[], inDirectory: string) {
  mkdirp.sync(inDirectory);
  folderPaths.forEach((folderPath) => mkdirp.sync(folderPath));
}

async function createFilesFromTemplateFiles(templateFilePaths: string[], templateDirectory: string, filePaths: string[], inDirectory: string, name: string) {
  const templateFileNameToFilePathToCreateMapping = _.zipObject(templateFilePaths, filePaths);

  Object.keys(templateFileNameToFilePathToCreateMapping).forEach((templateFilePath) => {

    const rawTemplateContent = fs.readFileSync(
      path.join(templateDirectory, templateFilePath),
      "utf8",
    );
    const template = handlebars.compile(rawTemplateContent);

    const context = {
      name
    };

    const content = template(context);

    fs.writeFileSync(templateFileNameToFilePathToCreateMapping[templateFilePath], content);

  });
}

async function folderPathsToCreate(fromDirectory: string, intoDirectory: string, name: string): Promise<string[]> {
  const templateFolderPaths = getFolderPathsRecursively(fromDirectory);
  const folderPathsToCreate = templateFolderPaths.map((templateFolderPath) => {
    return path.join(intoDirectory, replaceName(templateFolderPath, name));
  });

  let conflictingFolderPath: string;
  for (const folderPath of folderPathsToCreate) {
    if (fs.existsSync(folderPath)) {
      conflictingFolderPath = folderPath;
      break;
    }
  }

  if (conflictingFolderPath) {
    throw new Error(`Folder already exists at path: ${conflictingFolderPath}`);
  }

  return folderPathsToCreate;
}

async function filePathsToCreate(folderPaths: string[], fromDirectory: string, intoDirectory: string, name: string): Promise<string[]> {

  const filePathsToCreate: string[] = templateFilePaths(folderPaths, fromDirectory)
    .map((templateFilePath) => {
      return path.join(intoDirectory, replaceName(templateFilePath, name));
    });

  let conflictingFilePath: string;
  for (const filePath of filePathsToCreate) {
    if (fs.existsSync(filePath)) {
      conflictingFilePath = filePath;
      break;
    }
  }

  if (conflictingFilePath) {
    throw new Error(`File already exists at path: ${conflictingFilePath}`);
  }

  return filePathsToCreate;
}

function templateFilePaths(folderPaths: string[], fromDirectory: string): string[] {
  return _.flatMap(folderPaths.concat([""]), (folderPath) => {
    const fullTemplateFolderPath = path.join(fromDirectory, folderPath);
    const templateFileNames = getTemplateFileNamesAtTemplateDirectory(fullTemplateFolderPath);
    return templateFileNames.map((templateFileName) => {
      return path.join(folderPath, templateFileName);
    });
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

async function createContainerFolder(folderPattern: string, templateName: string, directoryToCreateIn: string): Promise<string> {

  const folderName = replaceName(folderPattern, templateName);
  const directory = path.join(directoryToCreateIn, folderName);
  const pathExists = fs.existsSync(directory);

  if (pathExists) {
    throw new Error(`Folder already exists at path: ${directory}`);
  }

  return directory;

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