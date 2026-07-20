# PITT — AI Co-Pilot for Delivery Drivers

> A driver-first, reviewable trip-exception assistant built for OpenAI Build Week.

**PITT** turns a delivery delay into a visible, explainable decision — and a reviewable report — without taking control away from the driver. The current Build Week demo is a local, seeded proof of concept. The commercial direction is a conversational AI companion that saves driving time by reacting to the unexpected, with fuel and report handling as contextual bonuses.

---

## What the Demo Does (Current POC)

This is a runnable, dependency-free local demo. It uses only seeded data and works without credentials, API keys, or network access.

1. **Simulated Planning Preview** — A delivery ledger orders five stops by time window. A recommended corridor is compared against a deliberately wasteful loop. A reachable fuel stop is inserted before the reserve floor would fail. All coordinates, prices, and traffic patterns are seeded local demo data.

2. **Driver-Controlled Day Playback** — Advance through five legs. At noon and 3 PM, choose whether to recalculate the route after seeded price events. Fuel state and delivery outcomes follow your choices.

3. **Trip Exception & Review** — When a delay pushes projected fuel reserve below the carrier's policy floor, PITT explains the gap, suggests one pre-approved stop with alternatives, and requires explicit driver review before generating a report.

4. **Report Draft** — A deterministic fallback report restates every fact. When an approved AI endpoint is configured, an optional provider-neutral adapter drafts a natural-language narrative while preserving every deterministic fact verbatim. If the call fails, PITT falls back automatically.

**Live demo:** https://seeker-cyber-maker.github.io/pitt-build-week/

---

## The Vision (Commercial Direction)

PITT is being explored as a **driver companion**, not a dispatch system.

**What makes it different from existing GPS apps:**
- **Conversation-driven corrections** — The driver asks, the AI explains the trade-off (time vs. distance vs. fuel), and the driver decides. No black-box routing.
- **Time saved, not distance shaved** — A longer route that avoids a 45-minute standstill is the better route. Existing apps predict traffic from historical patterns; PITT would react to the unexpected in real time.
- **Contextual features** — Fuel stops, report drafts, and delivery adjustments appear only when a delay or exception makes them necessary.

**Three potential stages:**
1. **Driver Companion** — Low-friction day planning, reserve warnings, exception capture, and end-of-trip reporting.
2. **Fleet Workflow Layer** — Documented adapters to existing dispatch, ELD, map, fuel-card, or delivery-proof systems.
3. **Enterprise / Sovereign Deployment** — Tenant-controlled inference, data-retention policy, and offline/degraded operation.

See `CONTROL/PRODUCT_DIRECTION.md` for validation questions, non-claims, and the honest boundary between POC and product.

---

## Run the Local Demo

```bash
npm test          # 23 Node tests: planning, playback, fuel, scenario, report contract, UI contract
npm run serve     # python3 -m http.server 4173 --directory app
```

Open `http://127.0.0.1:4173` and complete the visible path:

1. Inspect the simulated delivery ledger and compare the recommended corridor against the rejected loop.
2. Advance the seeded day; at noon and 3 PM, compare a fuel-price recalculation with keeping the current route.
3. Review the seeded trip and acknowledge the deterministic reserve-risk recommendation.
4. Review and confirm the locally generated report draft, including its leg-level delivery outcomes.

**Python AI/report tests:**
```bash
python3 -m unittest discover -s tests/ai -p "test_*.py" -v
# 24 tests: deterministic fallback for all three seeded inputs, provider error handling,
# AI success path, configuration detection, secret masking, and contract shape.
```

---

## Demo Boundary

PITT does **not** control a vehicle, dispatch real routes, access regulated vehicle systems, or claim live traffic, mapping, real station information, or fuel-pricing data. Its route diagram uses clearly labelled invented coordinates, local deterministic calculations, seeded fuel prices balanced against simulated detour cost, and a seeded weekday historical-traffic reference at predicted presence times. Model output is a reviewable draft, never an autonomous instruction.

The display can switch between metric and imperial physical units. It can also label the seeded local-money scenario as CAD or USD; this is not a currency-conversion feature and does not use an exchange-rate feed.

The report includes a compact Lua-table machine handoff for a later approved workflow. It remains local, shows `driver_review_required` until the driver confirms review, and never sends or triggers downstream automation on its own.

---

## How We Used Codex and GPT-5.6

**Codex** managed the integration lane — establishing collaboration lanes and contracts, implementing deterministic demo modules, adding regression tests, and maintaining the evidence trail that ties every claim to committed code and validation.

**GPT-5.6** informed the bounded product and report-contract design, including the provider-neutral report contract and its requirement that deterministic facts remain authoritative.

The runnable demo deliberately uses the deterministic local fallback so a reviewer can test it without credentials. An optional OpenAI-compatible report adapter is present for later approved use; it is not required for the POC to function and does not issue driver instructions.

---

## Project Structure

```
app/                          # Local demo shell (no framework, no build step)
  app.js                      # Demo flow: planning → Trip Watch → review → report
  scenario.js                 # Seeded trips, deterministic reserve logic
  planner.js                  # Delivery ledger, route comparison, refuel selection
  day-playback.js             # Driver-controlled day progression
  fuel-simulation.js          # Fuel state, price events
  index.html, styles.css      # Presentation layer

packages/ai/                  # Provider-neutral report module (Python)
  report_generator.py         # Deterministic fallback + optional AI-assisted path
  models.py                   # pitt.report-input.v1 / pitt.report-draft.v1
  config.py                   # Secret-safe provider configuration
  tests/ai/                   # 24 unit tests

CONTROL/                      # Scope, contracts, workboard, fixtures
SUBMISSION/                   # Build Week submission artifacts
HANDOFFS/                     # Lane handoffs with evidence and next steps
```

---

## Classification of Every Claim

| Capability | Status |
|---|---|
| Seeded delivery ordering + route comparison | **Current POC** — runnable in demo, tested |
| Deterministic fuel-reserve calculation | **Current POC** — runnable in demo, tested |
| Driver review gate + report draft | **Current POC** — runnable in demo, tested |
| AI-assisted narrative (fallback when offline) | **Current POC** — Python module tested, deterministic path runs without credentials |
| Seeded day playback with price events | **Current POC** — runnable in demo, tested |
| Live traffic / GPS / mapping | **Not built** — intentionally out of scope |
| Real-time route correction | **Simulated demo behavior** — seeded historical patterns only |
| Fleet integrations (ELD, dispatch, fuel-card) | **Commercial direction** — requires validation and authorization |
| Conversational AI time-saving optimization | **Commercial direction** — future product hypothesis |

---

## License

[MIT](LICENSE) — Open source for Build Week submission.

---

*Built for the OpenAI Build Week — Work and Productivity track.*
*See `SUBMISSION/DEVWEEK_REFERENCES.md` for official requirements and deadline.*
