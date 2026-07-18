export const demoTrip = Object.freeze({
  id: "PITT-DEMO-017",
  driver: "Jordan Lee",
  cargo: "Refrigerated groceries",
  destination: "North Market Distribution Centre",
  route: "A-40 East / local delivery corridor",
  departure: "08:10",
  plannedArrival: "10:40",
  fuelPercent: 24,
  minimumReservePercent: 12,
  projectedFuelBurnPercent: 17,
  delayMinutes: 28,
  stop: {
    name: "Northbound Service Plaza",
    distanceKm: 19,
    detourMinutes: 15,
    status: "Pre-approved demo stop"
  }
});

export function calculateRisk(trip) {
  const projectedReservePercent = trip.fuelPercent - trip.projectedFuelBurnPercent;
  const reserveGapPercent = projectedReservePercent - trip.minimumReservePercent;
  const arrivalDelayMinutes = trip.delayMinutes + trip.stop.detourMinutes;

  return {
    projectedReservePercent,
    reserveGapPercent,
    arrivalDelayMinutes,
    reserveState: reserveGapPercent < 0 ? "urgent" : reserveGapPercent <= 3 ? "tight" : "safe"
  };
}

export function createRecommendation(trip, risk = calculateRisk(trip)) {
  const urgency = risk.reserveState === "urgent" ? "Fuel stop needed now" : "Fuel stop recommended";

  return {
    urgency,
    title: `${urgency}: ${trip.stop.name}`,
    summary: `Projected reserve is ${risk.projectedReservePercent}% against the ${trip.minimumReservePercent}% policy floor.`,
    reasons: [
      `Delay adds ${trip.delayMinutes} minutes to the seeded trip.`,
      `${trip.stop.distanceKm} km away with a ${trip.stop.detourMinutes}-minute planned detour.`,
      `${trip.stop.status}; no live station, traffic, or price feed is used.`
    ],
    alternatives: [
      "Continue without stopping: projected reserve remains below policy.",
      "Contact dispatch for a different approved stop: review needed before changing the plan."
    ],
    confidence: "High for this seeded arithmetic; not a live route prediction."
  };
}

export function createFallbackReport(trip, risk = calculateRisk(trip), recommendation = createRecommendation(trip, risk)) {
  return [
    `Trip exception draft - ${trip.id}`,
    `${trip.driver} is delivering ${trip.cargo} to ${trip.destination}.`,
    `A seeded ${trip.delayMinutes}-minute delay changes projected fuel reserve to ${risk.projectedReservePercent}% (policy floor: ${trip.minimumReservePercent}%).`,
    `Recommended review action: stop at ${trip.stop.name}, ${trip.stop.distanceKm} km away, with a planned ${trip.stop.detourMinutes}-minute detour.`,
    `Driver review status: pending confirmation.`,
    `Source: deterministic local demo fallback. ${recommendation.confidence}`
  ].join("\n");
}
