"use strict";

import { ITemplateManifest } from "../getTemplateManifest";

import * as _ from "lodash";

// Returns a standardized version of the name (PascalCase) with any Suffixes that should be ignore removed.
export function sanitizedName(name: string, options: ITemplateManifest): string {

  const pascalCaseValue = _.chain(name).camelCase().upperFirst().value();

  let nameToUse = pascalCaseValue;

  for (const suffixToIgnore of options.suffixesToIgnoreInInput) {
    if (nameToUse.toLowerCase().endsWith(suffixToIgnore.toLowerCase())) {
      nameToUse = nameToUse.slice(0, nameToUse.length - suffixToIgnore.length);
    }
  }

  return nameToUse;
}
