# Patrick Assignment: AI-Assisted Report Layer

Worktree: `/Volumes/GitHub/GitHub/worktrees/pitt-patrick-ai-report`
Branch: `harness/patrick-ai-report`

Read `README.md`, `CONTROL/PRODUCT_SCOPE.md`, `CONTROL/WORKBOARD.md`, `CONTROL/COLLABORATORS.md`, and `CONTROL/HARNESS_BRIEF.md` first.

## Build Only This Lane

Create a small provider-neutral report-drafting module under `packages/ai/` plus focused tests in `tests/ai/`.

Input is the later scenario engine's structured report payload. Output is a structured report draft suitable for driver review. The module must:

- use `PITT_AI_BASE_URL`, `PITT_AI_API_KEY`, and `PITT_AI_MODEL` only when all are configured;
- never log secrets;
- return a clearly marked deterministic fallback report if configuration is absent, an HTTP call fails, or a response is malformed;
- distinguish `deterministic facts` from `AI-assisted narrative` in the result;
- make no autonomous action or recommendation beyond the supplied scenario decision.

Use a simple documented request/response contract. Do not add a framework, database, live routing data, or UI.

## Acceptance

Write tests for unconfigured fallback, failed provider call, malformed provider response, and accepted structured provider response. Update `HANDOFFS/Patrick.md` with changed paths, test result, contract notes, and open integration questions. Commit to your branch and open a PR; do not merge to `main`.
