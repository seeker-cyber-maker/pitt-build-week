import { expect, test } from "@playwright/test";

const beat = async (page, milliseconds = 900) => page.waitForTimeout(milliseconds);
const advance = async (page) => { await page.locator("#day-advance-button").click(); await beat(page); };
const refuel = async (page) => { await page.locator("#recalculate-route-button").click(); await beat(page, 1400); };
const pass = async (page) => { await page.locator("#keep-route-button").click(); await beat(page); };

test("run 1 — refuel after the price hike", async ({ page }) => {
  await page.goto("/");
  await beat(page);
  await advance(page); // leg 1
  await advance(page); // price hike
  await refuel(page);
  await expect(page.locator("#day-decision")).toContainText("Refuel selected after the seeded price spike");
  await advance(page); // leg 2, after refuel
  await expect(page.locator("#fuel-runtime-detail")).toContainText("Refuelled after price spike");
});

test("run 2 — pass the hike and refuel after the price drop", async ({ page }) => {
  await page.goto("/");
  await beat(page);
  await advance(page); // leg 1
  await advance(page); // price hike
  await pass(page);
  await advance(page); // leg 2
  await advance(page); // price drop
  await refuel(page);
  await expect(page.locator("#day-decision")).toContainText("Refuel selected after the seeded price drop");
  await advance(page); // leg 3, after refuel
  await expect(page.locator("#fuel-runtime-detail")).toContainText("Refuelled after price drop");
});

test("run 3 — morning fill makes both cheap-fuel detours uneconomic", async ({ page }) => {
  await page.goto("/?scenario=morning-filled");
  await beat(page);
  await advance(page); // leg 1 and morning fill
  await advance(page); // price hike
  await refuel(page); // economic check, no stop
  await expect(page.locator("#day-decision")).toContainText("does not recover the detour cost after the morning fill");
  await advance(page); // leg 2
  await advance(page); // price drop
  await refuel(page); // second economic check, no stop
  await expect(page.locator("#impact-analysis")).toContainText("Another fuel stop is not cost-worthy now");
  await expect(page.locator("#day-decision")).toContainText("does not recover the detour cost after the morning fill");
});

test("run 4 — pass both opportunities, run out, and close early", async ({ page }) => {
  await page.goto("/");
  await beat(page);
  await advance(page); // leg 1
  await advance(page); // price hike
  await pass(page);
  await advance(page); // leg 2
  await advance(page); // price drop
  await pass(page);
  await advance(page); // leg 3, tank reaches simulated empty
  await expect(page.locator("#fuel-runtime-status")).toHaveText("Out of fuel (simulated)");
  await expect(page.locator("#day-advance-button")).toHaveText("Out of fuel — close route early");
  await page.locator("#close-route-early-button").click();
  await beat(page, 1400);
  await expect(page.locator("#trip-watch-heading")).toHaveText("Trip Watch route closed early");
  await expect(page.locator("#delivery-report-summary")).toContainText("Remaining stops are marked undelivered");
});
