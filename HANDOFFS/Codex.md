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
- Added `app/planner.js`: a separate deterministic planning preview with a local delivery ledger, declared time-window ordering, reachable simulated refuel selection, and a recommended-versus-rejected route comparison. The map is explicitly made up and cannot be mistaken for live routing.
- Added `tests/planner.test.mjs` plus UI contract coverage for the visible planning boundary and time-window labels.
- Made refuel selection price-aware using only seeded CAD-per-litre values plus a simulated detour-cost rule. The UI makes the cheaper-per-litre-but-longer alternative explicit without implying a live fuel-price feed.

## Evidence

- **Command or check:** `npm test`
- **Result:** 11/11 Node tests passed: safe, tight, and urgent reserve calculations; planning-order and refuel checks; scope-bounded recommendation; and provenance-bearing local fallback report.
- **Command or check:** `python3 -m unittest discover -s tests/ai -p "test_*.py" -v`
- **Result:** 24/24 tests passed, including exact canonical output checks for all three seeded report inputs.
- **Command or check:** Browser walkthrough at `http://127.0.0.1:4173`
- **Result:** The planning ledger, recommended plan, rejected loop, and the existing trip watch -> driver acknowledgment -> report draft -> confirmation flow all rendered and changed local state. The confirmation visibly states that no external action was taken.

## Limits Or Risks

- The present scenario is intentionally local. The planning preview uses invented coordinates, fuel stops, and distances; it is not a live planning engine. The visible exception flow is pinned to the urgent case; safe and tight are canonical fixtures plus tested data states, not yet a visible scenario selector.
- The static browser shell uses its local deterministic fallback. The provider-neutral Python report module is independently validated and remains ready for a later single integration seam.
- No provider endpoint is called. The report is explicitly labeled as a deterministic local fallback.

## Next Small Action

- Re-record or update the short demo walkthrough to include the local planning preview before Trip Watch.
- Keep the current `app/` demo shell as the one visible flow. Do not attach real map, station, or routing feeds for this Build Week submission.
