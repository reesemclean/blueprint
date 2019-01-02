"use strict";

import * as fs from "fs-extra";

import { recursivelyListAllFilePathsForTemplatePath } from "./getTemplateFilesAndFolders";

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
  // Capture the token that starts with $, between {{ and }}.
  // Ignore additional characters infront of the $ and whitespace infront of }}
  const regExp = /{{.*?(\$.*?)\s?}}/g;
  const result: string[] = [];

  try {
    const rawTemplateContent = fs.readFileSync(
      filePath,
      "utf8",
    );

    let match = regExp.exec(rawTemplateContent);
    while (match) {
      // match[0] will include the entire {{ uppercase $XXXX }} string
      // match[1] will be just the capture group: $XXXX
      result.push(match[1]);
      match = regExp.exec(rawTemplateContent);
    }
  } catch (e) {
    return result;
  }

  return result;
}
