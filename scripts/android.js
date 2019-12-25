#!/usr/bin/env node

const path = require("path");
const fs = require('fs-extra')
const appConfig = require("../app.json");
const pd = require('pretty-data2').pd;
const cheerio = require('cheerio');
const jimp = require("jimp");


function getResourceDir(platform) {

    if (platform == "android") {
        return path.join(__dirname, "../android/app/src/main/res");
    } else if (platform == "ios") {
        return path.join(__dirname, "../ios", appConfig.name, "Images.xcassets");
    }


}

async function writePackageAndroid(packageName, name) {

    await Promise.all([
        writeNamespace("MainActivity.java", packageName),
        writeNamespace("MainApplication.java", packageName),
        writeNamespace("SplashScreenActivity.java", packageName),
        writeOnGradde(/applicationId "/gi, `        applicationId "${packageName}"    `),
        writePackageOnManifest(packageName),
        writeName(name)
    ]);

}

async function writeOnGradde(regex, newline) {

    const location = path.join(__dirname, "../android/app/build.gradle");;

    const fileText = await fs.readFile(location, "utf8");

    const newContents = fileText.split("\n").map(line => {

        if (regex.exec(line)) {
            return newline;
        }
        return line;
    }).join("\n")

    await fs.writeFile(location, newContents, "utf8");
}


async function writeNamespace(javaFile, package) {

    const location = path.join(__dirname, `../android/app/src/main/java/${javaFile}`);

    const fileText = await fs.readFile(location, "utf8");

    const newContents = fileText.split("\n").map(line => {

        if (/^package (.*?);$/.exec(line)) {
            return `package ${package};`;
        }
        return line;
    }).join("\n")

    await fs.writeFile(location, newContents, "utf8");

}


async function writePackageOnManifest(packageName) {
    const manifest = path.join(__dirname, "../android/app/src/main/AndroidManifest.xml");;
    var xml = await fs.readFile(manifest, 'utf8');
    const $ = cheerio.load(xml, { xmlMode: true });

    $.root().find("manifest").attr("package", packageName);
    xml = pd.xml($.xml());
    await fs.writeFile(manifest, xml);
}


async function writeName(name) {
    const values = path.join(__dirname, "../android/app/src/main/res/values/strings.xml");;
    var xml = await fs.readFile(values, 'utf8');
    const $ = cheerio.load(xml, { xmlMode: true });

    $("string[name=app_name]").text(name);
    xml = pd.xml($.xml());
    await fs.writeFile(values, xml);
}

async function writeSplashColor(color) {
    const values = path.join(__dirname, "../android/app/src/main/res/layout/activity_splash_screen.xml");;
    var xml = await fs.readFile(values, 'utf8');
    const $ = cheerio.load(xml, { xmlMode: true });

    $("*[android\\:background]").attr("android:background", color);
    xml = pd.xml($.xml());
    await fs.writeFile(values, xml);
}

async function writeSplashImage(src) {
    const image = await jimp.read(src);
    const output = path.join(__dirname, "../android/app/src/main/res/drawable", "bg_splashscreen.png");
    return image.clone().quality(100).writeAsync(output)

}

async function writeImageAndroid(image, size, name, type) {
    const output = path.join(__dirname, "../android/app/src/main/res", `${type}-${size}`, name);

    return image;
}

async function prepareIcon(file, output) {

    const image = await jimp.read(file);

    var images = [
    ];

    images.push([[196, 196], 'xxxhdpi']);
    images.push([[196, 196], "xxxhdpi"]);
    images.push([[144, 144], "xxhdpi"]);
    images.push([[96, 96], "xhdpi"]);
    images.push([[72, 72], "hdpi"]);
    images.push([[48, 48], "mdpi"]);

    const promises = images.map(([[w, h], size]) => {
        return writeImageAndroid(image.clone().resize(w, h).quality(100), size, output, "mipmap")
    })

    await Promise.all(promises);

}


module.exports = {
    packageName(appId, name) {
        return writePackageAndroid(appId, name);
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