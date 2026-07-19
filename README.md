# PITT Build Week

PITT is a deliberately narrow demo of a trip-exception and report assistant for delivery drivers. It begins with a simulated delivery ledger that orders time windows and inserts a reachable simulated fuel stop, then plays a driver-controlled seeded day with two fuel-price events before showing one refrigerated-delivery exception: a route delay makes a fuel stop urgent, the driver reviews a deterministic recommendation, and a report draft is produced for approval.

This repository is organized for several harnesses working in parallel without merging unverified ideas into the demo.

## Start Here

1. Read `CONTROL/WORKBOARD.md`.
2. Work only in a lane that is unclaimed or assigned to you.
3. Record evidence and resume notes in `HANDOFFS/<harness>.md`.
4. Run `python3 scripts/collate_handoffs.py` before asking the integrator to merge work.

The integration lane is deliberately small. A contribution is not ready merely because it builds: it must have a stated acceptance check and captured result.

## Run The Local Demo

This branch contains a dependency-free local demo shell under `app/`. It uses only seeded data and can be opened without credentials or a provider key.

```bash
npm test
npm run serve
```

Open `http://127.0.0.1:4173` and complete the visible path:

1. Inspect the simulated delivery ledger and compare the recommended corridor against the rejected loop.
2. Advance the seeded day; at noon and 3 PM, compare a fuel-price recalculation with keeping the current route.
3. Review the seeded trip and acknowledge the deterministic reserve-risk recommendation.
4. Review and confirm the locally generated report draft, including its leg-level delivery outcomes.

The existing scenario, UI, and AI/report lanes can replace the corresponding local modules later. The demo must remain usable when no model endpoint is configured.

## Demo Boundary

PITT does not control a vehicle, dispatch real routes, access regulated vehicle systems, or claim live traffic, mapping, real station information, or fuel-pricing data. Its route diagram uses clearly labelled invented coordinates, local deterministic calculations, and seeded fuel prices balanced against simulated detour cost. Model output is a reviewable draft, never an autonomous instruction.

See `CONTROL/PRODUCT_SCOPE.md` for the exact demo contract and `CONTROL/WORKBOARD.md` for the current queue.
