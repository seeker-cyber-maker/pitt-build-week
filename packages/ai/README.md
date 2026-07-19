# PITT AI Report Generator

Provider-neutral AI-assisted report generation module with deterministic fallback.

## Overview

This module generates delivery exception reports from structured scenario data. It attempts to use a configured AI provider for narrative generation, but gracefully falls back to a deterministic report if the provider is unavailable, fails, or returns malformed data.

## Architecture

```
packages/ai/
├── __init__.py              # Public API
├── models.py                # Data models (ScenarioPayload, ReportResult)
├── config.py                # Provider configuration and secret handling
└── report_generator.py      # Core report generation logic
```

## Usage

### Basic Usage

```python
from packages.ai import generate_report
from packages.ai.models import ScenarioPayload

# Create scenario from your scenario engine
scenario = ScenarioPayload(
    trip_id="TRIP-2026-001",
    driver_name="John Doe",
    # ... other fields
)

# Generate report (automatically handles AI vs fallback)
report = generate_report(scenario)

# Use the result
print(f"Report type: {report.report_type}")
print(f"Summary: {report.summary}")
print(f"Requires confirmation: {report.requires_driver_confirmation}")
```

### Configuration

Set environment variables to enable AI-assisted generation:

```bash
export PITT_AI_BASE_URL="https://api.openai.com/v1"
export PITT_AI_API_KEY="sk-..."
export PITT_AI_MODEL="gpt-4"
```

If any variable is missing, the module automatically uses deterministic fallback.

## Data Models

### ScenarioPayload (Input)

Structured scenario data from the scenario engine:

- **Trip details**: `trip_id`, `driver_name`, `vehicle_id`, `current_location`, `destination`, `cargo_type`
- **Exception details**: `exception_type`, `trigger_reason`, fuel metrics, distance
- **Recommendation**: `recommended_action`, `recommended_location`, `confidence_level`, `alternatives`
- **Deterministic calculation**: Dict of calculated metrics (fuel burn rate, etc.)

### ReportResult (Output)

Structured report with provenance marking:

- **report_type**: `"ai_assisted"` or `"deterministic_fallback"`
- **Content**: `summary`, `situation_description`, `recommended_action`, `reasoning`
- **Metadata**: `deterministic_facts`, `ai_contribution`, `confidence_notes`
- **Driver context**: `requires_driver_confirmation`, `alternatives_presented`

## Behavior Guarantees

### Deterministic Fallback Triggers

The module falls back to deterministic report generation when:

1. ✅ Environment variables are not set
2. ✅ HTTP connection fails (timeout, network error)
3. ✅ Provider returns an error (4xx, 5xx)
4. ✅ Provider response is malformed (missing fields, invalid JSON)
5. ✅ Provider response contains empty/invalid content

### Security

- ✅ API keys are **never logged**
- ✅ Use `ProviderConfig.mask_for_logging()` for safe logging
- ✅ All configuration is environment-based (no hardcoded secrets)

### Report Validation

- ✅ Deterministic reports cannot claim AI contribution
- ✅ AI-assisted reports must declare their contribution
- ✅ All reports contain deterministic facts for traceability
- ✅ All reports require driver confirmation (no autonomous action)

## Testing

```bash
# Run all tests
python3 -m unittest discover -s tests/ai -p "test_*.py" -v

# Run specific test class
python3 -m unittest tests.ai.test_report_generator.TestDeterministicFallback -v
```

### Test Coverage

- ✅ Unconfigured fallback (missing env vars)
- ✅ HTTP error fallback (500, 404, etc.)
- ✅ Connection error fallback (timeout, refused)
- ✅ Malformed response fallback (invalid JSON structure)
- ✅ Empty response fallback (empty AI content)
- ✅ Successful AI-assisted generation
- ✅ Secret masking in logs
- ✅ Report structure validation

## Integration Notes

### For Scenario Engine Developers

The module expects a `ScenarioPayload` with:
- All trip and vehicle identification
- Current state (fuel, location, distance)
- Pre-calculated recommendation with confidence
- Deterministic calculation results (dict)

### For UI Developers

The `ReportResult` provides:
- `report_type` to show provenance ("AI-assisted" or "Deterministic fallback")
- `summary` for quick display
- `situation_description` for detailed view
- `recommended_action` for driver confirmation screen
- `alternatives_presented` for alternative options
- `requires_driver_confirmation` (always `True` - no autonomous actions)

### For Integration Lane

This module is **stateless** and **dependency-minimal**:
- No database
- No framework dependencies
- Only stdlib HTTP client (`urllib.request`)
- Works with or without AI provider configured

## Open Integration Questions

1. **Scenario Payload Schema**: What exact fields will the scenario engine provide? Current schema is based on product scope, but exact field names should be confirmed.

2. **Provider Endpoint**: Should we support multiple provider formats (OpenAI, Anthropic, custom), or is one OpenAI-compatible endpoint sufficient for Build Week?

3. **Timeout Configuration**: Currently hardcoded to 10 seconds. Should this be configurable?

4. **Logging Level**: AI generation logs at INFO level. Should fallback events log at WARNING or INFO?

5. **Error Details to UI**: Should the UI receive error details when AI fails, or just the fallback report?

## Non-Goals (Out of Scope)

- ❌ Live traffic/mapping/fuel data integration
- ❌ Database persistence
- ❌ Multiple provider fallback chains
- ❌ Report history/versioning
- ❌ Autonomous decision-making
- ❌ Production authentication/authorization

## License

Part of PITT Build Week project.
