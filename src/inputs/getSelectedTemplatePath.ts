"use strict";

import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { Disposable, QuickPickItem, window, workspace } from "vscode";

import { NoTemplateSelectedError, SetupError } from "../errors";
import { IMultiStepData } from "./getUserInput";

interface ITemplateQuickPickItem extends QuickPickItem {
  filePath: string;
}

export async function getSelectedTemplatePath(
  availableTemplatePaths: string[],
  multiStep: IMultiStepData,
): Promise<string> {

  const quickPickItems: ITemplateQuickPickItem[] = availableTemplatePaths
    .map(folderPath => {
      return quickPickItemsForFolder(folderPath);
    })
    .reduce((prev, curr) => {
      return prev.concat(curr);
    }, []);

  if (quickPickItems.length === 0) {
    throw new SetupError();
  }

  const disposables: Disposable[] = [];
  try {
    return await new Promise<string>((resolve, reject) => {
      const input = window.createQuickPick<ITemplateQuickPickItem>();
      input.items = quickPickItems;
      input.placeholder = "Which template would you like to use?";
      input.ignoreFocusOut = true;
      input.step = multiStep.step;
      input.title = multiStep.title;
      disposables.push(
        input.onDidChangeSelection(items => {
          if (items.length === 0) {
            reject(new NoTemplateSelectedError());
            return;
          }
          resolve(items[0].filePath);
        }),
      );

      input.show();
    });
  } finally {
    disposables.forEach(d => d.dispose());
  }

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

export function expandFolderPath(folderPath: string): string {

  const normalizedPath = path.normalize(folderPath);
  let result = folderPath;

  if (normalizedPath.substring(0, 1) === "~") {
    const home = os.homedir();
    const subPath = normalizedPath.substring(1, normalizedPath.length);
    result = path.join(home, subPath);
  } else {
    result = path.resolve(workspace.rootPath, folderPath);
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
