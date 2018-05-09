"use strict";

import { getDesiredName } from "./getDesiredName";
import { getSelectedTemplatePath } from "./getSelectedTemplatePath";

export interface IUserInput {
    inputName: string;
    selectedTemplatePath: string;
}

export async function getUserInput(availableTemplatePaths: string[]): Promise<IUserInput> {

    const selectedTemplatePath = await getSelectedTemplatePath(availableTemplatePaths);
    const inputName = await getDesiredName();

    return {
        inputName,
        selectedTemplatePath,
    };

}
