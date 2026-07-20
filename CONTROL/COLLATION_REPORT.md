# PITT Collaboration Report

Generated locally from `HANDOFFS/*.md`. This report does not validate code or merge branches.

## Status Summary

| Harness | Status |
| --- | --- |
| Codex | ** current correction verified locally; ready to publish |
| Patrick | ** complete |
| Research | ** complete |

---

# Harness Handoff: Codex

- **Status:** current correction verified locally; ready to publish
- **Lane:** Integration
- **Branch/worktree:** `harness/codex-integration`
- **Started:** 2026-07-18

## Changed Or Investigated

- Established collaboration control files, product boundary, handoff template, and collation utility.
- Added a dependency-free local demo shell under `app/` with a three-stage trip, recommendation, and report-review flow.
- Added deterministic scenario functions in `app/scenario.js` and focused Node tests in `tests/scenario.test.mjs`.
- Added `package.json` commands for local testing and serving.
- Defined the shared report boundary in `CONTROL/CONTRACTS/REPORT_DRAFT_V1.md` with bounded seeded input and deterministic fallback output fixtures.
- Updated Patrick's lane prompt to require contract validation, exact preservation of deterministic facts, and zero provider calls for the local seeded fixture.
- Merged Patrick's AI/report implementation, routing-contract review, and seeded-scenario validation.
- Added canonical safe and tight report input/output fixtures alongside the urgent fixture; all three match the deterministic report generator exactly.
- Corrected the fallback narrative so below-floor, at-floor, and above-floor reserves use accurate language and a safe scenario does not invent a zero-distance stop.
- Added all three reserve states to `app/scenario.js`; the visible demo remains intentionally pinned to the urgent scenario.
- Added `app/planner.js`: a separate deterministic planning preview with a local delivery ledger, declared time-window ordering, reachable simulated refuel selection, and a recommended-versus-rejected route comparison. The map is explicitly made up and cannot be mistaken for live routing.
- Added `tests/planner.test.mjs` plus UI contract coverage for the visible planning boundary and time-window labels.
- Made refuel selection price-aware using only seeded CAD-per-litre values plus a simulated detour-cost rule. The UI makes the cheaper-per-litre-but-longer alternative explicit without implying a live fuel-price feed.
- Added a driver-controlled seeded day playback: five delivery legs, a noon price spike, a 3 PM price drop, explicit keep-or-recalculate choices, and a final delivery-outcome summary. The price events modify only the local planning preview and retain the no-live-data boundary.
- Added display-only metric/imperial and CAD/USD local-money controls. Distances and fuel volumes convert between physical units; currency values keep their seeded local numeric value and only change label, with an explicit no-exchange-rate disclosure.
- Added a compact `pitt.trip_handoff.v1` Lua-table machine handoff to the final report. It includes route, refuel, completed leg data, units, and review state; the copy action remains local and the payload explicitly records `external_action = false`.
- Diagnosed a public toggle failure as stale GitHub Pages module caching: newer HTML had controls while an older `app.js` lacked their listeners. The module now uses a versioned query string; the deployed controls were clicked and verified live.
- Made Trip Watch authoritative for the report gate: review opens only after an early route closure or normal route completion.
- An early route closure now preserves recorded delivery results and marks each remaining delivery as `Undelivered` with `Route closed early before delivery attempt`; the report and Lua handoff share that disposition.
- Added a driver-owned live fuel simulation to Trip Watch. Each completed leg updates the displayed fuel state; the planned refuel visibly moves fuel through approach, refill, and onward delivery; the driver can instead continue without refuelling, cross the reserve floor, reach a simulated empty tank, and then close the route early.
- Added predictive traffic analysis as a seeded weekday historical-pattern model. It is evaluated at predicted presence times, changes ETA math and compatible-delivery tie-breaking, and is shown per delivery plus in the local machine handoff. It is explicitly not live traffic.

## Evidence

