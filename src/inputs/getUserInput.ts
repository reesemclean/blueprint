"use strict";

import { getTemplatePathDynamicTokens } from "../utilities/dynamicTokenSearch";
import { getDesiredName } from "./getDesiredName";
import { getDynamicTemplateInputForToken } from "./getDynamicTokenInput";
import { getSelectedTemplatePath } from "./getSelectedTemplatePath";

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
    const selectedTemplatePath = await getSelectedTemplatePath(availableTemplatePaths, { step: stepCount++, title });
    const inputName = await getDesiredName({ step: stepCount++, title });
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
