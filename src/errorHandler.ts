import * as vscode from "vscode";

import * as constants from "./constants";
import { CancelError } from "./customErrors";

export async function handleError(error: Error) {
  if (error instanceof CancelError) { return; }

  const message: string = error.message ? error.message : "There was a problem creating your file(s).";
  const isModal = message.startsWith(constants.ERROR_SETUP_MESSAGE_PREFIX);

  const errorMessage = error.message ? error.message : "There was a problem creating your file(s).";
  vscode.window.showErrorMessage(errorMessage, { modal: isModal });
}