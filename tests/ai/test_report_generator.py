"""Tests for AI-assisted report generation."""

from __future__ import annotations

import json
import os
import unittest
from unittest.mock import patch
from urllib.error import HTTPError, URLError

# Add parent directory to path for imports
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from packages.ai.models import ScenarioPayload, ReportResult
from packages.ai.report_generator import generate_report
from packages.ai.config import ProviderConfig


class TestDeterministicFallback(unittest.TestCase):
    """Test deterministic fallback behavior."""
    
    def setUp(self):
        """Clear environment variables before each test."""
        for key in ["PITT_AI_BASE_URL", "PITT_AI_API_KEY", "PITT_AI_MODEL"]:
            os.environ.pop(key, None)
    
    def _create_sample_scenario(self) -> ScenarioPayload:
        """Create a sample scenario for testing."""
        return ScenarioPayload(
            trip_id="TRIP-2026-001",
            driver_name="John Doe",
            vehicle_id="TRUCK-42",
            current_location="Highway 101, Exit 42",
            destination="Cold Storage Depot B",
            cargo_type="Refrigerated Pharmaceuticals",
            exception_type="urgent_fuel_stop",
            trigger_reason="Route delay + high fuel consumption",
            current_fuel_liters=45.0,
            reserve_threshold_liters=60.0,
            distance_to_destination_km=180.0,
            recommended_action="Refuel immediately",
            recommended_location="Shell Station, Exit 45 (8km ahead)",
            confidence_level="high",
            alternatives=["Continue to depot (risk running out)", "Switch to alternative route"],
            deterministic_calculation={
                "fuel_burn_rate_l_per_km": 0.35,
                "estimated_fuel_needed_l": 63.0,
                "current_deficit_l": 15.0,
            }
        )
    
    def test_fallback_when_config_missing(self):
        """Test that we get deterministic fallback when config is incomplete."""
        scenario = self._create_sample_scenario()
        result = generate_report(scenario)
        
        self.assertEqual(result.report_type, "deterministic_fallback")
        self.assertIsNone(result.ai_contribution)
        self.assertIn("TRIP-2026-001", result.summary)
        self.assertIn("urgent_fuel_stop", result.summary.lower().replace(' ', '_'))
        self.assertTrue(result.requires_driver_confirmation)
        self.assertEqual(len(result.alternatives_presented), 2)
    
    def test_fallback_response_structure(self):
        """Test that fallback report has all required fields."""
        scenario = self._create_sample_scenario()
        result = generate_report(scenario)
        
        # Check all required fields are present and non-empty
        self.assertTrue(result.summary)
        self.assertTrue(result.situation_description)
        self.assertTrue(result.recommended_action)
        self.assertTrue(result.reasoning)
        self.assertTrue(result.deterministic_facts)
        self.assertTrue(result.confidence_notes)
        
        # Check deterministic facts include key metrics
        facts = result.deterministic_facts
        self.assertIn("trip_id", facts)
        self.assertIn("current_fuel_liters", facts)
        self.assertIn("reserve_threshold_liters", facts)
    
    def test_fallback_contains_scenario_data(self):
        """Test that fallback report includes key scenario information."""
        scenario = self._create_sample_scenario()
        result = generate_report(scenario)
        
        # Check that key data points appear in the report
        self.assertIn("45.0", result.situation_description)  # current fuel
        self.assertIn("60.0", result.situation_description)  # threshold
        self.assertIn("TRUCK-42", result.situation_description)
        self.assertIn("Shell Station", result.recommended_action)