- **Command or check:** `npm test`
- **Result:** 19/19 Node tests passed: safe, tight, and urgent reserve calculations; planning-order and refuel checks; price-event transitions; delivery-outcome summary; scope-bounded recommendation; and provenance-bearing local fallback report.
- **Command or check:** `python3 -m unittest discover -s tests/ai -p "test_*.py" -v`
- **Result:** 24/24 tests passed, including exact canonical output checks for all three seeded report inputs.
- **Command or check:** Browser walkthrough at `http://127.0.0.1:4173`
- **Result:** Desktop and mobile walkthroughs completed the five-leg playback, chose both price recalculations, and rendered the final delivery-outcome summary alongside the existing trip watch -> driver acknowledgment -> report draft -> confirmation flow. The confirmation visibly states that no external action was taken.
- **Command or check:** Local early-close walkthrough.
- **Result:** Closing after leg 1 produced one recorded `Delivered` outcome and four explicit `Undelivered` outcomes in both the visible report and `pitt.trip_handoff.v1`.
- **Command or check:** Browser walkthrough of the live-fuel branches.
- **Result:** Planned refuel raised the tracked fuel from `18.3%` at the pump to `80.0%`, then `67.9%` after leg 2. Declining it reached `6.2%` after leg 2, then `0.0%` with a `13.7%` simulated deficit after leg 3; further driving was disabled while early closure remained available. The Lua handoff recorded `driver_decision = "continue"` and `status = "empty"`.
- **Command or check:** Browser smoke check of the predictive-traffic planning state.
- **Result:** The ledger showed the local historical-pattern boundary, `36 simulated min` across the planned corridor, final predicted presence `11:26`, and a per-stop `09:05 · historical peak traffic +10 min` reference. No current-traffic claim is made.

## Limits Or Risks

- The present scenario is intentionally local. The planning preview uses invented coordinates, fuel stops, and distances; it is not a live planning engine. The visible exception flow is pinned to the urgent case; safe and tight are canonical fixtures plus tested data states, not yet a visible scenario selector.
- The static browser shell uses its local deterministic fallback. The provider-neutral Python report module is independently validated and remains ready for a later single integration seam.
- No provider endpoint is called. The report is explicitly labeled as a deterministic local fallback.

## Next Small Action

- **Current correction:** published Trip Watch authority and early-close delivery disposition.
- **Acceptance:** deploy the current commit to GitHub Pages and smoke-check that the cache-keyed module is served. Keep the seeded/no-live-data boundary.

---

# Harness Handoff: Patrick

- **Status:** complete
- **Lane:** AI/report boundary
- **Branch/worktree:** `harness/patrick-ai-report`
- **Started:** 2026-07-18
- **Completed:** 2026-07-19

## Delivered

- Implemented `packages/ai/` as a provider-neutral report drafting module aligned with `CONTROL/CONTRACTS/REPORT_DRAFT_V1.md`.
- `ScenarioPayload.from_dict()` accepts `pitt.report-input.v1`; `ReportResult.to_dict()` emits `pitt.report-draft.v1`.
- Added deterministic fallback, provenance labeling, secret-safe configuration, and an optional OpenAI-compatible path that is never called when `outbound_provider_authorized` is false.
- Added `tests/ai/test_report_generator.py` and an example using the canonical seeded fixtures.

## Evidence

- `python3 -m unittest discover -s tests/ai -p "test_*.py" -v`: 21 tests passed on Patrick's branch.
- The seeded input fixture produces the required deterministic fallback fixture exactly.
- Failure paths for missing configuration, unauthorized outbound use, transport errors, timeouts, and malformed responses fall back safely.

## Limits Or Risks

- The provider adapter currently accepts OpenAI-compatible chat completions only.
- The timeout is fixed at 10 seconds and there is no retry; this is intentional for the demo because it fails safely to the deterministic path.
- Do not add a provider key to Git. The seeded demo remains provider-free.

## Integration Boundary

| Consumer | Provided surface | Expected input |
| --- | --- | --- |
| Scenario engine | `ScenarioPayload.from_dict(input_dict)` | `pitt.report-input.v1` mapping |
| UI | `ReportResult.to_dict()` | Reads status, provenance, narrative, review requirement, and deterministic facts |
| Integration | `generate_report(scenario)` | Python import from `packages.ai` |

## Next Small Action

- The integration lane will connect this module at one report seam in the demo shell; it must not leave two competing report generators.
- If assigned the routing review, start a new `harness/patrick-routing-review` branch from `origin/harness/codex-integration` and append the review to this handoff. Do not modify shared contracts directly.

---

## Routing contract review

**Date:** 2026-07-19
**Branch:** `harness/patrick-routing-review`
**Scope:** Human-in-the-loop operational review of `CONTROL/CONTRACTS/ROUTING_CONTRACT_V1.md`. No code, no maps, no providers, no UI changes.
**Basis:** 25+ years cross-border and domestic Canadian/US driving experience, long- and short-distance routes, refrigerated and general cargo.

