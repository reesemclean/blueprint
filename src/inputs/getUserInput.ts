"use strict";

import { getDesiredName } from "./getDesiredName";
import { getSelectedTemplatePath } from "./getSelectedTemplatePath";

export interface IUserInput {
    inputName: string;
    selectedTemplatePath: string;
}

export interface IMultiStepData {
    totalSteps: number;
    step: number;
    title: string;
}

export async function getUserInput(availableTemplatePaths: string[]): Promise<IUserInput> {

    const totalSteps = 2;
    const title = "New File from Template";
    const selectedTemplatePath = await getSelectedTemplatePath(availableTemplatePaths, { totalSteps, step: 1, title });
    const inputName = await getDesiredName({ totalSteps, step: 2, title });

    return {
        inputName,
        selectedTemplatePath,
    };

}
