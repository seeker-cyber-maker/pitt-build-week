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

### Evidence

- Review conducted against existing `PITT-DEMO-017` fixture and `app/scenario.js` (commit `19dda1e`).
- Proposed values grounded in 25+ years driving experience: fuel burn rates, typical policy floors, realistic delays, and corridor stop distances.
- Only `HANDOFFS/Patrick.md` was modified.

---

## Driver demo walkthrough

**Date:** 2026-07-19
**Branch:** `harness/patrick-demo-walkthrough`
**Scope:** Evaluate the seeded local demo as a driver would. No code edits.
**Method:** `npm test` (5/5 passed), `npm run serve`, browser walkthrough of all 3 screens completing each visible step once.

---

### Findings by screen

#### Screen 1 — Trip watch

**Finding 1.1: "Review reserve risk" button**
- **Visible wording:** "Review reserve risk"
- **Category:** `useful preference`
- **Why it matters:** The word "risk" is slightly alarmist for a routine pre-check. A driver seeing "risk" on every trip might tune it out.
- **Suggested replacement:** "Check reserve status" or "Review fuel reserve"

**Finding 1.2: Metric sub-labels**
- **Visible wording:** "Seeded fuel state", "Policy threshold", "Seeded exception"
- **Category:** `no issue`
- **Why it matters:** These sub-labels are honest and transparent. They tell the driver these are scenario values, not live data, without breaking the flow.

**Finding 1.3: "Seeded demo" badge**
- **Visible wording:** "Seeded demo"
- **Category:** `no issue`
- **Why it matters:** Clearly visible in the top-right. Sets expectations immediately.

---

#### Screen 2 — Driver review

**Finding 2.1: "Projected reserve crosses the policy floor"**
- **Visible wording:** "Projected reserve crosses the policy floor"
- **Category:** `confirmed friction`
- **Why it matters:** The verb "crosses" is ambiguous. It could mean "exceeds" (above) or "drops below". In a stressful moment, a driver should not have to parse this.
- **Suggested replacement:** "Projected reserve falls below the policy floor"

**Finding 2.2: "5% below floor" without directional clarity**
- **Visible wording:** "5% below floor"
- **Category:** `confirmed friction`
- **Why it matters:** This is the most critical number on the screen. The reserve gap is -5% (below floor), but a quick glance might read it as "5% remaining above floor". The visual fuel bar helps, but the text alone is ambiguous under time pressure.
- **Suggested replacement:** Reserve the absolute value but add direction: "5% below policy floor (gap: -5%)" or use a red/amber color indicator that is unambiguous.

**Finding 2.3: "Pre-approved stop is the demonstration option supplied by the scenario"**
- **Visible wording:** "Pre-approved stop is the demonstration option supplied by the scenario"
- **Category:** `confirmed friction`
- **Why it matters:** "Supplied by the scenario" has no meaning to a driver. It is construction jargon bleeding into the user-facing text.
- **Suggested replacement:** "This stop is on the planned corridor and pre-approved by the carrier."

**Finding 2.4: Checkbox wording**
- **Visible wording:** "I reviewed the recommendation and want a report draft."
- **Category:** `no issue`
- **Why it matters:** Clear, driver-centric, and does not imply automatic action.

**Finding 2.5: Button disabled until checkbox is checked**
- **Category:** `no issue`
- **Why it matters:** Good pattern. Forces explicit acknowledgment before proceeding.

---

#### Screen 3 — Report draft

**Finding 3.1: "A seeded 28-minute delay" in the report body**
- **Visible wording:** "A seeded 28-minute delay changes projected fuel reserve to 7%"
- **Category:** `confirmed friction`
- **Why it matters:** The word "seeded" is developer jargon. A driver reading their report does not know what "seeded" means. It undermines trust in the report.
- **Suggested replacement:** "A 28-minute delay changes projected fuel reserve to 7%" (remove "seeded")

**Finding 3.2: "Source: deterministic local demo fallback" in the report body**
- **Visible wording:** "Source: deterministic local demo fallback. Seeded arithmetic only; not a live corridor prediction."
- **Category:** `confirmed friction`
- **Why it matters:** This is pure construction metadata. It belongs in a system log, not a driver-facing report. A driver should see provenance ("Local calculation, no external data") but not the internal module name.
- **Suggested replacement:** "Source: local calculation based on current fuel, delay, and carrier policy. No live traffic or weather data used."

