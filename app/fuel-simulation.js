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

export function createFuelSimulation({ completedLegs, refuelDecision, morningFilled = false, plan }) {
  const refuel = plan.refuel;
  const operations = [];
  let rawFuelPercent = vehicle.startingFuelPercent;

  if (completedLegs >= 1) {
    rawFuelPercent -= directDeliveryLegs[0].distanceKm * vehicle.fuelPercentPerMapKm;
    operations.push({ type: "delivery", label: "Leg 1 completed", fuelAfterPercent: rawFuelPercent });
    if (morningFilled) {
      rawFuelPercent = vehicle.refuelToPercent;
      operations.push({ type: "refuel", label: "Morning refuel completed", fuelAfterPercent: rawFuelPercent });
    }
  }

  if (completedLegs >= 2) {
    if (!morningFilled && refuelDecision === "noon-spike") {
      rawFuelPercent = vehicle.refuelToPercent;
      operations.push({ type: "refuel", label: `Refuelled after price spike at ${refuel.at.name}`, fuelAfterPercent: rawFuelPercent });
    }
    rawFuelPercent -= directDeliveryLegs[1].distanceKm * vehicle.fuelPercentPerMapKm;
    operations.push({ type: "delivery", label: "Leg 2 completed", fuelAfterPercent: rawFuelPercent });
  }

  for (let index = 2; index < completedLegs; index += 1) {
    if (index === 2 && !morningFilled && refuelDecision === "afternoon-drop") {
      rawFuelPercent = vehicle.refuelToPercent;
      operations.push({ type: "refuel", label: `Refuelled after price drop at ${refuel.at.name}`, fuelAfterPercent: rawFuelPercent });
    }
    rawFuelPercent -= directDeliveryLegs[index].distanceKm * vehicle.fuelPercentPerMapKm;
    operations.push({ type: "delivery", label: `Leg ${index + 1} completed`, fuelAfterPercent: rawFuelPercent });
  }

  const status = fuelStatus(rawFuelPercent);
  return {
    startingFuelPercent: vehicle.startingFuelPercent,
    currentFuelPercent: clampFuel(rawFuelPercent),
    rawFuelPercent,
    reserveFloorPercent: vehicle.minimumReservePercent,
    fuelDecision: morningFilled ? "morning" : refuelDecision,
    refuel,
    refuelOccurred: morningFilled || Boolean(refuelDecision),
    needsFuelDecision: false,
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
