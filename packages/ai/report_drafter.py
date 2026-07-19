"""
AI-Assisted Report Drafting Module

Generates driver-reviewable exception reports with deterministic fallback.
"""
import os
import json
from typing import Dict, Any, Optional
from dataclasses import dataclass
import logging

# Configure logging without exposing secrets
logger = logging.getLogger(__name__)


@dataclass
class ReportDraft:
    """Structured report draft with provenance."""
    
    title: str
    summary: str
    deterministic_facts: Dict[str, Any]
    ai_narrative: Optional[str]
    source: str  # 'deterministic' or 'ai-assisted'
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "title": self.title,
            "summary": self.summary,
            "deterministic_facts": self.deterministic_facts,
            "ai_narrative": self.ai_narrative,
            "source": self.source
        }


def _get_ai_config() -> Optional[Dict[str, str]]:
    """
    Retrieve AI provider configuration from environment.
    
    Returns None if configuration is incomplete.
    Never logs secrets.
    """
    base_url = os.getenv("PITT_AI_BASE_URL", "").strip()
    api_key = os.getenv("PITT_AI_API_KEY", "").strip()
    model = os.getenv("PITT_AI_MODEL", "").strip()
    
    if not all([base_url, api_key, model]):
        logger.debug("AI provider not fully configured, using deterministic fallback")
        return None
    
    return {
        "base_url": base_url,
        "api_key": api_key,
        "model": model
    }


def _call_ai_provider(config: Dict[str, str], prompt: str) -> Optional[str]:
    """
    Call AI provider with structured prompt.
    
    Returns None on failure (network, timeout, malformed response).
    Never logs secrets.
    """
    import requests
    
    try:
        
        headers = {
            "Authorization": f"Bearer {config['api_key']}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": config["model"],
            "messages": [
                {
                    "role": "system",
                    "content": "You are a professional delivery exception report writer. Generate clear, factual reports for drivers to review."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.3,
            "max_tokens": 500
        }
        
        response = requests.post(
            f"{config['base_url']}/chat/completions",
            headers=headers,
            json=payload,
            timeout=10
        )
        
        if response.status_code != 200:
            logger.warning(f"AI provider returned status {response.status_code}")
            return None
        
        data = response.json()
        
        # Handle OpenAI-compatible response format
        if "choices" in data and len(data["choices"]) > 0:
            message = data["choices"][0].get("message", {})
            content = message.get("content", "").strip()
            if content:
                return content
        
        logger.warning("AI provider response missing expected fields")
        return None
        
    except requests.exceptions.RequestException as e:
        logger.warning(f"AI provider request failed: {type(e).__name__}")
        return None
    except (KeyError, json.JSONDecodeError) as e:
        logger.warning(f"AI provider response malformed: {type(e).__name__}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error calling AI provider: {type(e).__name__}")
        return None


def _build_deterministic_report(payload: Dict[str, Any]) -> ReportDraft:
    """
    Generate deterministic fallback report from scenario payload.
    
    No AI involved - pure deterministic text generation.
    """
    facts = {
        "trip_id": payload.get("trip_id", "UNKNOWN"),
        "issue": payload.get("issue", "Unspecified exception"),
        "recommendation": payload.get("recommendation", "No recommendation available"),
        "timestamp": payload.get("timestamp", "Unknown time")
    }
    
    title = f"Exception Report: {facts['trip_id']}"
    
    summary = (
        f"Trip {facts['trip_id']} encountered an exception at {facts['timestamp']}. "
        f"Issue: {facts['issue']}. "
        f"Recommendation: {facts['recommendation']}."
    )
    
    return ReportDraft(
        title=title,
        summary=summary,
        deterministic_facts=facts,
        ai_narrative=None,
        source="deterministic"
    )


def _build_ai_prompt(payload: Dict[str, Any]) -> str:
    """Build structured prompt for AI provider."""
    return f"""Generate a professional exception report for a delivery driver to review.

Trip ID: {payload.get('trip_id', 'UNKNOWN')}
Issue: {payload.get('issue', 'Unspecified exception')}
Recommendation: {payload.get('recommendation', 'No recommendation')}
Timestamp: {payload.get('timestamp', 'Unknown')}

Write a clear 2-3 sentence summary that:
1. States what happened
2. Explains the recommended action
3. Maintains a professional, factual tone

Do not add information not provided above. Do not make autonomous decisions."""


def draft_report(payload: Dict[str, Any]) -> ReportDraft:
    """
    Draft an exception report from scenario payload.
    
    Args:
        payload: Structured scenario data with trip_id, issue, recommendation, timestamp
    
    Returns:
        ReportDraft with deterministic facts and optional AI narrative
    
    Always returns deterministic fallback if:
    - AI configuration is incomplete
    - AI provider call fails
    - AI response is malformed
    """
    # Start with deterministic base
    base_report = _build_deterministic_report(payload)
    
    # Attempt AI enhancement if configured
    config = _get_ai_config()
    if config is None:
        return base_report
    
    prompt = _build_ai_prompt(payload)
    ai_narrative = _call_ai_provider(config, prompt)
    
    if ai_narrative is None:
        return base_report
    
    # Return AI-enhanced version
    return ReportDraft(
        title=base_report.title,
        summary=base_report.summary,
        deterministic_facts=base_report.deterministic_facts,
        ai_narrative=ai_narrative,
        source="ai-assisted"
    )
