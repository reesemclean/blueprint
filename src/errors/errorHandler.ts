"use strict";

import * as vscode from "vscode";

import * as constants from "../constants";
import { AppError, CancelError, SetupError } from "./customErrors";

const defaultErrorMessage = "There was a problem creating your file(s).";

export async function handleError(error: AppError) {
  if (error.silent) { return; }

  const errorMessage = error.message ? error.message : defaultErrorMessage;

  vscode.window.showErrorMessage(errorMessage, { modal: error.modal });
}
