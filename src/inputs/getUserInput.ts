"use strict";

import { templatePathContainsDynamicOptions } from "../utilities/checkDynamicOptionSupport";
import { getDesiredName } from "./getDesiredName";
import { getDynamicOptions } from "./getDynamicOptions";
import { getSelectedTemplatePath } from "./getSelectedTemplatePath";

export interface IUserInput {
    inputName: string;
    selectedTemplatePath: string;
    dynamicOptions: string;
}

export interface IMultiStepData {
    step: number;
    title: string;
}

export async function getUserInput(availableTemplatePaths: string[]): Promise<IUserInput> {
    const title = "New File from Template";
    const selectedTemplatePath = await getSelectedTemplatePath(availableTemplatePaths, { step: 1, title });
    const inputName = await getDesiredName({ step: 2, title });

    const templateUsesDynamicOptions = await templatePathContainsDynamicOptions(selectedTemplatePath);

    let dynamicOptions = "";

    if (templateUsesDynamicOptions) {
        dynamicOptions = await getDynamicOptions({ step: 3, title });
    }

    return {
        dynamicOptions,
        inputName,
        selectedTemplatePath,
    };
}
