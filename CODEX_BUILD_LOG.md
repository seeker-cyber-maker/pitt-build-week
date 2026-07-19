# PITT Build Log

> Append-only record of confirmed Build Week milestones.
> Each entry references a commit hash, file path, or test command.
> Do not fabricate dates, test results, or external feedback.

---

## Format

```
### [Short title]
- **Commit:** [hash] or "multiple" with list
- **Files:** key paths changed
- **Evidence:** command and result
- **Notes:** context or limitations
```

---

### Multi-harness collaboration structure
- **Commit:** `8536d12`
- **Files:** `README.md`, `CONTROL/PRODUCT_SCOPE.md`, `CONTROL/WORKBOARD.md`, `CONTROL/HARNESS_BRIEF.md`, `CONTROL/PROMPTS/`, `HANDOFFS/_TEMPLATE.md`, `scripts/collate_handoffs.py`
- **Evidence:** Repository structure reviewed; collation script present.
- **Notes:** Established lane ownership, file-ownership table, handoff protocol, and product-scope boundary before any application code.

### Collaborator lane for AI report drafting
- **Commit:** `a971584`
- **Files:** `CONTROL/COLLABORATORS.md`, `HANDOFFS/Patrick.md`
- **Evidence:** Patrick Simard assigned to `packages/ai/`, `tests/ai/`, `.env.example`.
- **Notes:** Write access bounded to the AI/report lane only.

### Runnable local demo baseline
- **Commit:** `cf9118c`
- **Files:** `app/index.html`, `app/app.js`, `app/scenario.js`, `app/styles.css`, `package.json`
- **Evidence:** `npm run serve` starts a static server at port 4173. Three-step flow (trip watch → driver review → report draft) completes locally.
- **Notes:** No build step, no framework, no external dependencies. Demo label visible in the header.

### Deterministic reserve logic with safe/tight/urgent coverage
- **Commit:** `95fa43f`
- **Files:** `app/scenario.js`, `tests/scenario.test.mjs`
- **Evidence:** `npm test` — tests confirm `safe` (reserve gap +6%), `tight` (gap 0%), and `urgent` (gap −5%) states match expected arithmetic.
- **Notes:** `calculateRisk` uses only seeded input fields. No external data sources.

### Provider-safe AI report fallback
- **Commits:** `379ea37`, `3aa333f`, `d3e4fa2`, `52848e2`
- **Files:** `packages/ai/report_generator.py`, `packages/ai/config.py`, `packages/ai/models.py`, `packages/ai/__init__.py`, `tests/ai/test_report_generator.py`
- **Evidence:** `python3 -m unittest discover -s tests/ai -p "test_*.py" -v` — 24 tests pass. Covers unconfigured fallback, HTTP error, connection error, timeout, malformed response, empty response, valid AI response, configuration detection, secret masking, and contract shape.
- **Notes:** Deterministic fallback is always available. Provider calls use only `PITT_AI_BASE_URL`, `PITT_AI_API_KEY`, `PITT_AI_MODEL` from environment. Secrets are never logged.

### Report draft contract v1
- **Commit:** `52848e2` (alignment), fixtures added across integration merges
- **Files:** `CONTROL/CONTRACTS/REPORT_DRAFT_V1.md`, `CONTROL/fixtures/report-input.seeded-demo.v1.json`, `CONTROL/fixtures/report-output.fallback.v1.json`, `CONTROL/fixtures/report-input.seeded-safe.v1.json`, `CONTROL/fixtures/report-input.seeded-tight.v1.json`, `CONTROL/fixtures/report-output.seeded-safe.v1.json`, `CONTROL/fixtures/report-output.seeded-tight.v1.json`
- **Evidence:** `tests/report-contract.test.mjs` validates that the seeded input carries only bounded demo fields and the fallback output preserves provenance and driver review status.
- **Notes:** Input schema version `pitt.report-input.v1`; output schema version `pitt.report-draft.v1`. No VIN, license, latitude, longitude, or API key appears in any fixture.

### Routing contract review (operational input from Patrick)
- **Commits:** `7db0a7a`, `b39c98a`
- **Files:** `CONTROL/CONTRACTS/ROUTING_CONTRACT_V1.md`, `CONTROL/PROMPTS/PATRICK_ROUTING_REVIEW.md`
- **Evidence:** Contract reviewed for operational language. Recommendations applied: cooperative phrasing, explicit unknowns, degraded-mode requirements, and vehicle-profile structure that does not infer suitability.
- **Notes:** The routing contract is a future-integration interface. No live routing implementation exists for this submission.

### Driver walkthrough integration
- **Commits:** `7dcdd22`, `3aef825`
- **Files:** `CONTROL/PROMPTS/PATRICK_DEMO_WALKTHROUGH.md`, `app/scenario.js`, `tests/scenario.test.mjs`, `tests/app-ui-contract.test.mjs`
- **Evidence:** `npm test` — 8 tests pass. UI contract test confirms every `querySelector` target exists in `index.html`, and the fallback report uses plain-language provenance (not internal jargon).
- **Notes:** Walkthrough findings led to copy corrections: "below policy floor" language, selection-basis and alternatives in the report, and removal of internal terminology from driver-facing text.

### Seeded scenario validation (all three reserve states)
- **Commits:** `358a18f`, `35b1bef`, `95fa43f`
- **Files:** `app/scenario.js`, `CONTROL/fixtures/report-input.seeded-safe.v1.json`, `CONTROL/fixtures/report-input.seeded-tight.v1.json`, `CONTROL/fixtures/report-output.seeded-safe.v1.json`, `CONTROL/fixtures/report-output.seeded-tight.v1.json`
- **Evidence:** `npm test` confirms all three scenarios produce the expected reserve state. `python3 -m unittest discover -s tests/ai -p "test_*.py" -v` confirms all three seeded inputs produce matching deterministic report output.
- **Notes:** Visible demo pinned to urgent. Safe and tight are tested data states with canonical fixtures.

### Submission evidence lane
- **Commit:** (this commit)
- **Files:** `DEMO_SCENARIO.md`, `SUBMISSION/VIDEO_SCRIPT.md`, `SUBMISSION/CHECKLIST.md`, `CODEX_BUILD_LOG.md`, `HANDOFFS/Research.md`
- **Evidence:** All claims cross-checked against `CONTROL/PRODUCT_SCOPE.md`. `npm test` and `python3 -m unittest discover -s tests/ai -p "test_*.py" -v` run before commit.
- **Notes:** No application code changed. Submission artifacts only.
