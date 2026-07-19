# PITT Collaboration Report

Generated locally from `HANDOFFS/*.md`. This report does not validate code or merge branches.

## Status Summary

| Harness | Status |
| --- | --- |
| Codex | ** ready for integration |
| Patrick | ** complete |

---

# Harness Handoff: Codex

- **Status:** ready for integration
- **Lane:** Integration
- **Branch/worktree:** `main` during bootstrap only; future integration uses `harness/codex-integration`
- **Started:** 2026-07-18

## Changed Or Investigated

- Established collaboration control files, product boundary, handoff template, and collation utility.
- Added a dependency-free local demo shell under `app/` with a three-stage trip, recommendation, and report-review flow.
- Added deterministic scenario functions in `app/scenario.js` and focused Node tests in `tests/scenario.test.mjs`.
- Added `package.json` commands for local testing and serving.
- Defined the shared report boundary in `CONTROL/CONTRACTS/REPORT_DRAFT_V1.md` with bounded seeded input and deterministic fallback output fixtures.
- Updated Patrick's lane prompt to require contract validation, exact preservation of deterministic facts, and zero provider calls for the local seeded fixture.

## Evidence

- **Command or check:** `npm test`
- **Result:** 5/5 tests passed: urgent reserve calculation, scope-bounded recommendation, provenance-bearing local fallback report, and report-contract input/output checks.
- **Command or check:** Browser walkthrough at `http://127.0.0.1:4173`
- **Result:** Trip watch -> driver acknowledgment -> report draft -> confirmation state all rendered and changed local state. Screenshot: `/tmp/pitt-demo-report.png`.

## Limits Or Risks

- The present scenario is intentionally local and duplicates the narrow visual/demo contract so it can run before the scenario/UI/report lanes land. Those lanes should replace or extract this implementation rather than add a second competing flow.
- No provider endpoint is called. The report is explicitly labeled as a deterministic local fallback.

## Next Small Action

- Patrick implements `packages/ai/` against `CONTROL/CONTRACTS/REPORT_DRAFT_V1.md`, beginning with the local `fallback_ready` fixture. The seeded input has `outbound_provider_authorized: false`, so the first implementation must not call any provider.
- Keep the current `app/` demo shell until each lane-owned package is integrated at a single seam; do not introduce a second competing flow.

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

### Next Small Action

- Integration lane (Codex) reviews these proposals and decides which, if any, to incorporate into `ROUTING_CONTRACT_V1.md`.
- If accepted, the contract version should bump to v2 or the changes should be staged for post-Build Week discussion.
- No further action required from Patrick unless specific operational questions arise.
