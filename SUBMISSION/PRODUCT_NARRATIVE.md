# PITT Product Narrative

## The Operational Problem

Delivery drivers operate with incomplete information and no time to analyze it. A delay happens—traffic, a long unload, a missed appointment window—and suddenly the planned fuel reserve is tighter than the carrier's policy allows. The driver is now doing mental math at 100 km/h: current fuel, projected burn, distance to the next approved stop, whether that stop has reefer parking, how much time the detour adds, and whether dispatch needs to know.

Existing tools do not help in the moment. GPS apps optimize for shortest distance, not for the time lost in a standstill. Fleet dashboards log exceptions after the fact. Fuel apps show station locations but not whether a stop is necessary given the current load, delay, and carrier reserve policy. The result is stress, guesswork, and paperwork that duplicates what the driver already knew.

## What the Working Demo Does

PITT is a local, runnable proof of concept that demonstrates a different interaction model: explain the situation, suggest a reviewable option, preserve the driver's decision, and produce a report draft that restates every fact.

**Planning Preview.** The demo opens on a simulated delivery ledger with five stops ordered by time window: ASAP, Before noon, Before EOB, All day, and flexible. A recommended corridor is compared against a deliberately wasteful loop. A reachable fuel stop is inserted before the next leg would cross the carrier's reserve floor. The comparison balances a seeded per-litre price against the simulated detour cost, so the cheapest listed stop does not automatically win. All coordinates, stations, traffic patterns, and prices are seeded local demo data; the map is explicitly labelled a simulation.

**Trip Watch.** The driver advances through a five-leg seeded day. Fuel state drops on each leg and only rises when the driver chooses the planned refuel. At noon and 3 PM, seeded price events let the driver keep the current plan or recalculate with visible impact. The driver may also close the route early; unattempted stops are explicitly marked undelivered in the final record.

**Exception and Review.** When a 28-minute delay pushes projected fuel reserve below the 12-percent policy floor, PITT displays the gap, suggests one pre-approved corridor stop with distance and detour time, and lists alternatives. The driver must check an explicit review toggle before a report draft can be generated. No action is taken automatically.

**Report Draft.** If no AI provider is configured, PITT produces a deterministic fallback report that restates the delay, reserve, recommended stop, selection basis, alternatives, and delivery outcomes. If an approved OpenAI-compatible endpoint is configured, PITT sends a minimal redacted payload and drafts a natural-language narrative. Every deterministic fact is preserved verbatim. If the call fails, times out, or returns something unexpected, PITT falls back to the deterministic draft automatically. The report includes a compact Lua-table handoff for a later approved workflow; it remains local and never triggers external automation.

## What Is Simulated and What Is Not Built

The demo is intentionally narrow. It uses only seeded, deterministic data and requires no credentials, network access, or external APIs.

| What the demo uses | What is not built |
|---|---|
| Seeded delivery ledger with invented coordinates and stops | Live GPS, real mapping, or traffic feeds |
| Seeded weekday historical-traffic pattern at predicted presence times | Real-time traffic prediction or congestion data |
| Seeded fuel prices and simulated detour cost | Live pump prices, station availability, or fuel-card integration |
| Deterministic reserve arithmetic from seeded inputs | Telematics, ELD, or actual vehicle fuel state |
| One pre-approved stop per scenario | Dynamic stop search, carrier-approved network, or dispatch coordination |
| Local browser-only report and Lua handoff | External workflow triggers, email, or system integration |
| Optional AI narrative via OpenAI-compatible adapter | Proprietary model, guaranteed response quality, or autonomous instruction |

The "Demo scenario · local data only" label is visible throughout so a reviewer never confuses seeded demo behavior with a claim of live capability.

## Why It Could Grow into a Useful Product

PITT is being explored as a **driver companion**, not a dispatch system. The hypothesis is that a driver who understands *why* a correction is suggested is more likely to trust and use it. The demo's review gate, visible provenance, and deterministic fallback are architectural choices that would remain in a commercial version: the driver stays the decision-maker, the system explains its reasoning, and offline operation is a feature rather than a limitation.

Three potential validation stages are documented in `CONTROL/PRODUCT_DIRECTION.md`:

1. **Driver Companion.** A focused app that turns approved trip data into a readable day plan, fuel-reserve warnings, exception capture, and an end-of-trip report. The value is low-friction preparation and paperwork reduction, not autonomous navigation.

2. **Fleet Workflow Layer.** Documented adapters to existing dispatch, ELD, map, fuel-card, or delivery-proof systems. The integration layer normalizes inputs, retains provenance, shows uncertainty, and returns a human-reviewed report to the system of record. It does not silently become the source of truth for vehicle control or legal records.

3. **Enterprise / Sovereign Deployment.** Tenant-controlled inference provider, data-retention policy, identity model, and offline/degraded operation. The architecture is already provider-neutral; a customer can choose approved local, private-cloud, or managed inference under its own governance.

No pricing, subscription, per-driver fee, service level, or savings claim is established. The first commercial decision should follow pilot evidence: whether the validated buyer is an independent or small fleet that needs a driver companion, or a larger fleet that needs a workflow layer integrated with systems it already owns.

## Evidence

- **23 Node tests** covering planning, day playback, fuel simulation, scenario logic, report contract, and UI contract.
- **24 Python tests** covering deterministic fallback for all three seeded inputs, provider error handling, AI success path, configuration detection, secret masking, and contract shape.
- **Runnable without credentials** at `https://seeker-cyber-maker.github.io/pitt-build-week/`.

---

*This narrative supports the OpenAI Build Week submission for the Work and Productivity track. It does not claim live data, production safety, regulatory compliance, or real-time optimization. Every feature statement is classified as current POC, simulated demo behavior, commercial direction, or intentionally unbuilt capability.*
