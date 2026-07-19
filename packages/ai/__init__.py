"""PITT AI-Assisted Report Generation Module

Provider-neutral report drafting aligned with PITT Report Draft Contract v1.

Input:  pitt.report-input.v1  (ScenarioPayload)
Output: pitt.report-draft.v1  (ReportResult)
"""

from .models import ReportResult, ScenarioPayload
from .report_generator import generate_report

__all__ = ["generate_report", "ReportResult", "ScenarioPayload"]
