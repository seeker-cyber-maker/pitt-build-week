#!/usr/bin/env python3
"""Demonstration of the PITT AI report module against the v1 contract fixtures."""

from __future__ import annotations

import json

from packages.ai import generate_report
from packages.ai.models import ScenarioPayload


def main() -> None:
    # Canonical seeded-demo input fixture
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

    print("=" * 60)
    print("PITT Report Draft (Contract v1)")
    print("=" * 60)
    print(json.dumps(report.to_dict(), indent=2))
    print("=" * 60)
    print(f"Status: {report.status}")
    print(f"Provenance: {report.provenance_kind}")
    print(f"Review required: {report.review_required}")
    print(f"Review confirmed: {report.review_confirmed}")


if __name__ == "__main__":
    main()
