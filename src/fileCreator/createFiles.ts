"use strict";

import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";

import * as constants from "../constants";
import { WriteConflictError } from "../errors";
import { getTemplateManifestAtTemplateDirectory } from "../getTemplateManifest";
import { getFolderNamesAtDirectory, getTemplateFileNamesAtTemplateDirectory } from "./getTemplateFilesAndFolders";
import { sanitizedName } from "./inputSanitizer";
import { replaceStringUsingTransforms, replaceTemplateContent } from "./transforms";

import { IUserInput } from "../inputs";

export async function createFiles(userInput: IUserInput, inDirectory: string): Promise<void> {

  const options = getTemplateManifestAtTemplateDirectory(userInput.selectedTemplatePath);

  const name = sanitizedName(userInput.inputName, options);

  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "blueprint-"));

  await createFilesFromTemplateInDirectory(
    userInput.selectedTemplatePath,
    temporaryDirectory,
    userInput.inputName,
  );

  let containerFolderName = "";
  if (options.createFilesInFolderWithPattern) {
    containerFolderName = replaceStringUsingTransforms(options.createFilesInFolderWithPattern, name);
  }

  const pathToMoveTo = path.join(inDirectory, containerFolderName);

  const directoryContents = await fs.readdir(temporaryDirectory);

  for (const fileOrFolderName of directoryContents) {
    const pathToContents = path.join(temporaryDirectory, fileOrFolderName);
    const finalPath = path.join(pathToMoveTo, fileOrFolderName);

    try {
      await fs.copy(pathToContents, finalPath, { overwrite: false, errorOnExist: true, recursive: true });
    } catch (e) {
      if (e.code === "EEXIST") {
        throw new WriteConflictError(finalPath);
      }

      throw e;
    }
  }

  await fs.remove(temporaryDirectory);

}

async function createFilesFromTemplateInDirectory(
  templatePath: string,
  inDirectory: string,
  name: string): Promise<void> {

  await createFilesForTemplateFolder(templatePath, inDirectory, name);

  const templateFoldersInFolder = await getFolderNamesAtDirectory(templatePath);

  await Promise.all(
    templateFoldersInFolder.map(async (templateFolderName) => {

      const folderName = replaceStringUsingTransforms(templateFolderName, name);
      const fullFolderPath = path.join(templatePath, templateFolderName);
      const directoryToCreateIn = path.join(inDirectory, folderName);
      await fs.mkdir(directoryToCreateIn);
      await createFilesFromTemplateInDirectory(fullFolderPath, directoryToCreateIn, name);

    }),
  );

}

async function createFilesForTemplateFolder(
  templateFolderPath: string,
  inDirectory: string,
  name: string): Promise<void> {

  const templateFilesInFolder = await getTemplateFileNamesAtTemplateDirectory(templateFolderPath);

  await Promise.all(
    templateFilesInFolder.map(async (templateFilePath) => {

      const rawTemplateContent = fs.readFileSync(
        path.join(templateFolderPath, templateFilePath),
        "utf8",
      );

      const content = replaceTemplateContent(rawTemplateContent, name);
      const fileName = replaceStringUsingTransforms(templateFilePath, name);

      await fs.writeFile(path.join(inDirectory, fileName), content);

    }),
  );

}
