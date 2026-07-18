# PITT Build Week

PITT is a deliberately narrow demo of a trip-exception and report assistant for delivery drivers. It shows one refrigerated-delivery scenario: a route delay makes a fuel stop urgent, the driver reviews a deterministic recommendation, and an AI-assisted report draft is produced for approval.

This repository is organized for several harnesses working in parallel without merging unverified ideas into the demo.

## Start Here

1. Read `CONTROL/WORKBOARD.md`.
2. Work only in a lane that is unclaimed or assigned to you.
3. Record evidence and resume notes in `HANDOFFS/<harness>.md`.
4. Run `python3 scripts/collate_handoffs.py` before asking the integrator to merge work.

The integration lane is deliberately small. A contribution is not ready merely because it builds: it must have a stated acceptance check and captured result.

## Demo Boundary

PITT does not control a vehicle, dispatch real routes, access regulated vehicle systems, or claim live traffic, mapping, or fuel-pricing data. It uses a clearly labeled local demo scenario and deterministic calculations. Model output is a reviewable draft, never an autonomous instruction.

See `CONTROL/PRODUCT_SCOPE.md` for the exact demo contract and `CONTROL/WORKBOARD.md` for the current queue.
