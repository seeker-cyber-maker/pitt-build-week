"""Report generation aligned with PITT Report Draft Contract v1.

- Input:  pitt.report-input.v1
- Output: pitt.report-draft.v1

The adapter attempts AI assistance only when:
  1. All provider env vars are set (PITT_AI_*)
  2. outbound_provider_authorized is True in the input
  3. The provider call succeeds and passes structured validation

Otherwise, it returns a deterministic fallback that preserves every
authoritative fact verbatim.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from .config import ProviderConfig
from .models import ReportResult, ScenarioPayload

logger = logging.getLogger(__name__)


def generate_report(scenario: ScenarioPayload) -> ReportResult:
    """Generate a report draft from a structured scenario payload.

    Args:
        scenario: ScenarioPayload aligned with pitt.report-input.v1.

    Returns:
        ReportResult aligned with pitt.report-draft.v1.
    """
    config = ProviderConfig.from_environment()

    # --- Fast path: if provider is not authorized, skip network entirely ---
    if not scenario.outbound_provider_authorized:
        logger.info("outbound_provider_authorized=false; using deterministic fallback.")
        return _generate_deterministic_report(scenario)

    if not config.is_configured():
        logger.info(
            "AI provider not configured, using deterministic fallback. Config: %s",
            config.mask_for_logging(),
        )
        return _generate_deterministic_report(scenario)

    logger.info(
        "Attempting AI-assisted report generation. Config: %s",
        config.mask_for_logging(),
    )

    try:
        return _generate_ai_assisted_report(scenario, config)
    except Exception as e:
        logger.warning(
            "AI-assisted generation failed (%s: %s), falling back to deterministic report",
            type(e).__name__,
            str(e),
            exc_info=True,
        )
        return _generate_deterministic_report(scenario)


def _generate_deterministic_report(scenario: ScenarioPayload) -> ReportResult:
    """Produce a deterministic fallback report (pitt.report-draft.v1)."""

    # Build deterministic facts from the authoritative assessment
    deterministic_facts = {
        "scenario_id": scenario.scenario_id,
        "event_type": scenario.event_type,
        "delay_minutes": scenario.delay_minutes,
        "projected_arrival_reserve_percent": scenario.projected_arrival_reserve_percent,
        "minimum_reserve_percent": scenario.minimum_reserve_percent,
        "reserve_gap_percent": scenario.reserve_gap_percent,
        "recommended_stop": scenario.stop_label,
        "stop_distance_km": scenario.stop_distance_km,
        "stop_detour_minutes": scenario.stop_detour_minutes,
    }

    # The seeded-demo contract deliberately uses a compact provenance label in
    # the human-facing fallback while retaining the detailed source in input data.
    source_label = "seeded" if scenario.scenario_mode == "seeded_demo" else (
        scenario.event_source or "reported"
    )
    if scenario.reserve_gap_percent < 0:
        reserve_summary = (
            f"{scenario.projected_arrival_reserve_percent}%, below the "
            f"{scenario.minimum_reserve_percent}% policy floor"
        )
    elif scenario.reserve_gap_percent == 0:
        reserve_summary = (
            f"{scenario.projected_arrival_reserve_percent}%, at the "
            f"{scenario.minimum_reserve_percent}% policy floor"
        )
    else:
        reserve_summary = (
            f"{scenario.projected_arrival_reserve_percent}%, "
            f"{scenario.reserve_gap_percent} percentage points above the "
            f"{scenario.minimum_reserve_percent}% policy floor"
        )

    if scenario.decision_type == "continue_as_planned":
        narrative = (
            f"A {source_label} {scenario.delay_minutes}-minute delay leaves projected fuel "
            f"reserve at {reserve_summary}. The supplied scenario keeps the trip on its "
            f"planned corridor; no fuel-stop review is needed. Driver review remains "
            f"available before any external action."
        )
    else:
        narrative = (
            f"A {source_label} {scenario.delay_minutes}-minute delay changes projected fuel "
            f"reserve to {reserve_summary}. The supplied review option is {scenario.stop_label}, "
            f"{scenario.stop_distance_km} km away with a planned "
            f"{scenario.stop_detour_minutes}-minute detour. "
            f"Driver review is required before any external action."
        )

    return ReportResult(
        schema_version="pitt.report-draft.v1",
        status="fallback_ready",
        provenance_kind="deterministic_fallback",
        deterministic_facts=deterministic_facts,
        narrative=narrative,
        review_required=True,
        review_confirmed=False,
        limitations=[
            "Seeded local demo; no live GPS, traffic, map, fuel-price, telematics, or dispatch feed.",
            "This draft does not control a vehicle or issue a driving instruction.",
        ],
    )


def _generate_ai_assisted_report(
    scenario: ScenarioPayload, config: ProviderConfig
) -> ReportResult:
    """Attempt AI-assisted report using a configured provider.

    Raises:
        ConnectionError: HTTP or transport failure.
        ValueError: Malformed or empty provider response.
    """
    import urllib.request
    import urllib.error

    prompt = _build_prompt(scenario)

    request_body = {
        "model": config.model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a delivery exception report assistant. "
                    "Generate a clear, professional report for driver review. "
                    "Do not make autonomous decisions or change the recommended action. "
                    "Do not introduce extra facts beyond those supplied. "
                    "Focus on clear communication of the situation and recommendation."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 500,
        "temperature": 0.3,
    }

    request_json = json.dumps(request_body).encode("utf-8")

    url = f"{config.base_url}/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {config.api_key}",
    }

    req = urllib.request.Request(url, data=request_json, headers=headers)

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            response_data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise ConnectionError(f"HTTP {e.code}: {e.reason}") from e
    except urllib.error.URLError as e:
        raise ConnectionError(f"Connection failed: {e.reason}") from e

    try:
        ai_text = response_data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as e:
        raise ValueError(f"Malformed provider response: {e}") from e

    if not ai_text or not isinstance(ai_text, str):
        raise ValueError("Empty or invalid AI response content")

    return _structure_ai_response(scenario, ai_text, config)


def _build_prompt(scenario: ScenarioPayload) -> str:
    """Build the prompt for the AI provider."""
    return f"""Generate a professional delivery exception report based on this scenario:

