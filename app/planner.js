export const deliveryWindowLabels = Object.freeze({
  asap: "ASAP",
  before_noon: "Before noon",
  before_eob: "Before EOB",
  all_day: "All day",
  flexible: "No time specified"
});

const windowPriority = Object.freeze({
  asap: 0,
  before_noon: 1,
  before_eob: 2,
  all_day: 3,
  flexible: 4
});

export const simulatedPlanningInput = Object.freeze({
  vehicle: Object.freeze({
    startingFuelPercent: 50,
    minimumReservePercent: 14,
    refuelToPercent: 80,
    fuelPercentPerMapKm: 0.9
  }),
  origin: Object.freeze({ id: "hub", name: "Depot", kind: "origin", x: 90, y: 375 }),
  deliveries: Object.freeze([
    Object.freeze({ id: "DEL-104", name: "Lakeside Grocer", window: "asap", x: 260, y: 250 }),
    Object.freeze({ id: "DEL-105", name: "North Market Distribution Centre", window: "before_noon", x: 500, y: 180 }),
    Object.freeze({ id: "DEL-106", name: "Eastside Pharmacy", window: "before_eob", x: 700, y: 270 }),
    Object.freeze({ id: "DEL-107", name: "Riverbend Warehouse", window: "all_day", x: 770, y: 400 }),
    Object.freeze({ id: "DEL-108", name: "West Dock Receiving", window: "flexible", x: 550, y: 400 })
  ]),
  stations: Object.freeze([
    Object.freeze({ id: "FUEL-1", name: "Cedar Service Plaza", kind: "station", x: 400, y: 270 }),
    Object.freeze({ id: "FUEL-2", name: "Riverside Fuel Stop", kind: "station", x: 675, y: 365 }),
    Object.freeze({ id: "FUEL-3", name: "South Loop Fuel", kind: "station", x: 310, y: 420 })
  ])
});

export function mapDistanceKm(from, to) {
  return Math.hypot(to.x - from.x, to.y - from.y) / 10;
}

export function sortDeliveries(deliveries, origin = simulatedPlanningInput.origin) {
  return [...deliveries].sort((left, right) => {
    const priorityDifference = windowPriority[left.window] - windowPriority[right.window];
    if (priorityDifference !== 0) return priorityDifference;

    const distanceDifference = mapDistanceKm(origin, left) - mapDistanceKm(origin, right);
    return distanceDifference || left.id.localeCompare(right.id);
  });
}

function fuelCost(distanceKm, vehicle) {
  return distanceKm * vehicle.fuelPercentPerMapKm;
}

function chooseFuelStop(current, next, input) {
  const { vehicle, stations } = input;
  const directKm = mapDistanceKm(current, next);
  const candidates = stations
    .map((station) => {
      const approachKm = mapDistanceKm(current, station);
      const onwardKm = mapDistanceKm(station, next);
      return {
        station,
        approachKm,
        onwardKm,
        detourKm: approachKm + onwardKm - directKm
      };
    })
    .filter(({ approachKm }) => current.fuelPercent - fuelCost(approachKm, vehicle) >= vehicle.minimumReservePercent)
    .sort((left, right) => left.detourKm - right.detourKm || left.station.id.localeCompare(right.station.id));

  return candidates[0] ?? null;
}

function addLeg(steps, from, to, fuelPercent, vehicle, type = "delivery") {
  const distanceKm = mapDistanceKm(from, to);
  const nextFuelPercent = fuelPercent - fuelCost(distanceKm, vehicle);
  steps.push({ type, from, to, distanceKm, fuelBeforePercent: fuelPercent, fuelAfterPercent: nextFuelPercent });
  return nextFuelPercent;
}

export function buildRecommendedPlan(input = simulatedPlanningInput) {
  const { origin, vehicle } = input;
  const deliveries = sortDeliveries(input.deliveries, origin);
  const steps = [];
  let current = origin;
  let fuelPercent = vehicle.startingFuelPercent;

  for (const delivery of deliveries) {
    const directCost = fuelCost(mapDistanceKm(current, delivery), vehicle);
    if (fuelPercent - directCost < vehicle.minimumReservePercent) {
      const fuelStop = chooseFuelStop({ ...current, fuelPercent }, delivery, input);
      if (fuelStop) {
        fuelPercent = addLeg(steps, current, fuelStop.station, fuelPercent, vehicle, "refuel-approach");
        steps.push({
          type: "refuel",
          at: fuelStop.station,
          fuelBeforePercent: fuelPercent,
          fuelAfterPercent: vehicle.refuelToPercent,
          detourKm: fuelStop.detourKm
        });
        fuelPercent = vehicle.refuelToPercent;
        current = fuelStop.station;
      }
    }

    fuelPercent = addLeg(steps, current, delivery, fuelPercent, vehicle);
    current = delivery;
  }

  const distanceKm = steps.filter((step) => step.distanceKm).reduce((total, step) => total + step.distanceKm, 0);
  const refuel = steps.find((step) => step.type === "refuel");

  return {
    label: "Recommended plan",
    deliveries,
    steps,
    distanceKm,
    endingFuelPercent: fuelPercent,
    refuel,
    meetsReservePolicy: fuelPercent >= vehicle.minimumReservePercent
  };
}

export function buildRejectedPlan(input = simulatedPlanningInput) {
  const { origin, vehicle } = input;
  const byId = new Map(input.deliveries.map((delivery) => [delivery.id, delivery]));
  const deliveries = ["DEL-107", "DEL-104", "DEL-108", "DEL-105", "DEL-106"].map((id) => byId.get(id));
  const steps = [];
  let current = origin;
  let fuelPercent = vehicle.startingFuelPercent;

  for (const delivery of deliveries) {
    fuelPercent = addLeg(steps, current, delivery, fuelPercent, vehicle, "delivery");
    current = delivery;
  }

  const distanceKm = steps.reduce((total, step) => total + step.distanceKm, 0);
  return {
    label: "Rejected loop",
    deliveries,
    steps,
    distanceKm,
    endingFuelPercent: fuelPercent,
    refuel: null,
    meetsReservePolicy: false,
    reasons: [
      "It serves flexible work before urgent work.",
      "It crosses the simulated corridor repeatedly.",
      "It reaches the fuel policy floor before the final delivery."
    ]
  };
}

export function createPlanningComparison(input = simulatedPlanningInput) {
  const recommended = buildRecommendedPlan(input);
  const rejected = buildRejectedPlan(input);
  return {
    input,
    recommended,
    rejected,
    distanceSavedKm: rejected.distanceKm - recommended.distanceKm,
    fuelReserveImprovementPercent: recommended.endingFuelPercent - rejected.endingFuelPercent
  };
}
