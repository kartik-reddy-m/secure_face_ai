"""Short-lived liveness tokens for the blink challenge."""

from __future__ import annotations

import secrets
import time


class LivenessTokenStore:
    """Keep successful liveness checks in memory for a limited time."""

    def __init__(self, lifetime_seconds: int = 120) -> None:
        self._lifetime_seconds = lifetime_seconds
        self._tokens: dict[str, float] = {}

    def issue(self) -> str:
        """Create a token that may be used once before expiry."""
        self._remove_expired()
        token = secrets.token_urlsafe(32)
        self._tokens[token] = time.monotonic() + self._lifetime_seconds
        return token

    def consume(self, token: str) -> bool:
        """Validate and invalidate a one-time liveness token."""
        self._remove_expired()
        return self._tokens.pop(token, None) is not None

    def _remove_expired(self) -> None:
        now = time.monotonic()
        self._tokens = {
            token: expiry for token, expiry in self._tokens.items() if expiry > now
        }
