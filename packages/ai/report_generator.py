"""Report generation with AI assistance and deterministic fallback."""

from __future__ import annotations

import json
import logging
from typing import Any

from .config import ProviderConfig
from .models import ReportResult, ScenarioPayload

logger = logging.getLogger(__name__)


def generate_report(scenario: ScenarioPayload) -> ReportResult:
    """Generate a report draft from scenario data.
    
    Args:
        scenario: Structured scenario payload from the scenario engine.
    
    Returns:
        ReportResult with either AI-assisted content or deterministic fallback.
    
    The function will attempt to use the configured AI provider if available,
    but will gracefully fall back to a deterministic report if:
    - Configuration is incomplete
    - HTTP request fails
    - Provider response is malformed
    """
    config = ProviderConfig.from_environment()
    
    if not config.is_configured():
        logger.info(
            "AI provider not configured, using deterministic fallback. Config: %s",
            config.mask_for_logging()
        )
        return _generate_deterministic_report(scenario)
    
    logger.info(
        "Attempting AI-assisted report generation. Config: %s",
        config.mask_for_logging()
    )
    
    try:
        return _generate_ai_assisted_report(scenario, config)
    except Exception as e:
        logger.warning(
            "AI-assisted generation failed (%s: %s), falling back to deterministic report",
            type(e).__name__,
            str(e),
            exc_info=True
        )
        return _generate_deterministic_report(scenario)


def _generate_deterministic_report(scenario: ScenarioPayload) -> ReportResult:
    """Generate a deterministic report without AI assistance."""
    
    # Extract key metrics from deterministic calculation
    calc = scenario.deterministic_calculation
    fuel_deficit = scenario.reserve_threshold_liters - scenario.current_fuel_liters
    
    summary = (
        f"Trip {scenario.trip_id}: {scenario.exception_type.replace('_', ' ').title()} Required"
    )
    
    situation = (
        f"Vehicle {scenario.vehicle_id} carrying {scenario.cargo_type} "
        f"from {scenario.current_location} to {scenario.destination}. "
        f"Current fuel: {scenario.current_fuel_liters:.1f}L, "
        f"reserve threshold: {scenario.reserve_threshold_liters:.1f}L. "
        f"Deficit: {fuel_deficit:.1f}L. "
        f"Trigger: {scenario.trigger_reason}."
    )
    
    recommended = (
        f"{scenario.recommended_action} at {scenario.recommended_location}. "
        f"Confidence: {scenario.confidence_level}."
    )
    
    reasoning = (
        f"Deterministic calculation shows fuel reserve below safe threshold. "
        f"Distance to destination: {scenario.distance_to_destination_km:.1f}km. "
        f"Based on: {', '.join(f'{k}={v}' for k, v in calc.items())}."
    )
    
    return ReportResult(
        report_type="deterministic_fallback",
        summary=summary,
        situation_description=situation,
        recommended_action=recommended,
        reasoning=reasoning,
        deterministic_facts={
            "trip_id": scenario.trip_id,
            "current_fuel_liters": scenario.current_fuel_liters,
            "reserve_threshold_liters": scenario.reserve_threshold_liters,
            "distance_to_destination_km": scenario.distance_to_destination_km,
            "exception_type": scenario.exception_type,
        },
        ai_contribution=None,
        confidence_notes=f"Deterministic calculation, {scenario.confidence_level} confidence recommendation.",
        requires_driver_confirmation=True,
        alternatives_presented=scenario.alternatives,
    )


def _generate_ai_assisted_report(
    scenario: ScenarioPayload, config: ProviderConfig
) -> ReportResult:
    """Generate an AI-assisted report using the configured provider.
    
    Raises:
        ValueError: If the provider response is malformed.
        ConnectionError: If the HTTP request fails.
        TimeoutError: If the request times out.
    """
    import urllib.request
    import urllib.error
    
    # Build prompt with clear boundaries
    prompt = _build_prompt(scenario)
    
    # Prepare request
    request_body = {
        "model": config.model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a delivery exception report assistant. "
                    "Generate a clear, professional report for driver review. "
                    "Do not make autonomous decisions or change the recommended action. "
                    "Focus on clear communication of the situation and recommendation."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 500,
        "temperature": 0.3,
    }
    
    request_json = json.dumps(request_body).encode('utf-8')
    
    # Make request (no secrets in logs)
    url = f"{config.base_url}/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {config.api_key}",
    }
    
    req = urllib.request.Request(url, data=request_json, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            response_data = json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        raise ConnectionError(f"HTTP {e.code}: {e.reason}") from e
    except urllib.error.URLError as e:
        raise ConnectionError(f"Connection failed: {e.reason}") from e
    
    # Parse response
    try:
        ai_text = response_data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as e:
        raise ValueError(f"Malformed provider response: {e}") from e
    
    if not ai_text or not isinstance(ai_text, str):
        raise ValueError("Empty or invalid AI response content")
    
    # Build structured result
    return _structure_ai_response(scenario, ai_text)


def _build_prompt(scenario: ScenarioPayload) -> str:
    """Build the prompt for the AI provider."""
    calc_summary = ", ".join(f"{k}={v}" for k, v in scenario.deterministic_calculation.items())
    
    return f"""Generate a professional delivery exception report based on this scenario:

**Trip Details:**
- Trip ID: {scenario.trip_id}
- Driver: {scenario.driver_name}
- Vehicle: {scenario.vehicle_id}
- Route: {scenario.current_location} → {scenario.destination}
- Cargo: {scenario.cargo_type}

**Exception:**
- Type: {scenario.exception_type}
- Trigger: {scenario.trigger_reason}
- Current fuel: {scenario.current_fuel_liters:.1f}L
- Reserve threshold: {scenario.reserve_threshold_liters:.1f}L
- Distance remaining: {scenario.distance_to_destination_km:.1f}km

**Deterministic Calculation:**
{calc_summary}

**Recommendation:**
- Action: {scenario.recommended_action}
- Location: {scenario.recommended_location}
- Confidence: {scenario.confidence_level}
- Alternatives: {', '.join(scenario.alternatives) if scenario.alternatives else 'None'}

Please write a clear, professional report that:
1. Summarizes the situation in 1-2 sentences
2. Explains why this exception occurred
3. States the recommended action clearly
4. Notes that driver confirmation is required

Keep the tone professional and concise. Do not change the recommended action."""


def _structure_ai_response(scenario: ScenarioPayload, ai_text: str) -> ReportResult:
    """Structure the AI response into a ReportResult."""
    
    # Simple parsing: split by paragraphs and identify sections
    lines = [l.strip() for l in ai_text.split('\n') if l.strip()]
    
    summary = lines[0] if lines else "Report generated"
    situation = "\n".join(lines[:2]) if len(lines) >= 2 else ai_text[:200]
    
    return ReportResult(
        report_type="ai_assisted",
        summary=summary,
        situation_description=situation,
        recommended_action=f"{scenario.recommended_action} at {scenario.recommended_location}",
        reasoning=ai_text,
        deterministic_facts={
            "trip_id": scenario.trip_id,
            "current_fuel_liters": scenario.current_fuel_liters,
            "reserve_threshold_liters": scenario.reserve_threshold_liters,
            "distance_to_destination_km": scenario.distance_to_destination_km,
            "exception_type": scenario.exception_type,
        },
        ai_contribution="Narrative generated by AI provider for clarity and professionalism",
        confidence_notes=f"AI-assisted report based on {scenario.confidence_level} confidence recommendation",
        requires_driver_confirmation=True,
        alternatives_presented=scenario.alternatives,
    )
