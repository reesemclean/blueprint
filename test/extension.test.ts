//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from "assert";
import * as dirCompare from "dir-compare";
import * as fs from "fs-extra";
import * as path from "path";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { createFiles } from "../src/fileCreator";
import {
  IUserInput,
  expandFolderPath,
  IDynamicTemplateValues
} from "../src/inputs";

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {
  let outPath: string;
  let templatesPath: string;
  let expectedOutputPath: string;

  const beforeEach = () => {
    const testWorkspace = path.resolve(
      __dirname,
      "../../test/integrationTests"
    );

    outPath = path.resolve(testWorkspace, "./actualOutput");
    templatesPath = path.resolve(testWorkspace, "./templates");
    expectedOutputPath = path.resolve(testWorkspace, "./expectedOutput");
    fs.removeSync(outPath);
  };

  const runTestForTemplateNamed = async (
    templateName: string,
    dynamicTemplateValues: IDynamicTemplateValues
  ) => {
    const directoryPath = path.join(outPath, templateName);

    const userInput: IUserInput = {
      inputName: "MY User Input",
      selectedTemplatePath: path.join(templatesPath, templateName),
      dynamicTemplateValues
    };

    return createFiles(userInput, directoryPath)
      .then(() => {
        // Ensure at least one file was created
        assert.equal(fs.readdirSync(expectedOutputPath).length > 0, true);

        const options = {
          compareContent: true,
          noDiffSet: true
        };
        const result = dirCompare.compareSync(
          path.join(expectedOutputPath, templateName),
          directoryPath,
          options
        );
        assert.equal(result.same, true);
      })
      .catch(e => {
        console.log(e);
        throw e;
      });
  };

  // Defines a Mocha unit test
  test("includesImages", done => {
    beforeEach();
    runTestForTemplateNamed("includesImages", {}).then(() => {
      done();
    });
  });

  test("nestedFolders", done => {
    beforeEach();
    runTestForTemplateNamed("nestedFolders", {}).then(() => {
      done();
    });
  });

  test("transforms", done => {
    beforeEach();
    runTestForTemplateNamed("transforms", {}).then(() => {
      done();
    });
  });

  test("dynamicTemplateVariables", done => {
    beforeEach();

    const dynamicTemplateValues: IDynamicTemplateValues = {
      $test: {
        userInput: "test"
      },
      $status: {
        userInput: "fancy"
      },
      $emotion: {
        userInput: "nice"
      }
    };

    runTestForTemplateNamed(
      "dynamicTemplateVariables",
      dynamicTemplateValues
    ).then(() => {
      done();
    });
  });
});
