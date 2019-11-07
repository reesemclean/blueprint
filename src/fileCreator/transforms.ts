"use strict";

import * as handlebars from "handlebars";
import * as _ from "lodash";
import { IDynamicTemplateValues } from "../inputs";

let handlebarsInitialized = false;
let currentDate: Date = new Date();

export function setCurrentDate(date: Date) {
  currentDate = date;
}

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
    currentYear: (input) => {
      return getYear(currentDate);
    },
    currentMonth: (input) => {
      return getMonth(currentDate);
    },
    currentDate: (input) => {
      return getDayOfMonth(currentDate);
    },
    currentDay: (input) => {
      return getDay(currentDate);
    },
    currentHour: (input) => {
      return getHours(currentDate);
    },
    currentMin: (input) => {
      return getMinutes(currentDate);
    },
    currentSec: (input) => {
      return getSeconds(currentDate);
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

  const dynamicTemplateInputMap = Object.keys(dynamicTemplateValues).reduce((prev, value) => {
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
  result = replaceAll(result, "__currentYear__", getYear(currentDate));
  result = replaceAll(result, "__currentMonth__", getMonth(currentDate));
  result = replaceAll(result, "__currentDate__", getDayOfMonth(currentDate));
  result = replaceAll(result, "__currentDay__", getDay(currentDate));
  result = replaceAll(result, "__currentHour__", getHours(currentDate));
  result = replaceAll(result, "__currentMin__", getMinutes(currentDate));
  result = replaceAll(result, "__currentSec__", getSeconds(currentDate));
  return result;
}

function escapeRegExp(str): string {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace): string {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}

function getYear(date: Date): string {
  return date.getFullYear().toString();
}

function getMonth(date: Date): string {
  return padDateComponentToTwoChars((date.getMonth() + 1).toString());
}

function getDayOfMonth(date: Date): string {
  return padDateComponentToTwoChars(date.getDate().toString());
}

function getDay(date: Date): string {
  return date.getDay().toString();
}

function getHours(date: Date): string {
  return padDateComponentToTwoChars(date.getHours().toString());
}

function getMinutes(date: Date): string {
  return padDateComponentToTwoChars(date.getMinutes().toString());
}

function getSeconds(date: Date): string {
  return padDateComponentToTwoChars(date.getSeconds().toString());
}

function padDateComponentToTwoChars(str: string): string {
  if (str.length < 2) {
    str = '0' + str;
  }
  return str;
}
