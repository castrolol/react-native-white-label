#!/usr/bin/env node

const path = require("path");
const fs = require('fs-extra')
const iosRenameAppId = require("react-native-app-id/src/ios");
const jimp = require("jimp");
var Color = require('color');
var cheerio = require('cheerio');
const pd = require('pretty-data2').pd;

const appConfig = require("../app.json");

async function writeImageIos(image, size, name) {
    const output = path.join(__dirname, `../ios/${appConfig.name}/Images.xcassets/AppIcon.appiconset`, `AppIcon-${size}.png`);

    return image.writeAsync(output);
}

var sizes = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024];

async function prepareIcon(file, output) {

    const image = await jimp.read(file);

    const promises = sizes.map(size => {
        return writeImageIos(image.clone().resize(size, size).quality(100), size, output)
    })

    await Promise.all(promises);

}

async function writeSplashColor(hex) {
    const output = path.join(__dirname, `../ios/${appConfig.name}/Base.lproj`, 'LaunchScreen.xib');
    const color = Color(hex)
    const [r, g, b] = color.rgb().array();

    var xml = await fs.readFile(output, 'utf8');
    const $ = cheerio.load(xml, { xmlMode: true });

    $("color[key=backgroundColor]").attr("red", r).attr("green", g).attr("blue", b);
    xml = pd.xml($.xml());
    await fs.writeFile(output, xml);
}

async function writeSplashImage(src) {
    const image = await jimp.read(src);
    const output = path.join(__dirname, `../ios/${appConfig.name}/Images.xcassets/SplashScreen.imageset`, "SplashScreen.png");
    return image.clone().quality(100).writeAsync(output)

}

module.exports = {
    async packageName(appId, name) {
        const changes = await iosRenameAppId(appId, name);
        const promises = [];

        for (let file in changes) {
            promises.push(fs.writeFile(file, changes[file], 'utf8'));
        }

        await Promise.all(promises);
    },
    icon(file) {

        const appName = this.appName;
        const input = path.join(__dirname, "../build-variants", appName, file);

        return prepareIcon(input, "ic_launcher.png")

    },
    splashscreen(image, color = "#FFFFFF") {

        const appName = this.appName;
        const input = path.join(__dirname, "../build-variants", appName, image);

        return Promise.all([
            writeSplashImage(input),
            writeSplashColor(color)
        ]);
    }
}

