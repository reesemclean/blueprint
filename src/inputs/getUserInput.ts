"use strict";

import { getDesiredName } from "./getDesiredName";
import { getSelectedTemplatePath } from "./getSelectedTemplatePath";
import { getDynamicOptions } from "./getDynamicOptions";
import { templatePathContainDynamicOptions } from "../utilities/checkDynamicOptionSupport";

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

    const dynamicOptionsSupported = await templatePathContainDynamicOptions(selectedTemplatePath);

    var dynamicOptions = "";

    if (dynamicOptionsSupported) {
        dynamicOptions = await getDynamicOptions({ step: 3, title });
    }

    return {
        inputName,
        selectedTemplatePath,
        dynamicOptions: dynamicOptions
    };
}
