import assert from "node:assert/strict";
import test from "node:test";
import { calculateRisk, createFallbackReport, createRecommendation, demoTrip } from "../app/scenario.js";

test("seeded trip reaches the urgent reserve state", () => {
  const risk = calculateRisk(demoTrip);
  assert.deepEqual(risk, {
    projectedReservePercent: 7,
    reserveGapPercent: -5,
    arrivalDelayMinutes: 43,
    reserveState: "urgent"
  });
});

test("recommendation stays within the demo boundary", () => {
  const recommendation = createRecommendation(demoTrip);
  assert.match(recommendation.title, /Northbound Service Plaza/);
  assert.match(recommendation.reasons.join(" "), /no live station, traffic, or price feed/i);
  assert.doesNotMatch(JSON.stringify(recommendation), /needed now|contact dispatch|live route/i);
});

test("fallback report carries provenance and needs driver review", () => {
  const report = createFallbackReport(demoTrip);
  assert.match(report, /Driver review status: pending confirmation/);
  assert.match(report, /deterministic local demo fallback/i);
});
