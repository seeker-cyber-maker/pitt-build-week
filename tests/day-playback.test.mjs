import assert from "node:assert/strict";
import test from "node:test";
import { evaluatePriceEvent, summarizeDeliveryProgress } from "../app/day-playback.js";

test("noon spike recalculation moves the simulated refuel to the lower-cost route", () => {
  const evaluation = evaluatePriceEvent("noon-spike");
  assert.equal(evaluation.baselineStation.name, "Cedar Service Plaza");
  assert.equal(evaluation.recalculatedStation.name, "South Loop Fuel");
  assert.equal(evaluation.routeChanged, true);
});

test("afternoon price drop recalculation returns the simulated refuel to Cedar", () => {
  const evaluation = evaluatePriceEvent("afternoon-drop");
  assert.equal(evaluation.recalculatedStation.name, "Cedar Service Plaza");
  assert.equal(evaluation.routeChanged, false);
});

test("end-of-day summary reports every seeded delivery outcome", () => {
  const summary = summarizeDeliveryProgress(6);
  assert.equal(summary.complete, true);
  assert.equal(summary.completedLegs.length, 5);
  assert.deepEqual(summary.counts, { delivered: 3, undelivered: 1, nobody_on_site: 1 });
  assert.equal(summary.completedDistanceKm, 107.4);
});
