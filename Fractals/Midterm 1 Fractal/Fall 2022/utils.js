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

module.exports = {
    writeResults,
    loadSnapProject,
    enableTurboMode,
    checkBlocks
}