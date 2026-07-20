# Patrick Assignment: AI-Assisted Report Layer

Worktree: `/Volumes/GitHub/GitHub/worktrees/pitt-patrick-ai-report`
Branch: `harness/patrick-ai-report`

Read `README.md`, `CONTROL/PRODUCT_SCOPE.md`, `CONTROL/WORKBOARD.md`, `CONTROL/COLLABORATORS.md`, and `CONTROL/HARNESS_BRIEF.md` first.
Then read `CONTROL/OPERATIONAL_DESIGN_INPUTS.md` and `CONTROL/CONTRACTS/REPORT_DRAFT_V1.md`. Treat the seeded fixtures in `CONTROL/fixtures/` as the integration contract.

## Build Only This Lane

Create a small provider-neutral report-drafting module under `packages/ai/` plus focused tests in `tests/ai/`.

Input is `pitt.report-input.v1`; output is `pitt.report-draft.v1`, as defined in the shared contract. The module must:

- use `PITT_AI_BASE_URL`, `PITT_AI_API_KEY`, and `PITT_AI_MODEL` only when all are configured;
- never log secrets;
- return a clearly marked deterministic fallback report if configuration is absent, an HTTP call fails, or a response is malformed;
- distinguish `deterministic facts` from `AI-assisted narrative` in the result;
- make no autonomous action or recommendation beyond the supplied scenario decision.
- reject/return fallback for invalid or incomplete input rather than inventing facts;
- preserve the input's deterministic facts and `driver_review_required` state exactly;
- honor `data_handling.outbound_provider_authorized`: the seeded fixture is local-only and must never make a provider request.

Use a simple documented request/response contract. Do not add a framework, database, live routing data, or UI.

## Acceptance

Write tests for unconfigured fallback, failed provider call, malformed provider response, and accepted structured provider response. Update `HANDOFFS/Patrick.md` with changed paths, test result, contract notes, and open integration questions. Commit to your branch and open a PR; do not merge to `main`.
