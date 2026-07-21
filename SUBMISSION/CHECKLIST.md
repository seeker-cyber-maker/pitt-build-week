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

- [x] **Node.js and browser tests pass.**
  `npm test` — 27 tests across planning, moving weather, work-zone checks, day playback, fuel simulation, scenario, report-contract, and UI-contract coverage. `npx playwright test` — 4 browser outcomes covering price-hike refuel, price-drop refuel, the uneconomic second stop, and early closure after passing twice.

- [x] **Python AI/report tests pass.**
  `python3 -m unittest discover -s tests/ai -p "test_*.py" -v` — 24 tests covering deterministic fallback for all three seeded inputs, provider error handling (HTTP error, connection error, timeout, malformed response, empty response), AI success path, configuration detection, secret masking, and report-result contract shape.

- [x] **Seeded demo scenario is documented.**
  `DEMO_SCENARIO.md` states every fact with source references to `app/scenario.js` and canonical fixtures.

- [x] **Under-three-minute narration is ready for recording.**
  `SUBMISSION/NARRATION_QWEN3_TTS_V3.txt`, verified Qwen3 cues, timed captions, and `SUBMISSION/NARRATION_SYNC_PLAN_V3.md` define a 2:58.53 cut. Every cue has measured pre-roll, scene-level final-AAC transcription, and consistent `Pitt` pronunciation.

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

- [ ] **Entrant eligibility confirmed.**
  The official rules expressly exclude Quebec residents. Confirm the actual individual or organization entering the submission is eligible before submitting.

- [x] **Video v3 assembled and locally validated.**
  `SUBMISSION/final-video/pitt-devweek-submission-v3.mp4` is the final synchronized 2:58.53, 1920x1080 H.264/AAC cut. It has verified `Pitt` pronunciation, protected cue starts, scenario starting fuel conditions, scene-normalized narration, browser-only outcomes, one Codex contribution segment, and embedded English subtitles. Rebuild it with `scripts/build-submission-video-v3.sh`.

- [ ] **Public video upload.**
  Upload the v3 MP4 publicly to YouTube, add `SUBMISSION/PITT_VIDEO_CAPTIONS_V3.srt`, and check playback, audio, captions, and visibility while signed out.

- [x] **Screenshots for submission.**
  Four 1600×1000 captures under `SUBMISSION/screenshots/` show planning context, the uneconomic fuel detour, early route closure, and the report/machine handoff.

- [ ] **Devpost project page.**
  Submission is through `https://openai.devpost.com/`; deadline is July 21, 2026 at 5:00 PM PDT. Enter the project description, Work and Productivity track, public YouTube video, repository, and Codex `/feedback` session ID.

- [x] **Codex project-thread session ID recovered.**
  Local Codex session metadata identifies `019f8596-b0a4-7471-afc1-1b100df7f0e1` as the project thread used for the final four-outcome implementation and submission build. Confirm the Devpost field accepts this identifier when entering the submission.

- [x] **Hosted demo URL is available.**
  GitHub Pages is public at `https://seeker-cyber-maker.github.io/pitt-build-week/`. Before submission, perform one clean-browser smoke check against the current release.

- [ ] **Team member listing for submission form.**
  Confirm required fields: name, role, email, GitHub handle. Known contributors: repository owner (integration), Patrick Simard (AI/report boundary).

- [x] **Submission category or track.**
  `Work and Productivity` fits the driver and fleet workflow focus.

- [x] **Public-repository license.**
  The public repository includes an MIT `LICENSE`, and `package.json` declares `MIT`.

---

## Blocked

- [ ] **AI-assisted report demo recording with a live provider.**
  Blocked on a configured `PITT_AI_BASE_URL`, `PITT_AI_API_KEY`, and `PITT_AI_MODEL`. The deterministic fallback is fully functional and can be demonstrated without this.

---

## Final Review (Before Submitting)

- [x] Re-run `npm test` — 27/27 tests pass.
- [x] Re-run `npx playwright test` — 4/4 outcome tests pass.
- [x] Re-run `python3 -m unittest discover -s tests/ai -p "test_*.py" -v` — 24/24 tests pass.
- [x] Decode the complete final MP4 with FFmpeg — no errors.
- [x] Run `git diff --check` after final assembly changes — no whitespace errors.
- [ ] Read every claim in the submission against `CONTROL/PRODUCT_SCOPE.md`.
- [ ] Confirm no secrets, keys, personal data, or screenshots with personal data in the repository.
- [ ] Confirm the demo runs from a clean clone with no external dependencies beyond Node.js and Python 3.
