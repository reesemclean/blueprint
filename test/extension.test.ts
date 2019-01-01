//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as dirCompare from "dir-compare";
import * as fs from "fs-extra";
import * as path from "path";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { createFiles } from "../src/fileCreator";
import { IUserInput, expandFolderPath, IDynamicOptions } from "../src/inputs";

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    let outPath: string;
    let templatesPath: string;
    let expectedOutputPath: string;

    const beforeEach = () => {
        outPath = expandFolderPath("./actualOutput");
        templatesPath = expandFolderPath("./templates");
        expectedOutputPath = expandFolderPath("./expectedOutput");
        fs.removeSync(outPath);
    };

    const runTestForTemplateNamed = async (templateName: string) => {
        const directoryPath = path.join(outPath, templateName);

        const dynamicOptions: IDynamicOptions[] = [];

        const userInput: IUserInput = {
            inputName: "MY User Input",
            selectedTemplatePath: path.join(templatesPath, templateName),
            dynamicOptions,
        };

        return createFiles(userInput, directoryPath).then(() => {
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
        }).catch(e => {
            console.log(e);
            throw e;
        });
    };

    const runTestForTemplateWithDynamicOptionsNamed = async (templateName: string) => {
        const directoryPath = path.join(outPath, templateName);

        const dynamicOptions: IDynamicOptions[] = [];

        dynamicOptions.push({
            input: "test",
            token: "{{$test}}"
        });

        dynamicOptions.push({
            input: "fancy",
            token: "{{$status}}"
        });

        const userInput: IUserInput = {
            inputName: "MY User Input",
            selectedTemplatePath: path.join(templatesPath, templateName),
            dynamicOptions,
        };

        return createFiles(userInput, directoryPath).then(() => {
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
        }).catch(e => {
            console.log(e);
            throw e;
        });
    };

    // Defines a Mocha unit test
    test("includesImages", (done) => {
        beforeEach();
        runTestForTemplateNamed("includesImages").then(() => {
            done();
        });
    });

    test("nestedFolders", (done) => {
        beforeEach();
        runTestForTemplateNamed("nestedFolders").then(() => {
            done();
        });
    });

    test("transforms", (done) => {
        beforeEach();
        runTestForTemplateNamed("transforms").then(() => {
            done();
        });
    });

    test("dynamicTemplateVariables", (done) => {
        beforeEach();
        runTestForTemplateWithDynamicOptionsNamed("dynamicTemplateVariables").then(() => {
            done();
        });
    });
});