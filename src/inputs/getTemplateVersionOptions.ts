"use strict";

import { Disposable, QuickPickItem, window } from "vscode";
import { NoTemplateSelectedError } from "../errors";
import { IMultiStepData } from "./getUserInput";

interface ITemplateVersionQuickPickItem extends QuickPickItem {
  folderName: string;
}

export async function getTemplateVersionFolder(
  manifestTemplateVersions: ITemplateVersionQuickPickItem[],
  multiStep: IMultiStepData,
): Promise<string> {

  const disposables: Disposable[] = [];
  try {
      return await new Promise<string>((resolve, reject) => {
          const input = window.createQuickPick<QuickPickItem>();
          input.items = manifestTemplateVersions.reduce((prev, curr) => {
            return prev.concat(curr);
          }, []);
          input.placeholder = "Which template version would you like to use?";
          input.ignoreFocusOut = true;
          input.step = multiStep.step;
          input.title = multiStep.title;
          disposables.push(
            input.onDidChangeSelection((items: any) => {
              if (items.length === 0) {
                reject(new NoTemplateSelectedError());
                return;
              }
              resolve(items[0].folderName);
              input.dispose();
            }),
          );

          input.show();
      });
  } finally {
      disposables.forEach(d => d.dispose());
  }
}
