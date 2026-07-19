# Harness Handoff: Patrick

- **Status:** ready for integration
- **Lane:** AI/report boundary
- **Branch/worktree:** `harness/patrick-ai-report`
- **Started:** 2026-07-18
- **Completed:** 2026-07-19

## Changed Or Investigated

### Core Module (`packages/ai/`)

Aligned with **PITT Report Draft Contract v1** (`CONTROL/CONTRACTS/REPORT_DRAFT_V1.md`).

- `__init__.py` — Public API exports (`generate_report`, `ReportResult`, `ScenarioPayload`)
- `models.py` — `ScenarioPayload.from_dict()` accepts `pitt.report-input.v1`; `ReportResult.to_dict()` emits `pitt.report-draft.v1`
- `config.py` — `ProviderConfig` with secret masking and safe `__repr__`
- `report_generator.py` — `generate_report()` with deterministic fallback; respects `outbound_provider_authorized`
- `README.md` — Documentation aligned with contract v1
- `example_usage.py` — Demonstration using canonical seeded fixtures

### Tests (`tests/ai/`)

- `test_report_generator.py` — 21 tests covering contract alignment, fixture matching, fallback paths, AI success, security

## Evidence

### Test Command

```bash
python3 -m unittest discover -s tests/ai -p "test_*.py" -v
```

### Result

```
Ran 21 tests in 0.019s
OK
```

### Fixture Alignment

The seeded input fixture (`CONTROL/fixtures/report-input.seeded-demo.v1.json`) produces output that matches the fallback fixture (`CONTROL/fixtures/report-output.fallback.v1.json`) exactly.

### Contract Invariants Verified

- ✅ `schema_version` == `pitt.report-input.v1` on input, `pitt.report-draft.v1` on output
- ✅ `scenario.mode` == `seeded_demo` respected
- ✅ `deterministic_assessment` preserved verbatim in output facts
- ✅ `driver_review_required` remains `True` in output
- ✅ Missing/unauthorized config returns `fallback_ready`
- ✅ HTTP errors, malformed responses, timeouts all return safe fallback
- ✅ Successful AI output preserves all deterministic facts
- ✅ No secrets in logs or string representations
- ✅ No network call when `outbound_provider_authorized: false`

## Limits Or Risks

1. **Provider Format:** OpenAI-compatible chat completions only
2. **Timeout:** Hardcoded 10 seconds (could be configurable)
3. **No Retry:** Single attempt; fast-fail to fallback
4. **Schema Evolution:** If `pitt.report-input.v2` is defined, `models.py` will need an update

## Integration Questions (from Codex)

1. Is the current report structure enough for a driver to explain an exception after the fact without turning it into paperwork theater?
2. Which one or two fields would make a report more useful to dispatch while remaining non-sensitive and optional?
3. Does the distinction between `observed`, `seeded`, and `unknown` need a visible field in the narrative, or is provenance plus limitations sufficient?
4. Which phrasing sounds like a helpful draft rather than a system issuing orders to a driver?

## Next Small Action

- Integration lane (Codex) reviews PR #2 and confirms contract alignment before merge.
- After merge, scenario engine and UI lanes wire `generate_report()` into the end-to-end flow.

## TODO List for Integration Lane (Reviewer)

### Before Merge
- [ ] Checkout branch: `git fetch origin && git checkout harness/patrick-ai-report`
- [ ] Run tests: `python3 -m unittest discover -s tests/ai -p "test_*.py" -v` (expect 21/21 OK)
- [ ] Verify fixture alignment:
  ```bash
  PYTHONPATH=/opt/data/workspace/pitt-build-week python3 -c "
  from packages.ai import generate_report
  from packages.ai.models import ScenarioPayload
  import json
  with open('CONTROL/fixtures/report-input.seeded-demo.v1.json') as f:
      d = json.load(f)
  r = generate_report(ScenarioPayload.from_dict(d))
  print(json.dumps(r.to_dict(), indent=2))
  "
  ```
  Output must match `CONTROL/fixtures/report-output.fallback.v1.json` exactly.
- [ ] Confirm no files modified outside `packages/ai/`, `tests/ai/`, `HANDOFFS/Patrick.md`, `WORKLOG.md`
- [ ] Confirm no secrets in code, tests, or logs
- [ ] Review answers to integration questions (above)

### After Merge to `main`
- [ ] Wire `packages/ai/` into `app/` demo shell (replace or extract the local report generation in `app/scenario.js`)
- [ ] Ensure single seam: do not keep a second competing report flow
- [ ] Scenario engine lane: confirm `pitt.report-input.v1` output matches `ScenarioPayload.from_dict()` expectations
- [ ] UI lane: wire report display to consume `ReportResult.to_dict()` output
- [ ] Add `.env` with real AI credentials if testing the AI-assisted path (optional for demo)
- [ ] Run full E2E: trip → alert → report draft → driver review → confirm

### Known Integration Points
| Component | What I Provide | What I Expect |
|---|---|---|
| Scenario Engine | `ScenarioPayload.from_dict(input_dict)` | `pitt.report-input.v1` dict with all required fields |
| UI | `ReportResult.to_dict()` | Consumer reads `status`, `provenance.kind`, `narrative`, `review.required`, `deterministic_facts` |
| Integration | `generate_report(scenario)` callable | Python module importable from `packages.ai` |

### Blockers / Needs Decision
1. **Schema v2?** If Codex updates `REPORT_DRAFT_V1.md`, this module needs a matching update.
2. **Provider for demo?** No provider needed for seeded demo (fallback works). If adding AI-assisted demo, need `.env` + `outbound_provider_authorized: true`.
3. **Python path wiring?** `packages/` is not a proper Python package yet. Integration may need `PYTHONPATH` or a `setup.py` adjustment.

## Branch Status

- All code committed to `harness/patrick-ai-report`
- Tests passing (21/21)
- Fixture alignment verified
- PR #2 updated and open
- No merge to `main` without integration verification
