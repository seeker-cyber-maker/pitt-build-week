# AGY Assignment: Product UI

Worktree: `/Volumes/GitHub/GitHub/worktrees/pitt-agy-product-ui`
Branch: `harness/agy-product-ui`

Read `README.md`, `CONTROL/PRODUCT_SCOPE.md`, `CONTROL/WORKBOARD.md`, and `CONTROL/HARNESS_BRIEF.md` first.

Build a very small, polished frontend shell only. Do not invent production integrations, route control, mapping, authentication, or a backend contract.

## Deliverable

Create `packages/web/` with a runnable local app that presents a three-step sequence using a hard-coded local state object:

1. **Trip brief:** refrigerated-delivery context and explicit `Demo scenario` label.
2. **Exception:** urgent fuel-reserve alert, explanation, primary and fallback stop cards, and a driver review action.
3. **Report review:** editable report draft, clear deterministic versus AI-assisted labels, and a confirm action that records a local confirmation state.

The UI must make clear that the driver remains the decision maker. Every visible control must work locally. Use restrained operational styling, not a marketing landing page.

## Acceptance

Build/run it locally, perform the complete three-step journey, and capture the result in `HANDOFFS/AGY.md`: changed paths, commands/results, known limitations, and exact next integration point. Commit only your lane. Do not merge to `main`.
