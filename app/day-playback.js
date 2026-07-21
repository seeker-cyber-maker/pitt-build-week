import { createPlanningComparison, simulatedPlanningInput } from "./planner.js";

export const deliveryStatusLabels = Object.freeze({
  delivered: "Delivered",
  undelivered: "Undelivered",
  nobody_on_site: "Nobody on site"
});

export const simulatedDayTimeline = Object.freeze([
  Object.freeze({
    kind: "leg",
    time: "09:10",
    title: "Leg 1 · Depot to Lakeside Grocer",
    distanceKm: 21.1,
    delivery: Object.freeze({ status: "delivered", proof: "Recipient barcode scanned" })
  }),
  Object.freeze({
    kind: "event",
    id: "noon-spike",
    time: "11:20",
    title: "Seeded price spike",
    description: "Cedar rises sharply while South Loop remains lower priced.",
    prices: Object.freeze({ "FUEL-1": 2.65, "FUEL-2": 2.29, "FUEL-3": 1.82 })
  }),
  Object.freeze({
    kind: "leg",
    time: "13:35",
    title: "Leg 2 · Lakeside to North Market",
    distanceKm: 27.6,
    delivery: Object.freeze({ status: "nobody_on_site", proof: "Delivery location picture taken" })
  }),
  Object.freeze({
    kind: "event",
    id: "afternoon-drop",
    time: "15:00",
    title: "Seeded price drop",
    description: "Cedar and South Loop both lower their seeded prices.",
    prices: Object.freeze({ "FUEL-1": 1.55, "FUEL-2": 1.59, "FUEL-3": 1.44 })
  }),
  Object.freeze({
    kind: "leg",
    time: "15:35",
    title: "Leg 3 · North Market to Eastside Pharmacy",
    distanceKm: 22.1,
    delivery: Object.freeze({ status: "undelivered", proof: "Access gate closed; no handoff completed" })
  }),
  Object.freeze({
    kind: "leg",
    time: "16:10",
    title: "Leg 4 · Eastside to Riverbend",
    distanceKm: 14.7,
    delivery: Object.freeze({ status: "delivered", proof: "Signature by adult collected" })
  }),
  Object.freeze({
    kind: "leg",
    time: "17:25",
    title: "Leg 5 · Riverbend to West Dock",
    distanceKm: 21.9,
    delivery: Object.freeze({ status: "delivered", proof: "Delivery location picture taken after leave-at-door" })
  })
]);

function withSeededPrices(prices) {
  return {
    ...simulatedPlanningInput,
    stations: simulatedPlanningInput.stations.map((station) => ({
      ...station,
      pricePerLitreCad: prices[station.id] ?? station.pricePerLitreCad
    }))
  };
}

export function evaluatePriceEvent(eventId) {
  const event = simulatedDayTimeline.find((item) => item.kind === "event" && item.id === eventId);
  if (!event) throw new Error(`Unknown simulated price event: ${eventId}`);

  const baseline = createPlanningComparison();
  const recalculated = createPlanningComparison(withSeededPrices(event.prices));
  const baselineStation = baseline.recommended.refuel.at;
  const recalculatedStation = recalculated.recommended.refuel.at;

  return {
    event,
    baseline,
    recalculated,
    routeChanged: baselineStation.id !== recalculatedStation.id,
    baselineStation,
    recalculatedStation
  };
}

export function evaluateAdditionalRefuel(eventId, currentFuelPercent) {
  const evaluation = evaluatePriceEvent(eventId);
  const selected = evaluation.recalculated.recommended.refuel;
  const candidates = [{ station: selected.at, detourCostCad: selected.detourCostCad }, ...selected.alternatives];
  const cheapestPump = [...candidates].sort((left, right) => left.station.pricePerLitreCad - right.station.pricePerLitreCad)[0];
  const vehicle = simulatedPlanningInput.vehicle;
  const topUpLitres = Math.max(0, ((vehicle.refuelToPercent - currentFuelPercent) / 100) * vehicle.tankLitres);
  const pumpSavingsCad = Math.max(0, (selected.at.pricePerLitreCad - cheapestPump.station.pricePerLitreCad) * topUpLitres);
  const detourCostCad = cheapestPump.detourCostCad;

  return {
    ...evaluation,
    currentFuelPercent,
    topUpLitres,
    cheapestPump,
    pumpSavingsCad,
    detourCostCad,
    netBenefitCad: pumpSavingsCad - detourCostCad,
    worthwhile: pumpSavingsCad > detourCostCad
  };
}

export function summarizeDeliveryProgress(timelineIndex) {
  const completedLegs = simulatedDayTimeline
    .slice(0, timelineIndex + 1)
    .filter((item) => item.kind === "leg");
  const counts = Object.fromEntries(Object.keys(deliveryStatusLabels).map((key) => [key, 0]));

  for (const leg of completedLegs) counts[leg.delivery.status] += 1;

  return {
    completedLegs,
    completedDistanceKm: completedLegs.reduce((total, leg) => total + leg.distanceKm, 0),
    counts,
    complete: completedLegs.length === simulatedDayTimeline.filter((item) => item.kind === "leg").length
  };
}
