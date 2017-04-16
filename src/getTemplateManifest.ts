"use strict";

import * as fs from "fs";
import * as constants from "./constants";

export interface ITemplateManifest {
    suffixesToIgnoreInInput: string[];
    createFilesInFolderWithPattern: string | null;
}

const defaultTemplateManifest = {
    suffixesToIgnoreInInput: [],
    createFilesInFolderWithPattern: null,
};

export function getTemplateManifestAtTemplateDirectory(templateFolderPath: string): ITemplateManifest {

    try {
        const rawManifestContent = fs.readFileSync(`${templateFolderPath}/${constants.MANIFEST_FILE_NAME}`, "utf8");

        if (!rawManifestContent) { return defaultTemplateManifest; }

        const object = JSON.parse(rawManifestContent);
        if (object) {
            return Object.assign({}, defaultTemplateManifest, object);
        }

        return defaultTemplateManifest;
    } catch (e) {
        return defaultTemplateManifest;
    }
}
