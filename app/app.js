import { calculateRisk, createFallbackReport, createRecommendation, demoTrip } from "./scenario.js";
import { createPlanningComparison, deliveryWindowLabels } from "./planner.js";
import { deliveryStatusLabels, evaluatePriceEvent, simulatedDayTimeline, summarizeDeliveryProgress } from "./day-playback.js";

const trip = demoTrip;
const risk = calculateRisk(trip);
const recommendation = createRecommendation(trip, risk);
let planning = createPlanningComparison();

const state = {
  activeStep: 1,
  highestUnlockedStep: 1,
  reviewed: false,
  confirmed: false,
  mapMode: "recommended",
  rebuildCount: 0,
  dayIndex: -1,
  eventChoices: {},
  displayUnit: "metric",
  displayCurrency: "CAD",
  routeClosed: false,
  routeCloseReason: null
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

  document.querySelector("#review-button").disabled = !state.routeClosed || !state.reviewed;
  document.querySelector("#confirm-button").disabled = !state.reviewed;
  document.querySelector("#review-toggle").checked = state.reviewed;
  document.querySelector("#confirmed-state").hidden = !state.confirmed;
  const rebuildStatus = document.querySelector("#plan-rebuild-status");
  rebuildStatus.hidden = state.rebuildCount === 0;
  rebuildStatus.textContent = state.rebuildCount === 0
    ? ""
    : `Local plan rebuilt from the same seeded inputs. Result unchanged by design. Run ${state.rebuildCount}.`;
  document.querySelector("#rebuild-plan-button").textContent = state.rebuildCount === 0
    ? "Rebuild local plan"
    : `Local plan rebuilt · run ${state.rebuildCount}`;
  document.querySelectorAll("[data-map-mode]").forEach((button) => {
    const selected = button.dataset.mapMode === state.mapMode;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  renderMap();
  renderDayPlayback();
  renderDeliveryReportSummary();
  renderMachineHandoff();
  renderDisplayControls();
  renderTripDetails();
  renderTripWatchContext();
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
document.querySelector("#recommendation-summary").textContent = recommendation.summary;

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function formatDistance(value) {
  if (state.displayUnit === "imperial") return `${(value / 1.609344).toFixed(1)} simulated mi`;
  return `${value.toFixed(1)} simulated km`;
}

function formatFuelVolume(value) {
  if (state.displayUnit === "imperial") return `${(value / 3.78541).toFixed(1)} US gal`;
  return `${value.toFixed(1)} L`;
}

function formatMoney(value) {
  return `$${value.toFixed(2)} ${state.displayCurrency}`;
}

function formatFuelPrice(value) {
  if (state.displayUnit === "imperial") return `$${(value * 3.78541).toFixed(3)}/US gal ${state.displayCurrency}`;
  return `$${value.toFixed(3)}/L ${state.displayCurrency}`;
}

function renderDisplayControls() {
  document.querySelectorAll("[data-display-unit]").forEach((button) => {
    const selected = button.dataset.displayUnit === state.displayUnit;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document.querySelectorAll("[data-display-currency]").forEach((button) => {
    const selected = button.dataset.displayCurrency === state.displayCurrency;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document.querySelector("#display-basis").textContent = state.displayUnit === "imperial"
    ? `Distance and volume are shown in imperial units. ${state.displayCurrency} is a seeded local-money label; no exchange rate is applied.`
    : `Distance and volume are shown in metric units. ${state.displayCurrency} is a seeded local-money label; no exchange rate is applied.`;
}

function renderTripDetails() {
  document.querySelector("#stop-detail").textContent = `${formatDistance(trip.stop.distanceKm)} away · ${trip.stop.detourMinutes}-minute detour`;
  document.querySelector("#report-draft").textContent = createFallbackReport(trip, risk, recommendation)
    .replace(`${trip.stop.distanceKm} km`, state.displayUnit === "imperial" ? `${(trip.stop.distanceKm / 1.609344).toFixed(1)} mi` : `${trip.stop.distanceKm} km`);
}

function renderTripWatchContext() {
  const summary = summarizeDeliveryProgress(state.dayIndex);
  const currentItem = state.dayIndex >= 0 ? simulatedDayTimeline[state.dayIndex] : null;
  const heading = document.querySelector("#trip-watch-heading");
  const context = document.querySelector("#trip-watch-context");
  const status = document.querySelector("#trip-watch-status");
  const beginButton = document.querySelector("#begin-button");

  if (state.routeClosed) {
    const completedNormally = state.routeCloseReason === "completed";
    heading.textContent = completedNormally ? "Trip Watch route completed" : "Trip Watch route closed early";
    context.textContent = `${summary.completedLegs.length} of 5 simulated delivery legs recorded. Continue to driver review and generate the report from this same Trip Watch state.`;
    status.textContent = completedNormally ? "Route completed" : "Closed early";
    status.className = "status status-safe";
    beginButton.disabled = false;
    beginButton.textContent = completedNormally ? "Review completed route →" : "Review closed route →";
    return;
  }

  heading.textContent = currentItem ? `Trip Watch: ${currentItem.title}` : "Route has not started";
  context.textContent = currentItem
    ? `${summary.completedLegs.length} of 5 simulated delivery legs recorded. Close the route early to begin review, or continue Trip Watch until it closes automatically.`
    : "Start the simulated day in Trip Watch. Review and report generation stay locked until the route is closed.";
  status.textContent = currentItem ? "Route in progress" : "Awaiting trip";
  status.className = "status status-draft";
  beginButton.disabled = true;
  beginButton.textContent = "Close route in Trip Watch to review";
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
    ["Planned refuel", `${recommended.refuel.at.name} at ${formatFuelPrice(recommended.refuel.at.pricePerLitreCad)} · ${formatMoney(recommended.refuel.estimatedPlanCostCad)} total · ${formatFuelVolume(recommended.refuel.refillLitres)}`],
    ["Price tradeoff", lowerPriceAlternative ? `${lowerPriceAlternative.station.name} is cheaper per litre, but its simulated detour costs more.` : `Selected from reachable simulated stations before ${nextDelivery?.name ?? "the next delivery"}.`],
    ["Loop avoided", `${formatDistance(distanceSavedKm)} and ${Math.round(fuelReserveImprovementPercent)} percentage points more ending reserve`]
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

function renderDayPlayback() {
  const currentItem = state.dayIndex >= 0 ? simulatedDayTimeline[state.dayIndex] : null;
  const hasUnresolvedEvent = currentItem?.kind === "event" && !state.eventChoices[currentItem.id];
  const nextItem = simulatedDayTimeline[state.dayIndex + 1];
  const timeline = document.querySelector("#day-timeline");
  const advanceButton = document.querySelector("#day-advance-button");
  const choice = document.querySelector("#event-choice");
  const decision = document.querySelector("#day-decision");

  timeline.innerHTML = simulatedDayTimeline.map((item, index) => {
    const complete = index < state.dayIndex;
    const current = index === state.dayIndex;
    const detail = item.kind === "event"
      ? item.description
      : `${formatDistance(item.distanceKm)} · ${deliveryStatusLabels[item.delivery.status]} · ${item.delivery.proof}`;
    return `<div class="day-row ${complete ? "is-complete" : ""} ${current ? "is-current" : ""}">
      <time>${item.time}</time><div><strong>${item.title}</strong><small>${detail}</small></div>
    </div>`;
  }).join("");

  if (!currentItem) {
    document.querySelector("#day-current-time").textContent = "Before departure";
    document.querySelector("#day-current-title").textContent = "Ready to start the simulated day";
    document.querySelector("#day-current-detail").textContent = "Advance through five seeded delivery legs. Two price events pause for a driver choice.";
  } else if (currentItem.kind === "event") {
    const evaluation = evaluatePriceEvent(currentItem.id);
    const currentStation = planning.recommended.refuel.at;
    const recalculatedStation = evaluation.recalculatedStation;
    const routeWouldChange = currentStation.id !== recalculatedStation.id;
    document.querySelector("#day-current-time").textContent = currentItem.time;
    document.querySelector("#day-current-title").textContent = currentItem.title;
    document.querySelector("#day-current-detail").textContent = currentItem.description;
    document.querySelector("#impact-analysis").textContent = routeWouldChange
      ? `Impact analysis: recalculating moves the planned refuel from ${currentStation.name} to ${recalculatedStation.name}, changing the simulated refill-and-detour cost from ${formatMoney(planning.recommended.refuel.estimatedPlanCostCad)} to ${formatMoney(evaluation.recalculated.recommended.refuel.estimatedPlanCostCad)}.`
      : `Impact analysis: recalculation keeps ${recalculatedStation.name} as the lowest simulated refill-and-detour cost at ${formatMoney(evaluation.recalculated.recommended.refuel.estimatedPlanCostCad)}.`;
  } else {
    document.querySelector("#day-current-time").textContent = currentItem.time;
    document.querySelector("#day-current-title").textContent = currentItem.title;
    document.querySelector("#day-current-detail").textContent = `${formatDistance(currentItem.distanceKm)} completed. Delivery status: ${deliveryStatusLabels[currentItem.delivery.status]}. ${currentItem.delivery.proof}.`;
  }

  choice.hidden = !hasUnresolvedEvent;
  const eventChoice = currentItem?.kind === "event" ? state.eventChoices[currentItem.id] : null;
  decision.hidden = !eventChoice;
  if (eventChoice) {
    decision.textContent = eventChoice === "recalculate"
      ? `Route recalculated from the seeded ${currentItem.time} fuel prices. The planning panel now reflects the selected stop.`
      : "Route kept. The recalculated alternative remains visible in the impact analysis.";
  }

  advanceButton.disabled = !nextItem || hasUnresolvedEvent;
  advanceButton.textContent = !nextItem
    ? "Simulated day complete"
    : hasUnresolvedEvent
      ? "Choose an event response"
      : state.dayIndex < 0
        ? "Start simulated day"
        : `Advance to ${nextItem.title}`;

  const closeEarlyButton = document.querySelector("#close-route-early-button");
  closeEarlyButton.hidden = state.dayIndex < 0 || state.routeClosed;
  closeEarlyButton.disabled = hasUnresolvedEvent;
}

function renderDeliveryReportSummary() {
  const summary = summarizeDeliveryProgress(state.dayIndex);
  const destination = document.querySelector("#delivery-report-summary");
  if (summary.completedLegs.length === 0) {
    destination.innerHTML = "<strong>Delivery outcomes</strong><br>Seeded day playback has not produced a delivery outcome yet.";
    return;
  }

  const rows = summary.completedLegs.map((leg) => `<li><strong>${leg.title}</strong><br>${deliveryStatusLabels[leg.delivery.status]} · ${leg.delivery.proof}</li>`).join("");
  destination.innerHTML = `<strong>Delivery outcomes</strong><br>${summary.completedLegs.length} of 5 simulated delivery legs · ${formatDistance(summary.completedDistanceKm)}<br>Delivered ${summary.counts.delivered} · Undelivered ${summary.counts.undelivered} · Nobody on site ${summary.counts.nobody_on_site}<ul>${rows}</ul>`;
}

function machineToken(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function machineDistance(value) {
  return state.displayUnit === "imperial" ? value / 1.609344 : value;
}

function machineFuelPrice(value) {
  return state.displayUnit === "imperial" ? value * 3.78541 : value;
}

function createMachineHandoff() {
  const summary = summarizeDeliveryProgress(state.dayIndex);
  const refuel = planning.recommended.refuel;
  const distanceUnit = state.displayUnit === "imperial" ? "mi" : "km";
  const volumeUnit = state.displayUnit === "imperial" ? "us_gal" : "litre";
  const legs = summary.completedLegs.map((leg) => `    { id = "${machineToken(leg.title)}", status = "${leg.delivery.status}", proof = "${machineToken(leg.delivery.proof)}" },`);
  return [
    "return {",
    "  schema = \"pitt.trip_handoff.v1\",",
    "  mode = \"seeded_local_demo\",",
    `  trip_id = \"${trip.id}\",`,
    `  review_state = \"${state.confirmed ? "confirmed_local_only" : "driver_review_required"}\",`,
    "  external_action = false,",
    `  units = { distance = \"${distanceUnit}\", volume = \"${volumeUnit}\", money = \"${state.displayCurrency}\", money_basis = \"seeded_local_no_conversion\" },`,
    `  refuel = { station = \"${refuel.at.id}\", price = ${machineFuelPrice(refuel.at.pricePerLitreCad).toFixed(3)}, price_unit = \"${state.displayCurrency}_per_${volumeUnit}\", estimated_cost = ${refuel.estimatedPlanCostCad.toFixed(2)} },`,
    `  route = { distance = ${machineDistance(planning.recommended.distanceKm).toFixed(1)}, completed_legs = ${summary.completedLegs.length}, completed_distance = ${machineDistance(summary.completedDistanceKm).toFixed(1)} },`,
    "  delivery_legs = {",
    ...legs,
    "  },",
    `  next_action = \"${state.confirmed ? "await_approved_downstream_workflow" : "obtain_driver_review"}\"`,
    "}"
  ].join("\n");
}

function renderMachineHandoff() {
  document.querySelector("#machine-handoff-output").textContent = createMachineHandoff();
}

function renderMap() {
  const activePlan = planning[state.mapMode];
  const recommendedPoints = routePoints(planning.recommended);
  const rejectedPoints = routePoints(planning.rejected);
  const activePoints = routePoints(activePlan);
  const polyline = (points) => points.map((point) => `${point.x},${point.y}`).join(" ");
  const allNodes = [planning.input.origin, ...planning.input.deliveries, ...planning.input.stations];
  const activeDescription = state.mapMode === "recommended"
    ? `${formatDistance(activePlan.distanceKm)}. Refuel at ${activePlan.refuel.at.name} for ${formatFuelPrice(activePlan.refuel.at.pricePerLitreCad)}; ${formatMoney(activePlan.refuel.estimatedPlanCostCad)} simulated refill-and-detour cost; ending reserve ${formatPercent(activePlan.endingFuelPercent)}.`
    : `${formatDistance(activePlan.distanceKm)}. No planned refuel; ending reserve ${formatPercent(activePlan.endingFuelPercent)}. ${activePlan.reasons.join(" ")}`;

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
  if (!state.routeClosed) return;
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
document.querySelector("#copy-machine-handoff").addEventListener("click", async () => {
  const status = document.querySelector("#machine-copy-status");
  try {
    await navigator.clipboard.writeText(document.querySelector("#machine-handoff-output").textContent);
    status.textContent = "Machine handoff copied. No external workflow was started.";
  } catch {
    status.textContent = "Copy permission was unavailable; select the local handoff text instead.";
  }
  status.hidden = false;
});
document.querySelectorAll("[data-map-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    state.mapMode = button.dataset.mapMode;
    render();
  });
});
document.querySelectorAll("[data-display-unit]").forEach((button) => {
  button.addEventListener("click", () => {
    state.displayUnit = button.dataset.displayUnit;
    renderPlanning();
    render();
  });
});
document.querySelectorAll("[data-display-currency]").forEach((button) => {
  button.addEventListener("click", () => {
    state.displayCurrency = button.dataset.displayCurrency;
    renderPlanning();
    render();
  });
});
document.querySelector("#rebuild-plan-button").addEventListener("click", () => {
  planning = createPlanningComparison();
  state.rebuildCount += 1;
  state.mapMode = "recommended";
  renderPlanning();
  render();
});
document.querySelector("#day-advance-button").addEventListener("click", () => {
  if (state.dayIndex + 1 >= simulatedDayTimeline.length) return;
  state.dayIndex += 1;
  if (state.dayIndex === simulatedDayTimeline.length - 1) {
    state.routeClosed = true;
    state.routeCloseReason = "completed";
    state.highestUnlockedStep = Math.max(state.highestUnlockedStep, 2);
  }
  render();
});
document.querySelector("#close-route-early-button").addEventListener("click", () => {
  if (state.dayIndex < 0 || state.routeClosed) return;
  state.routeClosed = true;
  state.routeCloseReason = "early";
  state.highestUnlockedStep = Math.max(state.highestUnlockedStep, 2);
  render();
  goTo(2);
});
document.querySelector("#recalculate-route-button").addEventListener("click", () => {
  const currentItem = simulatedDayTimeline[state.dayIndex];
  if (!currentItem || currentItem.kind !== "event") return;
  const evaluation = evaluatePriceEvent(currentItem.id);
  planning = evaluation.recalculated;
  state.eventChoices[currentItem.id] = "recalculate";
  state.mapMode = "recommended";
  renderPlanning();
  render();
});
document.querySelector("#keep-route-button").addEventListener("click", () => {
  const currentItem = simulatedDayTimeline[state.dayIndex];
  if (!currentItem || currentItem.kind !== "event") return;
  state.eventChoices[currentItem.id] = "keep";
  render();
});
document.querySelectorAll("[data-go-to]").forEach((button) => {
  button.addEventListener("click", () => goTo(Number(button.dataset.goTo)));
});

render();
