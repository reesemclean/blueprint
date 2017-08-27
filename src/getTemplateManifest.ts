"use strict";

import * as fs from "fs";
import * as path from "path";

import * as constants from "./constants";

export interface ITemplateManifest {
    suffixesToIgnoreInInput: string[];
    createFilesInFolderWithPattern: string | null;
}

const defaultTemplateManifest = {
    createFilesInFolderWithPattern: null,
    suffixesToIgnoreInInput: [],
};

export function getTemplateManifestAtTemplateDirectory(templateFolderPath: string): ITemplateManifest {

    try {
        const manifestPath = path.join(templateFolderPath, constants.MANIFEST_FILE_NAME);
        const rawManifestContent = fs.readFileSync(manifestPath, "utf8");

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
