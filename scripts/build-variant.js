#!/usr/bin/env node

const path = require("path");
const fs = require('fs-extra')
const appConfig = require("../app.json");
const argv = require('yargs').argv
const steps = require("../build-variants/steps");

const context = {
    platform: "none",
    dirs: {
        images: null
    },
    icon(imageNome) {

    },
    packageName(appid, name) {

    },
    image(file, output) {

    },
    file(file, output) {

    }
};


async function prepareBuild(appName, platform) {
    if (platform != 'ios' && platform != 'android') {
        throw new Error("Plataforma '" + platform + "' inexistente ");
    }

    const fn = require("./" + platform);

    var _context = { ...context, appName, platform };

    _context.packageName = fn.packageName;;
    _context.icon = fn.icon;
    _context.splashscreen = fn.splashscreen;
    _context.file = (ori, dest) => copyFile(appName, ori, dest)
    _context.image = (ori, dest) => copyFile(appName, ori, dest)
    _context.json = (data, dest) => writeJson(appName, data, dest)

    await steps(_context);

}

async function copyFile(appName, file, dest) {
    const input = path.join(__dirname, "../build-variants", appName, file);
    const output = path.join(__dirname, "../", dest);

    await fs.copy(input, output, { overwrite: true })
}


async function writeJson(appName, obj, dest) {
    const output = path.join(__dirname, "../", dest);

    await fs.writeJSON(output, obj, { overwrite: true })
}


prepareBuild(argv._[0], argv.platform)