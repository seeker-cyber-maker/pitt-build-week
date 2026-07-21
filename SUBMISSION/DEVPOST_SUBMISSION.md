# PITT - Devpost Submission Text

> Copy-ready draft. Verify the form fields, video URL, `/feedback` session ID, and final wording against the official rules immediately before submission.

## Project Name

**PITT - Driver-First Trip Assistant**

## Elevator Pitch

A local, review-first trip-exception assistant that explains a delay, makes the fuel and timing trade-off visible, and drafts a report without taking control away from the driver.

## The Problem

When a delivery day changes, drivers often have to reconcile reserve, detour time, delivery windows, and exception paperwork from incomplete information. PITT explores a more inspectable workflow: show the facts, show a bounded option and its limitations, then let the driver decide.

## What PITT Does

PITT is a runnable local proof of concept built for OpenAI Build Week. It uses only seeded, deterministic data and requires no credentials or external API.

1. **Planning preview:** a local delivery ledger orders five simulated stops, compares a recommended corridor against a rejected loop, and inserts a simulated fuel stop before reserve policy fails.
2. **Trip Watch:** a five-leg seeded day responds to driver choices, including refuelling, continued travel, early closure, and noon/3 PM simulated fuel-price events.
3. **Exception review:** a seeded delay creates an urgent reserve gap. PITT presents the calculation, one pre-approved simulated stop, alternatives, and an explicit driver-review gate.
4. **Report draft:** a deterministic local report restates the final facts and delivery outcomes. A separate provider-neutral Python adapter can later draft an approved AI-assisted narrative while preserving deterministic facts.

The POC uses seeded historical traffic, moving weather, a road-work register at predicted presence times, made-up coordinates, simulated stations, simulated fuel prices, and local delivery proof records. It does **not** use live GPS, mapping, traffic, weather, construction, fuel prices, telematics, ELD, dispatch, or vehicle-control systems.

**Live demo:** https://seeker-cyber-maker.github.io/pitt-build-week/

## How We Built It

**Codex** was central to the integration work: it organized collaboration lanes and contracts, implemented and integrated the deterministic demo modules, added regression tests, and maintained an evidence trail linking claims to code and validation.

**GPT-5.6** supported the bounded product and report-contract design, including the rule that deterministic facts remain authoritative. The published demo intentionally uses its local deterministic fallback so judges can run it without credentials.

## Challenges

- Keeping the project runnable without credentials, a database, or a live provider.
- Demonstrating useful route and fuel reasoning without presenting seeded local data as live fleet data.
- Designing an optional AI narrative path that cannot rewrite authoritative calculations or bypass driver review.

## Accomplishments

- 27 Node tests covering planning, moving weather, work-zone checks, Trip Watch, fuel consequences, report gating, and UI wiring.
- 4 Playwright browser runs proving every fuel-decision outcome shown in the video.
- 24 Python tests covering report fallback, provider failures, contract shape, and secret-safe configuration.
- A driver-controlled end-to-end flow: plan, review a simulated exception, record the result, and produce a local handoff without external action.

## What We Learned

- A recommendation is more useful when its source, trade-off, and limitations are visible.
- Deterministic fallback is valuable for offline and credential-free demonstrations.
- The promising product question is not autonomous routing; it is whether an understandable, reviewable assistant can reduce decision and reporting friction for drivers.

## What's Next

Validate a driver companion with a small fleet, identify which report fields save time without duplicating paperwork, and design bounded adapters to systems the customer already uses. See `CONTROL/PRODUCT_DIRECTION.md` for the full validation path and non-claims.

## Built With

- Codex
- GPT-5.6
- Vanilla JavaScript
- Python 3 standard library
- GitHub Pages

## Try It Out

- Demo: https://seeker-cyber-maker.github.io/pitt-build-week/
- Repository: https://github.com/seeker-cyber-maker/pitt-build-week
- Video: add the public YouTube URL after recording

```bash
git clone https://github.com/seeker-cyber-maker/pitt-build-week.git
cd pitt-build-week
npm test
npm run serve
```

## Team

- Patrick Simard (@psimardgit): AI/report boundary and operational review
- Project integration: Codex-supported collaboration, deterministic demo, and submission evidence

## Submission Boundary

This is a current POC with seeded simulation, not a claim of live operational capability, production safety, regulatory compliance, or real-time optimization.
