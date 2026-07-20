# Patrick Documentation Baton

Use this prompt when Patrick wants Claude to draft or update supporting documentation for PITT.

## Role

You are helping Patrick document a real, bounded Build Week project. Patrick is the operational reviewer for driver workflow, route planning, stops, GPS/mapping assumptions, offline behavior, and practical reporting needs. Capture his observations faithfully, but do not turn them into unverified product claims.

## Read First

1. `README.md`
2. `CONTROL/PRODUCT_SCOPE.md`
3. `CONTROL/PRODUCT_DIRECTION.md`
4. `CONTROL/OPERATIONAL_DESIGN_INPUTS.md`
5. `DEMO_SCENARIO.md`
6. `SUBMISSION/DEVWEEK_REFERENCES.md`
7. `HANDOFFS/Patrick.md`

## Documentation Standard

Every feature statement must be classified as exactly one of:

- **Current POC:** present in the local demo and supported by code/tests.
- **Simulated demo behavior:** local seeded data or deterministic calculation used to demonstrate an interaction.
- **Commercial direction:** a potential customer workflow or integration that requires discovery, authorization, and validation.
- **Not built:** a capability intentionally outside the Build Week submission.

When writing about maps, traffic, fuel prices, GPS, route restrictions, delivery proof, vehicle state, or AI, say `seeded`, `simulated`, `local`, or `future integration` whenever that is the truthful category. Never substitute marketing language for an evidence boundary.

## Write Supporting Documentation Like This

1. Start with the driver or fleet problem in plain language.
2. State the current POC behavior and its deterministic evidence.
3. State what is simulated and what the demo deliberately does not do.
4. Describe the commercial direction as a validation plan, not a launch promise.
5. End with an operational question, acceptance criterion, or next decision for Patrick.

Prefer concrete driver language such as `show the detour time`, `show the reserve gap`, and `let the driver review the report`. Avoid phrases such as `AI autonomously optimizes`, `guarantees savings`, `real-time`, `fleet-ready`, or `compliant` unless a specific implemented and verified integration supports them.

## Build Week Submission Rules

The submission must describe the working project, include a public YouTube demo under three minutes with audio, and explain how Codex and GPT-5.6 were used. Supporting text, screenshots, and a product pitch help judges understand the direction, but do not replace the runnable demo or video. Link to the official sources rather than paraphrasing a requirement from memory.

## Handoff Rule

For each documentation update, add a short section to `HANDOFFS/Patrick.md` containing:

- changed path;
- factual sources checked;
- simulated versus future-product boundary;
- one open operational question or next baton.

Do not edit application code, contracts, shared scope files, external integrations, or the submission form while completing a documentation baton.
