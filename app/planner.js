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

export const trafficForecastBasis = "Seeded weekday historical pattern at predicted arrival time; not live traffic.";

const planningStartMinutes = 8 * 60 + 30;

export function formatPlanningTime(minutes) {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = Math.round(minutes % 60);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function predictHistoricalTraffic(from, to, departureMinutes) {
  const hour = Math.floor(departureMinutes / 60) % 24;
  const distanceKm = mapDistanceKm(from, to);
  const corridorWeight = Math.abs(to.y - from.y) > 90 ? 1.15 : 1;
  let condition = "light historical traffic";
  let multiplier = 0.08;

  if ((hour >= 7 && hour < 10) || (hour >= 16 && hour < 19)) {
    condition = "historical peak traffic";
    multiplier = 0.42;
  } else if ((hour >= 10 && hour < 12) || (hour >= 14 && hour < 16)) {
    condition = "historical moderate traffic";
    multiplier = 0.22;
  }

  return {
    condition,
    delayMinutes: Math.max(1, Math.round(distanceKm * multiplier * corridorWeight)),
    basis: trafficForecastBasis
  };
}

export const simulatedPlanningInput = Object.freeze({
  vehicle: Object.freeze({
    startingFuelPercent: 50,
    minimumReservePercent: 14,
    refuelToPercent: 80,
    fuelPercentPerMapKm: 0.9,
    tankLitres: 100,
    simulatedDetourCostPerKmCad: 0.72
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
    Object.freeze({ id: "FUEL-1", name: "Cedar Service Plaza", kind: "station", x: 400, y: 270, pricePerLitreCad: 1.869 }),
    Object.freeze({ id: "FUEL-2", name: "Riverside Fuel Stop", kind: "station", x: 675, y: 365, pricePerLitreCad: 1.799 }),
    Object.freeze({ id: "FUEL-3", name: "South Loop Fuel", kind: "station", x: 310, y: 420, pricePerLitreCad: 1.739 })
  ])
});

export function mapDistanceKm(from, to) {
  return Math.hypot(to.x - from.x, to.y - from.y) / 10;
}

export function sortDeliveries(deliveries, origin = simulatedPlanningInput.origin, departureMinutes = planningStartMinutes) {
  return [...deliveries].sort((left, right) => {
    const priorityDifference = windowPriority[left.window] - windowPriority[right.window];
    if (priorityDifference !== 0) return priorityDifference;

    const leftTraffic = predictHistoricalTraffic(origin, left, departureMinutes).delayMinutes;
    const rightTraffic = predictHistoricalTraffic(origin, right, departureMinutes).delayMinutes;
    const leftScore = mapDistanceKm(origin, left) + leftTraffic;
    const rightScore = mapDistanceKm(origin, right) + rightTraffic;
    return leftScore - rightScore || left.id.localeCompare(right.id);
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
      const fuelAfterApproachPercent = current.fuelPercent - fuelCost(approachKm, vehicle);
      const refillLitres = ((vehicle.refuelToPercent - fuelAfterApproachPercent) / 100) * vehicle.tankLitres;
      const detourKm = approachKm + onwardKm - directKm;
      const fuelSpendCad = refillLitres * station.pricePerLitreCad;
      const detourCostCad = detourKm * vehicle.simulatedDetourCostPerKmCad;
      return {
        station,
        approachKm,
        onwardKm,
        detourKm,
        fuelAfterApproachPercent,
        refillLitres,
        fuelSpendCad,
        detourCostCad,
        estimatedPlanCostCad: fuelSpendCad + detourCostCad
      };
    })
    .filter(({ fuelAfterApproachPercent }) => fuelAfterApproachPercent >= vehicle.minimumReservePercent)
    .sort((left, right) => left.estimatedPlanCostCad - right.estimatedPlanCostCad || left.detourKm - right.detourKm || left.station.id.localeCompare(right.station.id));

  if (!candidates[0]) return null;
  return { ...candidates[0], alternatives: candidates.slice(1) };
}

function addLeg(steps, from, to, fuelPercent, vehicle, departureMinutes, type = "delivery") {
  const distanceKm = mapDistanceKm(from, to);
  const nextFuelPercent = fuelPercent - fuelCost(distanceKm, vehicle);
  const traffic = predictHistoricalTraffic(from, to, departureMinutes);
  const baselineTravelMinutes = Math.max(1, Math.round(distanceKm * 1.2));
  const plannedTravelMinutes = baselineTravelMinutes + traffic.delayMinutes;
  const predictedArrivalMinutes = departureMinutes + plannedTravelMinutes;
  steps.push({
    type,
    from,
    to,
    distanceKm,
    fuelBeforePercent: fuelPercent,
    fuelAfterPercent: nextFuelPercent,
    departureMinutes,
    predictedArrivalMinutes,
    baselineTravelMinutes,
    predictedTrafficDelayMinutes: traffic.delayMinutes,
    trafficCondition: traffic.condition,
    trafficBasis: traffic.basis
  });
  return { fuelPercent: nextFuelPercent, predictedArrivalMinutes };
}

export function buildRecommendedPlan(input = simulatedPlanningInput) {
  const { origin, vehicle } = input;
  const deliveries = sortDeliveries(input.deliveries, origin);
  const steps = [];
  let current = origin;
  let fuelPercent = vehicle.startingFuelPercent;
  let predictedMinutes = planningStartMinutes;

  for (const delivery of deliveries) {
    const directCost = fuelCost(mapDistanceKm(current, delivery), vehicle);
    if (fuelPercent - directCost < vehicle.minimumReservePercent) {
      const fuelStop = chooseFuelStop({ ...current, fuelPercent }, delivery, input);
      if (fuelStop) {
        const approach = addLeg(steps, current, fuelStop.station, fuelPercent, vehicle, predictedMinutes, "refuel-approach");
        fuelPercent = approach.fuelPercent;
        predictedMinutes = approach.predictedArrivalMinutes;
        steps.push({
          type: "refuel",
          at: fuelStop.station,
          fuelBeforePercent: fuelPercent,
          fuelAfterPercent: vehicle.refuelToPercent,
          departureMinutes: predictedMinutes,
          predictedArrivalMinutes: predictedMinutes + 12,
          serviceMinutes: 12,
          detourKm: fuelStop.detourKm,
          refillLitres: fuelStop.refillLitres,
          fuelSpendCad: fuelStop.fuelSpendCad,
          detourCostCad: fuelStop.detourCostCad,
          estimatedPlanCostCad: fuelStop.estimatedPlanCostCad,
          alternatives: fuelStop.alternatives
        });
        fuelPercent = vehicle.refuelToPercent;
        predictedMinutes += 12;
        current = fuelStop.station;
      }
    }

    const leg = addLeg(steps, current, delivery, fuelPercent, vehicle, predictedMinutes);
    fuelPercent = leg.fuelPercent;
    predictedMinutes = leg.predictedArrivalMinutes;
    current = delivery;
  }

  const distanceKm = steps.filter((step) => step.distanceKm).reduce((total, step) => total + step.distanceKm, 0);
  const refuel = steps.find((step) => step.type === "refuel");
  const predictedTrafficDelayMinutes = steps.reduce((total, step) => total + (step.predictedTrafficDelayMinutes ?? 0), 0);

  return {
    label: "Recommended plan",
    deliveries,
    steps,
    distanceKm,
    endingFuelPercent: fuelPercent,
    refuel,
    predictedArrivalMinutes: predictedMinutes,
    predictedTrafficDelayMinutes,
    trafficBasis: trafficForecastBasis,
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
  let predictedMinutes = planningStartMinutes;

  for (const delivery of deliveries) {
    const leg = addLeg(steps, current, delivery, fuelPercent, vehicle, predictedMinutes, "delivery");
    fuelPercent = leg.fuelPercent;
    predictedMinutes = leg.predictedArrivalMinutes;
    current = delivery;
  }

  const distanceKm = steps.reduce((total, step) => total + step.distanceKm, 0);
  return {
    label: "Rejected loop",
    deliveries,
    steps,
    distanceKm,
    endingFuelPercent: fuelPercent,
    predictedArrivalMinutes: predictedMinutes,
    predictedTrafficDelayMinutes: steps.reduce((total, step) => total + step.predictedTrafficDelayMinutes, 0),
    trafficBasis: trafficForecastBasis,
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
