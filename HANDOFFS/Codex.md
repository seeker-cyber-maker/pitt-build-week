# Harness Handoff: Codex

- **Status:** in progress
- **Lane:** Integration
- **Branch/worktree:** `harness/codex-integration`
- **Started:** 2026-07-18

## Changed Or Investigated

- Established collaboration control files, product boundary, handoff template, and collation utility.
- Added a dependency-free local demo shell under `app/` with a three-stage trip, recommendation, and report-review flow.
- Added deterministic scenario functions in `app/scenario.js` and focused Node tests in `tests/scenario.test.mjs`.
- Added `package.json` commands for local testing and serving.
- Defined the shared report boundary in `CONTROL/CONTRACTS/REPORT_DRAFT_V1.md` with bounded seeded input and deterministic fallback output fixtures.
- Updated Patrick's lane prompt to require contract validation, exact preservation of deterministic facts, and zero provider calls for the local seeded fixture.
- Merged Patrick's AI/report implementation, routing-contract review, and seeded-scenario validation.
- Added canonical safe and tight report input/output fixtures alongside the urgent fixture; all three match the deterministic report generator exactly.
- Corrected the fallback narrative so below-floor, at-floor, and above-floor reserves use accurate language and a safe scenario does not invent a zero-distance stop.
- Added all three reserve states to `app/scenario.js`; the visible demo remains intentionally pinned to the urgent scenario.

## Evidence

- **Command or check:** `npm test`
- **Result:** 6/6 tests passed: safe, tight, and urgent reserve calculations; scope-bounded recommendation; and provenance-bearing local fallback report.
- **Command or check:** `python3 -m unittest discover -s tests/ai -p "test_*.py" -v`
- **Result:** 24/24 tests passed, including exact canonical output checks for all three seeded report inputs.
- **Command or check:** Browser walkthrough at `http://127.0.0.1:4173`
- **Result:** Trip watch -> driver acknowledgment -> report draft -> confirmation state all rendered and changed local state. The confirmation visibly states that no external action was taken.

## Limits Or Risks

- The present scenario is intentionally local. The visible shell is pinned to the urgent case; safe and tight are canonical fixtures plus tested data states, not yet a visible scenario selector.
- The static browser shell uses its local deterministic fallback. The provider-neutral Python report module is independently validated and remains ready for a later single integration seam.
- No provider endpoint is called. The report is explicitly labeled as a deterministic local fallback.

## Next Small Action

- Run the submission-evidence lane: produce the demo script, checklist, build evidence, and README polish around the now-validated local demo.
- Keep the current `app/` demo shell as the one visible flow. Do not extract another scenario engine or add a second report generator unless it replaces the existing seam deliberately.
