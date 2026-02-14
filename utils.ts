import { ElementHandle, Page } from "puppeteer";
import fs from "fs";
import path from "path";

export function scriptOnLoad() {

  try {
    delete (navigator as any).webdriver;
  } catch { }

  Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined,
    configurable: true
  });


  const orig = Element.prototype.attachShadow;

  Element.prototype.attachShadow = function (opts) {
    const root = orig.call(this, opts);
    if (opts.mode === "closed") {
      console.warn("Intercepted closed shadow root:", this);
      this._shadowRoot = root;
    }
    return root;
  };
}


export async function closeBlankPages(browser): Promise<void> {
  const pages = await browser.pages()

  for (const page of pages) {
    const url = page.url();
    if (url.includes('about:blank')) {
      await page.close();
    }
  }
}

export function closeTargetBlank(browser): void {
  browser.on('targetcreated', async (target) => {
    if (target.type() === 'page') {
      const newPage = await target.page();
      await newPage.close();
    }
  });

}

export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sleep(s1: number, s2?: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, (s2 ? random(s1, s2) : s1) * 1000));
}

export async function scrollIntoView(el: ElementHandle): Promise<void> {
  await el.evaluate(el => el?.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' }));
}

export async function pageClick(page: Page, el: ElementHandle): Promise<void> {
  await scrollIntoView(el);
  const box = await el.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  }
}

export async function click(page, selector: string): Promise<void> {
  return await page.evaluate((selector) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    setTimeout(() => {
      document.querySelector(selector)?.click();
    }, 250);
  }, selector);

}


export async function blockPopups(page): Promise<void> {

  await sleep(1, 2)

  await page.on('dialog', async dialog => {
    await dialog.dismiss();
  });

  await sleep(0.5, 1)

  await page.evaluate(() => {
    document.querySelector('body + iframe')?.remove();
  });


  await sleep(0.5, 1)

  await click(page, 'body')

  await sleep(0.5, 1)

  await click(page, 'body')

}

export async function waitForSelector(page, selector: string, options?: {}): Promise<void> {
  return await page.waitForSelector(selector, { visible: true, ...options });
}


export function getProxies(p: string) {
  // Path to your txt file
  const filePath = path.resolve(p);

  // Read file as string
  const fileContent = fs.readFileSync(filePath, "utf-8");

  // Split into lines and filter out empty lines
  const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== "");

  // Convert each line to object
  const proxies: { host: string; port: number; username: string; password: string }[] = lines.map(line => {
    const [host, portStr, username, password] = line.split(":");
    return {
      host,
      port: Number(portStr),
      username,
      password,
    };
  });

  return proxies;
}