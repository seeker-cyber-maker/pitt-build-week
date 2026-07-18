import { calculateRisk, createFallbackReport, createRecommendation, demoTrip } from "./scenario.js";

const trip = demoTrip;
const risk = calculateRisk(trip);
const recommendation = createRecommendation(trip, risk);

const state = {
  activeStep: 1,
  reviewed: false,
  confirmed: false
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
  });

  document.querySelector("#review-button").disabled = !state.reviewed;
  document.querySelector("#confirm-button").disabled = !state.reviewed;
  document.querySelector("#driver-review").checked = state.reviewed;
  document.querySelector("#confirmed-state").hidden = !state.confirmed;
}

function goTo(step) {
  state.activeStep = step;
  render();
  document.querySelector("main").scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelector("#trip-id").textContent = trip.id;
document.querySelector("#driver").textContent = trip.driver;
document.querySelector("#cargo").textContent = trip.cargo;
document.querySelector("#destination").textContent = trip.destination;
document.querySelector("#route").textContent = trip.route;
document.querySelector("#departure").textContent = trip.departure;
document.querySelector("#planned-arrival").textContent = trip.plannedArrival;
document.querySelector("#fuel-now").textContent = `${trip.fuelPercent}%`;
document.querySelector("#reserve-floor").textContent = `${trip.minimumReservePercent}%`;
document.querySelector("#delay").textContent = formatMinutes(trip.delayMinutes);
document.querySelector("#projected-reserve").textContent = `${risk.projectedReservePercent}%`;
document.querySelector("#reserve-gap").textContent = `${Math.abs(risk.reserveGapPercent)}% below floor`;
document.querySelector("#stop-name").textContent = trip.stop.name;
document.querySelector("#stop-detail").textContent = `${trip.stop.distanceKm} km away · ${trip.stop.detourMinutes}-minute detour`;
document.querySelector("#recommendation-summary").textContent = recommendation.summary;
document.querySelector("#report-draft").textContent = createFallbackReport(trip, risk, recommendation);

document.querySelector("#begin-button").addEventListener("click", () => goTo(2));
document.querySelector("#review-toggle").addEventListener("change", (event) => {
  state.reviewed = event.target.checked;
  render();
});
document.querySelector("#review-button").addEventListener("click", () => goTo(3));
document.querySelector("#confirm-button").addEventListener("click", () => {
  state.confirmed = true;
  render();
});
document.querySelectorAll("[data-go-to]").forEach((button) => {
  button.addEventListener("click", () => goTo(Number(button.dataset.goTo)));
});

render();
