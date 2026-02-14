import puppeteer from "puppeteer";
import { closeBlankPages, closeTargetBlank, scriptOnLoad, sleep } from "./utils.ts";

async function crawl(url: string) {

  let browser, page;

  try {


    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--start-maximized',
        '--start-hidden',
      ]
    });



    page = await browser.newPage();
    await page.setBypassCSP(true);


    await page.setViewport({ width: 1920, height: 1080 });

    closeTargetBlank(browser);

    await page.evaluateOnNewDocument(scriptOnLoad);


    await page.goto(url, { waitUntil: 'networkidle2' });

    closeBlankPages(browser);

    await sleep(4, 8);

    console.log('Page loaded');


  } catch (error) {
    console.error('Error during crawl:', error);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

crawl('https://tpi.li/EN5q')