**Trip Details:**
- Scenario: {scenario.scenario_id}
- Driver: {scenario.driver_display_alias}
- Cargo: {scenario.cargo_category}
- Destination: {scenario.destination_label}
- Route: {scenario.route_label}

**Event:**
- Type: {scenario.event_type}
- Delay: {scenario.delay_minutes} minutes
- Source: {scenario.event_source}

**Deterministic Assessment:**
- Current fuel: {scenario.current_fuel_percent}%
- Projected reserve: {scenario.projected_arrival_reserve_percent}%
- Policy floor: {scenario.minimum_reserve_percent}%
- Reserve gap: {scenario.reserve_gap_percent}%
- Status: {scenario.assessment_status}

**Proposed Decision:**
- Type: {scenario.decision_type}
- Stop: {scenario.stop_label}
- Distance: {scenario.stop_distance_km} km
- Detour: {scenario.stop_detour_minutes} minutes
- Basis: {scenario.selection_basis}
- Alternatives: {', '.join(scenario.alternatives) if scenario.alternatives else 'None'}

Please write a clear, professional report that:
1. Summarizes the situation in 1-2 sentences
2. Explains why this exception occurred
3. States the recommended action clearly
4. Notes that driver confirmation is required

Keep the tone professional and concise. Do not change the recommended action."""


def _structure_ai_response(
    scenario: ScenarioPayload, ai_text: str, config: ProviderConfig
) -> ReportResult:
    """Structure a validated AI response into a pitt.report-draft.v1 result."""

    deterministic_facts = {
        "scenario_id": scenario.scenario_id,
        "event_type": scenario.event_type,
        "delay_minutes": scenario.delay_minutes,
        "projected_arrival_reserve_percent": scenario.projected_arrival_reserve_percent,
        "minimum_reserve_percent": scenario.minimum_reserve_percent,
        "reserve_gap_percent": scenario.reserve_gap_percent,
        "recommended_stop": scenario.stop_label,
        "stop_distance_km": scenario.stop_distance_km,
        "stop_detour_minutes": scenario.stop_detour_minutes,
    }

    return ReportResult(
        schema_version="pitt.report-draft.v1",
        status="draft_ready",
        provenance_kind="ai_assisted",
        provenance_model=config.model,
        provenance_base_url=config.base_url,
        deterministic_facts=deterministic_facts,
        narrative=ai_text.strip(),
        review_required=True,
        review_confirmed=False,
        limitations=[
            "Seeded local demo; no live GPS, traffic, map, fuel-price, telematics, or dispatch feed.",
            "This draft does not control a vehicle or issue a driving instruction.",
        ],
    )
