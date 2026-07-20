# PITT Product Direction

## Purpose

PITT is being demonstrated as a local, driver-first planning, trip-watch, and exception-reporting proof of concept. The Build Week submission proves an interaction model, not a production fleet-management claim.

The product question after Build Week is straightforward: can a driver and fleet team use the same reviewable information flow to reduce avoidable fuel, routing, delivery-exception, and paperwork friction without taking control away from the driver or introducing an opaque dispatch system?

## What The Current POC Demonstrates

These are **simulated POC features**, implemented with local seeded data and deterministic calculations:

- A delivery ledger orders `ASAP`, `Before noon`, `Before EOB`, `All day`, and flexible stops.
- A simulated route comparison exposes a rejected loop and a shorter recommended corridor.
- Refuel selection balances seeded local fuel prices, reserve policy, and simulated detour cost.
- A seeded weekday historical-traffic pattern is applied at predicted presence times, not as a live traffic feed.
- Trip Watch advances through a driver-controlled five-leg day, including noon and 3 PM fuel-price events.
- The driver may recalculate, keep the plan, refuel, continue without refuelling, or close early. Fuel state and delivery outcomes follow those local choices.
- A review-gated report and local Lua-table handoff preserve the final state without starting any external workflow.
- A provider-neutral report contract supports an optional AI-assisted narrative, while a deterministic fallback remains authoritative and runnable without credentials.

## Commercial Direction: Validate Before Claiming

PITT should be explored as a product in stages rather than sold as a complete fleet platform on the strength of this demo.

### 1. Driver Companion

A focused driver-facing companion could turn approved trip data into a readable day plan, fuel-reserve warnings, exception capture, and a reviewable end-of-trip report. Its value is low-friction preparation and paperwork reduction, not autonomous navigation or dispatch.

### 2. Fleet Workflow Layer

For a small fleet, PITT could accept data from an existing dispatch, ELD, map, fuel-card, or delivery-proof system through documented adapters. The integration layer would normalize inputs, retain provenance, show uncertainty, and return a human-reviewed report or recommendation to the system of record. It must not silently become the source of truth for vehicle control, cargo compliance, or legal records.

### 3. Enterprise / Sovereign Deployment

Larger customers may require a tenant-controlled inference provider, data-retention policy, identity model, audit trail, and offline/degraded operation. The intended architecture is provider-neutral: a customer can choose approved local, private-cloud, or managed inference under its own governance. PITT would orchestrate bounded prompts and deterministic policy checks; it would not resell opaque inference as an unavoidable dependency.

## Commercial Packaging Is Not Set Yet

No pricing, subscription, per-driver fee, service level, or savings claim is established. The first commercial decision should follow pilot evidence: whether the validated buyer is an independent/small fleet that needs a driver companion, or a larger fleet that needs a workflow layer integrated with systems it already owns.

## Product Principles

- **Driver first:** recommendations explain the trade-off and preserve the driver's decision.
- **Inspectable data:** each recommendation exposes source, calculation basis, limitations, and review state.
- **Offline/degraded by design:** missing live data narrows claims and behavior; it never fabricates certainty.
- **Integrate, do not replace:** respect the customer's regulated or existing systems of record.
- **Privacy and security:** minimize data, authenticate devices and users, and make later integrations auditable.
- **Commercial honesty:** avoid pricing, savings, regulatory, safety, or performance claims until measured with a specific customer and real authorized data.

## Post-POC Validation Questions

1. Which report fields save a driver meaningful time without becoming duplicate paperwork?
2. Which existing systems are authoritative for stops, vehicle state, delivery proof, and fuel transactions?
3. What data can be cached offline, for how long, and with what provenance and expiry?
4. What approval, escalation, and audit path does each fleet require before a recommendation can influence operations?
5. Does a driver companion, a fleet workflow layer, or a customer-operated deployment create the clearest first commercial offering?

## Explicit Non-Claims

This document does not claim that PITT currently has real mapping, traffic, fuel-price, GPS, ELD, telematics, barcode, image-capture, identity, route-optimization, security-certification, or dispatch integrations. Those are future validation and product-design questions.
