"""Data models for report generation."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


@dataclass
class ScenarioPayload:
    """Input: structured scenario data from the scenario engine."""
    
    trip_id: str
    driver_name: str
    vehicle_id: str
    current_location: str
    destination: str
    cargo_type: str
    
    # Exception details
    exception_type: str  # e.g., "urgent_fuel_stop"
    trigger_reason: str
    current_fuel_liters: float
    reserve_threshold_liters: float
    distance_to_destination_km: float
    
    # Recommendation
    recommended_action: str
    recommended_location: str
    confidence_level: str  # "high", "medium", "low"
    alternatives: list[str]
    deterministic_calculation: dict[str, float]  # fuel burn, time estimates, etc.


@dataclass
class ReportResult:
    """Output: structured report draft with provenance marking."""
    
    report_type: Literal["ai_assisted", "deterministic_fallback"]
    
    # Core content
    summary: str
    situation_description: str
    recommended_action: str
    reasoning: str
    
    # Metadata
    deterministic_facts: dict[str, str | float]
    ai_contribution: str | None  # Description of what AI added, or None for fallback
    confidence_notes: str
    
    # Driver review context
    requires_driver_confirmation: bool
    alternatives_presented: list[str]
    
    def __post_init__(self):
        """Validate report structure."""
        if self.report_type == "deterministic_fallback":
            assert self.ai_contribution is None, "Fallback reports must not claim AI contribution"
        elif self.report_type == "ai_assisted":
            assert self.ai_contribution is not None, "AI-assisted reports must declare contribution"
