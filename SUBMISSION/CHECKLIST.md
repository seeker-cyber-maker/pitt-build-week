# PITT Submission Checklist

> Organized by readiness. Only items confirmed by repository evidence are marked ready.
> Uncertain hackathon requirements are marked as pending verification.

---

## Ready

- [x] **Repository is private and accessible to collaborators.**
  Confirmed via `CONTROL/COLLABORATORS.md`; Patrick Simard has write access on his lane.

- [x] **README describes the project scope and demo boundary.**
  `README.md` states the single scenario, local-only data, and the driver-in-control constraint.

- [x] **Product scope document defines what is and is not built.**
  `CONTROL/PRODUCT_SCOPE.md` lists the demonstrable story, required demo elements, and explicit exclusions.

- [x] **Local run instructions work.**
  `npm test` runs Node.js scenario and contract tests. `python3 -m http.server 4173 --directory app` serves the demo. Both documented in `package.json`.

- [x] **Node.js tests pass.**
  `npm test` — 6 tests across `tests/scenario.test.mjs`, `tests/report-contract.test.mjs`, and `tests/app-ui-contract.test.mjs`. Covers safe/tight/urgent reserves, report contract shape, UI element binding, and provenance wording.

- [x] **Python AI/report tests pass.**
  `python3 -m unittest discover -s tests/ai -p "test_*.py" -v` — 24 tests covering deterministic fallback for all three seeded inputs, provider error handling (HTTP error, connection error, timeout, malformed response, empty response), AI success path, configuration detection, secret masking, and report-result contract shape.

- [x] **Seeded demo scenario is documented.**
  `DEMO_SCENARIO.md` states every fact with source references to `app/scenario.js` and canonical fixtures.

- [x] **Three-minute video script is written.**
  `SUBMISSION/VIDEO_SCRIPT.md` follows the visible three-step flow and explains AI tooling use honestly.

- [x] **Build log is seeded with confirmed milestones.**
  `CODEX_BUILD_LOG.md` records milestones traceable to commit hashes and test evidence.

- [x] **Handoff records all changed paths and validation.**
  `HANDOFFS/Research.md` lists every path created, validation performed, and open questions.

- [x] **Demo runs without login, API keys, or external dependencies.**
  The app serves from `app/` with `python3 -m http.server`. No authentication, no database, no build step.

- [x] **Driver remains the decision-maker in every flow.**
  The review toggle gates the report draft. The confirmation states no external action was taken.

- [x] **Every claim cross-checked against `CONTROL/PRODUCT_SCOPE.md`.**
  No submission artifact claims live data, production safety, regulatory compliance, or real-time optimization.

---

## Pending

- [ ] **Video recording.**
  Script is ready (`SUBMISSION/VIDEO_SCRIPT.md`). Recording needs to be captured from a local browser session.

- [ ] **Screenshots for submission.**
  Screenshots of all three demo steps should be captured from a running instance. No screenshots exist in the repository yet.

- [ ] **Devpost or submission-portal project page.**
  Pending verification: confirm the exact submission platform, required fields, and deadline. The video script and README are ready to adapt.

- [ ] **Deployment or hosted demo URL.**
  The demo is a static site and could be deployed to any static host. No deployment has been configured. Pending: confirm whether a hosted URL is required or if a local-run video is sufficient.

- [ ] **Team member listing for submission form.**
  Confirm required fields: name, role, email, GitHub handle. Known contributors: repository owner (integration), Patrick Simard (AI/report boundary).

- [ ] **Submission category or track.**
  Pending verification: confirm which Build Week category or track applies.

- [ ] **License or open-source disclosure.**
  No LICENSE file exists in the repository. Pending: confirm whether one is required for submission.

---

## Blocked

- [ ] **AI-assisted report demo recording with a live provider.**
  Blocked on a configured `PITT_AI_BASE_URL`, `PITT_AI_API_KEY`, and `PITT_AI_MODEL`. The deterministic fallback is fully functional and can be demonstrated without this.

---

## Final Review (Before Submitting)

- [ ] Re-run `npm test` — confirm all tests pass.
- [ ] Re-run `python3 -m unittest discover -s tests/ai -p "test_*.py" -v` — confirm all tests pass.
- [ ] Run `git diff --check` — confirm no whitespace errors.
- [ ] Read every claim in the submission against `CONTROL/PRODUCT_SCOPE.md`.
- [ ] Confirm no secrets, keys, personal data, or screenshots with personal data in the repository.
- [ ] Confirm the demo runs from a clean clone with no external dependencies beyond Node.js and Python 3.