**Finding 3.3: "Review recorded for this local demo"**
- **Visible wording:** "Review recorded for this local demo. No external action was taken."
- **Category:** `confirmed friction`
- **Why it matters:** "For this local demo" breaks the fourth wall. The driver does not know they are in a demo.
- **Suggested replacement:** "Review recorded. No external action was taken." (keep the second half, which is excellent)

**Finding 3.4: "PITT does not contact carrier systems, change the planned corridor, or control a vehicle. The driver remains the decision-maker."**
- **Visible wording:** Exact text above
- **Category:** `no issue`
- **Why it matters:** Perfect tone. Neither directive nor surveillance. It explicitly sets boundaries and empowers the driver.

**Finding 3.5: "Confirm review" button**
- **Visible wording:** "Confirm review"
- **Category:** `no issue`
- **Why it matters:** Clear action. Does not say "Submit" or "Approve" (which might imply dispatch authority).

---

### Cross-screen observations

**Navigation friction**
- **Category:** `confirmed friction`
- **Observation:** The progress dots ("1 Trip watch", "2 Driver review", "3 Report draft") look clickable but forward navigation from dot 1 to dot 2 did not respond in the walkthrough. Backward navigation (dot 3 to dot 2) worked. Forward flow required clicking the primary button instead.
- **Why it matters:** A driver might click the progress bar expecting to jump ahead, then think the app is frozen. Consistent navigation behavior matters in a cab.
- **Suggested fix:** Either make all progress dots clickable for forward navigation, or visually disable the ones that are not yet reachable.

**Missing: selection basis visibility**
- **Category:** `useful preference`
- **Observation:** The selection basis ("pre-approved demo stop") appears in the bullet list on screen 2 but is not prominent. On screen 3, it is missing entirely from the report draft.
- **Why it matters:** Drivers need to know *why* this stop was chosen. Trust depends on transparency.
- **Suggested fix:** Add a line to the report: "Selection basis: pre-approved corridor stop."

**Missing: explicit alternative in report**
- **Category:** `useful preference`
- **Observation:** The two alternatives ("Continue without stopping...", "Contact dispatch...") are visible on screen 2 but absent from the report draft on screen 3.
- **Why it matters:** A report reviewed later by dispatch or a supervisor should show that alternatives were considered.
- **Suggested fix:** Include alternatives in the report body.

---

### Summary table

| Finding | Screen | Category | Priority |
|---|---|---|---|
| "crosses the policy floor" is ambiguous | Screen 2 | confirmed friction | High |
| "5% below floor" lacks directional clarity | Screen 2 | confirmed friction | High |
| "seeded" in report body | Screen 3 | confirmed friction | High |
| "deterministic local demo fallback" in report | Screen 3 | confirmed friction | High |
| "supplied by the scenario" | Screen 2 | confirmed friction | Medium |
| "for this local demo" after confirm | Screen 3 | confirmed friction | Medium |
| Forward navigation via progress dots | All | confirmed friction | Medium |
| Selection basis missing from report | Screen 3 | useful preference | Medium |
| Alternatives missing from report | Screen 3 | useful preference | Low |
| "Review reserve risk" slightly alarmist | Screen 1 | useful preference | Low |
| Boundary disclaimer and driver empowerment | Screen 3 | no issue | — |
| Checkbox and disabled-button pattern | Screen 2 | no issue | — |

---

### What I did NOT do

- Did NOT edit `app/index.html`, `app/app.js`, `app/scenario.js`, or `app/styles.css`.
- Did NOT modify `CONTROL/CONTRACTS/`, `CONTROL/WORKBOARD.md`, or other shared files.
- Did NOT add screenshots, provider keys, or external data.
- Did NOT claim the demo has live routing, fleet integration, or regulatory compliance.

---

### Evidence

- Walkthrough conducted on `http://127.0.0.1:4173` running from commit `35b1bef`.
- All three visible steps completed: trip watch → driver review → report draft → confirm.
- Only `HANDOFFS/Patrick.md` was modified.

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

### Next Small Action

- Integration lane (Codex) reviews these proposals and decides which, if any, to incorporate into `ROUTING_CONTRACT_V1.md`.
- If accepted, the contract version should bump to v2 or the changes should be staged for post-Build Week discussion.
- No further action required from Patrick unless specific operational questions arise.
