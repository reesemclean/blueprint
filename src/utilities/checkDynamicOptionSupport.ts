"use strict";

import * as fs from "fs-extra";

import { recursivelyListAllFilePathsForTemplatePath } from "./getTemplateFilesAndFolders";

export async function templatePathContainsDynamicOptions(templatePath: string): Promise<boolean> {
  const fileList = await recursivelyListAllFilePathsForTemplatePath(templatePath);

  for (const filePath of fileList) {
    const result = await findDynamicOptionTokenInFile(filePath);
    if (result) {
      return true;
    }
  }

  return false;
}

export async function getTemplatePathDynamicOptions(templatePath: string): Promise<string[]> {
  const fileList = await recursivelyListAllFilePathsForTemplatePath(templatePath);

  let result: string[] = [];

  for (const filePath of fileList) {
    const items = await findDynamicOptionTokensInFile(filePath);
    result = result.concat(items);
  }

  return Array.from(new Set(result));
}

async function findDynamicOptionTokensInFile(filePath: string): Promise<string[]> {
  const regExp = /{{\$(.*?)}}/gm;
  const result: string[] = [];

  try {
    const rawTemplateContent = fs.readFileSync(
      filePath,
      "utf8",
    );

    let match = regExp.exec(rawTemplateContent);
    while (match) {
      result.push(match[0]);
      match = regExp.exec(rawTemplateContent);
    }
  } catch (e) {

    return result;
  }

  return result;
}

async function findDynamicOptionTokenInFile(filePath: string): Promise<boolean> {
  const regExp = /{{\s?\$1\s?}}/;
  try {
    const rawTemplateContent = fs.readFileSync(
      filePath,
      "utf8",
    );

    return regExp.test(rawTemplateContent);
  } catch (e) {
    return false;
  }
}
