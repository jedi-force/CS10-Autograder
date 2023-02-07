const path = require("path");
const utils = require(path.resolve(__dirname, "./utils.js"));
const fs = require("fs");
const puppeteer = require("puppeteer");

async function grade(submissionPath, blockNamesPath, autograderPath) {
    const browser = await puppeteer.launch({
        executablePath: "/usr/bin/google-chrome",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    try {    
        await page.goto("https://snap.berkeley.edu/snap/snap.html");

        // Turn on Turbo mode.
        await page.evaluate(utils.enableTurboMode);

        // Load student project. Project is loaded if name is updated.
        const submissionXML = fs.readFileSync(submissionPath).toString();
        await page.evaluate(utils.loadSnapProject, submissionXML);
        await page.waitForFunction(() => world.children[0].getProjectName() !== "")

        // Check if required blocks are present.
        const blockNames = fs.readFileSync(blockNamesPath, "utf8").split('\n');
        const validSubmission = await page.evaluate(utils.checkBlocks, blockNames);
        if (!validSubmission) {
            utils.writeResults(JSON.stringify({
                "score": 0,
                "output": "Seems like some blocks were missing."
            }));

            await browser.close();
            return;
        }

        // Call the autograder and get the result.
        const autograderXML = fs.readFileSync(autograderPath).toString();
        const result = await page.evaluate(utils.importAndCall, autograderXML);

        utils.writeResults(result);
        
        await browser.close();

    } catch (e) {
        utils.writeResults(JSON.stringify({
            "score": 0,
            "output": (
                "Failed to grade submission.\n" +
                "Make sure your blocks run in a reasonable amount of time " +
                "and don't output errors.\n" +
                "The autograder block should not take longer than " +
                "20 seconds to report with Turbo Mode on!"
            )  
        }));

        await browser.close();
    }
}

if (typeof require !== "undefined" && require.main === module) {
    const submissionPath = "/autograder/source/submission.xml";
    const blockNamesPath = "/autograder/source/blocks.txt";
    const autograderPath = "/autograder/source/autograder.xml";
    grade(submissionPath, blockNamesPath, autograderPath);
}