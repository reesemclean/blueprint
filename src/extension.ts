"use strict";

import * as fs from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";

import { handleError } from "./errors";
import { createFiles } from "./fileCreator";
import { getUserInput } from "./inputs";

export function activate(context: vscode.ExtensionContext) {

  const disposable = vscode.commands.registerCommand("extension.blueprint", async (e: vscode.Uri) => {

    let directoryPath = (e && e.fsPath) ? e.fsPath : vscode.workspace.rootPath;

    if (!(await fs.stat(directoryPath)).isDirectory()) {
      directoryPath = path.dirname(directoryPath);
    }

    const templateFolderRawPaths = vscode.workspace
      .getConfiguration("blueprint")
      .get("templatesPath") as string[];

    const enableDynamicOptions = vscode.workspace
      .getConfiguration("blueprint")
      .get("enableDynamicOptions") as boolean;

    try {
      const userInput = await getUserInput(templateFolderRawPaths, enableDynamicOptions);
      await createFiles(userInput, directoryPath);
    } catch (error) {
      handleError(error);
    }

  });

  context.subscriptions.push(disposable);
}