---

### Operational Review Questions For Patrick

#### 1. What information must a driver see before considering a stop recommendation useful rather than distracting?

**confirmed operational need**
- The **distance to the stop in kilometers** (not miles, not vague "nearby") — drivers think in kilometers on most Canadian routes and expect consistency.
- The **estimated time added** by the detour, not just distance — a 19 km stop on a highway is 12 minutes; a 19 km stop through city streets is 35 minutes. That distinction changes the decision.
- The **selection basis** in plain language — "pre-approved demo stop" is acceptable for Build Week, but in real use the driver needs to know whether the stop is on the planned corridor, carrier-approved, or merely the closest match.
- **One explicit alternative** with a clear consequence — "continue without stopping: projected reserve remains below policy" is exactly right. The driver must see the trade-off, not just the preferred option.

**useful preference**
- Cargo category display — "refrigerated groceries" matters for stop selection (some plazas have reefers, some do not), but it is not a blocker for the demo.
- Fuel type indication — diesel vs. DEF availability matters on long routes, but this is future scope.

**out of Build Week scope**
- Live pump prices, real-time parking availability, or restaurant hours — these require external providers and are not seeded-demo material.

---

#### 2. Which unknowns should block a recommendation versus remain visible limitations?

**confirmed operational need**
- **Missing reserve facts must block the recommendation** — if `reserve_state` is absent or incomplete, the contract must return `validation_failed`, not `degraded_ready`. A stop recommendation without fuel/reserve data is dangerous noise.
- **Missing origin/destination labels should block** — a recommendation without context is useless; the driver cannot evaluate it.

**unknown / needs evidence**
- Missing `weather_context` — should remain a visible limitation. Drivers operate in weather they can see; a system saying "weather unknown" is honest and acceptable.
- Missing `driver_hours_state` — remain a visible limitation. Do not infer HOS compliance from partial data.
- Missing vehicle restrictions (clearance, weight, hazmat) — remain a visible limitation. A seeded demo cannot claim to know bridge limits or truck routes.

**Proposed contract wording:**

> In `pitt.routing-recommendation.v1`, add an explicit `blocking_unknowns` field alongside `assumptions`:
>
> ```
> blocking_unknowns: list[str]  # Missing facts that prevented a full recommendation
> ```
>
> When `reserve_state` or `destination_label` is missing, set `status` to `validation_failed` and list the missing fields in `blocking_unknowns`. When weather, hours, or restrictions are missing, set `status` to `degraded_ready` and list them in `assumptions`.

---

#### 3. What does a genuinely useful offline/degraded recommendation look like in practice?

**confirmed operational need**
- It must state **what still works** — "Reserve calculation is deterministic; the recommended stop is based on the pre-approved corridor."
- It must state **what is missing** — "No live traffic, weather, or station availability data."
- It must give **one actionable fallback** — "If the recommended stop is unreachable, continue to the next pre-approved corridor stop and recalculate reserve manually."

**useful preference**
- A simple visual badge or label: "Offline mode — using seeded scenario only." This is UI territory but the contract should carry a `degraded_mode` string that the UI can display verbatim.

**unknown / needs evidence**
- Whether drivers would trust an offline recommendation more or less than a provider-backed one. Some experienced drivers trust their own judgment over any system; others appreciate confirmation. This needs fleet-specific research.

**Proposed contract wording:**

> In `pitt.routing-recommendation.v1`, `degraded_mode` should be a required string, not just a field name:
>
> ```
> degraded_mode: str  # Human-readable statement of what remains valid when external data is absent
> ```
>
> Example: "This recommendation uses only the seeded corridor and deterministic reserve calculation. Live traffic, weather, and station status are unavailable."

---

#### 4. Which stop-selection factors are stable enough for a future contract, and which are too context-dependent to model yet?

**Stable enough for a future contract**
- **Distance and detour time** — always relevant, always measurable from any map provider.
- **Reserve gap at arrival** — deterministic, scenario-driven, no external dependency.
- **Pre-approved stop list** — carrier-specific, but stable within a fleet's operating territory.
- **Cargo sensitivity** — "refrigerated" vs. "dry" vs. "hazmat" is a stable classification that affects stop suitability.

**Too context-dependent to model yet**
- **Real-time pump availability** — varies hour by hour, requires live provider.
- **Driver meal/rest preferences** — individual, not fleet-level.
- **Customer delivery window constraints** — may be contractual but too variable for a generic contract.
- **Road restrictions by season** — ice roads, spring weight limits, construction zones change constantly.

