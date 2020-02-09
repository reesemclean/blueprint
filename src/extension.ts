"use strict";

import * as fs from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";

import { handleError } from "./errors";
import { createFiles } from "./fileCreator";
import { getUserInput } from "./inputs";

export function activate(context: vscode.ExtensionContext) {

  const disposable = vscode.commands.registerCommand("extension.blueprint", async (e: vscode.Uri) => {

    // get target dir path from args, when command is executed from context menu
    let directoryPath = (e && e.fsPath) ? e.fsPath : null;
    
    // otherwise use hacky clipboard trick to get currently selected item it treeview
    // see this issue for vscode api implementation
    // https://github.com/microsoft/vscode/issues/3553
    if (!directoryPath) {
      const tempClipboardValue = await vscode.env.clipboard.readText();
      await vscode.commands.executeCommand('copyFilePath');
      directoryPath = await vscode.env.clipboard.readText();
      await vscode.env.clipboard.writeText(tempClipboardValue);
    }
    // otherwise place stuff in the first workspace root (if it's open)
    if (!directoryPath) {
      directoryPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null;
    }
    // do no proceed if there is still no directory path
    if (!directoryPath) {
      vscode.window.showInformationMessage("Directory for new files not found.")
      return;
    }

    if (!(await fs.stat(directoryPath)).isDirectory()) {
      directoryPath = path.dirname(directoryPath);
    }

    const templateFolderRawPaths = vscode.workspace
      .getConfiguration("blueprint")
      .get("templatesPath") as string[];

    try {
      const userInput = await getUserInput(templateFolderRawPaths);
      await createFiles(userInput, directoryPath);
    } catch (error) {
      handleError(error);
    }

  });

  context.subscriptions.push(disposable);
}
