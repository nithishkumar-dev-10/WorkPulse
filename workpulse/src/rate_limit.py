"""Small in-process sliding-window limiter for auth endpoints.

Kept dependency-free and local to each API worker. Swap for Redis/slowapi if the
service is ever run with multiple workers or replicas.
"""

import threading
import time
from collections import defaultdict, deque
from typing import Callable

from fastapi import HTTPException, Request

_lock = threading.Lock()
_hits: dict[tuple[str, str], deque[float]] = defaultdict(deque)


def _client_key(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def rate_limit(scope: str, max_requests: int, window_seconds: int) -> Callable:
    def dependency(request: Request) -> None:
        now = time.monotonic()
        key = (scope, _client_key(request))
        with _lock:
            window = _hits[key]
            while window and window[0] <= now - window_seconds:
                window.popleft()
            if len(window) >= max_requests:
                retry_after = max(1, int(window_seconds - (now - window[0])) + 1)
                raise HTTPException(
                    status_code=429,
                    detail=f"Too many attempts. Try again in {retry_after} seconds.",
                    headers={"Retry-After": str(retry_after)},
                )
            window.append(now)

    return dependency
