import assert from "node:assert/strict";
import test from "node:test";
import { createPlanningComparison } from "../app/planner.js";
import { createFuelSimulation } from "../app/fuel-simulation.js";

const plan = createPlanningComparison().recommended;

test("planned refuel raises fuel after the first delivery", () => {
  const afterLegOne = createFuelSimulation({ completedLegs: 1, fuelDecision: null, plan });
  const afterLegTwo = createFuelSimulation({ completedLegs: 2, fuelDecision: "refuel", plan });

  assert.equal(afterLegOne.needsFuelDecision, true);
  assert.equal(afterLegOne.status, "within_policy");
  assert.equal(afterLegTwo.refuelOccurred, true);
  assert.ok(afterLegTwo.currentFuelPercent > afterLegOne.currentFuelPercent);
});

test("driver can continue without refuelling and run out in the seeded trip", () => {
  const afterLegTwo = createFuelSimulation({ completedLegs: 2, fuelDecision: "continue", plan });
  const afterLegThree = createFuelSimulation({ completedLegs: 3, fuelDecision: "continue", plan });

  assert.equal(afterLegTwo.status, "below_reserve");
  assert.equal(afterLegThree.outOfFuel, true);
  assert.equal(afterLegThree.currentFuelPercent, 0);
});
