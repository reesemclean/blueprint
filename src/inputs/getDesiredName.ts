"use strict";

import { Disposable, window } from "vscode";

import { CancelError, NoNameGivenError } from "../errors";
import { IMultiStepData } from "./getUserInput";

export async function getDesiredName(multiStep: IMultiStepData): Promise<string> {
  const disposables: Disposable[] = [];

  try {
    return await new Promise<string>((resolve, reject) => {
      const input = window.createInputBox();
      input.step = multiStep.step;
      input.totalSteps = multiStep.totalSteps;
      input.title = multiStep.title;
      input.ignoreFocusOut = true;
      input.value = "";
      input.prompt = "Enter a value to be used within your template.";

      disposables.push(
        input.onDidAccept(() => {
          const name = input.value;
          if (name === undefined) {
            throw new CancelError();
          }
          if (!name) {
            throw new NoNameGivenError();
          }

          resolve(name);
          input.dispose();
        }),
      );

      input.show();
    });
  } finally {
    disposables.forEach(d => d.dispose());
  }
}
