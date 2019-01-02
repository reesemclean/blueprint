"use strict";

import { getTemplatePathDynamicOptions } from "../utilities/checkDynamicOptionSupport";
import { getDesiredName } from "./getDesiredName";
import { getDynamicOption } from "./getDynamicOptions";
import { getSelectedTemplatePath } from "./getSelectedTemplatePath";

export interface IUserInput {
    inputName: string;
    selectedTemplatePath: string;
    dynamicOptions: IDynamicOptions[];
}

export interface IMultiStepData {
    step: number;
    title: string;
}

export interface IDynamicOptions {
    token: string;
    input: string;
}

export async function getUserInput(availableTemplatePaths: string[]): Promise<IUserInput> {
    let stepCount = 1;
    const title = "New File from Template";
    const selectedTemplatePath = await getSelectedTemplatePath(availableTemplatePaths, { step: stepCount++, title });
    const inputName = await getDesiredName({ step: stepCount++, title });
    const dynamicOptionTokens = await getTemplatePathDynamicOptions(selectedTemplatePath);

    const dynamicOptions: IDynamicOptions[] = [];
    for (const option of dynamicOptionTokens) {
        dynamicOptions.push({
            input: await getDynamicOption(option, { step: stepCount++, title }),
            token: option,
        });
    }

    return {
        dynamicOptions,
        inputName,
        selectedTemplatePath,
    };
}
