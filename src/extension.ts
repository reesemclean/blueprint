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

    try {
      const userInput = await getUserInput(templateFolderRawPaths);
      await createFiles(userInput, directoryPath, new Date());
    } catch (error) {
      handleError(error);
    }

  });

  context.subscriptions.push(disposable);
}