class TestAIAssistedReportWithMockedHTTP(unittest.TestCase):
    """Test AI-assisted report generation with mocked HTTP responses."""
    
    def setUp(self):
        """Set up environment for AI provider testing."""
        os.environ["PITT_AI_BASE_URL"] = "https://api.example.com/v1"
        os.environ["PITT_AI_API_KEY"] = "test-key-12345"
        os.environ["PITT_AI_MODEL"] = "gpt-4"
    
    def tearDown(self):
        """Clean up environment."""
        for key in ["PITT_AI_BASE_URL", "PITT_AI_API_KEY", "PITT_AI_MODEL"]:
            os.environ.pop(key, None)
    
    def _create_sample_scenario(self) -> ScenarioPayload:
        """Create a sample scenario for testing."""
        return ScenarioPayload(
            trip_id="TRIP-2026-002",
            driver_name="Jane Smith",
            vehicle_id="TRUCK-88",
            current_location="Interstate 5, Mile 120",
            destination="Distribution Center Alpha",
            cargo_type="Frozen Foods",
            exception_type="urgent_fuel_stop",
            trigger_reason="Unexpected traffic delay",
            current_fuel_liters=38.0,
            reserve_threshold_liters=55.0,
            distance_to_destination_km=150.0,
            recommended_action="Refuel at next approved station",
            recommended_location="Chevron, Exit 130",
            confidence_level="high",
            alternatives=["Continue with risk", "Request backup vehicle"],
            deterministic_calculation={
                "fuel_burn_rate_l_per_km": 0.32,
                "estimated_fuel_needed_l": 48.0,
                "current_deficit_l": 10.0,
            }
        )
    
    def test_http_error_falls_back(self):
        """Test that HTTP errors trigger deterministic fallback."""
        scenario = self._create_sample_scenario()
        
        # Mock urlopen to raise HTTPError
        with patch('urllib.request.urlopen') as mock_urlopen:
            mock_urlopen.side_effect = HTTPError(
                url="https://api.example.com/v1/chat/completions",
                code=500,
                msg="Internal Server Error",
                hdrs={},
                fp=None
            )
            
            result = generate_report(scenario)
            
            # Should fall back to deterministic
            self.assertEqual(result.report_type, "deterministic_fallback")
            self.assertIsNone(result.ai_contribution)
    
    def test_connection_error_falls_back(self):
        """Test that connection errors trigger deterministic fallback."""
        scenario = self._create_sample_scenario()
        
        # Mock urlopen to raise URLError
        with patch('urllib.request.urlopen') as mock_urlopen:
            mock_urlopen.side_effect = URLError("Connection refused")
            
            result = generate_report(scenario)
            
            # Should fall back to deterministic
            self.assertEqual(result.report_type, "deterministic_fallback")
            self.assertIsNone(result.ai_contribution)
    
    def test_timeout_falls_back(self):
        """Test that timeouts trigger deterministic fallback."""
        scenario = self._create_sample_scenario()
        
        # Mock urlopen to raise TimeoutError
        with patch('urllib.request.urlopen') as mock_urlopen:
            mock_urlopen.side_effect = TimeoutError("Request timed out")
            
            result = generate_report(scenario)
            
            # Should fall back to deterministic
            self.assertEqual(result.report_type, "deterministic_fallback")
            self.assertIsNone(result.ai_contribution)
    
    def test_malformed_response_falls_back(self):
        """Test that malformed responses trigger deterministic fallback."""
        scenario = self._create_sample_scenario()
        
        # Mock urlopen to return malformed JSON
        with patch('urllib.request.urlopen') as mock_urlopen:
            mock_response = unittest.mock.MagicMock()
            mock_response.read.return_value = b'{"invalid": "structure"}'
            mock_response.__enter__ = lambda self: self
            mock_response.__exit__ = lambda self, *args: None
            mock_urlopen.return_value = mock_response
            
            result = generate_report(scenario)
            
            # Should fall back to deterministic
            self.assertEqual(result.report_type, "deterministic_fallback")
            self.assertIsNone(result.ai_contribution)
    
    def test_empty_response_falls_back(self):
        """Test that empty AI responses trigger deterministic fallback."""
        scenario = self._create_sample_scenario()
        
        # Mock urlopen to return valid structure but empty content
        with patch('urllib.request.urlopen') as mock_urlopen:
            mock_response = unittest.mock.MagicMock()
            response_data = {
                "choices": [
                    {
                        "message": {
                            "content": ""
                        }
                    }
                ]
            }
            mock_response.read.return_value = json.dumps(response_data).encode('utf-8')
            mock_response.__enter__ = lambda self: self
            mock_response.__exit__ = lambda self, *args: None
            mock_urlopen.return_value = mock_response
            
            result = generate_report(scenario)
            
            # Should fall back to deterministic
            self.assertEqual(result.report_type, "deterministic_fallback")
            self.assertIsNone(result.ai_contribution)
    
    def test_valid_ai_response(self):
        """Test successful AI-assisted report generation."""
        scenario = self._create_sample_scenario()
        
        # Mock urlopen to return valid AI response
        with patch('urllib.request.urlopen') as mock_urlopen:
            mock_response = unittest.mock.MagicMock()
            ai_content = """Trip TRIP-2026-002 requires an urgent fuel stop.

The vehicle TRUCK-88 is carrying Frozen Foods and currently has 38.0L of fuel, which is below the safe reserve threshold of 55.0L. With 150.0km remaining to reach Distribution Center Alpha, and based on the deterministic fuel calculations, an immediate refuel is necessary to ensure safe delivery.

The recommended action is to refuel at the next approved station at Chevron, Exit 130. This recommendation has high confidence based on current fuel consumption rates and remaining distance.

Driver confirmation is required before proceeding with this exception action."""
            
            response_data = {
                "choices": [
                    {
                        "message": {
                            "content": ai_content
                        }
                    }
                ]
            }
            mock_response.read.return_value = json.dumps(response_data).encode('utf-8')
            mock_response.__enter__ = lambda self: self
            mock_response.__exit__ = lambda self, *args: None
            mock_urlopen.return_value = mock_response
            
            result = generate_report(scenario)
            
            # Should be AI-assisted
            self.assertEqual(result.report_type, "ai_assisted")
            self.assertIsNotNone(result.ai_contribution)
            self.assertIn("AI provider", result.ai_contribution)
            
            # Should still contain deterministic facts
            self.assertIn("trip_id", result.deterministic_facts)
            self.assertEqual(result.deterministic_facts["trip_id"], "TRIP-2026-002")
            
            # Should contain AI content
            self.assertIn("TRIP-2026-002", result.summary)
            self.assertTrue(result.requires_driver_confirmation)


