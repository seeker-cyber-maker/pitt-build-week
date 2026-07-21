import assert from "node:assert/strict";
import test from "node:test";
import { evaluateAdditionalRefuel, evaluatePriceEvent, summarizeDeliveryProgress } from "../app/day-playback.js";

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

test("cheap fuel is rejected after a morning fill when detour cost exceeds pump savings", () => {
  for (const [eventId, fuelPercent] of [["noon-spike", 80], ["afternoon-drop", 55.2]]) {
    const evaluation = evaluateAdditionalRefuel(eventId, fuelPercent);
    assert.equal(evaluation.worthwhile, false);
    assert.ok(evaluation.detourCostCad > evaluation.pumpSavingsCad);
  }
});

test("end-of-day summary reports every seeded delivery outcome", () => {
  const summary = summarizeDeliveryProgress(6);
  assert.equal(summary.complete, true);
  assert.equal(summary.completedLegs.length, 5);
  assert.deepEqual(summary.counts, { delivered: 3, undelivered: 1, nobody_on_site: 1 });
  assert.equal(summary.completedDistanceKm, 107.4);
});
