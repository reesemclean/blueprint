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

async function findDynamicOptionTokenInFile(filePath: string): Promise<boolean> {
  const regExp = /{{\s?\$1\s?}}/
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