**out of Build Week scope**
- All context-dependent factors above, plus: live traffic, weather routing, dynamic pricing, ELD integration, dispatch coordination.

**Proposed contract wording:**

> In `pitt.routing-request.v1`, change `vehicle_profile` to a more precise structure:
>
> ```
> vehicle_profile: {
>   class: str           # e.g., "tractor_trailer", "straight_truck", "van"
>   fuel_type: str       # e.g., "diesel", "gasoline", "electric"
>   cargo_sensitivity: str  # e.g., "refrigerated", "dry", "hazmat"
>   declared_restrictions: list[str]  # e.g., ["no_tunnel", "no_bridge_under_4m"]
> }
> ```
>
> This replaces the current broad `vehicle_profile` string with a structure that supports stable classification while keeping unknown restrictions explicit.

---

#### 5. Which terms sound like a helpful assistant rather than navigation, dispatch, or surveillance software?

**Terms that sound helpful**
- "Recommended stop" — implies suggestion, not command.
- "Review option" — emphasizes driver agency.
- "Projected reserve" — honest about uncertainty.
- "Selection basis" — transparent about why this stop was chosen.
- "Assumptions" — frames limitations as context, not failures.

**Terms that sound like navigation/dispatch/surveillance**
- "Route" — implies turn-by-turn guidance. The contract should use "corridor" or "planned path" instead.
- "Safe" or "compliant" — the system cannot claim safety or regulatory compliance without evidence. Use "reviewable" or "within scenario bounds" instead.
- "Dispatch approval" — implies authority the system does not have. Use "carrier pre-approved" or "planned corridor" instead.
- "Monitor" or "track" — surveillance language. Use "record" or "log" if needed, but avoid in the demo.

**Proposed contract wording:**

> In `pitt.routing-recommendation.v1`, replace the field name `rationale` with `context_summary`:
>
> ```
> context_summary: str  # Bounded plain-language explanation of how the recommendation relates to supplied facts
> ```
>
> "Rationale" sounds like the system is justifying an order. "Context summary" sounds like it is helping the driver understand the situation.
>
> Also, add a `tone_guidance` note to the contract:
>
> > All narrative fields must use cooperative phrasing ("we recommend," "please review") rather than imperative phrasing ("you must," "proceed to"). The system is an assistant; the driver is the decision-maker.

---

### Short list of driver-visible information required

| Information | Why it matters | Build Week status |
|---|---|---|
| Distance to stop (km) | Primary decision factor | ✅ In contract |
| Detour time (minutes) | Affects schedule and pay | ✅ In contract |
| Selection basis | Trust and transparency | ✅ In contract |
| One explicit alternative | Informed choice | ✅ In contract |
| Reserve gap at arrival | Safety justification | ✅ In contract |
| Cargo sensitivity | Stop suitability | ⚠️ Under `vehicle_profile`, needs structure |
| Fuel type | Pump availability | ❌ Future scope |
| Live weather/traffic/prices | Contextual accuracy | ❌ Explicitly excluded |

---

### Explicit unknowns that must remain limitations in the Build Week demo

1. **Vehicle restrictions** — The demo cannot claim to know bridge heights, weight limits, or hazmat corridors for the seeded route.
2. **Driver hours of service** — No ELD integration means no HOS validation; remain `unknown`.
3. **Weather impact** — Seeded delay is a fixed value; no live weather means no dynamic adjustment.
4. **Station availability** — The recommended stop is pre-approved by scenario, not verified live.
5. **Real-time traffic** — Detour time is seeded, not adjusted for congestion.
6. **Cargo-specific stop needs** — Refrigerated parking, DEF pumps, scale access are not modeled.

These should all appear in the `limitations` field of any routing output and in the `limitations` field of the linked report output.

---

### Proposed integration changes

All proposals are recorded here for the integration lane to apply or reject. I have not edited shared contracts directly.

1. **Add `blocking_unknowns` field** to `pitt.routing-recommendation.v1` (see Question 2).
2. **Make `degraded_mode` a required human-readable string** (see Question 3).
3. **Restructure `vehicle_profile`** from a string to a structured object with `class`, `fuel_type`, `cargo_sensitivity`, and `declared_restrictions` (see Question 4).
4. **Rename `rationale` to `context_summary`** (see Question 5).
5. **Add `tone_guidance` note** to the contract requiring cooperative phrasing (see Question 5).

