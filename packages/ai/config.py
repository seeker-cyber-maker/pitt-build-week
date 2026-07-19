"""Provider configuration and secrets management."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass
class ProviderConfig:
    """AI provider configuration from environment variables."""

    base_url: str | None
    api_key: str | None
    model: str | None

    @classmethod
    def from_environment(cls) -> ProviderConfig:
        """Load configuration from environment variables.

        Returns a config object. Check is_configured() to determine
        if all required values are present.
        """
        return cls(
            base_url=os.environ.get("PITT_AI_BASE_URL"),
            api_key=os.environ.get("PITT_AI_API_KEY"),
            model=os.environ.get("PITT_AI_MODEL"),
        )

    def is_configured(self) -> bool:
        """Check if all required configuration is present."""
        return all([
            self.base_url,
            self.api_key,
            self.model,
        ])

    def mask_for_logging(self) -> dict[str, str]:
        """Return a safe representation for logging (no secrets)."""
        return {
            "base_url": self.base_url or "(not set)",
            "api_key": "***REDACTED***" if self.api_key else "(not set)",
            "model": self.model or "(not set)",
        }

    def __repr__(self) -> str:
        masked = self.mask_for_logging()
        return (
            f"ProviderConfig("
            f"base_url={masked['base_url']!r}, "
            f"api_key={masked['api_key']!r}, "
            f"model={masked['model']!r})"
        )
