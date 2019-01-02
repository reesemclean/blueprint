"use strict";

import { Disposable, window } from "vscode";

import { IMultiStepData } from "./getUserInput";

export async function getDynamicTemplateInputForToken(token: string, multiStep: IMultiStepData): Promise<string> {
  const disposables: Disposable[] = [];

  try {
    return await new Promise<string>((resolve, reject) => {
      const input = window.createInputBox();
      input.step = multiStep.step;
      input.title = multiStep.title;
      input.ignoreFocusOut = true;
      input.value = "";
      input.prompt = "Enter value for " + token + ".";

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
