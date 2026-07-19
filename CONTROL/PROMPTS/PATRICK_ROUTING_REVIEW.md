# Patrick Assignment: Routing Contract Operational Review

Worktree: create a fresh worktree or branch from `origin/harness/codex-integration`.
Suggested branch: `harness/patrick-routing-review`.

## Purpose

Perform a short human-in-the-loop review of the future-facing routing contract. This task captures real driver workflow constraints before anyone builds routing or map integrations. It is not permission to implement live routing, provider calls, map use, or UI changes.

## Read First

1. `README.md`
2. `CONTROL/PRODUCT_SCOPE.md`
3. `CONTROL/WORKBOARD.md`
4. `CONTROL/COLLABORATORS.md`
5. `CONTROL/OPERATIONAL_DESIGN_INPUTS.md`
6. `CONTROL/CONTRACTS/ROUTING_CONTRACT_V1.md`

## Work Only In Your Handoff

Append a dated `Routing contract review` section to `HANDOFFS/Patrick.md`. Answer the five questions under `Operational Review Questions For Patrick` using direct operational experience where applicable.

For each recommendation, label it one of:

- `confirmed operational need`
- `useful preference`
- `unknown / needs evidence`
- `out of Build Week scope`

When a shared contract field or rule should change, write the exact proposed wording under `Proposed integration changes`. Do not edit `CONTROL/CONTRACTS/ROUTING_CONTRACT_V1.md`, `CONTROL/WORKBOARD.md`, or other shared files yourself.

## Guardrails

- Keep the Build Week demo seeded and local only.
- Do not claim road clearance, truck restriction compliance, real-time traffic, weather, prices, availability, driver-hours compliance, or safe navigation unless the supplied scenario explicitly carries verified evidence.
- Prefer a visible limitation over a plausible guess.
- Do not add dependencies, secrets, provider keys, map data, or code.
- Ask Patrick for clarification rather than inventing driver practice.

## Acceptance

The handoff contains:

1. Answers to all five review questions.
2. A short list of the driver-visible information required to make a stop recommendation useful without distraction.
3. Explicit unknowns that must remain limitations in the Build Week demo.
4. Any proposed contract wording, clearly separated from confirmed observations.
5. `git diff --check` result and the commit hash.

Commit only `HANDOFFS/Patrick.md` to your review branch and push it. Do not merge it.
