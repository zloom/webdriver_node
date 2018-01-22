import { WebDriver, By, WebElementPromise } from "selenium-webdriver";
import { timeout, whenAll, distinct, Track, updateBy, split, except } from "./commonUtils";
import { requestLinks, readAllTracks, transformLinks } from "./injections";


export const sendKeysWithDelay = async (driver: WebDriver, delay: number, css: string, keys: string) => {
    const element = await driver.findElement(By.css(css));
    for (let k of keys.split("")) {
        await timeout(delay);
        await element.sendKeys(k);
    }
}

export const findAndClick = async (driver: WebDriver, css: string) => {
    const element = await driver.findElement(By.css(css));
    await element.click();
}

export const fetchTracks = async (driver: WebDriver, maxCount: number, maxFailures: number, updater: (batch: Track[]) => void = console.log): Promise<void> => {
    let count = 0;
    let failures = 0;
    while (failures < maxFailures && count < maxCount) {
        
        await driver.executeScript(function () { window.scrollTo(0, document.body.scrollHeight) });
        await timeout(3000);      

        let pageTracks: Track[] = await driver.executeScript<Track[]>(readAllTracks);
        pageTracks = distinct(pageTracks, (a, b) => a.trackId == b.trackId);

        if (!pageTracks || pageTracks.length == 0) {
            ++failures;
            continue;
        }

        const requests = split(pageTracks, 3).map(async b => driver.executeAsyncScript<Track[]>(requestLinks, b));     
        let linkedTracks = (await whenAll(requests)).reduce((s, a) => [...s, ...a], []);        
        linkedTracks = await driver.executeScript<Track[]>(transformLinks, linkedTracks);

        const resultTracks = updateBy(pageTracks, linkedTracks, (pt, lt) => ({ ...pt, link: lt.link }), (pt, lt) => pt.trackId === lt.trackId);
        updater(resultTracks);
        count += resultTracks.length;
    }
}




