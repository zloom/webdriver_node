import { sendKeysWithDelay, findAndClick, fetchTracks } from "./webdriverUtils";
import { timeout, Track, tryCatch } from "./commonUtils";
import { Builder, Capabilities } from "selenium-webdriver";
import { Options, setDefaultService, ServiceBuilder } from "selenium-webdriver/chrome";
import * as express from "express";

let tracks = [];
let driver;
setDefaultService(new ServiceBuilder("").build());

const initDriver = async (): Promise<string> => {
    if (driver) {
        console.log("Dispose driver.");
        try { await driver.quit(); }
        catch (e) { return JSON.stringify(e); }
        finally { driver = null; console.log("Driver disposed."); }
    }
    console.log("Set driver path");
    const config = Capabilities.chrome();
    const options = (new Options().headless() as any).windowSize({ width: 800, height: 800 });
    console.log("Config created.");
    driver = new Builder().withCapabilities(config).setChromeOptions(options).build();
    console.log("Driver created.");
    return "Done";
}

const startParse = async () => {
    console.log("Starting parse.");
    await driver.get("http://vk.com");
    await sendKeysWithDelay(driver, 1, "#index_email", "");
    await sendKeysWithDelay(driver, 1, "#index_pass", "");
    await findAndClick(driver, "#index_login_button");
    console.log("Login executed.");
    await timeout(3000);
    await findAndClick(driver, "#l_aud > a");
    await timeout(3000);
    console.log("Start fetching tracks.");
    tracks = [];
    await fetchTracks(driver, 150, 4, t => t.forEach(tracks.push));
    console.log("Parse finished.");
}

console.log("Config start...");
const server = express();
server.get('/tracks', (_, res) => res.send(tracks));
server.post('/init', (_, res) => tryCatch(initDriver, a => res.send(a)));
server.post('/parse', (_, res) => tryCatch(startParse, a => res.send(a)));
console.log("Config done. Start server...");
server.listen(3000, () => console.log("Server started."));
