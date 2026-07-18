# Harness Brief

You are contributing to PITT Build Week. Work in one assigned lane only. Favor the smallest testable change that advances the visible demo.

Before editing:

1. Read `README.md`, `CONTROL/PRODUCT_SCOPE.md`, and `CONTROL/WORKBOARD.md`.
2. Claim a `ready` lane by creating or updating your own `HANDOFFS/<harness>.md` with `Status: in progress`.
3. Create a feature branch or worktree named `harness/<name>-<lane>`.

While working:

- Do not change product scope, provider secrets, deployment settings, or another lane's owned paths.
- Use fake/seeded data unless the assigned lane explicitly authorizes an integration.
- Add a focused acceptance check. State clearly whether it ran.
- Keep the app useful when an AI endpoint is absent or errors.
- Read `CONTROL/OPERATIONAL_DESIGN_INPUTS.md` when work touches routing, mapping, driver workflow, stops, or reporting. Translate operational feedback into bounded requirements and tests; do not imply live integrations.

Before handing off:

- Update your handoff with paths, tests, output, limitations, and the exact next action.
- Do not claim a feature works without recorded evidence.

The goal is a believable, reviewable demo, not a shipping fleet-management platform.
