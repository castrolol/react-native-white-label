const defaultSettings = require(`./settings.json`);

async function steps(context) {

    // imports
    const settings = require(`./${context.appName}/settings.json`);
    const colors = require(`./${context.appName}/colors.json`);

    // json
    const app = { ...defaultSettings, ...settings };
    const variables = { ...defaultSettings.values, ...settings.values };
    const _colors = { ...defaultSettings.colors, ...colors };

    // moving
    await context.packageName(app.packageName, app.appName);
    await context.icon(app.iconName);
    await context.splashscreen(app.splashscreenImage, app.splashscreenColor);

    for (const file in app.images) {
        await context.image(file, app.images[file]);
    }

    for (const file in app.files) {
        await context.file(file, app.files[file]);
    }

    await context.json(variables, "assets/vars.json");
    await context.json(_colors, "assets/colors.json");
}


module.exports = steps;