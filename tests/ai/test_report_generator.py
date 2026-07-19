"""Tests for PITT AI report generator aligned with Report Draft Contract v1.

Coverage:
- Deterministic fallback (no config, unauthorized provider, all error paths)
- AI-assisted success path (mocked HTTP)
- Contract alignment with Codex fixtures
- Security (secret masking)
"""

from __future__ import annotations

import io
import json
import os
import unittest
from unittest.mock import patch
from urllib.error import HTTPError, URLError

from packages.ai.config import ProviderConfig
from packages.ai.models import ReportResult, ScenarioPayload
from packages.ai.report_generator import generate_report


# ---------------------------------------------------------------------------
# Fixture helpers
# ---------------------------------------------------------------------------

SEEDED_INPUT = {
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

EXPECTED_FALLBACK = {
    "schema_version": "pitt.report-draft.v1",
    "status": "fallback_ready",
    "provenance": {"kind": "deterministic_fallback"},
    "deterministic_facts": {
        "scenario_id": "PITT-DEMO-017",
        "event_type": "delay_and_reserve_risk",
        "delay_minutes": 28,
        "projected_arrival_reserve_percent": 7,
        "minimum_reserve_percent": 12,
        "reserve_gap_percent": -5,
        "recommended_stop": "Northbound Service Plaza",
        "stop_distance_km": 19,
        "stop_detour_minutes": 15,
    },
    "narrative": (
        "A seeded local scenario 28-minute delay changes projected fuel "
        "reserve to 7%, below the 12% policy floor. "
        "The supplied review option is Northbound Service Plaza, "
        "19 km away with a planned 15-minute detour. "
        "Driver review is required before any external action."
    ),
    "review": {"required": True, "confirmed": False},
    "limitations": [
        "Seeded local demo; no live GPS, traffic, map, fuel-price, telematics, or dispatch feed.",
        "This draft does not control a vehicle or issue a driving instruction.",
    ],
}


def _clear_env():
    for key in ("PITT_AI_BASE_URL", "PITT_AI_API_KEY", "PITT_AI_MODEL"):
        os.environ.pop(key, None)


def _set_env():
    os.environ["PITT_AI_BASE_URL"] = "https://api.example.com/v1"
    os.environ["PITT_AI_API_KEY"] = "sk-test-secret"
    os.environ["PITT_AI_MODEL"] = "gpt-4"


# ---------------------------------------------------------------------------
# Contract fixture tests
# ---------------------------------------------------------------------------

class TestContractFixture(unittest.TestCase):
    """Verify exact alignment with Codex fixtures."""

    def test_seeded_input_produces_fallback_output(self):
        _clear_env()
        scenario = ScenarioPayload.from_dict(SEEDED_INPUT)
        result = generate_report(scenario)
        self.assertEqual(result.status, "fallback_ready")
        self.assertEqual(result.provenance_kind, "deterministic_fallback")
        self.assertEqual(result.deterministic_facts, EXPECTED_FALLBACK["deterministic_facts"])
        self.assertEqual(result.narrative, EXPECTED_FALLBACK["narrative"])
        self.assertTrue(result.review_required)
        self.assertFalse(result.review_confirmed)
        self.assertEqual(result.limitations, EXPECTED_FALLBACK["limitations"])

    def test_output_matches_fixture_dict(self):
        _clear_env()
        scenario = ScenarioPayload.from_dict(SEEDED_INPUT)
        result = generate_report(scenario)
        self.assertEqual(result.to_dict(), EXPECTED_FALLBACK)


# ---------------------------------------------------------------------------
# Deterministic fallback tests
# ---------------------------------------------------------------------------

class TestDeterministicFallback(unittest.TestCase):
    def test_no_config_returns_fallback(self):
        _clear_env()
        scenario = ScenarioPayload.from_dict(SEEDED_INPUT)
        result = generate_report(scenario)
        self.assertEqual(result.status, "fallback_ready")
        self.assertEqual(result.provenance_kind, "deterministic_fallback")

    def test_provider_not_authorized_returns_fallback(self):
        _set_env()
        data = dict(SEEDED_INPUT)
        data["data_handling"] = {
            **data["data_handling"],
            "outbound_provider_authorized": False,
        }
        scenario = ScenarioPayload.from_dict(data)
        result = generate_report(scenario)
        self.assertEqual(result.status, "fallback_ready")
        self.assertEqual(result.provenance_kind, "deterministic_fallback")

    def test_fallback_preserves_all_deterministic_facts(self):
        _clear_env()
        scenario = ScenarioPayload.from_dict(SEEDED_INPUT)
        result = generate_report(scenario)
        facts = result.deterministic_facts
        self.assertEqual(facts["scenario_id"], "PITT-DEMO-017")
        self.assertEqual(facts["event_type"], "delay_and_reserve_risk")
        self.assertEqual(facts["delay_minutes"], 28)
        self.assertEqual(facts["projected_arrival_reserve_percent"], 7)
        self.assertEqual(facts["minimum_reserve_percent"], 12)
        self.assertEqual(facts["reserve_gap_percent"], -5)
        self.assertEqual(facts["recommended_stop"], "Northbound Service Plaza")
        self.assertEqual(facts["stop_distance_km"], 19)
        self.assertEqual(facts["stop_detour_minutes"], 15)

    def test_fallback_narrative_contains_key_facts(self):
        _clear_env()
        scenario = ScenarioPayload.from_dict(SEEDED_INPUT)
        result = generate_report(scenario)
        self.assertIn("28-minute", result.narrative)
        self.assertIn("7%", result.narrative)
        self.assertIn("12%", result.narrative)
        self.assertIn("Northbound Service Plaza", result.narrative)
        self.assertIn("19 km", result.narrative)
        self.assertIn("15-minute", result.narrative)

    def test_fallback_has_limitations(self):
        _clear_env()
        scenario = ScenarioPayload.from_dict(SEEDED_INPUT)
        result = generate_report(scenario)
        self.assertEqual(len(result.limitations), 2)
        self.assertIn("no live GPS", result.limitations[0])
        self.assertIn("does not control a vehicle", result.limitations[1])

    def test_review_is_always_required(self):
        _clear_env()
        scenario = ScenarioPayload.from_dict(SEEDED_INPUT)
        result = generate_report(scenario)
        self.assertTrue(result.review_required)
        self.assertFalse(result.review_confirmed)


# ---------------------------------------------------------------------------
# AI provider error tests
# ---------------------------------------------------------------------------

class TestAIAssistedReportWithMockedHTTP(unittest.TestCase):
    def setUp(self):
        _set_env()
        self.data = dict(SEEDED_INPUT)
        self.data["data_handling"] = {
            **self.data["data_handling"],
            "outbound_provider_authorized": True,
        }

    def test_http_error_falls_back(self):
        scenario = ScenarioPayload.from_dict(self.data)
        error = HTTPError("http://example.com", 500, "Internal Server Error", None, None)
        with patch("urllib.request.urlopen", side_effect=error):
            result = generate_report(scenario)
        self.assertEqual(result.status, "fallback_ready")
        self.assertEqual(result.provenance_kind, "deterministic_fallback")

    def test_connection_error_falls_back(self):
        scenario = ScenarioPayload.from_dict(self.data)
        with patch("urllib.request.urlopen", side_effect=URLError("Connection refused")):
            result = generate_report(scenario)
        self.assertEqual(result.status, "fallback_ready")
        self.assertEqual(result.provenance_kind, "deterministic_fallback")

    def test_timeout_falls_back(self):
        scenario = ScenarioPayload.from_dict(self.data)
        with patch("urllib.request.urlopen", side_effect=TimeoutError("Request timed out")):
            result = generate_report(scenario)
        self.assertEqual(result.status, "fallback_ready")
        self.assertEqual(result.provenance_kind, "deterministic_fallback")

    def test_malformed_response_falls_back(self):
        scenario = ScenarioPayload.from_dict(self.data)
        response_bytes = json.dumps({"invalid": "shape"}).encode()
        mock = io.BytesIO(response_bytes)
        with patch("urllib.request.urlopen", return_value=mock):
            result = generate_report(scenario)
        self.assertEqual(result.status, "fallback_ready")
        self.assertEqual(result.provenance_kind, "deterministic_fallback")

    def test_empty_response_falls_back(self):
        scenario = ScenarioPayload.from_dict(self.data)
        response_bytes = json.dumps({
            "choices": [{"message": {"content": ""}}]
        }).encode()
        mock = io.BytesIO(response_bytes)
        with patch("urllib.request.urlopen", return_value=mock):
            result = generate_report(scenario)
        self.assertEqual(result.status, "fallback_ready")
        self.assertEqual(result.provenance_kind, "deterministic_fallback")

    def test_valid_ai_response(self):
        scenario = ScenarioPayload.from_dict(self.data)
        ai_text = (
            "A 28-minute delay has reduced the projected fuel reserve to 7%, "
            "which is below the 12% policy floor. The recommended stop is "
            "Northbound Service Plaza, 19 km away."
        )
        response_bytes = json.dumps({
            "choices": [{"message": {"content": ai_text}}]
        }).encode()
        mock = io.BytesIO(response_bytes)
        with patch("urllib.request.urlopen", return_value=mock):
            result = generate_report(scenario)
        self.assertEqual(result.status, "draft_ready")
        self.assertEqual(result.provenance_kind, "ai_assisted")
        self.assertEqual(result.narrative, ai_text)
        self.assertTrue(result.review_required)
        self.assertFalse(result.review_confirmed)
        # Deterministic facts must still be present verbatim
        self.assertEqual(
            result.deterministic_facts,
            EXPECTED_FALLBACK["deterministic_facts"],
        )


# ---------------------------------------------------------------------------
# Configuration tests
# ---------------------------------------------------------------------------

class TestProviderConfig(unittest.TestCase):
    def test_not_configured_when_empty(self):
        _clear_env()
        config = ProviderConfig.from_environment()
        self.assertFalse(config.is_configured())

    def test_not_configured_when_partial(self):
        _clear_env()
        os.environ["PITT_AI_BASE_URL"] = "https://example.com"
        config = ProviderConfig.from_environment()
        self.assertFalse(config.is_configured())

    def test_configured_when_complete(self):
        _set_env()
        config = ProviderConfig.from_environment()
        self.assertTrue(config.is_configured())

    def test_secrets_are_masked(self):
        _set_env()
        config = ProviderConfig.from_environment()
        masked = config.mask_for_logging()
        self.assertEqual(masked["api_key"], "***REDACTED***")
        self.assertEqual(masked["base_url"], "https://api.example.com/v1")
        self.assertEqual(masked["model"], "gpt-4")

    def test_secrets_not_in_string_representation(self):
        _set_env()
        config = ProviderConfig.from_environment()
        self.assertNotIn("secret", str(config))
        self.assertNotIn("sk-test", repr(config))


# ---------------------------------------------------------------------------
# ReportResult contract tests
# ---------------------------------------------------------------------------

class TestReportResultContract(unittest.TestCase):
    def test_fallback_dict_matches_contract(self):
        result = ReportResult(
            status="fallback_ready",
            provenance_kind="deterministic_fallback",
            deterministic_facts={"key": "value"},
            narrative="Test narrative",
            limitations=["Limitation 1"],
        )
        d = result.to_dict()
        self.assertEqual(d["schema_version"], "pitt.report-draft.v1")
        self.assertEqual(d["status"], "fallback_ready")
        self.assertEqual(d["provenance"], {"kind": "deterministic_fallback"})
        self.assertEqual(d["deterministic_facts"], {"key": "value"})
        self.assertEqual(d["narrative"], "Test narrative")
        self.assertEqual(d["review"], {"required": True, "confirmed": False})
        self.assertEqual(d["limitations"], ["Limitation 1"])

    def test_ai_dict_includes_model_and_url(self):
        result = ReportResult(
            status="draft_ready",
            provenance_kind="ai_assisted",
            provenance_model="gpt-4",
            provenance_base_url="https://api.example.com/v1",
            deterministic_facts={},
            narrative="AI text",
        )
        d = result.to_dict()
        self.assertEqual(d["provenance"], {
            "kind": "ai_assisted",
            "model": "gpt-4",
            "base_url": "https://api.example.com/v1",
        })


if __name__ == "__main__":
    unittest.main()
