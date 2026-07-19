import assert from "node:assert/strict";
import test from "node:test";
import { buildRecommendedPlan, buildRejectedPlan, createPlanningComparison, deliveryWindowLabels, simulatedPlanningInput, sortDeliveries } from "../app/planner.js";

test("delivery ledger sorts the seeded time windows before flexible work", () => {
  const ordered = sortDeliveries(simulatedPlanningInput.deliveries).map((delivery) => delivery.window);
  assert.deepEqual(ordered, ["asap", "before_noon", "before_eob", "all_day", "flexible"]);
  assert.equal(deliveryWindowLabels.flexible, "No time specified");
});

test("recommended plan balances seeded fuel price against detour cost before reserve fails", () => {
  const plan = buildRecommendedPlan();
  assert.equal(plan.refuel.at.name, "Cedar Service Plaza");
  assert.ok(plan.steps.some((step) => step.type === "refuel"));
  assert.ok(plan.steps.filter((step) => step.distanceKm).every((step) => step.fuelAfterPercent >= 0));
  assert.ok(plan.endingFuelPercent >= simulatedPlanningInput.vehicle.minimumReservePercent);
  assert.equal(plan.refuel.at.pricePerLitreCad, 1.869);
  assert.ok(plan.refuel.estimatedPlanCostCad > plan.refuel.fuelSpendCad);
  assert.ok(simulatedPlanningInput.stations.find((station) => station.id === "FUEL-3").pricePerLitreCad < plan.refuel.at.pricePerLitreCad);
  assert.equal(plan.refuel.alternatives[0].station.name, "South Loop Fuel");
});

test("rejected loop is longer and leaves less fuel than the recommended plan", () => {
  const comparison = createPlanningComparison();
  const rejected = buildRejectedPlan();
  assert.ok(comparison.recommended.distanceKm < rejected.distanceKm);
  assert.ok(comparison.distanceSavedKm > 0);
  assert.ok(comparison.fuelReserveImprovementPercent > 0);
  assert.equal(rejected.meetsReservePolicy, false);
  assert.match(rejected.reasons.join(" "), /flexible work before urgent work/i);
});
