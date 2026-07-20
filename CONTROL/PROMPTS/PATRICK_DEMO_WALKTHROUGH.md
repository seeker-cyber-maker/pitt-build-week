# Patrick Assignment: Driver Demo Walkthrough

Worktree: create a fresh branch from `origin/harness/codex-integration`.
Suggested branch: `harness/patrick-demo-walkthrough`.

## Purpose

Evaluate the current seeded local demo as a driver would. Find friction, ambiguity, distracting wording, or missing driver-visible context before the submission is polished. This is a short review, not an implementation task.

## Run The Demo

```bash
npm test
npm run serve
```

Open `http://127.0.0.1:4173`, then complete the three visible steps once without reading the source first.

## Record Only In Your Handoff

Append a dated `Driver demo walkthrough` section to `HANDOFFS/Patrick.md`.

For each finding, record:

- screen and exact visible wording;
- `confirmed friction`, `useful preference`, or `no issue`;
- why it matters during a delivery stop or a quick review;
- suggested replacement wording only when you are confident.

Review these points specifically:

1. Are distance, detour time, reserve gap, selection basis, alternative, and local-demo limitation visible quickly enough?
2. Does any wording sound directive, dispatch-like, surveillance-like, or overconfident?
3. Does the review/confirm step make it clear that no external action is taken?
4. Is anything needed for the seeded demo missing, or is anything shown that would distract a driver?

## Guardrails

- Do not edit code, UI, shared contracts, screenshots, or configuration.
- Do not add provider keys, live maps, GPS, or external data.
- Do not ask Claude to infer trucking practice; ask Patrick when a decision depends on actual driver experience.

## Acceptance

Commit only the appended handoff section. Run `git diff --check`, push the branch, and report the commit hash. No merge.
