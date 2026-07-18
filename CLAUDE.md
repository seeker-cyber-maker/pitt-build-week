# PITT Contributor Guide

## Mission

Build a clear, runnable Build Week demonstration of PITT: a driver-facing trip exception assistant. The demo shows a seeded delivery delay, a deterministic fuel-reserve risk, one reviewable pre-approved stop, and a report draft. It does not claim live fleet integrations.

## Read First

1. `README.md`
2. `CONTROL/PRODUCT_SCOPE.md`
3. `CONTROL/WORKBOARD.md`
4. `CONTROL/OPERATIONAL_DESIGN_INPUTS.md`
5. Your lane prompt under `CONTROL/PROMPTS/`
6. `HANDOFFS/<your-lane>.md`

For the AI/report lane also read:

- `CONTROL/CONTRACTS/REPORT_DRAFT_V1.md`
- `CONTROL/fixtures/report-input.seeded-demo.v1.json`
- `CONTROL/fixtures/report-output.fallback.v1.json`

For routing, mapping, stops, or offline behavior also read:

- `CONTROL/CONTRACTS/ROUTING_CONTRACT_V1.md`

## Non-Negotiable Demo Boundaries

- Keep the demo local, deterministic, and review-first.
- Never claim live GPS, traffic, map, pricing, telematics, ELD, dispatch, vehicle control, or autonomous routing.
- Recommendations are reviewable options, never commands to a driver.
- Keep provenance visible: `seeded_local`, `deterministic_fallback`, or `ai_assisted`.
- Do not add databases, authentication, billing, analytics, external APIs, or frameworks unless the workboard explicitly assigns them.
- Do not weaken the no-provider fallback path to make an external provider look required.

## AI/Report Contract

- Input is `pitt.report-input.v1`; output is `pitt.report-draft.v1`.
- The deterministic assessment is authoritative. Do not recalculate, alter severity, or invent operational facts.
- Preserve `driver_review_required: true`; confirmation is a separate explicit UI event.
- The seeded fixture sets `outbound_provider_authorized: false`. It must produce a local fallback with no network request.
- Redact by design: no legal identity, GPS traces, vehicle identifiers, credentials, manifests, or high-risk cargo instructions.

## Patrick's Operational Role

Patrick is the primary operational reviewer for routing workflow, GPS and mapping assumptions, stop selection, ETA expectations, offline behavior, and the driver interaction flow. Treat his observations as requirements to capture in a contract, acceptance case, or explicit open question.

Do not turn an operational observation into a claim of live capability. Do not treat an assumption about roads, truck stops, vehicle restrictions, traffic, or regulation as a fact without a documented source or a clearly labeled seeded fixture.

Escalate instead of guessing when routing behavior conflicts with real driving practice, a mapping assumption affects safety, a new data field is needed, a regulation is unclear, or report wording could change legal or operational meaning.

## Working Rules

- Stay in the files owned by your lane in `CONTROL/WORKBOARD.md`.
- Do not overwrite another contributor's changes. Re-read `git status` before editing.
- Keep changes small and testable. Add a focused test alongside any behavior change.

## Operating Style: Human-In-The-Loop Baton Passes

This lane is deliberately collaborative, not autonomous. Work one clearly bounded slice at a time, then hand it back to Patrick for direction.

1. Read the assigned contract and identify the smallest implementation slice.
2. Implement and test that slice only.
3. Run `npm test`.
4. Update `HANDOFFS/Patrick.md` with what changed, evidence, limits, and one concrete next choice.
5. Run `python3 scripts/collate_handoffs.py` and stop.

Do not independently expand into UI, maps, live providers, new data collection, architecture changes, or a second feature after reaching a passing milestone. Ask Patrick for the next baton when requirements are unclear or a decision affects driver workflow, data handling, or product scope.

Prefer a short, honest handoff over a broad attempt to anticipate every future feature.

## Definition Of Done For This Sprint

- The seeded refrigerated-delivery scenario runs without credentials or network access.
- Risk, the suggested stop, limitations, provenance, and driver review state are understandable on screen.
- Tests are green and no capability is presented as live when it is simulated.
