# PITT Collaboration Report

Generated locally from `HANDOFFS/*.md`. This report does not validate code or merge branches.

## Status Summary

| Harness | Status |
| --- | --- |
| Codex | ** ready for integration |
| Patrick | ** ready for integration |

---

# Harness Handoff: Codex

- **Status:** ready for integration
- **Lane:** Integration
- **Branch/worktree:** `main` during bootstrap only; future integration uses `harness/codex-integration`
- **Started:** 2026-07-18

## Changed Or Investigated

- Established collaboration control files, product boundary, handoff template, and collation utility.
- Added a dependency-free local demo shell under `app/` with a three-stage trip, recommendation, and report-review flow.
- Added deterministic scenario functions in `app/scenario.js` and focused Node tests in `tests/scenario.test.mjs`.
- Added `package.json` commands for local testing and serving.
- Defined the shared report boundary in `CONTROL/CONTRACTS/REPORT_DRAFT_V1.md` with bounded seeded input and deterministic fallback output fixtures.
- Updated Patrick's lane prompt to require contract validation, exact preservation of deterministic facts, and zero provider calls for the local seeded fixture.

## Evidence

- **Command or check:** `npm test`
- **Result:** 5/5 tests passed: urgent reserve calculation, scope-bounded recommendation, provenance-bearing local fallback report, and report-contract input/output checks.
- **Command or check:** Browser walkthrough at `http://127.0.0.1:4173`
- **Result:** Trip watch -> driver acknowledgment -> report draft -> confirmation state all rendered and changed local state. Screenshot: `/tmp/pitt-demo-report.png`.

## Limits Or Risks

- The present scenario is intentionally local and duplicates the narrow visual/demo contract so it can run before the scenario/UI/report lanes land. Those lanes should replace or extract this implementation rather than add a second competing flow.
- No provider endpoint is called. The report is explicitly labeled as a deterministic local fallback.

## Next Small Action

- Patrick implements `packages/ai/` against `CONTROL/CONTRACTS/REPORT_DRAFT_V1.md`, beginning with the local `fallback_ready` fixture. The seeded input has `outbound_provider_authorized: false`, so the first implementation must not call any provider.
- Keep the current `app/` demo shell until each lane-owned package is integrated at a single seam; do not introduce a second competing flow.

---

# Harness Handoff: Patrick

- **Status:** ready for integration
- **Lane:** AI/report boundary
- **Branch/worktree:** `harness/patrick-ai-report`
- **Started:** 2026-07-18
- **Completed:** 2026-07-19

## Delivered

- Implemented `packages/ai/` as a provider-neutral report drafting module aligned with `CONTROL/CONTRACTS/REPORT_DRAFT_V1.md`.
- `ScenarioPayload.from_dict()` accepts `pitt.report-input.v1`; `ReportResult.to_dict()` emits `pitt.report-draft.v1`.
- Added deterministic fallback, provenance labeling, secret-safe configuration, and an optional OpenAI-compatible path that is never called when `outbound_provider_authorized` is false.
- Added `tests/ai/test_report_generator.py` and an example using the canonical seeded fixtures.

## Evidence

- `python3 -m unittest discover -s tests/ai -p "test_*.py" -v`: 21 tests passed on Patrick's branch.
- The seeded input fixture produces the required deterministic fallback fixture exactly.
- Failure paths for missing configuration, unauthorized outbound use, transport errors, timeouts, and malformed responses fall back safely.

## Limits Or Risks

- The provider adapter currently accepts OpenAI-compatible chat completions only.
- The timeout is fixed at 10 seconds and there is no retry; this is intentional for the demo because it fails safely to the deterministic path.
- Do not add a provider key to Git. The seeded demo remains provider-free.

## Integration Boundary

| Consumer | Provided surface | Expected input |
| --- | --- | --- |
| Scenario engine | `ScenarioPayload.from_dict(input_dict)` | `pitt.report-input.v1` mapping |
| UI | `ReportResult.to_dict()` | Reads status, provenance, narrative, review requirement, and deterministic facts |
| Integration | `generate_report(scenario)` | Python import from `packages.ai` |

## Next Small Action

- Integrate this module at one report seam in the demo shell; do not leave two competing report generators.
- Run the JavaScript demo checks and the Python AI/report tests together before merging to `main`.
