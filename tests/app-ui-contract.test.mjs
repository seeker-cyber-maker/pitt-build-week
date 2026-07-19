import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createFallbackReport, demoTrip } from "../app/scenario.js";
import { deliveryWindowLabels } from "../app/planner.js";

test("renderer references only existing review controls", async () => {
  const [app, markup] = await Promise.all([
    readFile(new URL("../app/app.js", import.meta.url), "utf8"),
    readFile(new URL("../app/index.html", import.meta.url), "utf8")
  ]);

  const selectors = [...app.matchAll(/querySelector\("#([^"]+)"\)/g)].map((match) => match[1]);
  for (const selector of selectors) {
    assert.match(markup, new RegExp(`id="${selector}"`), `#${selector} must exist in app/index.html`);
  }

  assert.match(markup, /Projected reserve falls below the policy floor/);
  assert.match(markup, /Simulated planning ledger/);
  assert.match(markup, /Local map simulation/);
  assert.equal(deliveryWindowLabels.before_noon, "Before noon");
  assert.equal(deliveryWindowLabels.flexible, "No time specified");
  assert.match(app, /below policy floor \(gap: \$\{risk.reserveGapPercent\}%\)/);
  assert.doesNotMatch(markup, /supplied by the scenario/i);
});

test("driver-facing report uses plain-language provenance and selection context", () => {
  const report = createFallbackReport(demoTrip);

  assert.match(report, /A 28-minute delay/);
  assert.match(report, /Selection basis: pre-approved planned-corridor stop/);
  assert.match(report, /Alternatives considered:/);
  assert.match(report, /Source: local calculation from the displayed fuel, delay, and carrier policy/);
  assert.doesNotMatch(report, /seeded|deterministic local demo fallback/i);
});

test("rebuilding the local plan has a visible result", async () => {
  const [app, markup] = await Promise.all([
    readFile(new URL("../app/app.js", import.meta.url), "utf8"),
    readFile(new URL("../app/index.html", import.meta.url), "utf8")
  ]);

  assert.match(markup, /id="plan-rebuild-status"/);
  assert.match(app, /planning = createPlanningComparison\(\);/);
  assert.match(app, /state\.rebuildCount \+= 1/);
});

test("seeded day playback exposes two explicit driver choices and a delivery report", async () => {
  const [app, markup] = await Promise.all([
    readFile(new URL("../app/app.js", import.meta.url), "utf8"),
    readFile(new URL("../app/index.html", import.meta.url), "utf8")
  ]);

  assert.match(markup, /Seeded day playback/);
  assert.match(markup, /id="recalculate-route-button"/);
  assert.match(markup, /id="keep-route-button"/);
  assert.match(markup, /id="delivery-report-summary"/);
  assert.match(app, /evaluatePriceEvent/);
  assert.match(app, /summarizeDeliveryProgress/);
});

test("display toggles keep currency local and only convert units", async () => {
  const [app, markup] = await Promise.all([
    readFile(new URL("../app/app.js", import.meta.url), "utf8"),
    readFile(new URL("../app/index.html", import.meta.url), "utf8")
  ]);

  assert.match(markup, /data-display-unit="metric"/);
  assert.match(markup, /data-display-unit="imperial"/);
  assert.match(markup, /data-display-currency="CAD"/);
  assert.match(markup, /data-display-currency="USD"/);
  assert.match(markup, /exchange rate/i);
  assert.match(app, /formatFuelPrice/);
  assert.doesNotMatch(app, /exchangeRate|USD_PER_CAD/i);
  assert.match(markup, /src="\.\/app\.js\?v=unit-display-20260719"/);
});
