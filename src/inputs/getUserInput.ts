"use strict";

import { getTemplateManifestAtTemplateDirectory } from "../getTemplateManifest";
import { getTemplatePathDynamicTokens } from "../utilities/dynamicTokenSearch";
import { getDesiredName } from "./getDesiredName";
import { getDynamicTemplateInputForToken } from "./getDynamicTokenInput";
import { getSelectedTemplatePath } from "./getSelectedTemplatePath";
import { getTemplateVersionFolder } from "./getTemplateVersionOptions";

export interface IUserInput {
    inputName: string;
    selectedTemplatePath: string;
    dynamicTemplateValues: IDynamicTemplateValues;
}

export interface IMultiStepData {
    step: number;
    title: string;
}

export interface IDynamicTemplateValues {
    [token: string]: {
        userInput: string;
    };
}

export async function getUserInput(availableTemplatePaths: string[]): Promise<IUserInput> {
    let stepCount = 1;
    const title = "New File from Template";
    let selectedTemplatePath = await getSelectedTemplatePath(availableTemplatePaths, { step: stepCount++, title });
    const inputName = await getDesiredName({ step: stepCount++, title });

    const manifestOptions = getTemplateManifestAtTemplateDirectory(selectedTemplatePath) as any;
    if (!!manifestOptions.templateVersions) {
        const versionFolder: string =
            await getTemplateVersionFolder(manifestOptions.templateVersions, { step: stepCount++, title });
        selectedTemplatePath = `${selectedTemplatePath}\\${versionFolder}`;
    }

    const dynamicTokens = await getTemplatePathDynamicTokens(selectedTemplatePath);
    const dynamicTemplateValues: IDynamicTemplateValues = {};
    for (const option of dynamicTokens) {
        const userInput = await getDynamicTemplateInputForToken(option, { step: stepCount++, title });
        dynamicTemplateValues[option] = {
            userInput,
        };
    }

    return {
        dynamicTemplateValues,
        inputName,
        selectedTemplatePath,
    };
}
