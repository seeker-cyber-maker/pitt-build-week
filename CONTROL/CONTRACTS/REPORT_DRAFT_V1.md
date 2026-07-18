# PITT Report Draft Contract v1

**Status:** Build Week integration contract. Provider-neutral, local-demo first.

## Purpose

The report layer turns a deterministic trip-exception assessment into a **reviewable draft**. It does not discover facts, recalculate route risk, select a route, contact dispatch, or trigger vehicle actions.

The canonical seeded examples are:

- `CONTROL/fixtures/report-input.seeded-demo.v1.json`
- `CONTROL/fixtures/report-output.fallback.v1.json`

## Input: `pitt.report-input.v1`

The scenario engine supplies this object. The report adapter may use only these fields or a stricter redacted projection of them.

| Section | Required information | Why it is needed |
| --- | --- | --- |
| `scenario` | opaque scenario/trip ID and `seeded_demo` mode | Correlate one draft to one visible demo run. |
| `trip` | driver display alias, cargo category, destination/route labels | Give the reviewer human context without a live identity or location feed. |
| `event` | event type, delay, source label | State what changed and whether it is seeded or observed. |
| `deterministic_assessment` | current fuel, projected reserve, policy floor, gap, status, calculation version | Preserve the authoritative facts. |
| `proposed_decision` | reviewable stop label, detour, alternatives, review requirement | Describe the supplied recommendation without inventing one. |
| `data_handling` | provenance, retention class, outbound authorization | Let the adapter decide whether external inference is allowed. |

### Required invariants

- `schema_version` must equal `pitt.report-input.v1`.
- `scenario.mode` must be visibly `seeded_demo` for this submission.
- `deterministic_assessment` is authoritative. A model may summarize it but may not change values, severity, or decision fields.
- `proposed_decision.driver_review_required` must remain `true`.
- Input without the complete deterministic assessment must produce a deterministic fallback or a structured validation failure, never a confident narrative.

## Output: `pitt.report-draft.v1`

| Field | Contract |
| --- | --- |
| `schema_version` | Always `pitt.report-draft.v1`. |
| `status` | `draft_ready`, `fallback_ready`, or `validation_failed`. |
| `provenance` | `deterministic_fallback` or `ai_assisted`, with model/base URL only when an external provider was actually used. |
| `deterministic_facts` | A lossless, structured copy of the relevant input facts. |
| `narrative` | Plain-language summary. It must not introduce extra facts, operational commands, or safety assurances. |
| `review` | `required: true`, with `confirmed: false` until the UI records an explicit driver review. |
| `limitations` | Clear list of unavailable information and demo boundaries. |

### Provider behavior

1. Missing configuration, transport failure, timeout, non-2xx response, or malformed response must return `fallback_ready`.
2. The fallback must be useful, deterministic, and show `provenance.kind = deterministic_fallback`.
3. A successful provider response is accepted only after structured validation and must still preserve the original deterministic facts verbatim.
4. Never log API keys, authorization headers, raw provider payloads, or full report bodies by default.

## Data-Minimization Contract

### Required for the demo

- Opaque trip/scenario identifier.
- Driver display alias, not a legal identity.
- Broad cargo category, not customer manifests or hazardous-material details.
- Human-readable destination and route labels, not raw GPS history.
- Seeded time/delay, reserve, policy, and stop facts.
- Explicit provenance and review status.

### Explicitly excluded

- Legal name, phone, license, employee ID, VIN, plates, account numbers, credentials, barcode scans, or attachments.
- Raw GPS traces, live location, route history, ELD logs, dashcam, dispatch messages, or customer data.
- Tanker/refrigerated compliance assertions, high-risk-cargo instructions, lock control, or emergency dispatch logic.

### Storage and outbound handling

- Build Week mode is session-only: no local database, analytics, or report history is required.
- When a provider is not configured, no network request occurs.
- When a provider is configured later, the adapter sends the smallest redacted projection that can produce the draft and labels the result `ai_assisted`.
- Operational feedback informs future schema evolution; it does not grant permission to collect additional data.

## Integration Questions For Pat

1. Is the current report structure enough for a driver to explain an exception after the fact without turning it into paperwork theater?
2. Which one or two fields would make a report more useful to dispatch while remaining non-sensitive and optional?
3. Does the distinction between `observed`, `seeded`, and `unknown` need a visible field in the narrative, or is provenance plus limitations sufficient?
4. Which phrasing sounds like a helpful draft rather than a system issuing orders to a driver?

## Acceptance Cases

- Unconfigured adapter returns the fallback fixture shape.
- Provider failure and malformed response return the same safe fallback shape.
- Accepted provider output preserves every deterministic fact and retains `review.required = true`.
- Neither input nor output contains an excluded identifier or claims live integrations.
