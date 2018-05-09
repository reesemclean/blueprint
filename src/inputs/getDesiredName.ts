"use strict";

import * as vscode from "vscode";

import { CancelError, NoNameGivenError } from "../errors";

export async function getDesiredName(): Promise<string> {
  const name = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: "Name",
    value: "",
  });

  if (name === undefined) {
    throw new CancelError();
  }
  if (!name) {
    throw new NoNameGivenError();
  }

  return name;
}
