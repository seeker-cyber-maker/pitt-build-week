"""Data models aligned with PITT Report Draft Contract v1.

Input:  pitt.report-input.v1
Output: pitt.report-draft.v1
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal


# ---------------------------------------------------------------------------
# Input model (from scenario engine)
# ---------------------------------------------------------------------------

@dataclass
class ScenarioPayload:
    """Input aligned with pitt.report-input.v1.

    The adapter may use only these fields or a stricter redacted projection.
    """

    # Identity
    schema_version: str = "pitt.report-input.v1"

    # Scenario
    scenario_id: str = ""
    scenario_mode: Literal["seeded_demo", "live"] = "seeded_demo"

    # Trip context
    driver_display_alias: str = ""
    cargo_category: str = ""
    destination_label: str = ""
    route_label: str = ""

    # Event
    event_type: str = ""
    delay_minutes: int = 0
    event_source: str = ""

    # Deterministic assessment (authoritative)
    calculation_version: str = ""
    current_fuel_percent: float = 0.0
    projected_arrival_reserve_percent: float = 0.0
    minimum_reserve_percent: float = 0.0
    reserve_gap_percent: float = 0.0
    assessment_status: str = ""

    # Proposed decision
    decision_type: str = ""
    stop_label: str = ""
    stop_distance_km: float = 0.0
    stop_detour_minutes: float = 0.0
    selection_basis: str = ""
    alternatives: list[str] = field(default_factory=list)
    driver_review_required: bool = True

    # Data handling
    data_provenance: str = ""
    data_retention: str = ""
    outbound_provider_authorized: bool = False

    @classmethod
    def from_dict(cls, data: dict) -> ScenarioPayload:
        """Build from a pitt.report-input.v1 dict."""
        scenario = data.get("scenario", {})
        trip = data.get("trip", {})
        event = data.get("event", {})
        assessment = data.get("deterministic_assessment", {})
        decision = data.get("proposed_decision", {})
        handling = data.get("data_handling", {})
        return cls(
            schema_version=data.get("schema_version", "pitt.report-input.v1"),
            scenario_id=scenario.get("id", ""),
            scenario_mode=scenario.get("mode", "seeded_demo"),
            driver_display_alias=trip.get("driver_display_alias", ""),
            cargo_category=trip.get("cargo_category", ""),
            destination_label=trip.get("destination_label", ""),
            route_label=trip.get("route_label", ""),
            event_type=event.get("type", ""),
            delay_minutes=event.get("delay_minutes", 0),
            event_source=event.get("source", ""),
            calculation_version=assessment.get("calculation_version", ""),
            current_fuel_percent=assessment.get("current_fuel_percent", 0.0),
            projected_arrival_reserve_percent=assessment.get("projected_arrival_reserve_percent", 0.0),
            minimum_reserve_percent=assessment.get("minimum_reserve_percent", 0.0),
            reserve_gap_percent=assessment.get("reserve_gap_percent", 0.0),
            assessment_status=assessment.get("status", ""),
            decision_type=decision.get("type", ""),
            stop_label=decision.get("stop_label", ""),
            stop_distance_km=decision.get("distance_km", 0.0),
            stop_detour_minutes=decision.get("detour_minutes", 0.0),
            selection_basis=decision.get("selection_basis", ""),
            alternatives=decision.get("alternatives", []),
            driver_review_required=decision.get("driver_review_required", True),
            data_provenance=handling.get("provenance", ""),
            data_retention=handling.get("retention", ""),
            outbound_provider_authorized=handling.get("outbound_provider_authorized", False),
        )


# ---------------------------------------------------------------------------
# Output model
# ---------------------------------------------------------------------------

@dataclass
class ReportResult:
    """Output aligned with pitt.report-draft.v1."""

    schema_version: str = "pitt.report-draft.v1"
    status: Literal["draft_ready", "fallback_ready", "validation_failed"] = "fallback_ready"
    provenance_kind: Literal["deterministic_fallback", "ai_assisted"] = "deterministic_fallback"
    provenance_model: str | None = None
    provenance_base_url: str | None = None
    deterministic_facts: dict = field(default_factory=dict)
    narrative: str = ""
    review_required: bool = True
    review_confirmed: bool = False
    limitations: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        """Serialize to pitt.report-draft.v1 dict."""
        provenance: dict = {"kind": self.provenance_kind}
        if self.provenance_model:
            provenance["model"] = self.provenance_model
        if self.provenance_base_url:
            provenance["base_url"] = self.provenance_base_url
        return {
            "schema_version": self.schema_version,
            "status": self.status,
            "provenance": provenance,
            "deterministic_facts": self.deterministic_facts,
            "narrative": self.narrative,
            "review": {
                "required": self.review_required,
                "confirmed": self.review_confirmed,
            },
            "limitations": self.limitations,
        }
