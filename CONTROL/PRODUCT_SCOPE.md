# PITT: Build Week Product Scope

## The One Demonstrable Story

A refrigerated delivery is underway. A simulated delivery ledger ranks its stops by declared time window, compares a sensible route against a visibly wasteful loop, and inserts a reachable simulated fuel stop before reserve policy fails. A later simulated delay and fuel burn make the active trip reserve unsafe. PITT explains the issue, ranks a pre-approved fuel stop, creates a driver-reviewable exception report, and records the decision.

## Must Be Real In The Demo

- A visible, seeded trip scenario and a visible `Demo scenario` label.
- A visible local delivery ledger with `ASAP`, `Before noon`, `Before EOB`, `All day`, and no-time-specified work.
- Deterministic simulated route ordering, refuel selection that balances seeded fuel price with simulated detour cost, and a clearly labelled recommended-versus-rejected local map visualization.
- Deterministic fuel-reserve and deadline-risk calculations.
- A recommendation with plain reasons, confidence/limitations, and alternatives.
- A driver review/confirm step; no automatic action.
- A generated report draft from an approved model endpoint, with fallback deterministic text if the endpoint is unavailable.
- A clean, no-login presentation path.

## Explicitly Not Built For This Submission

- Live GPS, real mapping, traffic, station prices/status, telematics, barcode hardware, or fleet integrations.
- Vehicle/lock control, dispatch authority, high-risk cargo management, or driver surveillance.
- Production security, billing, or enterprise identity integration.

## Acceptance

A reviewer can complete the seeded trip from alert to confirmed report in under two minutes and can see which parts are deterministic versus AI-assisted.
