import assert from "node:assert/strict";
import test from "node:test";
import { createPlanningComparison } from "../app/planner.js";
import { createFuelSimulation } from "../app/fuel-simulation.js";

const plan = createPlanningComparison().recommended;

test("price-spike refuel raises fuel before the second delivery", () => {
  const afterLegOne = createFuelSimulation({ completedLegs: 1, refuelDecision: null, plan });
  const afterLegTwo = createFuelSimulation({ completedLegs: 2, refuelDecision: "noon-spike", plan });

  assert.equal(afterLegOne.needsFuelDecision, false);
  assert.equal(afterLegOne.status, "within_policy");
  assert.equal(afterLegTwo.refuelOccurred, true);
  assert.ok(afterLegTwo.currentFuelPercent > afterLegOne.currentFuelPercent);
});

test("driver can pass both price events and run out in the seeded trip", () => {
  const afterLegTwo = createFuelSimulation({ completedLegs: 2, refuelDecision: null, plan });
  const afterLegThree = createFuelSimulation({ completedLegs: 3, refuelDecision: null, plan });

  assert.equal(afterLegTwo.status, "below_reserve");
  assert.equal(afterLegThree.outOfFuel, true);
  assert.equal(afterLegThree.currentFuelPercent, 0);
});

test("morning fill supports both price-event checks without another refuel", () => {
  const atNoon = createFuelSimulation({ completedLegs: 1, refuelDecision: null, morningFilled: true, plan });
  const atAfternoon = createFuelSimulation({ completedLegs: 2, refuelDecision: null, morningFilled: true, plan });
  assert.equal(atNoon.currentFuelPercent, 80);
  assert.equal(atAfternoon.currentFuelPercent, 55.16);
  assert.equal(atAfternoon.fuelDecision, "morning");
});
