# Harness Handoff: Research

- **Status:** complete
- **Lane:** Submission
- **Branch/worktree:** `harness/research-submission` / `/Volumes/GitHub/GitHub/worktrees/pitt-research-submission`
- **Started:** 2026-07-19

## Changed Or Investigated

### New files (submission lane only)

- `DEMO_SCENARIO.md` — Exact narrative of the seeded urgent trip with source references to `app/scenario.js` and canonical fixtures.
- `SUBMISSION/VIDEO_SCRIPT.md` — Three-minute spoken walkthrough matching the visible three-step flow. Explains Codex and GPT-5.6 roles without invented claims.
- `SUBMISSION/CHECKLIST.md` — Submission readiness checklist. Ready, pending, and blocked sections. Uncertain hackathon requirements marked as pending verification.
- `CODEX_BUILD_LOG.md` — Append-only build log seeded with confirmed milestones. Each entry references a commit hash and/or file path.
- `HANDOFFS/Research.md` — This file.

### Files read but not modified

- `README.md`
- `CONTROL/PRODUCT_SCOPE.md`
- `CONTROL/WORKBOARD.md`
- `CONTROL/HARNESS_BRIEF.md`
- `CONTROL/COLLABORATORS.md`
- `CONTROL/COLLATION_REPORT.md`
- `CONTROL/PROMPTS/RESEARCH_SUBMISSION.md`
- `CONTROL/PROMPTS/AGY_PRODUCT_UI.md`
- `CONTROL/PROMPTS/OPENCODE_SCENARIO.md`
- `CONTROL/PROMPTS/PATRICK_AI_REPORT.md`
- `CONTROL/CONTRACTS/REPORT_DRAFT_V1.md`
- `CONTROL/CONTRACTS/ROUTING_CONTRACT_V1.md`
- `CONTROL/fixtures/report-input.seeded-demo.v1.json`
- `CONTROL/fixtures/report-output.fallback.v1.json`
- `HANDOFFS/Codex.md`
- `HANDOFFS/Patrick.md`
- `app/scenario.js`
- `app/app.js`
- `app/index.html`
- `package.json`
- `tests/scenario.test.mjs`
- `tests/report-contract.test.mjs`
- `tests/app-ui-contract.test.mjs`
- `tests/ai/test_report_generator.py`
- `IMPLEMENTATION_COMPLETE.md`
- `WORKLOG.md`

## Evidence

- **Command or check:** `npm test`
- **Result:** 8/8 tests passed (scenario coverage, report contract, UI contract, provenance wording).

- **Command or check:** `python3 -m unittest discover -s tests/ai -p "test_*.py" -v`
- **Result:** 24/24 tests passed (deterministic fallback, provider errors, AI success, config, contract shape).

- **Command or check:** `git diff --check`
- **Result:** Clean — no whitespace errors.

- **Command or check:** Every claim in the five new files reviewed against `CONTROL/PRODUCT_SCOPE.md`.
- **Result:** No claim of live data, production safety, regulatory compliance, or real-time optimization found.

## Limits Or Risks

- No application code, contracts, fixtures, routing logic, or UI was modified.
- The video script has not been recorded yet. The script text is ready.
- Screenshots have not been captured. The demo runs locally and screenshots can be taken from a browser session.
- Specific hackathon submission-platform requirements (Devpost fields, category, deadline) are not confirmed in repository evidence and are marked as pending verification in the checklist.

## Open Questions (Require Human Verification)

1. **Submission platform:** Is the submission through Devpost or another portal? What fields are required?
2. **Deployment requirement:** Is a hosted demo URL required, or is a local-run video sufficient?
3. **Team listing:** What format is needed for team member details on the submission form?
4. **Submission category/track:** Which Build Week category or track applies to PITT?
5. **License requirement:** Does the submission require a LICENSE file in the repository?
6. **Video format:** What are the required video format, resolution, and hosting requirements (YouTube, Loom, direct upload)?
7. **AI provider for demo recording:** Should the video show the deterministic fallback only, or should a configured GPT-5.6 endpoint be available for the recording?

## Next Small Action

- Integration merged the submission evidence at `091c13a`, corrected the stale Node test count to 8, and removed the unsupported implication that GPT-5.6 is configured for the recording.
- A human should review the open questions above before final submission.
