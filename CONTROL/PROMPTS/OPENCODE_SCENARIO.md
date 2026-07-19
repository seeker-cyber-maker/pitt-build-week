# OpenCode Assignment: Scenario Engine

Worktree: `/Volumes/GitHub/GitHub/worktrees/pitt-opencode-scenario`
Branch: `harness/opencode-scenario`

Read `README.md`, `CONTROL/PRODUCT_SCOPE.md`, `CONTROL/WORKBOARD.md`, `CONTROL/HARNESS_BRIEF.md`, and `CONTROL/CONTRACTS/ROUTING_CONTRACT_V1.md` first.

Build the deterministic scenario engine only. Do not build UI, call a model, add live APIs, or change scope documents.

## Deliverable

Create `packages/scenario/` and `tests/scenario/` with a small dependency-free TypeScript or Python module that accepts a seeded refrigerated-delivery trip and returns a structured decision:

- `safe`, `tight`, or `urgent` fuel reserve status;
- reserve calculation and deadline-risk fields;
- one primary and one fallback pre-approved fuel-stop option;
- plain-language deterministic reasons;
- a report payload for a later AI drafting layer.

The structured decision must follow the routing contract's Build Week boundary: block output when origin, destination, or reserve facts are missing; label non-blocking missing external data as assumptions; include a human-readable degraded-mode statement; and use `context_summary`, not imperative navigation language.

## Required Cases

- A safe trip keeps the original plan.
- A tight trip recommends review without making an urgent diversion.
- An urgent trip recommends the selected approved stop and makes clear why.

## Acceptance

Run focused tests locally. Record exact paths, the test command/result, and remaining assumptions in `HANDOFFS/OpenCode.md`. Commit only your lane. Do not merge to `main`.
