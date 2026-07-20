import { simulatedPlanningInput } from "./planner.js";
import { simulatedDayTimeline } from "./day-playback.js";

const vehicle = simulatedPlanningInput.vehicle;
const directDeliveryLegs = simulatedDayTimeline.filter((item) => item.kind === "leg");

function clampFuel(value) {
  return Math.max(0, value);
}

function fuelStatus(rawFuelPercent) {
  if (rawFuelPercent <= 0) return "empty";
  if (rawFuelPercent < vehicle.minimumReservePercent) return "below_reserve";
  return "within_policy";
}

export function createFuelSimulation({ completedLegs, fuelDecision, plan }) {
  const deliverySteps = plan.steps.filter((step) => step.type === "delivery");
  const refuelApproach = plan.steps.find((step) => step.type === "refuel-approach");
  const refuel = plan.refuel;
  const operations = [];
  let rawFuelPercent = vehicle.startingFuelPercent;

  if (completedLegs >= 1) {
    rawFuelPercent = deliverySteps[0].fuelAfterPercent;
    operations.push({ type: "delivery", label: "Leg 1 completed", fuelAfterPercent: rawFuelPercent });
  }

  if (completedLegs >= 2 && fuelDecision === "refuel") {
    rawFuelPercent = refuelApproach.fuelAfterPercent;
    operations.push({ type: "approach", label: `Arrived at ${refuel.at.name}`, fuelAfterPercent: rawFuelPercent });
    rawFuelPercent = refuel.fuelAfterPercent;
    operations.push({ type: "refuel", label: `Refuelled at ${refuel.at.name}`, fuelAfterPercent: rawFuelPercent });
    rawFuelPercent = deliverySteps[1].fuelAfterPercent;
    operations.push({ type: "delivery", label: "Leg 2 completed", fuelAfterPercent: rawFuelPercent });
  } else if (completedLegs >= 2 && fuelDecision === "continue") {
    rawFuelPercent = deliverySteps[0].fuelAfterPercent - (directDeliveryLegs[1].distanceKm * vehicle.fuelPercentPerMapKm);
    operations.push({ type: "delivery", label: "Leg 2 completed without refuelling", fuelAfterPercent: rawFuelPercent });
  }

  for (let index = 2; index < completedLegs; index += 1) {
    if (fuelDecision === "refuel") {
      rawFuelPercent = deliverySteps[index].fuelAfterPercent;
    } else if (fuelDecision === "continue") {
      rawFuelPercent -= directDeliveryLegs[index].distanceKm * vehicle.fuelPercentPerMapKm;
    }
    operations.push({ type: "delivery", label: `Leg ${index + 1} completed`, fuelAfterPercent: rawFuelPercent });
  }

  const status = fuelStatus(rawFuelPercent);
  return {
    startingFuelPercent: vehicle.startingFuelPercent,
    currentFuelPercent: clampFuel(rawFuelPercent),
    rawFuelPercent,
    reserveFloorPercent: vehicle.minimumReservePercent,
    fuelDecision,
    refuel,
    refuelOccurred: fuelDecision === "refuel" && completedLegs >= 2,
    needsFuelDecision: completedLegs === 1 && !fuelDecision,
    status,
    outOfFuel: status === "empty",
    operations
  };
}

export const fuelStatusLabels = Object.freeze({
  within_policy: "Within reserve policy",
  below_reserve: "Below reserve policy",
  empty: "Out of fuel (simulated)"
});
