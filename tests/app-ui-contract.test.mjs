import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createFallbackReport, demoTrip } from "../app/scenario.js";

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