---

### Evidence

- Review conducted against `CONTROL/CONTRACTS/ROUTING_CONTRACT_V1.md` (commit `19dda1e`).
- All recommendations grounded in `CONTROL/OPERATIONAL_DESIGN_INPUTS.md` (Patrick's driver profile).
- No code, maps, providers, APIs, or UI elements were added.
- Only `HANDOFFS/Patrick.md` was modified.

---

## Driver demo walkthrough

**Date:** 2026-07-19
**Branch:** `harness/patrick-demo-walkthrough`
**Scope:** Driver-facing usability review of the three-screen local demo. No code or contract edits.
**Method:** Local walkthrough of trip watch, driver review, report draft, and confirmation.

### Accepted integration findings

- Replaced ambiguous reserve wording with an explicit below-policy statement and a signed gap (`-5%`).
- Replaced construction jargon in the stop explanation, report draft, provenance label, and confirmation copy with plain driver-facing language.
- Added selection basis and considered alternatives to the report draft.
- Made forward progress steps visibly unavailable until the corresponding primary action unlocks them.

### Integration note

The walkthrough branch was based on `35b1bef` and therefore predates later scenario coverage. Its findings were reviewed manually rather than merged wholesale, preserving the already-integrated safe/tight/urgent scenario evidence. Integration added a regression check for stale UI selectors after finding the renderer referenced a non-existent checkbox id.

### Retained boundaries

- The demo badge, footer, and local-data limitations remain visible because the submission must not imply live routing, traffic, weather, fuel, or dispatch integration.
- The driver remains the decision-maker; no interaction changes the planned corridor or sends an external action.

### Evidence

- `npm test`: 8/8 passed after integration.
- `python3 -m unittest discover -s tests/ai -p 'test_*.py' -v`: 24/24 passed after integration.
- Browser walkthrough completed all three steps and confirmed the local review without console errors.

---

### Next Small Action

- Integration lane (Codex) reviews these proposals and decides which, if any, to incorporate into `ROUTING_CONTRACT_V1.md`.
- If accepted, the contract version should bump to v2 or the changes should be staged for post-Build Week discussion.
- Validate the three seeded scenarios (safe / tight / urgent) as driver-plausible inputs before the scenario engine and UI lanes build around them.

---

## Seeded scenario validation

**Date:** 2026-07-19
**Scope:** Validate all three seeded demo scenarios (safe, tight, urgent) as driver-plausible inputs before implementation lanes proceed.

### Current state

Only one seeded scenario exists: `PITT-DEMO-017` (urgent). The workboard calls for three states: **safe**, **tight**, and **urgent**. The scenario engine and UI lanes need bounded fixtures to proceed independently.

### Validation of existing scenario: PITT-DEMO-017 (urgent)

| Field | Value | Plausibility assessment |
|---|---|---|
| Driver | "Jordan Lee" | Alias, no PII. Acceptable. |
| Cargo | "refrigerated groceries" | Common category, affects stop choice. Plausible. |
| Route | "A-40 East / local delivery corridor" | A-40 is a real Quebec corridor. "Local delivery corridor" is vague but acceptable for demo. |
| Current fuel | 24% | Plausible mid-trip level for a tractor-trailer with ~1000L tank. |
| Min reserve | 12% | Carrier policy floor. Typical range is 10-15%. Plausible. |
| Projected arrival reserve | 7% | Below policy. Urgent state justified. |
| Delay | 28 min | Traffic incident or inspection delay. Common and plausible. |
| Stop | "Northbound Service Plaza", 19 km, 15 min detour | Highway service plaza at ~19 km is realistic on A-40. 15 min detour for fuel + reefer check is reasonable. |

**Verdict:** `confirmed operational need` — The urgent scenario is driver-plausible. The numbers are internally consistent: 24% - 17% burn = 7% arrival, gap = -5%, which triggers urgent correctly.

### Proposed additional scenarios

I have not added these to `CONTROL/fixtures/` (integration-owned). I propose exact values here for Codex to stage as fixtures.

#### PITT-DEMO-018 — safe

```json
{
  "schema_version": "pitt.report-input.v1",
  "scenario": {"id": "PITT-DEMO-018", "mode": "seeded_demo"},
  "trip": {
    "driver_display_alias": "Samir Patel",
    "cargo_category": "dry goods",
    "destination_label": "Southside Logistics Hub",
    "route_label": "Highway 20 West / express corridor"
  },
  "event": {
    "type": "delay_and_reserve_risk",
    "delay_minutes": 12,
    "source": "seeded local scenario"
  },
  "deterministic_assessment": {
    "calculation_version": "pitt.reserve-risk.v1",
    "current_fuel_percent": 45,
    "projected_arrival_reserve_percent": 18,
    "minimum_reserve_percent": 12,
    "reserve_gap_percent": 6,
    "status": "safe"
  },
  "proposed_decision": {
    "type": "continue_as_planned",
    "stop_label": "None required",
    "distance_km": 0,
    "detour_minutes": 0,
    "selection_basis": "Reserve above policy floor; no stop needed.",
    "alternatives": [
      "Stop proactively at next corridor plaza: adds 10 minutes, unnecessary but available.",
      "Contact dispatch to adjust schedule: not required for safe reserve."
    ],
    "driver_review_required": true
  },
  "data_handling": {
    "provenance": "seeded_local",
    "retention": "session_only",
    "outbound_provider_authorized": false
  }
}
```

**Plausibility:** A 45% tank with 18% projected arrival (12% floor + 6% gap) is comfortable. A 12-minute delay is minor. No stop needed. The alternatives are realistic choices a driver might consider.

---

#### PITT-DEMO-019 — tight

```json
{
  "schema_version": "pitt.report-input.v1",
  "scenario": {"id": "PITT-DEMO-019", "mode": "seeded_demo"},
  "trip": {
    "driver_display_alias": "Aisha Dubois",
    "cargo_category": "refrigerated pharmaceuticals",
    "destination_label": "East End Medical Depot",
    "route_label": "A-10 East / secondary corridor"
  },
  "event": {
    "type": "delay_and_reserve_risk",
    "delay_minutes": 22,
    "source": "seeded local scenario"
  },
  "deterministic_assessment": {
    "calculation_version": "pitt.reserve-risk.v1",
    "current_fuel_percent": 32,
    "projected_arrival_reserve_percent": 11,
    "minimum_reserve_percent": 12,
    "reserve_gap_percent": -1,
    "status": "tight"
  },
  "proposed_decision": {
    "type": "fuel_stop_review",
    "stop_label": "Eastbridge Travel Centre",
    "distance_km": 14,
    "detour_minutes": 12,
    "selection_basis": "pre-approved corridor stop",
    "alternatives": [
      "Continue to destination: reserve will be 11%, 1% below policy. Risky but possible.",
      "Contact dispatch for alternate stop: may add 20+ minutes."
    ],
    "driver_review_required": true
  },
  "data_handling": {
    "provenance": "seeded_local",
    "retention": "session_only",
    "outbound_provider_authorized": false
  }
}
```

**Plausibility:** 32% current fuel with 11% projected arrival is just below the 12% floor. A 22-minute delay pushes it from marginal to tight. The 14 km / 12 min stop is close enough to be attractive. The "continue" alternative is genuinely risky — a realistic driver dilemma.

---

### Why these three scenarios matter

| State | What it tests | UI behavior |
|---|---|---|
| **safe** | No action needed. System confirms plan. | Green/okay indicator. Optional proactive stop suggested. |
| **tight** | Marginal decision. Driver judgment required. | Yellow/caution indicator. Close call framing. |
| **urgent** | Action required. System strongly recommends stop. | Red/alert indicator. Clear recommendation with fallback. |

Together they cover the full decision spectrum. The UI lane can build three distinct screen states from these fixtures. The scenario engine lane can test `reserve_gap_percent` thresholds: `> 3` = safe, `0 to 3` = tight, `< 0` = urgent.

### What I did NOT do

- I did NOT add these fixtures to `CONTROL/fixtures/` (integration-owned).
- I did NOT modify `app/scenario.js` (Codex-owned).
- I did NOT create new report-output fixtures (the report layer can generate them deterministically from the inputs).

### What the integration lane should do

1. Review my plausibility assessment.
2. If accepted, copy the two proposed JSON fixtures into `CONTROL/fixtures/`.
3. Rename or adjust IDs as needed for consistency.
4. Generate corresponding `report-output.*.v1.json` fixtures by running the report module.
5. Update `app/scenario.js` to include all three trip variants.
6. Then unblock the scenario engine and UI lanes.

---

### Evidence

- Review conducted against existing `PITT-DEMO-017` fixture and `app/scenario.js` (commit `19dda1e`).
- Proposed values grounded in 25+ years driving experience: fuel burn rates, typical policy floors, realistic delays, and corridor stop distances.
- Only `HANDOFFS/Patrick.md` was modified.

---

## Strategic Positioning Proposal (2026-07-20)

> **Owner:** Patrick (driver perspective / AI-report lane)
> **Status:** Proposal — awaiting feedback from Integration (Codex) and Submission (Research) before applying to any shared files.

### The Problem with Current Narrative

The README, demo scenario, and video script currently position PITT as a **fuel-reserve management and exception-reporting tool**. This is a crowded space: Trucker Path, Sygic Truck, Waze for Trucks, and dozens of fleet dashboards already do fuel stops and route exceptions. A Build Week submission framed this way will not stand out.

### Proposed Differentiation

PITT's real differentiator is **conversational, real-time AI that saves driving time** — not distance, but **wall-clock time** — by dynamically correcting the course as conditions change. Fuel-stop management is a **bonus feature**, not the headline.

**What makes this unique:**
- Existing GPS apps predict traffic from historical patterns ("usual Tuesday jam at 3 PM"). PITT would use live traffic + AI reasoning to **react to the unexpected** — an accident, a sudden closure, a delay at the receiver.
- The correction is **conversation-driven**: the driver asks, the AI explains the trade-off (time vs. distance vs. fuel), and the driver decides. No black-box routing.
- The goal is **time saved**, not shortest distance. A longer route that avoids a 45-minute standstill is the better route.
- The fuel stop is **contextual**: inserted only when a delay makes it necessary, not on every trip.

### Driver-Visible Value Proposition (proposed)

> "PITT doesn't just reroute you around traffic — it explains why, shows you the time trade-off, and lets you decide. Fuel stops, report drafts, and delivery adjustments happen automatically in the background when they're needed. You drive less stressed and arrive on time more often."

### What This Means for Submission Documents

| Document | Current framing | Proposed framing |
|---|---|---|
| `README.md` | "trip-exception and report assistant for delivery drivers" | "AI co-pilot for delivery drivers: real-time course correction that saves time, with contextual fuel and report handling" |
| `DEMO_SCENARIO.md` | Fuel-reserve exception as the story | Time-saving course correction as the story; fuel as the consequence of the delay |
| `VIDEO_SCRIPT.md` | 45 seconds on fuel reserve, 15 seconds on report | 45 seconds on the delay → AI correction → time saved, 15 seconds on fuel + report as supporting features |

### Why the Fuel Angle Is Still Present (But Not Dominant)

- Fuel management is the **seeded demo mechanism** we can show in a local Build Week environment
- In a production vision, the same AI layer handles fuel, HOS, delivery windows, weather, and receiver delays
- The demo's deterministic fallback report shows **trust and transparency** — the driver always sees why a correction was suggested

### Request to Other Lanes

**Integration (Codex):** Does this positioning conflict with the current demo scope or the visible app flow? The UI would need minimal changes — mostly copy and header labels — but the narrative shift is significant.

**Submission (Research):** Does the Build Week judging criteria reward "AI-assisted time optimization" more than "fuel management"? If so, this reframing strengthens the submission.

**UI (AGY):** If the three-screen demo gets a selector for safe/tight/urgent, could the urgent screen emphasize the **delay causing the problem** and the **time saved by the correction** rather than only the fuel gap?

### What I Am NOT Proposing

- I am NOT proposing to add live traffic, maps, or real AI endpoints to the Build Week demo. The demo stays local and seeded.
- I am NOT proposing to change the report contract, AI adapter, or deterministic fallback. Those are technically complete.
- I am proposing a **narrative and copy change only** for the submission artifacts.

### Next Small Action

1. **Integration (Codex) and Submission (Research) review this proposal.**
2. If accepted, I will draft revised copy for `README.md`, `DEMO_SCENARIO.md`, and `VIDEO_SCRIPT.md` in a new branch.
3. If rejected, the current submission documents remain unchanged and the demo ships as-is.

### Evidence

- This proposal is grounded in 25+ years of cross-border driving experience. Every experienced driver knows that "saving kilometers" is worthless if you lose two hours in a traffic jam. Time is the currency that matters.
- Competitive analysis: Trucker Path = fuel + parking. Sygic = truck-specific routing. Waze = crowd traffic. None of them explain **why** a correction is suggested in natural language, or let the driver weigh time vs. distance vs. fuel in a conversation.
- PITT's existing AI/report layer (`packages/ai/`) already supports the "explain the trade-off" pattern through its narrative field. The architecture aligns with this vision even if the demo is currently narrow.

---

# Harness Handoff: Research

- **Status:** complete
- **Lane:** Submission
- **Branch/worktree:** `harness/research-submission` / `/Volumes/GitHub/GitHub/worktrees/pitt-research-submission`
- **Started:** 2026-07-19

## Changed Or Investigated

### New files (submission lane only)

- `DEMO_SCENARIO.md` — Exact narrative of the seeded urgent trip with source references to `app/scenario.js` and canonical fixtures.
- `SUBMISSION/VIDEO_SCRIPT.md` — Three-minute spoken walkthrough matching the visible three-step flow. Explains Codex and GPT-5.6 roles without invented claims.
- `SUBMISSION/CHECKLIST.md` — Submission readiness checklist. Ready, pending, and blocked sections. Uncertain hackathon requirements marked as pending verification.
- `CODEX_BUILD_LOG.md` — Append-only build log seeded with confirmed milestones. Each entry references a commit hash and/or file path.
- `HANDOFFS/Research.md` — This file.

### Files read but not modified

- `README.md`
- `CONTROL/PRODUCT_SCOPE.md`
- `CONTROL/WORKBOARD.md`
- `CONTROL/HARNESS_BRIEF.md`
- `CONTROL/COLLABORATORS.md`
- `CONTROL/COLLATION_REPORT.md`
- `CONTROL/PROMPTS/RESEARCH_SUBMISSION.md`
- `CONTROL/PROMPTS/AGY_PRODUCT_UI.md`
- `CONTROL/PROMPTS/OPENCODE_SCENARIO.md`
- `CONTROL/PROMPTS/PATRICK_AI_REPORT.md`
- `CONTROL/CONTRACTS/REPORT_DRAFT_V1.md`
- `CONTROL/CONTRACTS/ROUTING_CONTRACT_V1.md`
- `CONTROL/fixtures/report-input.seeded-demo.v1.json`
- `CONTROL/fixtures/report-output.fallback.v1.json`
- `HANDOFFS/Codex.md`
- `HANDOFFS/Patrick.md`
- `app/scenario.js`
- `app/app.js`
- `app/index.html`
- `package.json`
- `tests/scenario.test.mjs`
- `tests/report-contract.test.mjs`
- `tests/app-ui-contract.test.mjs`
- `tests/ai/test_report_generator.py`
- `IMPLEMENTATION_COMPLETE.md`
- `WORKLOG.md`

## Evidence

- **Command or check:** `npm test`
- **Result:** 8/8 tests passed (scenario coverage, report contract, UI contract, provenance wording).

- **Command or check:** `python3 -m unittest discover -s tests/ai -p "test_*.py" -v`
- **Result:** 24/24 tests passed (deterministic fallback, provider errors, AI success, config, contract shape).

- **Command or check:** `git diff --check`
- **Result:** Clean — no whitespace errors.

- **Command or check:** Every claim in the five new files reviewed against `CONTROL/PRODUCT_SCOPE.md`.
- **Result:** No claim of live data, production safety, regulatory compliance, or real-time optimization found.

## Limits Or Risks

- No application code, contracts, fixtures, routing logic, or UI was modified.
- The video script has not been recorded yet. The script text is ready.
- Screenshots have not been captured. The demo runs locally and screenshots can be taken from a browser session.
- Specific hackathon submission-platform requirements (Devpost fields, category, deadline) are not confirmed in repository evidence and are marked as pending verification in the checklist.

## Open Questions (Require Human Verification)

1. **Submission platform:** Is the submission through Devpost or another portal? What fields are required?
2. **Deployment requirement:** Is a hosted demo URL required, or is a local-run video sufficient?
3. **Team listing:** What format is needed for team member details on the submission form?
4. **Submission category/track:** Which Build Week category or track applies to PITT?
5. **License requirement:** Does the submission require a LICENSE file in the repository?
6. **Video format:** What are the required video format, resolution, and hosting requirements (YouTube, Loom, direct upload)?
7. **AI provider for demo recording:** Should the video show the deterministic fallback only, or should a configured GPT-5.6 endpoint be available for the recording?

## Next Small Action

- Integration merged the submission evidence at `091c13a`, corrected the stale Node test count to 8, and removed the unsupported implication that GPT-5.6 is configured for the recording.
- A human should review the open questions above before final submission.
