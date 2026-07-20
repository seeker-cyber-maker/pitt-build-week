# PITT Product Narrative

## The Problem

Delivery work can turn a small delay into a chain of decisions: fuel reserve, detour time, delivery windows, approved stops, and the report that has to be written afterward. Those inputs are often scattered across tools, while the driver needs a short, understandable explanation and retains responsibility for the decision.

## What The Working POC Does

PITT is a local, runnable proof of concept for a driver-first trip-exception workflow.

**Planning preview.** Five seeded deliveries are ordered by declared time window. A simulated recommended corridor is compared with a deliberately wasteful loop. A simulated fuel stop is selected before the seeded reserve floor would fail, balancing seeded price against simulated detour cost. A seeded weekday historical-traffic pattern is applied at predicted presence times.

**Trip Watch.** The driver advances a five-leg seeded day. Fuel decreases on each completed leg and only rises after the driver selects the planned refuel. At noon and 3 PM, seeded price events allow the driver to keep the current plan or recalculate. The driver may also close early; unattempted stops become undelivered in the local trip record.

**Exception and review.** A 28-minute seeded delay moves projected reserve below a 12-percent policy floor. PITT shows the gap, one pre-approved simulated stop, and alternatives. The driver must explicitly review the recommendation before generating a report.

**Report.** The browser demo produces a deterministic local report. The repository also contains a provider-neutral Python adapter for a later approved AI-assisted narrative. That adapter preserves deterministic facts and falls back safely when unavailable. Neither path issues a driver instruction or starts an external workflow.

## Simulation Boundary

All coordinates, stations, traffic patterns, fuel prices, delivery outcomes, and vehicle state in the POC are seeded local demo data. PITT does not claim live GPS, mapping, traffic, station availability, fuel-card, ELD, telematics, dispatch, barcode, image-capture, or vehicle-control integrations. The visible `Demo scenario · local data only` label makes this boundary clear.

## Why It Could Become Useful

The product hypothesis is a **driver companion**, not a replacement for dispatch or regulated systems. A commercial version would need to prove that its explanations, review gates, provenance labels, and offline/degraded behavior reduce friction without creating duplicate paperwork or opaque decision-making.

The documented validation path is:

1. **Driver companion:** readable day plan, reserve warning, exception capture, and end-of-trip report.
2. **Fleet workflow layer:** documented adapters to existing systems of record, with provenance and human review.
3. **Customer-operated deployment:** customer-controlled inference, retention, identity, auditing, and degraded-mode policy.

No pricing, savings, safety, compliance, service-level, or integration claim has been established. Those need pilot evidence and customer authorization.

## Evidence

- `npm test`: 23 tests across planning, playback, fuel simulation, scenarios, report contract, and UI contract.
- `python3 -m unittest discover -s tests/ai -p 'test_*.py' -v`: 24 tests for deterministic fallback, provider failure handling, response validation, configuration, secret masking, and the report contract.
- Public demo: https://seeker-cyber-maker.github.io/pitt-build-week/

This narrative supports the OpenAI Build Week **Work and Productivity** submission. It describes a working simulated POC and a commercial validation direction, not a finished fleet product.
