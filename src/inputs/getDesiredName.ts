"use strict";

import * as _ from "lodash";
import * as vscode from "vscode";

import { CancelError } from "../customErrors";

export async function getDesiredName(): Promise<string> {
  const name = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: "Name",
    value: "",
  })

  if (name === undefined) {
    throw new CancelError("escape was pressed");
  }
  if (!name) {
    throw new Error("Unable to create file(s): No Name Given");
  }
  const pascalCaseValue = _.chain(name).camelCase().upperFirst().value();

  return pascalCaseValue;
}