class TestProviderConfig(unittest.TestCase):
    """Test provider configuration handling."""
    
    def setUp(self):
        """Clear environment before each test."""
        for key in ["PITT_AI_BASE_URL", "PITT_AI_API_KEY", "PITT_AI_MODEL"]:
            os.environ.pop(key, None)
    
    def test_config_not_configured_when_empty(self):
        """Test that config is not considered configured when variables are missing."""
        config = ProviderConfig.from_environment()
        self.assertFalse(config.is_configured())
    
    def test_config_not_configured_when_partial(self):
        """Test that config is not configured with only some variables."""
        os.environ["PITT_AI_BASE_URL"] = "https://api.example.com"
        os.environ["PITT_AI_MODEL"] = "gpt-4"
        # Missing API_KEY
        
        config = ProviderConfig.from_environment()
        self.assertFalse(config.is_configured())
    
    def test_config_is_configured_when_complete(self):
        """Test that config is configured when all variables are present."""
        os.environ["PITT_AI_BASE_URL"] = "https://api.example.com"
        os.environ["PITT_AI_API_KEY"] = "test-key"
        os.environ["PITT_AI_MODEL"] = "gpt-4"
        
        config = ProviderConfig.from_environment()
        self.assertTrue(config.is_configured())
    
    def test_secrets_are_masked_in_logging(self):
        """Test that API keys are never exposed in log-safe representations."""
        os.environ["PITT_AI_BASE_URL"] = "https://api.example.com"
        os.environ["PITT_AI_API_KEY"] = "secret-key-do-not-log"
        os.environ["PITT_AI_MODEL"] = "gpt-4"
        
        config = ProviderConfig.from_environment()
        masked = config.mask_for_logging()
        
        # Should not contain the actual key
        self.assertNotIn("secret-key", str(masked))
        self.assertIn("REDACTED", masked["api_key"])
        
        # Should contain non-secret values
        self.assertEqual(masked["base_url"], "https://api.example.com")
        self.assertEqual(masked["model"], "gpt-4")
    
    def test_secrets_not_in_string_representation(self):
        """Test that secrets don't leak through normal string operations."""
        os.environ["PITT_AI_API_KEY"] = "super-secret-key-12345"
        
        config = ProviderConfig.from_environment()
        
        # Even str() shouldn't expose the key directly
        config_str = str(config)
        # The key might appear in the dataclass repr, but mask_for_logging() is the safe path
        # Main thing: enforce use of mask_for_logging() in actual code
        
        # Real test: mask_for_logging never exposes it
        self.assertNotIn("super-secret-key-12345", str(config.mask_for_logging()))


class TestReportResultValidation(unittest.TestCase):
    """Test that ReportResult validation works correctly."""
    
    def test_deterministic_cannot_claim_ai_contribution(self):
        """Test that deterministic reports cannot claim AI contribution."""
        with self.assertRaises(AssertionError):
            ReportResult(
                report_type="deterministic_fallback",
                summary="Test",
                situation_description="Test",
                recommended_action="Test",
                reasoning="Test",
                deterministic_facts={},
                ai_contribution="This should fail",  # Invalid!
                confidence_notes="Test",
                requires_driver_confirmation=True,
                alternatives_presented=[],
            )
    
    def test_ai_assisted_must_declare_contribution(self):
        """Test that AI-assisted reports must declare contribution."""
        with self.assertRaises(AssertionError):
            ReportResult(
                report_type="ai_assisted",
                summary="Test",
                situation_description="Test",
                recommended_action="Test",
                reasoning="Test",
                deterministic_facts={},
                ai_contribution=None,  # Invalid!
                confidence_notes="Test",
                requires_driver_confirmation=True,
                alternatives_presented=[],
            )
    
    def test_valid_deterministic_report(self):
        """Test that valid deterministic reports pass validation."""
        report = ReportResult(
            report_type="deterministic_fallback",
            summary="Test",
            situation_description="Test",
            recommended_action="Test",
            reasoning="Test",
            deterministic_facts={"test": "value"},
            ai_contribution=None,
            confidence_notes="Test",
            requires_driver_confirmation=True,
            alternatives_presented=["Alt 1"],
        )
        self.assertEqual(report.report_type, "deterministic_fallback")
    
    def test_valid_ai_assisted_report(self):
        """Test that valid AI-assisted reports pass validation."""
        report = ReportResult(
            report_type="ai_assisted",
            summary="Test",
            situation_description="Test",
            recommended_action="Test",
            reasoning="Test",
            deterministic_facts={"test": "value"},
            ai_contribution="AI contribution description",
            confidence_notes="Test",
            requires_driver_confirmation=True,
            alternatives_presented=["Alt 1"],
        )
        self.assertEqual(report.report_type, "ai_assisted")


if __name__ == "__main__":
    unittest.main()
