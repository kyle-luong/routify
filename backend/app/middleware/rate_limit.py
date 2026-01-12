"""
Simple in-memory rate limiter for FastAPI.
For production with multiple workers, use Redis instead.
"""
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
import time
import asyncio

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        requests_per_minute: int = 60,
        requests_per_hour: int = 1000,
        burst_limit: int = 10,  # Max requests per second
    ):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.burst_limit = burst_limit
        
        # Track requests: {ip: [(timestamp, count), ...]}
        self.minute_tracker: dict[str, list] = defaultdict(list)
        self.hour_tracker: dict[str, list] = defaultdict(list)
        self.second_tracker: dict[str, list] = defaultdict(list)
        
        # Lock for thread safety
        self._lock = asyncio.Lock()

    def _get_client_ip(self, request: Request) -> str:
        """Get client IP, handling proxies."""
        # Check X-Forwarded-For header (from load balancers/proxies)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        # Check X-Real-IP header
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to direct connection
        return request.client.host if request.client else "unknown"

    def _clean_old_entries(self, tracker: list, window_seconds: int, now: float) -> list:
        """Remove entries older than the time window."""
        cutoff = now - window_seconds
        return [t for t in tracker if t > cutoff]

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/api/health"]:
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        now = time.time()

        async with self._lock:
            # Clean old entries
            self.second_tracker[client_ip] = self._clean_old_entries(
                self.second_tracker[client_ip], 1, now
            )
            self.minute_tracker[client_ip] = self._clean_old_entries(
                self.minute_tracker[client_ip], 60, now
            )
            self.hour_tracker[client_ip] = self._clean_old_entries(
                self.hour_tracker[client_ip], 3600, now
            )

            # Check burst limit (per second)
            if len(self.second_tracker[client_ip]) >= self.burst_limit:
                raise HTTPException(
                    status_code=429,
                    detail="Too many requests. Please slow down.",
                    headers={"Retry-After": "1"}
                )

            # Check minute limit
            if len(self.minute_tracker[client_ip]) >= self.requests_per_minute:
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded. Please wait a minute.",
                    headers={"Retry-After": "60"}
                )

            # Check hour limit
            if len(self.hour_tracker[client_ip]) >= self.requests_per_hour:
                raise HTTPException(
                    status_code=429,
                    detail="Hourly rate limit exceeded. Please try again later.",
                    headers={"Retry-After": "3600"}
                )

            # Record this request
            self.second_tracker[client_ip].append(now)
            self.minute_tracker[client_ip].append(now)
            self.hour_tracker[client_ip].append(now)

        response = await call_next(request)
        
        # Add rate limit headers to response
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(
            self.requests_per_minute - len(self.minute_tracker[client_ip])
        )
        
        return response


class SlowDownMiddleware(BaseHTTPMiddleware):
    """
    Additional middleware to slow down suspicious behavior.
    If a user makes too many requests, add artificial delay.
    """
    def __init__(self, app, threshold: int = 30, delay_ms: int = 500):
        super().__init__(app)
        self.threshold = threshold  # Requests per minute before slowing
        self.delay_ms = delay_ms
        self.tracker: dict[str, list] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Clean old entries (last minute)
        self.tracker[client_ip] = [t for t in self.tracker[client_ip] if t > now - 60]
        
        # Add delay if over threshold
        if len(self.tracker[client_ip]) > self.threshold:
            await asyncio.sleep(self.delay_ms / 1000)
        
        self.tracker[client_ip].append(now)
        return await call_next(request)
