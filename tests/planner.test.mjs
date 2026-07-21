import assert from "node:assert/strict";
import test from "node:test";
import { buildRecommendedPlan, buildRejectedPlan, checkSeededConstruction, constructionCheckBasis, createPlanningComparison, deliveryWindowLabels, predictSeededWeather, simulatedPlanningInput, sortDeliveries, trafficForecastBasis, weatherForecastBasis } from "../app/planner.js";

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

test("predicted traffic uses seeded historical patterns at planned presence times", () => {
  const plan = buildRecommendedPlan();
  const travelSteps = plan.steps.filter((step) => step.distanceKm);

  assert.ok(plan.predictedTrafficDelayMinutes > 0);
  assert.ok(plan.predictedArrivalMinutes > 8 * 60 + 30);
  assert.ok(travelSteps.every((step) => step.predictedTrafficDelayMinutes > 0));
  assert.ok(travelSteps.every((step) => /historical/.test(step.trafficCondition)));
  assert.match(plan.trafficBasis, /not live traffic/i);
  assert.match(trafficForecastBasis, /predicted arrival time/i);
});

test("weather cells move across the route and remain explicitly non-live", () => {
  const early = predictSeededWeather({ x: 90, y: 375 }, { x: 260, y: 250 }, 8 * 60 + 30);
  const later = predictSeededWeather({ x: 500, y: 180 }, { x: 700, y: 270 }, 11 * 60);
  const plan = buildRecommendedPlan();
  assert.equal(early.movement, "rain band moving west to east");
  assert.notEqual(early.condition, later.condition);
  assert.ok(plan.steps.filter((step) => step.distanceKm).every((step) => step.weatherMovement));
  assert.match(weatherForecastBasis, /not live weather/i);
});

test("construction checks use the seeded work-zone register", () => {
  const match = checkSeededConstruction({ x: 500, y: 180 }, { x: 700, y: 270 }, 12 * 60);
  const miss = checkSeededConstruction({ x: 90, y: 375 }, { x: 260, y: 250 }, 9 * 60);
  const plan = buildRecommendedPlan();
  assert.match(match.status, /resurfacing/i);
  assert.ok(match.delayMinutes > 0);
  assert.equal(miss.delayMinutes, 0);
  assert.ok(plan.predictedConstructionDelayMinutes >= 0);
  assert.match(constructionCheckBasis, /not live road status/i);
});
