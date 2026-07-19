# PITT AI Report Module

Aligned with **PITT Report Draft Contract v1**.

## Purpose

Turns a deterministic trip-exception assessment into a **reviewable draft**. It does not discover facts, recalculate route risk, select a route, contact dispatch, or trigger vehicle actions.

## Contract

- **Input:** `pitt.report-input.v1` (see `CONTROL/fixtures/report-input.seeded-demo.v1.json`)
- **Output:** `pitt.report-draft.v1` (see `CONTROL/fixtures/report-output.fallback.v1.json`)

## Quick Start

```python
from packages.ai import generate_report
from packages.ai.models import ScenarioPayload

# Load from the canonical fixture
data = {
    "schema_version": "pitt.report-input.v1",
    "scenario": {"id": "PITT-DEMO-017", "mode": "seeded_demo"},
    "trip": {
        "driver_display_alias": "Jordan Lee",
        "cargo_category": "refrigerated groceries",
        "destination_label": "North Market Distribution Centre",
        "route_label": "A-40 East / local delivery corridor",
    },
    "event": {
        "type": "delay_and_reserve_risk",
        "delay_minutes": 28,
        "source": "seeded local scenario",
    },
    "deterministic_assessment": {
        "calculation_version": "pitt.reserve-risk.v1",
        "current_fuel_percent": 24,
        "projected_arrival_reserve_percent": 7,
        "minimum_reserve_percent": 12,
        "reserve_gap_percent": -5,
        "status": "urgent",
    },
    "proposed_decision": {
        "type": "fuel_stop_review",
        "stop_label": "Northbound Service Plaza",
        "distance_km": 19,
        "detour_minutes": 15,
        "selection_basis": "pre-approved demo stop",
        "alternatives": [
            "Continue without stopping: projected reserve remains below policy.",
            "Contact dispatch for a different approved stop: review needed before changing the plan.",
        ],
        "driver_review_required": True,
    },
    "data_handling": {
        "provenance": "seeded_local",
        "retention": "session_only",
        "outbound_provider_authorized": False,
    },
}

scenario = ScenarioPayload.from_dict(data)
report = generate_report(scenario)

print(report.to_dict())
# Output matches CONTROL/fixtures/report-output.fallback.v1.json exactly
```

## Provider Configuration (Optional)

When `outbound_provider_authorized` is `True` and all env vars are set:

```bash
export PITT_AI_BASE_URL="https://api.openai.com/v1"
export PITT_AI_API_KEY="sk-..."
export PITT_AI_MODEL="gpt-4"
```

When not configured or unauthorized, the module returns a deterministic fallback with full provenance labeling.

## Testing

```bash
python3 -m unittest discover -s tests/ai -p "test_*.py" -v
```

Coverage:
- Contract fixture alignment
- Deterministic fallback (no config, unauthorized, all error paths)
- AI-assisted success path (mocked)
- Secret masking
- Output schema validation
