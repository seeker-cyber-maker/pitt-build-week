# PITT Routing Contract v1

**Status:** Future-integration interface and Build Week design boundary, revised after operational review on 2026-07-19. No live routing implementation is implied.

## Purpose

This contract separates routing behavior from map, traffic, fleet, or provider choices. It lets operational review define what a safe, reviewable recommendation must explain before PITT integrates any external data.

For Build Week, any routing object is a **seeded local scenario**. It must be visible as simulated and must not be presented as navigation or dispatch authority.

## Input: `pitt.routing-request.v1`

| Field | Required | Meaning | Build Week rule |
| --- | --- | --- | --- |
| `request_id` | yes | Opaque correlation ID | Seeded value only. |
| `mode` | yes | `seeded_demo` or future declared mode | Submission uses `seeded_demo`. |
| `origin_label` | yes | Human-readable start label | No raw coordinates required. |
| `destination_label` | yes | Human-readable destination label | No customer address required. |
| `vehicle_profile` | yes | Structured declared vehicle and cargo profile | Unknown restrictions stay unknown. |
| `reserve_state` | yes | Current reserve, policy floor, and calculation provenance | Deterministic scenario facts are authoritative. |
| `driver_hours_state` | optional | Declared availability or `unknown` | Do not infer hours-of-service compliance. |
| `weather_context` | optional | Source, timestamp, and availability | Missing data must be explicit. |
| `provider_context` | yes | Map/traffic source or `unavailable` | No provider call in Build Week mode. |
| `data_handling` | yes | Provenance, retention, and outbound authorization | Follow the same minimization posture as reports. |

`vehicle_profile` contains only declared, stable classification fields:

```text
class: str                    # e.g. tractor_trailer, straight_truck, van
fuel_type: str                # e.g. diesel, gasoline, electric
cargo_sensitivity: str        # e.g. refrigerated, dry, hazmat, unknown
declared_restrictions: list[str]
```

An empty or incomplete `declared_restrictions` list means restrictions are unknown; it never implies that a vehicle is suitable for a road, bridge, tunnel, or stop.

## Output: `pitt.routing-recommendation.v1`

| Field | Contract |
| --- | --- |
| `status` | `recommendation_ready`, `degraded_ready`, or `validation_failed`. |
| `provenance` | `seeded_local`, `provider_backed`, or `deterministic_fallback`; always visibly labeled. |
| `recommended_stop` | A supplied, reviewable stop candidate with label, distance/detour estimate, and selection basis. |
| `alternatives` | At least one explicit alternative or a statement that none is available in the scenario. |
| `context_summary` | Bounded plain-language explanation of how the recommendation relates to supplied facts. |
| `assumptions` | List every unknown or fixed scenario condition that materially affects the recommendation. |
| `blocking_unknowns` | Missing facts that prevented a recommendation. Empty unless `status` is `validation_failed`. |
| `confidence` | `seeded`, `limited`, or a future provider-backed confidence with evidence basis. |
| `driver_review_required` | Always `true`. |
| `degraded_mode` | Required human-readable statement of what remains valid and what external data is unavailable. |
| `report_projection` | Minimal fields that may be passed to the report contract. |

## Required Behavior

1. Validate the declared mode, origin label, destination label, and complete reserve facts before emitting a recommendation. Missing required facts return `validation_failed` and list the fields in `blocking_unknowns`.
2. Classify the supplied reserve gap deterministically: greater than 3 percentage points is `safe`; 0 through 3 points inclusive is `tight`; below 0 is `urgent`.
3. Treat vehicle restrictions, cargo restrictions, clearance, current traffic, weather, station availability, price, and driver-hours compliance as `unknown` unless supplied with source and freshness metadata.
4. Never issue turn-by-turn instructions, control a vehicle, change dispatch plans, or describe a route as safe or compliant.
5. Keep a recommendation reviewable: expose assumptions, alternatives, provenance, `context_summary`, and degraded behavior.
6. When non-blocking external data is missing, return `degraded_ready` with explicit limitations rather than guessing. Weather, driver-hours state, restrictions, traffic, prices, and station availability are non-blocking unless a future declared policy says otherwise.
7. The report layer consumes only the minimal `report_projection`; it does not receive raw location history or map-provider payloads.
8. Narrative fields use cooperative phrasing such as "recommended stop" and "please review". They must not use imperative wording, imply dispatch authority, or describe surveillance.

## Data Boundary

Allowed for the future interface:

- Human-readable origin/destination and stop labels.
- Declared vehicle class, fuel type, cargo sensitivity, and restrictions.
- Deterministic reserve facts, delay facts, provenance, and explicit data availability.
- Source name and freshness metadata when a provider is actually authorized.

Excluded by default:

- Raw GPS traces, continuous location, ELD data, dashcam, dispatch messages, driver identity, vehicle identifiers, customer records, credentials, manifests, and regulated-cargo details.

## Operational Review Questions For Patrick

1. What information must a driver see before considering a stop recommendation useful rather than distracting?
2. Which unknowns should block a recommendation versus remain visible limitations?
3. What does a genuinely useful offline/degraded recommendation look like in practice?
4. Which stop-selection factors are stable enough for a future contract, and which are too context-dependent to model yet?
5. Which terms sound like a helpful assistant rather than navigation, dispatch, or surveillance software?

## Narrative Tone Guidance

- Prefer `recommended stop`, `review option`, `projected reserve`, `selection basis`, and `assumptions`.
- Prefer `planned corridor` over `route` when describing the seeded scenario.
- Do not use `safe`, `compliant`, `dispatch approval`, `monitor`, or `track` unless a future evidence-backed policy explicitly defines the term.
- A degraded-mode message must state both what remains valid and what data is unavailable.

## Acceptance Cases

- The seeded demo identifies its recommendation as local and simulated.
- Missing origin, destination, or reserve facts return `validation_failed` with non-empty `blocking_unknowns`.
- A missing provider or other non-blocking external data returns `degraded_ready`, a visible `degraded_mode` message, visible assumptions, and no invented traffic, stop, weather, or price data.
- Every routing output requires driver review and carries a minimal report projection.
- Every recommendation exposes distance, detour time, selection basis, an alternative, and a `context_summary` derived only from supplied facts.
- No output claims vehicle suitability, regulatory compliance, road clearance, or real-time routing unless an authorized future integration supplies evidence.
