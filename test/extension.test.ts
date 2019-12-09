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
import { IUserInput, expandFolderPath, IDynamicTemplateValues } from "../src/inputs";

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

    const runTestForTemplateNamed = async (templateName: string, outName: string, dynamicTemplateValues: IDynamicTemplateValues, testDate: Date) => {
        const directoryPath = path.join(outPath, outName);

        const userInput: IUserInput = {
            inputName: "MY User Input",
            selectedTemplatePath: path.join(templatesPath, templateName),
            dynamicTemplateValues,
        };

        return createFiles(userInput, directoryPath, testDate).then(() => {
            // Ensure at least one file was created
            assert.equal(fs.readdirSync(expectedOutputPath).length > 0, true);

            const options = {
                compareContent: true,
                noDiffSet: true
            };
            const result = dirCompare.compareSync(
                path.join(expectedOutputPath, outName),
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
        runTestForTemplateNamed("includesImages", "includesImages", {}, new Date()).then(() => {
            done();
        });
    });

    test("nestedFolders", (done) => {
        beforeEach();
        runTestForTemplateNamed("nestedFolders", "nestedFolders", {}, new Date()).then(() => {
            done();
        });
    });

    test("transforms", (done) => {
        beforeEach();
        runTestForTemplateNamed("transforms", "transforms", {}, new Date()).then(() => {
            done();
        });
    });

    test("dynamicTemplateVariables", (done) => {
        beforeEach();

        const dynamicTemplateValues: IDynamicTemplateValues = {
            "$test": {
                userInput: "test"
            },
            "$status": {
                userInput: "fancy"
            },
            "$emotion": {
                userInput: "nice"
            }
        };

        runTestForTemplateNamed("dynamicTemplateVariables", "dynamicTemplateVariables", dynamicTemplateValues, new Date()).then(() => {
            done();
        });
    });

    test("datetime-simple", (done) => {
        beforeEach();

        const testDate = new Date("1965-10-31 22:43:54");

        runTestForTemplateNamed("datetime", "datetime-simple", {}, testDate).then(() => {
            done();
        });
    });

    test("datetime-zeropadding", (done) => {
        beforeEach();

        const testDate = new Date("0100-02-03 04:05:06");
        testDate.setFullYear(1);

        runTestForTemplateNamed("datetime", "datetime-zeropadding", {}, testDate).then(() => {
            done();
        });
    });
});