import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const baseURL = process.env.PITT_DEMO_URL ?? "http://127.0.0.1:4173";
const output = new URL("../SUBMISSION/screenshots/", import.meta.url);
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });

async function shot(name, locator = null) {
  if (locator) await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await page.screenshot({ path: new URL(name, output).pathname, fullPage: false });
}

await page.goto(baseURL);
await page.locator(".planning").evaluate((element) => window.scrollTo(0, element.offsetTop - 24));
await shot("01-planning-context.png");

await page.goto(`${baseURL}/?scenario=morning-filled`);
for (let index = 0; index < 2; index += 1) await page.locator("#day-advance-button").click();
await page.locator("#recalculate-route-button").click();
for (let index = 0; index < 2; index += 1) await page.locator("#day-advance-button").click();
await page.locator("#recalculate-route-button").click();
await shot("02-cheap-fuel-bad-detour.png", page.locator(".day-event-panel"));

await page.goto(baseURL);
for (let index = 0; index < 2; index += 1) await page.locator("#day-advance-button").click();
await page.locator("#keep-route-button").click();
for (let index = 0; index < 2; index += 1) await page.locator("#day-advance-button").click();
await page.locator("#keep-route-button").click();
await page.locator("#day-advance-button").click();
await page.locator("#close-route-early-button").click();
await shot("03-route-closed-early.png", page.locator("#trip-watch-heading"));

await page.locator("#begin-button").click();
await page.locator("#review-toggle").check();
await page.locator("#review-button").click();
await shot("04-report-and-machine-handoff.png", page.locator("#machine-handoff-output"));

await browser.close();
