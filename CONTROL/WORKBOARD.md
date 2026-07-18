# PITT Workboard

## Objective

Deliver a credible, runnable Build Week demo before the deadline, with a small evidence trail that makes collaboration and judging easy.

## Working Rules

- `main` is integration-only. Do not use it for exploratory edits.
- One lane owns a file group at a time. Do not edit another lane's owned files without recording a handoff request.
- A lane reports: changed paths, acceptance command/result, known limits, and next step.
- Treat generated content and model answers as untrusted until a deterministic check or human review validates them.
- Do not add unlicensed live map/traffic/fleet data to the demo.

## Active Task List

| Status | Lane | Owner / Harness | Deliverable | Acceptance check |
| --- | --- | --- | --- | --- |
| in progress | Integration | Codex | Runnable app shell, scope guard, final merge | Seeded flow runs locally and build evidence is captured |
| ready | Scenario engine | OpenCode | Deterministic trip data, reserve-risk calculator, report payload schema | Unit cases cover safe, tight, and urgent reserve states |
| ready | Product UI | AGY | Three-screen demo flow: trip, alert, review/report | Every visible control is wired to local state |
| ready | AI/report boundary | Patrick / Claude | Provider adapter with a deterministic offline fallback | Live call works when configured; fallback shows provenance when not |
| ready | Submission | Research / writer lane | Demo script, README, build log, submission checklist | 3-minute narration script matches current UI |
| later | Integrations | None | Real traffic, maps, ELD/telematics, fuel feeds | Explicitly out of Build Week scope |

## File Ownership

| Lane | Primary paths |
| --- | --- |
| Integration | `app/`, `scripts/`, `CONTROL/`, top-level docs |
| Scenario engine | `packages/scenario/`, `tests/scenario/` |
| Product UI | `packages/web/` |
| AI/report boundary | `packages/ai/`, `tests/ai/`, `.env.example` |
| Submission | `SUBMISSION/`, `DEMO_SCENARIO.md`, `CODEX_BUILD_LOG.md` |

## Collation Protocol

Before work stops, update `HANDOFFS/<harness>.md` from the template. The integrator runs:

```bash
python3 scripts/collate_handoffs.py
```

This writes `CONTROL/COLLATION_REPORT.md`. It is a readout, not a merge. The integrator reviews the report, verifies the cited commands, then chooses what enters `main`.
