# PITT Demo Scenario

> Exact narrative of the seeded urgent trip used in the Build Week demo.
> Every trip-exception fact below is represented by `app/scenario.js` and `CONTROL/fixtures/report-input.seeded-demo.v1.json`. The separate planning preview is represented by `app/planner.js`.

## Simulated Planning Preview

Before the active trip exception, the demo shows a local delivery ledger with five simulated destinations. It orders declared time windows as `ASAP`, `Before noon`, `Before EOB`, `All day`, then `No time specified`. A fixed-coordinate, made-up corridor map compares that plan with a deliberately rejected loop.

The recommended plan inserts Cedar Service Plaza before North Market Distribution Centre because the next direct leg would cross the seeded 14% reserve floor. Its selection balances seeded per-litre price against simulated detour cost; South Loop Fuel is cheaper per litre, but loses after its longer detour is counted. The comparison is deterministic and visibly labelled a local map simulation. It is not a claim about real roads, stations, traffic, distance, routing, fuel price, or fuel availability.

## Trip Context

| Field | Value | Source |
| --- | --- | --- |
| Trip ID | PITT-DEMO-017 | `seededTrips.urgent.id` |
| Driver (display alias) | Jordan Lee | `seededTrips.urgent.driver` |
| Cargo | Refrigerated groceries | `seededTrips.urgent.cargo` |
| Destination | North Market Distribution Centre | `seededTrips.urgent.destination` |
| Planned corridor | A-40 East / local delivery corridor | `seededTrips.urgent.plannedCorridor` |
| Departure | 08:10 | `seededTrips.urgent.departure` |
| Planned arrival | 10:40 | `seededTrips.urgent.plannedArrival` |

## The Exception

A 28-minute delay is seeded into the scenario. The delay increases projected fuel burn and pushes the estimated arrival reserve below the carrier's policy floor.

| Metric | Value | Calculation |
| --- | --- | --- |
| Current fuel | 24% | Seeded input |
| Projected fuel burn | 17% | Seeded input |
| Projected arrival reserve | 7% | 24% − 17% = 7% |
| Carrier policy floor | 12% | Seeded input |
| Reserve gap | −5% | 7% − 12% = −5% |
| Reserve state | **urgent** | Gap < 0 → urgent |
| Delay | 28 min | Seeded input |
| Arrival delay (with stop) | 43 min | 28 + 15 = 43 min |

The `calculateRisk` function in `app/scenario.js` performs this arithmetic. It uses no external data.

## Driver Action

PITT presents a single recommended review action:

| Detail | Value |
| --- | --- |
| Recommended stop | Northbound Service Plaza |
| Distance | 19 km |
| Planned detour | 15 minutes |
| Selection basis | Pre-approved corridor stop |
| Driver review required | Yes — always |

The driver must check a review toggle before a report draft can be created. No action is taken automatically.

### Alternatives Presented

1. Continue without stopping: projected reserve remains below policy.
2. Review a different approved stop: driver confirmation is required before changing the plan.

## Report Draft

After the driver acknowledges the recommendation, PITT generates a local deterministic report draft. The report includes:

- Trip ID, driver alias, cargo category, and destination.
- The delay, projected reserve, policy floor, and reserve gap.
- The recommended stop with distance, detour time, and selection basis.
- Alternatives considered.
- Driver review status: pending confirmation.
- Source statement: "local calculation from the displayed fuel, delay, and carrier policy. No live traffic, weather, station-status, or dispatch data is used."

When no AI provider is configured, the report is labeled **Fallback draft / Local calculation**. When an approved provider is configured and responds successfully, the report is labeled **AI-assisted** and preserves every deterministic fact verbatim.

## Local-Only Boundary

This demo operates entirely within a local browser session. It does not use:

- Live GPS, real mapping, or traffic data.
- Real fuel-station prices or availability.
- Telematics, ELD, or vehicle-control systems.
- Dispatch, fleet management, or carrier APIs.
- Driver identity, vehicle identification, or customer records.

The driver remains the decision-maker at every step. The confirmation action records a local state change and explicitly states: "Review recorded. No external action was taken."

## Additional Seeded Scenarios (Tested, Not Visible in Demo)

The codebase also includes validated safe and tight scenarios used for test coverage:

| Scenario | Trip ID | Reserve | Gap | State | Stop Required |
| --- | --- | --- | --- | --- | --- |
| Safe | PITT-DEMO-018 | 18% | +6% | safe | No |
| Tight | PITT-DEMO-019 | 12% | 0% | tight | Recommended |
| **Urgent** | **PITT-DEMO-017** | **7%** | **−5%** | **urgent** | **Review required** |

The visible demo is pinned to the urgent scenario. All three are covered by `tests/scenario.test.mjs` and `tests/ai/test_report_generator.py`.
