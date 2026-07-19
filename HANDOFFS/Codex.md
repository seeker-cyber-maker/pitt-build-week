# Harness Handoff: Codex

- **Status:** current correction verified locally; ready to publish
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
- Added a driver-controlled seeded day playback: five delivery legs, a noon price spike, a 3 PM price drop, explicit keep-or-recalculate choices, and a final delivery-outcome summary. The price events modify only the local planning preview and retain the no-live-data boundary.
- Added display-only metric/imperial and CAD/USD local-money controls. Distances and fuel volumes convert between physical units; currency values keep their seeded local numeric value and only change label, with an explicit no-exchange-rate disclosure.
- Added a compact `pitt.trip_handoff.v1` Lua-table machine handoff to the final report. It includes route, refuel, completed leg data, units, and review state; the copy action remains local and the payload explicitly records `external_action = false`.
- Diagnosed a public toggle failure as stale GitHub Pages module caching: newer HTML had controls while an older `app.js` lacked their listeners. The module now uses a versioned query string; the deployed controls were clicked and verified live.
- Made Trip Watch authoritative for the report gate: review opens only after an early route closure or normal route completion.
- An early route closure now preserves recorded delivery results and marks each remaining delivery as `Undelivered` with `Route closed early before delivery attempt`; the report and Lua handoff share that disposition.

## Evidence

- **Command or check:** `npm test`
- **Result:** 19/19 Node tests passed: safe, tight, and urgent reserve calculations; planning-order and refuel checks; price-event transitions; delivery-outcome summary; scope-bounded recommendation; and provenance-bearing local fallback report.
- **Command or check:** `python3 -m unittest discover -s tests/ai -p "test_*.py" -v`
- **Result:** 24/24 tests passed, including exact canonical output checks for all three seeded report inputs.
- **Command or check:** Browser walkthrough at `http://127.0.0.1:4173`
- **Result:** Desktop and mobile walkthroughs completed the five-leg playback, chose both price recalculations, and rendered the final delivery-outcome summary alongside the existing trip watch -> driver acknowledgment -> report draft -> confirmation flow. The confirmation visibly states that no external action was taken.
- **Command or check:** Local early-close walkthrough.
- **Result:** Closing after leg 1 produced one recorded `Delivered` outcome and four explicit `Undelivered` outcomes in both the visible report and `pitt.trip_handoff.v1`.

## Limits Or Risks

- The present scenario is intentionally local. The planning preview uses invented coordinates, fuel stops, and distances; it is not a live planning engine. The visible exception flow is pinned to the urgent case; safe and tight are canonical fixtures plus tested data states, not yet a visible scenario selector.
- The static browser shell uses its local deterministic fallback. The provider-neutral Python report module is independently validated and remains ready for a later single integration seam.
- No provider endpoint is called. The report is explicitly labeled as a deterministic local fallback.

## Next Small Action

- **Current correction:** published Trip Watch authority and early-close delivery disposition.
- **Acceptance:** deploy the current commit to GitHub Pages and smoke-check that the cache-keyed module is served. Keep the seeded/no-live-data boundary.
