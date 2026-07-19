import assert from "node:assert/strict";
import test from "node:test";
import { calculateRisk, createFallbackReport, createRecommendation, demoTrip, seededTrips } from "../app/scenario.js";

test("seeded scenarios cover safe, tight, and urgent reserve states", () => {
  assert.deepEqual(calculateRisk(seededTrips.safe), {
    projectedReservePercent: 18,
    reserveGapPercent: 6,
    arrivalDelayMinutes: 12,
    reserveState: "safe"
  });
  assert.deepEqual(calculateRisk(seededTrips.tight), {
    projectedReservePercent: 12,
    reserveGapPercent: 0,
    arrivalDelayMinutes: 34,
    reserveState: "tight"
  });
  assert.deepEqual(calculateRisk(seededTrips.urgent), {
    projectedReservePercent: 7,
    reserveGapPercent: -5,
    arrivalDelayMinutes: 43,
    reserveState: "urgent"
  });
});

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
