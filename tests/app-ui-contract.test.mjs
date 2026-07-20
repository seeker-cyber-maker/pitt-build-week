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
  assert.match(app, /Predicted traffic/);
  assert.match(app, /trafficForecastBasis/);
  assert.doesNotMatch(app, /exchangeRate|USD_PER_CAD/i);
  assert.match(markup, /src="\.\/app\.js\?v=predictive-traffic-20260719"/);
});

test("report includes a review-gated Lua machine handoff", async () => {
  const [app, markup] = await Promise.all([
    readFile(new URL("../app/app.js", import.meta.url), "utf8"),
    readFile(new URL("../app/index.html", import.meta.url), "utf8")
  ]);

  assert.match(markup, /id="machine-handoff-output"/);
  assert.match(markup, /id="copy-machine-handoff"/);
  assert.match(app, /pitt\.trip_handoff\.v1/);
  assert.match(app, /seeded_weekday_historical/);
  assert.match(app, /live_data = false/);
  assert.match(app, /driver_review_required/);
  assert.match(app, /external_action = false/);
  assert.match(app, /navigator\.clipboard\.writeText/);
});

test("Trip Watch is the route authority before review can be opened", async () => {
  const [app, markup] = await Promise.all([
    readFile(new URL("../app/app.js", import.meta.url), "utf8"),
    readFile(new URL("../app/index.html", import.meta.url), "utf8")
  ]);

  assert.match(markup, /id="close-route-early-button"/);
  assert.match(markup, /id="trip-watch-context"/);
  assert.match(app, /routeClosed/);
  assert.match(app, /routeCloseReason = "completed"/);
  assert.match(app, /routeCloseReason = "early"/);
  assert.match(app, /if \(!state\.routeClosed\) return/);
  assert.match(app, /Route closed early before delivery attempt/);
  assert.match(app, /status: "undelivered"/);
});

test("Trip Watch exposes a driver-owned live fuel decision", async () => {
  const [app, markup] = await Promise.all([
    readFile(new URL("../app/app.js", import.meta.url), "utf8"),
    readFile(new URL("../app/index.html", import.meta.url), "utf8")
  ]);

  assert.match(markup, /id="take-planned-refuel-button"/);
  assert.match(markup, /id="continue-without-refuel-button"/);
  assert.match(markup, /id="fuel-runtime-value"/);
  assert.match(app, /currentFuelSimulation/);
  assert.match(app, /Out of fuel — close route early/);
});
