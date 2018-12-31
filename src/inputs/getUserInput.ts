"use strict";

import { getDesiredName } from "./getDesiredName";
import { getSelectedTemplatePath } from "./getSelectedTemplatePath";
import { getDynamicOptions } from "./getDynamicOptions";

export interface IUserInput {
    inputName: string;
    selectedTemplatePath: string;
    dynamicOptions: string;
}

export interface IMultiStepData {
    totalSteps: number;
    step: number;
    title: string;
}

export async function getUserInput(availableTemplatePaths: string[]): Promise<IUserInput> {

    const totalSteps = 3;
    const title = "New File from Template";
    const selectedTemplatePath = await getSelectedTemplatePath(availableTemplatePaths, { totalSteps, step: 1, title });
    const inputName = await getDesiredName({ totalSteps, step: 2, title });
    const dynamicOptions = await getDynamicOptions({ totalSteps, step: 3, title });

    return {
        inputName,
        selectedTemplatePath,
        dynamicOptions: dynamicOptions
    };
}
