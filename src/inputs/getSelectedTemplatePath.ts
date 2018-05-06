"use strict";

import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";

import * as constants from "../constants";
import { CancelError } from "../customErrors";

interface ITemplateQuickPickItem extends vscode.QuickPickItem {
  filePath: string;
}

export async function getSelectedTemplatePath(availableTemplatePaths: string[]): Promise<string> {

  const quickPickItems: ITemplateQuickPickItem[] = availableTemplatePaths
    .map(folderPath => {
      return quickPickItemsForFolder(folderPath);
    })
    .reduce((prev, curr) => {
      return prev.concat(curr);
    }, []);

  if (quickPickItems.length === 0) {
    // tslint:disable-next-line:max-line-length
    throw new Error(`${constants.ERROR_SETUP_MESSAGE_PREFIX} No templates found. Please see ${constants.README_URL} for information on setting up Blueprint in your project.`);
  }

  const placeHolder = "Which template would you like to use?";

  const result = await vscode.window.showQuickPick(quickPickItems, { placeHolder, ignoreFocusOut: true });

  if (result === undefined) {
    throw new CancelError("escape was pressed");
  }
  if (!result) {
    throw new Error("Unable to create file(s): No Template Selected");
  }

  return result.filePath;

}

function quickPickItemsForFolder(folderPath: string) {
  try {
    const expandedFolderPath = expandFolderPath(folderPath);
    const templateNames = templateNamesForFolderPath(expandedFolderPath);

    const items: ITemplateQuickPickItem[] = templateNames.map((name, index) => {
      return {
        description: index === 0 ? folderPath : "",
        filePath: path.join(expandedFolderPath, name),
        label: name,
      };
    });
    return items;

  } catch (error) {
    // tslint:disable-next-line
    console.log(`Error loading template path: ${folderPath}, error:  ${error}`);
    return [];
  }
}

function expandFolderPath(folderPath: string): string {

  const normalizedPath = path.normalize(folderPath);
  let result = folderPath;

  if (normalizedPath.substring(0, 1) === "~") {
    const home = os.homedir();
    const subPath = normalizedPath.substring(1, normalizedPath.length);
    result = path.join(home, subPath);
  } else {
    result = path.resolve(vscode.workspace.rootPath, folderPath);
  }

  return result;

}

function templateNamesForFolderPath(templatesFolderPath: string): string[] {
  const templateDirectories = fs
    .readdirSync(templatesFolderPath)
    .filter((f) => {
      const templateFolderPath = path.join(templatesFolderPath, f);
      return fs.statSync(templateFolderPath).isDirectory();
    });
  return templateDirectories;
}