# PITT: Build Week Product Scope

## The One Demonstrable Story

A refrigerated delivery is underway. A simulated delay and fuel burn make the planned reserve unsafe. PITT explains the issue, ranks a pre-approved fuel stop, creates a driver-reviewable exception report, and records the decision.

## Must Be Real In The Demo

- A visible, seeded trip scenario and a visible `Demo scenario` label.
- Deterministic fuel-reserve and deadline-risk calculations.
- A recommendation with plain reasons, confidence/limitations, and alternatives.
- A driver review/confirm step; no automatic action.
- A generated report draft from an approved model endpoint, with fallback deterministic text if the endpoint is unavailable.
- A clean, no-login presentation path.

## Explicitly Not Built For This Submission

- Live GPS, mapping, traffic, station prices, telematics, barcode hardware, or fleet integrations.
- Vehicle/lock control, dispatch authority, high-risk cargo management, or driver surveillance.
- Production security, billing, or enterprise identity integration.

## Acceptance

A reviewer can complete the seeded trip from alert to confirmed report in under two minutes and can see which parts are deterministic versus AI-assisted.
