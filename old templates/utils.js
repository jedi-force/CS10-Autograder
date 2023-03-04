const fs = require("fs");

/**
 * Write content to results.json as Gradescope expects.
 * 
 * @param {String} content Stringified JSON.
 */
function writeResults(content) {
    fs.writeFileSync("/autograder/results/results.json", content);
}

/**
 * This is a Puppeteer pageFunction (some variables not defined here).
 * Open the Snap! project encoded by the given XML.
 * 
 * @param {String} submissionXML
 */
function loadSnapProject(submissionXML) {
    world.children[0].openProjectString(submissionXML);
}

/**
 * This is a Puppeteer pageFunction (some variables not defined here).
 * Turn on Turbo Mode in the current project.
 */
function enableTurboMode() {
    world.children[0].stage.isFastTracked = true;
}

/**
 * This is a Puppeteer pageFunction (some variables not defined here).
 * Check if the current Snap! project has the specified blocks.
 * 
 * @param  {Array.<String>} blockNames
 * @return {Boolean}
 */
function checkBlocks(blockNames) {
    const projectBlocks = new Set(
        world.children[0].stage.globalBlocks.map(block => block.spec)
    );
    return blockNames.every(name => projectBlocks.has(name)); 
}

/**
 * This is a Puppeteer pageFunction (some variables not defined here).
 * Call the Snap! reporter with the given name and return its result.
 * 
 * @param  {String} reporerName
 * @return {String}
 */
function callReporter(reporterName) {
    return invoke(
        world.children[0].stage.globalBlocks.find(
            block => block.spec === reporterName
        ).blockInstance(),
        null,
        world.children[0].currentSprite,
        20000,
        "Took too long!"
    );
}

/**
 * This is a Puppeteer pageFunction (some variables not defined here).
 * Create the Snap! reporter from XML, call it and return its result.
 * 
 * @param  {String} reporterXML
 * @return {String}
 */
function importAndCall(reporterXML) {
    return invoke(
        world.children[0].deserializeScriptString(reporterXML),
        null,
        world.children[0].currentSprite,
        20000,
        "Took too long!"
    );
}

module.exports = {
    writeResults,
    loadSnapProject,
    enableTurboMode,
    checkBlocks,
    callReporter,
    importAndCall,
}