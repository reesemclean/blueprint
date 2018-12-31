"use strict";

import { Disposable, window } from "vscode";

import { CancelError, NoNameGivenError } from "../errors";
import { IMultiStepData } from "./getUserInput";

export async function getDynamicOptions(multiStep: IMultiStepData): Promise<string> {
  const disposables: Disposable[] = [];

  try {
    return await new Promise<string>((resolve, reject) => {
      const input = window.createInputBox();
      input.step = multiStep.step;
      input.totalSteps = multiStep.totalSteps;
      input.title = multiStep.title;
      input.ignoreFocusOut = true;
      input.value = "";
      input.prompt = "Optional - Enter dynamic options separated by semicolons.";

      disposables.push(
        input.onDidAccept(() => {

          resolve(input.value);
          input.dispose();
        }),
      );

      input.show();
    });
  } finally {
    disposables.forEach(d => d.dispose());
  }
}
