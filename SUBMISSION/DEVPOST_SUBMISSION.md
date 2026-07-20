# PITT — Devpost Submission Text

> Ready to copy-paste into Devpost. Every claim is classified and cross-checked against `CONTROL/PRODUCT_SCOPE.md`.
> Official challenge: https://openai.devpost.com/ | Track: Work and Productivity
> Deadline: July 21, 2026 at 5:00 PM PDT

---

## Project Name

**PITT** — AI Co-Pilot for Delivery Drivers

## Tagline / Elevator Pitch

A driver-first trip-exception assistant that explains delays, suggests reviewable corrections, and drafts reports — without taking control away from the driver.

## The Problem

Every delivery driver knows the scenario: you're halfway through your day, a delay hits, and now your fuel reserve is tighter than planned. Existing GPS apps show you the shortest route, but they don't explain **why** a longer detour might save you an hour. Fleet dashboards log exceptions after the fact, but they don't help the driver decide in the moment. The driver is left doing mental math, guessing at trade-offs, and filling out paperwork later.

## What PITT Does (Current POC)

PITT is a local, runnable proof of concept built for OpenAI Build Week. It demonstrates a reviewable exception-and-report flow using only seeded, deterministic data — no live traffic, no real maps, no API keys required.

**1. Simulated Planning Preview**
A delivery ledger orders five stops by time window. A recommended corridor is compared against a deliberately wasteful loop. A reachable fuel stop is inserted before the reserve floor would fail. All coordinates, stations, prices, and traffic are seeded local demo data.

**2. Driver-Controlled Day Playback**
Advance through five legs. At noon and 3 PM, choose whether to recalculate after seeded price events. Fuel state and delivery outcomes follow your choices.

**3. Trip Exception & Review**
When a delay pushes projected fuel reserve below the carrier's policy floor, PITT explains the gap, suggests one pre-approved stop with alternatives, and **requires explicit driver review** before generating a report. No automatic action.

**4. Report Draft**
A deterministic fallback report restates every fact. When an approved AI endpoint is configured, an optional provider-neutral adapter drafts a natural-language narrative while preserving every deterministic fact verbatim. If the call fails, PITT falls back automatically.

**Live demo:** https://seeker-cyber-maker.github.io/pitt-build-week/

## How We Built It

**Codex** managed the integration lane — establishing collaboration lanes and contracts, implementing deterministic demo modules, adding regression tests, and maintaining the evidence trail that ties every claim to committed code and validation.

**GPT-5.6** informed the bounded product and report-contract design, including the provider-neutral report contract and its requirement that deterministic facts remain authoritative.

The runnable demo deliberately uses the deterministic local fallback so a reviewer can test it without credentials. An optional OpenAI-compatible report adapter is present for later approved use; it is not required for the POC to function and does not issue driver instructions.

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

## Challenges We Ran Into

- **Scope discipline:** The demo is intentionally narrow. Every time we considered adding a live provider, a database, or a framework, we had to reject it to keep the demo runnable without credentials.
- **Narrative accuracy:** We had to resist the temptation to present seeded demo data as live routing. The "Demo scenario · local data only" label is always visible.
- **Report contract design:** Balancing a provider-neutral AI adapter with a deterministic fallback that preserves every fact required careful contract design. The result is `pitt.report-input.v1` → `pitt.report-draft.v1`.

## Accomplishments That We're Proud Of

- **24 Python tests** covering deterministic fallback for all three seeded inputs, provider error handling, AI success path, configuration detection, secret masking, and contract shape.
- **23 Node tests** covering planning, day playback, fuel simulation, scenario logic, report contract, and UI contract.
- **Driver review gate** — the report button is disabled until the driver explicitly confirms review. No autonomous action.
- **Provider-neutral architecture** — the AI adapter can use any OpenAI-compatible endpoint, or run entirely offline with deterministic fallback.

## What We Learned

- **Time is the currency that matters.** Every experienced driver knows that "saving kilometers" is worthless if you lose two hours in a traffic jam. The demo's fuel story is a proxy for the real value: helping the driver make time-saving decisions with clear explanations.
- **Transparency beats black-box optimization.** A driver who understands *why* a correction is suggested is more likely to trust and use it. The deterministic fallback report, with its visible provenance and limitations, builds that trust.
- **Offline-first is not a limitation — it's a feature.** The deterministic fallback means PITT is always useful, even without network access or AI credentials.

## What's Next for PITT

1. **Pilot the driver companion** with a small fleet to validate which report fields save meaningful time without becoming duplicate paperwork.
2. **Design fleet workflow adapters** for existing dispatch, ELD, map, and fuel-card systems.
3. **Explore conversational AI** for real-time course correction that explains time-vs-distance-vs-fuel trade-offs in natural language.

See `CONTROL/PRODUCT_DIRECTION.md` for the full validation plan and explicit non-claims.

## Built With

- **Codex** — Integration lane, collaboration structure, deterministic demo modules, regression tests
- **GPT-5.6** — Product and report-contract design, provider-neutral adapter design
- **Python 3** — `packages/ai/` report module with deterministic fallback
- **Vanilla JavaScript** — `app/` demo shell, no framework, no build step
- **GitHub Pages** — Static demo hosting

## Try It Out

- **Live demo:** https://seeker-cyber-maker.github.io/pitt-build-week/
- **Repository:** https://github.com/seeker-cyber-maker/pitt-build-week
- **Video:** [YouTube link — to be added after recording]
- **Run locally:**
  ```bash
  git clone https://github.com/seeker-cyber-maker/pitt-build-week.git
  cd pitt-build-week
  npm test
  npm run serve
  # Open http://127.0.0.1:4173
  ```

## Team

- **Patrick Simard** (@psimardgit) — AI/report boundary, operational reviewer (25+ years cross-border driving experience)
- **Integration lead** — Codex-managed collaboration structure, demo shell, scenario integration

## Open Operational Questions

- Which report fields save a driver meaningful time without becoming duplicate paperwork?
- Does a driver companion, a fleet workflow layer, or a customer-operated deployment create the clearest first commercial offering?

---

*Prepared according to `CONTROL/PROMPTS/PATRICK_SUPPORTING_DOCUMENTATION.md`.*
*Every feature statement classified as Current POC, Simulated demo behavior, Commercial direction, or Not built.*
*Cross-checked against `CONTROL/PRODUCT_SCOPE.md` — no live data, production safety, regulatory compliance, or real-time optimization is claimed.*
