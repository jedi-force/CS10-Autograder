const path = require("path");
const utils = require(path.resolve(__dirname, "./utils.js"));
const fs = require("fs");
const puppeteer = require("puppeteer");

async function grade(submissionPath, blockNamesPath, autograderPath, version) {
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
                "output": (
                    "Seems like the fractal block is missing or renamed.\n" +
                    "Make sure your work is inside the existing fractal block! " +
                    "and that the argument names aren't changed!"
                )
            }));

            await browser.close();
            return;
        }

        // Call the autograder and get the result.
        const autograderXML = fs.readFileSync(autograderPath).toString();
        await page.evaluate((xml, ver) => {
            const ag = world.children[0].deserializeScriptString(xml);
            ag.children[2].children[0].text = ver;
            ag.inputs();

            world.children[0].stage.threads.startProcess(
                ag,
                world.children[0].currentSprite,
                null,
                null, 
                function() {window.result = this.homeContext.inputs[0]}
            );
        }, autograderXML, version);

        await page.waitForFunction(() => window.result !== undefined)
        const result = await page.evaluate(() => window.result);
        utils.writeResults(result);
        
        await browser.close();

    } catch (e) {
        utils.writeResults(JSON.stringify({
            "score": 0,
            "output": (
                "Failed to grade submission.\n" +
                "Make sure to choose \"Export Project\" to download " +
                "your solution from Snap! and name the XML file: " +
                "Fractal&lt;FirstName&gt;&lt;LastName&gt;&lt;SecretNumber&gt;.xml"
            )
        }));

        await browser.close();
    }
}

if (typeof require !== "undefined" && require.main === module) {
    const submissionPath = "/autograder/source/submission.xml";
    const blockNamesPath = "/autograder/source/blocks.txt";
    const autograderPath = "/autograder/source/autograder.xml";
    const version = process.argv[2];
    grade(submissionPath, blockNamesPath, autograderPath, version);
}