# PITT Submission Checklist

> Organized by readiness. Only items confirmed by repository evidence are marked ready.
> Official requirements were checked 2026-07-20; see `SUBMISSION/DEVWEEK_REFERENCES.md` and re-check Devpost immediately before submission.

---

## Ready

- [x] **Repository is public and accessible to judges.**
  Confirmed at `https://github.com/seeker-cyber-maker/pitt-build-week`; collaborator workflow is recorded in `CONTROL/COLLABORATORS.md`.

- [x] **README describes the project scope and demo boundary.**
  `README.md` states the single scenario, local-only data, and the driver-in-control constraint.

- [x] **Product scope document defines what is and is not built.**
  `CONTROL/PRODUCT_SCOPE.md` lists the demonstrable story, required demo elements, and explicit exclusions.

- [x] **Local run instructions work.**
  `npm test` runs Node.js scenario and contract tests. `python3 -m http.server 4173 --directory app` serves the demo. Both documented in `package.json`.

- [x] **Node.js tests pass.**
  `npm test` — 23 tests across planning, day playback, fuel simulation, scenario, report-contract, and UI-contract coverage. Includes traffic-at-predicted-presence, price-event decisions, early close, and review-gated handoff behavior.

- [x] **Python AI/report tests pass.**
  `python3 -m unittest discover -s tests/ai -p "test_*.py" -v` — 24 tests covering deterministic fallback for all three seeded inputs, provider error handling (HTTP error, connection error, timeout, malformed response, empty response), AI success path, configuration detection, secret masking, and report-result contract shape.

- [x] **Seeded demo scenario is documented.**
  `DEMO_SCENARIO.md` states every fact with source references to `app/scenario.js` and canonical fixtures.

- [ ] **Under-three-minute video script is ready for recording.**
  `SUBMISSION/VIDEO_SCRIPT.md` needs a final timing trim. Devpost requires a public YouTube video under three minutes with audio showing the project and covering Codex/GPT-5.6 use.

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

- [x] **Commercial direction is documented separately from the POC.**
  `CONTROL/PRODUCT_DIRECTION.md` records driver-companion, fleet-workflow, and customer-operated deployment hypotheses without presenting them as implemented capability.

- [x] **Submission narrative and Devpost draft are ready for final form entry.**
  `SUBMISSION/PRODUCT_NARRATIVE.md` and `SUBMISSION/DEVPOST_SUBMISSION.md` distinguish the working seeded POC from future commercial validation work.

---

## Pending

- [ ] **Video recording.**
  Script targets 2:30 (`SUBMISSION/VIDEO_SCRIPT.md`). Recording needs to be captured from a local browser session, uploaded publicly to YouTube, and checked for clear audio and a working-demo view.

- [ ] **Screenshots for submission.**
  Screenshots of all three demo steps should be captured from a running instance. No screenshots exist in the repository yet.

- [ ] **Devpost project page.**
  Submission is through `https://openai.devpost.com/`; deadline is July 21, 2026 at 5:00 PM PDT. Enter the project description, Work and Productivity track, public YouTube video, repository, and Codex `/feedback` session ID.

- [x] **Hosted demo URL is available.**
  GitHub Pages is public at `https://seeker-cyber-maker.github.io/pitt-build-week/`. Before submission, perform one clean-browser smoke check against the current release.

- [ ] **Team member listing for submission form.**
  Confirm required fields: name, role, email, GitHub handle. Known contributors: repository owner (integration), Patrick Simard (AI/report boundary).

- [x] **Submission category or track.**
  `Work and Productivity` fits the driver and fleet workflow focus.

- [ ] **Public-repository license.**
  The repository is public, so add an appropriate license before submission or verify that Devpost accepts the public code under the repository's current terms. Private-repository sharing is not the selected path.

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
