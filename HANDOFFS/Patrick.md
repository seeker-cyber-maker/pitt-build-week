# Harness Handoff: Patrick

- **Status:** complete
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

- The integration lane will connect this module at one report seam in the demo shell; it must not leave two competing report generators.
- If assigned the routing review, start a new `harness/patrick-routing-review` branch from `origin/harness/codex-integration` and append the review to this handoff. Do not modify shared contracts directly.
