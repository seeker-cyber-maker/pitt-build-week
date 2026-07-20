export const seededTrips = Object.freeze({
  safe: Object.freeze({
    id: "PITT-DEMO-018",
    driver: "Samir Patel",
    cargo: "Dry goods",
    destination: "Southside Logistics Hub",
    plannedCorridor: "Highway 20 West / planned corridor",
    departure: "08:10",
    plannedArrival: "10:40",
    fuelPercent: 45,
    minimumReservePercent: 12,
    projectedFuelBurnPercent: 27,
    delayMinutes: 12,
    stop: { name: "No fuel stop required", distanceKm: 0, detourMinutes: 0, status: "Reserve remains above the policy floor" }
  }),
  tight: Object.freeze({
    id: "PITT-DEMO-019",
    driver: "Aisha Dubois",
    cargo: "Refrigerated pharmaceuticals",
    destination: "East End Medical Depot",
    plannedCorridor: "A-10 East / planned corridor",
    departure: "08:10",
    plannedArrival: "10:40",
    fuelPercent: 32,
    minimumReservePercent: 12,
    projectedFuelBurnPercent: 20,
    delayMinutes: 22,
    stop: { name: "Eastbridge Travel Centre", distanceKm: 14, detourMinutes: 12, status: "Pre-approved corridor stop" }
  }),
  urgent: Object.freeze({
    id: "PITT-DEMO-017",
    driver: "Jordan Lee",
    cargo: "Refrigerated groceries",
    destination: "North Market Distribution Centre",
    plannedCorridor: "A-40 East / local delivery corridor",
    departure: "08:10",
    plannedArrival: "10:40",
    fuelPercent: 24,
    minimumReservePercent: 12,
    projectedFuelBurnPercent: 17,
    delayMinutes: 28,
    stop: { name: "Northbound Service Plaza", distanceKm: 19, detourMinutes: 15, status: "Pre-approved corridor stop" }
  })
});

export const demoTrip = seededTrips.urgent;

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
  if (risk.reserveState === "safe") {
    return {
      urgency: "Continue as planned",
      title: "Continue as planned",
      summary: `Projected reserve is ${risk.projectedReservePercent}%, ${risk.reserveGapPercent}% above the ${trip.minimumReservePercent}% policy floor.`,
      reasons: [
        `Delay adds ${trip.delayMinutes} minutes to the seeded trip.`,
        "No fuel stop review is needed for this seeded scenario.",
        "No live station, traffic, or price feed is used."
      ],
      alternatives: [
        "Continue as planned: projected reserve remains above policy.",
        "Optionally review the next pre-approved corridor stop: adds 10 seeded minutes."
      ],
      confidence: "Seeded arithmetic only; not a live corridor prediction."
    };
  }

  const urgency = risk.reserveState === "urgent" ? "Fuel stop review required" : "Fuel stop review recommended";

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
      "Review a different approved stop: driver confirmation is required before changing the plan."
    ],
    confidence: "Seeded arithmetic only; not a live corridor prediction."
  };
}

export function createFallbackReport(trip, risk = calculateRisk(trip), recommendation = createRecommendation(trip, risk)) {
  return [
    `Trip exception draft - ${trip.id}`,
    `${trip.driver} is delivering ${trip.cargo} to ${trip.destination}.`,
    `A ${trip.delayMinutes}-minute delay changes projected fuel reserve to ${risk.projectedReservePercent}% (policy floor: ${trip.minimumReservePercent}%).`,
    `Recommended review action: stop at ${trip.stop.name}, ${trip.stop.distanceKm} km away, with a planned ${trip.stop.detourMinutes}-minute detour.`,
    `Selection basis: pre-approved planned-corridor stop.`,
    `Alternatives considered: ${recommendation.alternatives.join(" ")}`,
    `Driver review status: pending confirmation.`,
    `Source: local calculation from the displayed fuel, delay, and carrier policy. No live traffic, weather, station-status, or dispatch data is used.`
  ].join("\n");
}
