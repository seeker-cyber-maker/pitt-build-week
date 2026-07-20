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
| complete | Simulated route planning | Codex integration | Local delivery ledger, route-ordering and refuel preview, recommended/rejected map comparison | Node tests prove ordering, reachable refuel insertion, and loop penalty; UI labels it simulated |
| complete | Scenario data and reserve logic | Codex integration | Canonical safe, tight, and urgent fixtures plus deterministic local calculation | All three states are driver-validated and covered by tests; avoid a duplicate engine |
| ready | Product UI | AGY | Three-screen demo flow: trip, alert, review/report | Every visible control is wired to local state |
| complete | AI/report boundary | Patrick / Claude | Provider adapter with a deterministic offline fallback | 21 Python tests and exact canonical fixture comparison pass |
| complete | Routing contract review | Patrick / Claude | Driver-informed review of `ROUTING_CONTRACT_V1.md` | Five operational questions answered; accepted contract clarifications applied by integration |
| complete | Driver demo walkthrough | Patrick / Claude, integrated by Codex | Five-minute local-demo usability review in Patrick's handoff | Accepted findings applied and verified against the current UI |
| in progress | Submission | Integration | Demo script, README, build log, submission checklist | Updated narration script matches the planning preview and three-step flow |
| later | Integrations | None | Real traffic, maps, ELD/telematics, fuel feeds | Explicitly out of Build Week scope |

## File Ownership

| Lane | Primary paths |
| --- | --- |
| Integration | `app/`, `scripts/`, `CONTROL/`, top-level docs |
| Scenario engine | `packages/scenario/`, `tests/scenario/` |
| Product UI | `packages/web/` |
| AI/report boundary | `packages/ai/`, `tests/ai/`, `.env.example` |
| Submission | `SUBMISSION/`, `DEMO_SCENARIO.md`, `CODEX_BUILD_LOG.md` |

## Domain Steering

- `CONTROL/OPERATIONAL_DESIGN_INPUTS.md` is the shared source for operational feedback. Mapping/route-planning work follows Patrick's driver-workflow guidance; later small-fleet feedback informs report requirements only.
- No operational input authorizes a live integration or expands the Build Week product boundary.

## Collation Protocol

Before work stops, update `HANDOFFS/<harness>.md` from the template. The integrator runs:

```bash
python3 scripts/collate_handoffs.py
```

This writes `CONTROL/COLLATION_REPORT.md`. It is a readout, not a merge. The integrator reviews the report, verifies the cited commands, then chooses what enters `main`.

## Shared-File Rule

Lane work stays inside its owned paths. `HANDOFFS/<lane>.md` belongs to that lane; `CONTROL/COLLATION_REPORT.md`, this workboard, and shared contracts belong to the integration lane. A contributor proposes shared-file changes in its handoff instead of editing the shared file directly.
