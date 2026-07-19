import { calculateRisk, createFallbackReport, createRecommendation, demoTrip } from "./scenario.js";
import { createPlanningComparison, deliveryWindowLabels } from "./planner.js";

const trip = demoTrip;
const risk = calculateRisk(trip);
const recommendation = createRecommendation(trip, risk);
const planning = createPlanningComparison();

const state = {
  activeStep: 1,
  highestUnlockedStep: 1,
  reviewed: false,
  confirmed: false,
  mapMode: "recommended"
};

const formatMinutes = (minutes) => `${minutes} min`;

function render() {
  document.querySelectorAll("[data-step]").forEach((section) => {
    section.hidden = Number(section.dataset.step) !== state.activeStep;
  });

  document.querySelectorAll("[data-progress]").forEach((dot) => {
    const step = Number(dot.dataset.progress);
    dot.classList.toggle("is-active", step === state.activeStep);
    dot.classList.toggle("is-complete", step < state.activeStep);
    dot.disabled = step > state.highestUnlockedStep;
    dot.setAttribute("aria-current", step === state.activeStep ? "step" : "false");
  });

  document.querySelector("#review-button").disabled = !state.reviewed;
  document.querySelector("#confirm-button").disabled = !state.reviewed;
  document.querySelector("#review-toggle").checked = state.reviewed;
  document.querySelector("#confirmed-state").hidden = !state.confirmed;
  document.querySelectorAll("[data-map-mode]").forEach((button) => {
    const selected = button.dataset.mapMode === state.mapMode;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  renderMap();
}

function goTo(step) {
  if (step > state.highestUnlockedStep) return;
  state.activeStep = step;
  render();
  document.querySelector("main").scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelector("#trip-id").textContent = trip.id;
document.querySelector("#driver").textContent = trip.driver;
document.querySelector("#cargo").textContent = trip.cargo;
document.querySelector("#destination").textContent = trip.destination;
document.querySelector("#route").textContent = trip.plannedCorridor;
document.querySelector("#departure").textContent = trip.departure;
document.querySelector("#planned-arrival").textContent = trip.plannedArrival;
document.querySelector("#fuel-now").textContent = `${trip.fuelPercent}%`;
document.querySelector("#reserve-floor").textContent = `${trip.minimumReservePercent}%`;
document.querySelector("#delay").textContent = formatMinutes(trip.delayMinutes);
document.querySelector("#projected-reserve").textContent = `${risk.projectedReservePercent}%`;
document.querySelector("#reserve-gap").textContent = `${Math.abs(risk.reserveGapPercent)}% below policy floor (gap: ${risk.reserveGapPercent}%)`;
document.querySelector("#stop-name").textContent = trip.stop.name;
document.querySelector("#stop-detail").textContent = `${trip.stop.distanceKm} km away · ${trip.stop.detourMinutes}-minute detour`;
document.querySelector("#recommendation-summary").textContent = recommendation.summary;
document.querySelector("#report-draft").textContent = createFallbackReport(trip, risk, recommendation);

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function formatKm(value) {
  return `${value.toFixed(1)} simulated km`;
}

function formatCad(value) {
  return `$${value.toFixed(2)} CAD`;
}

function routePoints(plan) {
  const firstLeg = plan.steps.find((step) => step.from);
  if (!firstLeg) return [];
  return [firstLeg.from, ...plan.steps.filter((step) => step.to).map((step) => step.to)];
}

function renderPlanning() {
  const { recommended, rejected, distanceSavedKm, fuelReserveImprovementPercent } = planning;
  const nextDelivery = recommended.steps.find((step) => step.type === "delivery" && recommended.refuel && step.from.id === recommended.refuel.at.id)?.to;
  const lowerPriceAlternative = recommended.refuel.alternatives.find(({ station }) => station.pricePerLitreCad < recommended.refuel.at.pricePerLitreCad);
  document.querySelector("#planning-summary").innerHTML = [
    ["Priority order", recommended.deliveries.map((delivery) => deliveryWindowLabels[delivery.window]).join(" → ")],
    ["Planned refuel", `${recommended.refuel.at.name} at $${recommended.refuel.at.pricePerLitreCad.toFixed(3)}/L · ${formatCad(recommended.refuel.estimatedPlanCostCad)} total`],
    ["Price tradeoff", lowerPriceAlternative ? `${lowerPriceAlternative.station.name} is cheaper per litre, but its simulated detour costs more.` : `Selected from reachable simulated stations before ${nextDelivery?.name ?? "the next delivery"}.`],
    ["Loop avoided", `${distanceSavedKm.toFixed(1)} simulated km and ${Math.round(fuelReserveImprovementPercent)} percentage points more ending reserve`]
  ].map(([label, value]) => `<div class="planning-metric"><span>${label}</span><strong>${value}</strong></div>`).join("");

  document.querySelector("#delivery-list").innerHTML = recommended.deliveries.map((delivery, index) => `
    <div class="delivery-row">
      <span class="delivery-order">${index + 1}</span>
      <div><strong>${delivery.name}</strong><small>${delivery.id}</small></div>
      <span class="delivery-window window-${delivery.window}">${deliveryWindowLabels[delivery.window]}</span>
    </div>
  `).join("");

  document.querySelector("#map-plan-caption").textContent = "Choose a seeded route to inspect its local fuel and ordering outcome.";
  renderMap();
}

function renderMap() {
  const activePlan = planning[state.mapMode];
  const recommendedPoints = routePoints(planning.recommended);
  const rejectedPoints = routePoints(planning.rejected);
  const activePoints = routePoints(activePlan);
  const polyline = (points) => points.map((point) => `${point.x},${point.y}`).join(" ");
  const allNodes = [planning.input.origin, ...planning.input.deliveries, ...planning.input.stations];
  const activeDescription = state.mapMode === "recommended"
    ? `${formatKm(activePlan.distanceKm)}. Refuel at ${activePlan.refuel.at.name} for $${activePlan.refuel.at.pricePerLitreCad.toFixed(3)}/L; ${formatCad(activePlan.refuel.estimatedPlanCostCad)} simulated refill-and-detour cost; ending reserve ${formatPercent(activePlan.endingFuelPercent)}.`
    : `${formatKm(activePlan.distanceKm)}. No planned refuel; ending reserve ${formatPercent(activePlan.endingFuelPercent)}. ${activePlan.reasons.join(" ")}`;

  document.querySelector("#map-canvas").innerHTML = `
    <svg viewBox="0 0 860 500" role="img" aria-label="${activePlan.label}: ${activeDescription}">
      <title>${activePlan.label}</title>
      <desc>${activeDescription}</desc>
      <g class="map-grid">
        ${Array.from({ length: 8 }, (_, index) => `<line x1="${80 + index * 100}" y1="55" x2="${80 + index * 100}" y2="455" />`).join("")}
        ${Array.from({ length: 4 }, (_, index) => `<line x1="55" y1="${100 + index * 100}" x2="805" y2="${100 + index * 100}" />`).join("")}
      </g>
      <polyline class="route-line route-rejected ${state.mapMode === "rejected" ? "is-emphasized" : ""}" points="${polyline(rejectedPoints)}" />
      <polyline class="route-line route-recommended ${state.mapMode === "recommended" ? "is-emphasized" : ""}" points="${polyline(recommendedPoints)}" />
      <polyline class="route-line route-active" points="${polyline(activePoints)}" />
      ${allNodes.map((node) => {
        const isOrigin = node.kind === "origin";
        const isStation = node.kind === "station";
        const label = isOrigin ? "Depot" : node.name;
        const labelOnLeft = node.x > 610;
        return `<g class="map-node ${isOrigin ? "node-origin" : isStation ? "node-station" : "node-delivery"}">
          <circle cx="${node.x}" cy="${node.y}" r="${isOrigin ? 11 : isStation ? 9 : 8}" />
          ${isStation ? "" : `<text x="${node.x + (labelOnLeft ? -14 : 14)}" y="${node.y - 12}" text-anchor="${labelOnLeft ? "end" : "start"}">${label}</text>`}
        </g>`;
      }).join("")}
      ${activePlan.deliveries.map((delivery, index) => `<text class="route-number" x="${delivery.x - 4}" y="${delivery.y + 5}">${index + 1}</text>`).join("")}
    </svg>
    <div class="map-result ${state.mapMode === "recommended" ? "is-good" : "is-rejected"}"><strong>${activePlan.label}</strong><span>${activeDescription}</span></div>
  `;
}

renderPlanning();

document.querySelector("#begin-button").addEventListener("click", () => {
  state.highestUnlockedStep = Math.max(state.highestUnlockedStep, 2);
  goTo(2);
});
document.querySelector("#review-toggle").addEventListener("change", (event) => {
  state.reviewed = event.target.checked;
  render();
});
document.querySelector("#review-button").addEventListener("click", () => {
  state.highestUnlockedStep = Math.max(state.highestUnlockedStep, 3);
  goTo(3);
});
document.querySelector("#confirm-button").addEventListener("click", () => {
  state.confirmed = true;
  render();
});
document.querySelectorAll("[data-map-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    state.mapMode = button.dataset.mapMode;
    render();
  });
});
document.querySelector("#rebuild-plan-button").addEventListener("click", () => {
  state.mapMode = "recommended";
  render();
});
document.querySelectorAll("[data-go-to]").forEach((button) => {
  button.addEventListener("click", () => goTo(Number(button.dataset.goTo)));
});

render();
