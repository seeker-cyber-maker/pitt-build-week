#!/usr/bin/env python3
"""Example usage of the AI report generator module.

This demonstrates how to use the report generator with sample data.
"""

import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from packages.ai import generate_report
from packages.ai.models import ScenarioPayload


def main():
    """Run example report generation."""
    
    # Create a sample scenario (as would come from the scenario engine)
    scenario = ScenarioPayload(
        trip_id="DEMO-2026-001",
        driver_name="Alex Johnson",
        vehicle_id="TRUCK-101",
        current_location="Interstate 90, Exit 147",
        destination="Cold Storage Facility - North",
        cargo_type="Refrigerated Pharmaceuticals",
        
        # Exception details
        exception_type="urgent_fuel_stop",
        trigger_reason="Unexpected route delay due to road construction + higher than normal fuel consumption",
        current_fuel_liters=42.5,
        reserve_threshold_liters=58.0,
        distance_to_destination_km=165.0,
        
        # Recommendation
        recommended_action="Refuel immediately",
        recommended_location="Shell Station, Exit 150 (5.2km ahead)",
        confidence_level="high",
        alternatives=[
            "Continue to destination with risk of fuel shortage",
            "Switch to alternative route (adds 35km)",
        ],
        
        # Deterministic calculation results
        deterministic_calculation={
            "fuel_burn_rate_l_per_km": 0.36,
            "estimated_fuel_needed_l": 59.4,
            "current_deficit_l": 15.5,
            "safety_margin_percentage": -26.2,
        }
    )
    
    print("=" * 70)
    print("PITT AI Report Generator - Example")
    print("=" * 70)
    print()
    
    # Generate report (will use AI if configured, fallback otherwise)
    print("Generating report...")
    report = generate_report(scenario)
    
    print(f"\n✓ Report generated: {report.report_type}")
    print("=" * 70)
    
    # Display report
    print("\n📋 DELIVERY EXCEPTION REPORT\n")
    print(f"Summary: {report.summary}\n")
    print(f"Situation:\n{report.situation_description}\n")
    print(f"Recommended Action:\n{report.recommended_action}\n")
    print(f"Reasoning:\n{report.reasoning}\n")
    
    print("-" * 70)
    print("\n📊 DETERMINISTIC FACTS\n")
    for key, value in report.deterministic_facts.items():
        print(f"  • {key}: {value}")
    
    print()
    print("-" * 70)
    print("\n🤖 PROVENANCE INFORMATION\n")
    print(f"  Report Type: {report.report_type}")
    if report.ai_contribution:
        print(f"  AI Contribution: {report.ai_contribution}")
    else:
        print(f"  AI Contribution: None (deterministic only)")
    print(f"  Confidence Notes: {report.confidence_notes}")
    print(f"  Driver Confirmation Required: {report.requires_driver_confirmation}")
    
    print()
    print("-" * 70)
    print("\n🔀 ALTERNATIVES\n")
    for i, alt in enumerate(report.alternatives_presented, 1):
        print(f"  {i}. {alt}")
    
    print()
    print("=" * 70)
    
    # Configuration note
    from packages.ai.config import ProviderConfig
    config = ProviderConfig.from_environment()
    
    print("\n⚙️  CONFIGURATION STATUS\n")
    for key, value in config.mask_for_logging().items():
        print(f"  {key}: {value}")
    
    if not config.is_configured():
        print("\n💡 Tip: Set PITT_AI_BASE_URL, PITT_AI_API_KEY, and PITT_AI_MODEL")
        print("   environment variables to enable AI-assisted generation.")
    
    print()


if __name__ == "__main__":
    main()
