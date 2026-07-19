"""PITT AI-Assisted Report Generation Module

Provider-neutral report drafting with deterministic fallback.
"""

from .report_generator import generate_report, ReportResult

__all__ = ["generate_report", "ReportResult"]
