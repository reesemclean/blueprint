"use strict";

import * as handlebars from "handlebars";
import * as _ from "lodash";
import { IDynamicTemplateValues } from "../inputs";

let handlebarsInitialized = false;

export function initializeHandlebars() {
  handlebars.registerHelper({
    camelCase: (input) => {
      return _.camelCase(input);
    },
    kebabCase: (input) => {
      return _.kebabCase(input);
    },
    lowerCase: (input) => {
      return _.lowerCase(input);
    },
    lowerDotCase: (input) => {
      return _.snakeCase(input).replace(/_/g, ".");
    },
    pascalCase: (input) => {
      return _.chain(input).camelCase().upperFirst().value();
    },
    snakeCase: (input) => {
      return _.snakeCase(input);
    },
    upperCase: (input) => {
      return _.upperCase(input);
    },
    upperSnakeCase: (input) => {
      return _.snakeCase(input).toUpperCase();
    },
  });
}

export function replaceTemplateContent(
  rawContent: string,
  name: string,
  dynamicTemplateValues: IDynamicTemplateValues): string {

  if (!handlebarsInitialized) {
    initializeHandlebars();
    handlebarsInitialized = true;
  }

  const template = handlebars.compile(rawContent);

  const dynamicTemplateInputMap = Object.keys(dynamicTemplateValues).reduce<{ [key: string]: string }>((prev, value) => {
    prev[value] = dynamicTemplateValues[value].userInput;
    return prev;
  }, {});

  const context = {
    name,
    ...dynamicTemplateInputMap,
  };

  const content = template(context);

  return content;

}

export function replaceStringUsingTransforms(stringToReplace: string, name: string): string {
  let result = replaceAll(stringToReplace, "__name__", name);
  result = replaceAll(result, "__kebabCase_name__", _.kebabCase(name));
  result = replaceAll(result, "__pascalCase_name__", _.chain(name).camelCase().upperFirst().value());
  result = replaceAll(result, "__snakeCase_name__", _.snakeCase(name));
  result = replaceAll(result, "__lowerDotCase_name__", _.snakeCase(name).replace(/_/g, "."));
  result = replaceAll(result, "__camelCase_name__", _.camelCase(name));
  result = replaceAll(result, "__upperCase_name__", _.upperCase(name));
  result = replaceAll(result, "__lowerCase_name__", _.lowerCase(name));
  result = replaceAll(result, "__upperSnakeCase_name__", _.snakeCase(name).toUpperCase());
  return result;
}

function escapeRegExp(str: string): string {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str: string, find: string, replace: string): string {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}
