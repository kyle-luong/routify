"""
Simple in-memory rate limiter for FastAPI.
For production with multiple workers, use Redis instead.
"""
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
import time
import asyncio
import os
import ipaddress

# Trusted proxy IPs - only trust X-Forwarded-For from these
TRUSTED_PROXIES = set(
    ip.strip() for ip in os.getenv("TRUSTED_PROXIES", "127.0.0.1").split(",") if ip.strip()
)

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        requests_per_minute: int = 60,
        requests_per_hour: int = 1000,
        burst_limit: int = 10,
        cleanup_interval: int = 300,
    ):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.burst_limit = burst_limit
        self.cleanup_interval = cleanup_interval

        self.minute_tracker: dict[str, list] = defaultdict(list)
        self.hour_tracker: dict[str, list] = defaultdict(list)
        self.second_tracker: dict[str, list] = defaultdict(list)

        self._lock = asyncio.Lock()
        self._last_cleanup = time.time()

    def _is_valid_ip(self, ip: str) -> bool:
        """Validate IP address format."""
        try:
            ipaddress.ip_address(ip)
            return True
        except ValueError:
            return False

    def _get_client_ip(self, request: Request) -> str:
        """Get client IP, only trusting proxy headers from known proxies."""
        direct_ip = request.client.host if request.client else "unknown"

        # Only trust X-Forwarded-For if request comes from trusted proxy
        if direct_ip in TRUSTED_PROXIES:
            forwarded = request.headers.get("X-Forwarded-For")
            if forwarded:
                client_ip = forwarded.split(",")[0].strip()
                if self._is_valid_ip(client_ip):
                    return client_ip

            real_ip = request.headers.get("X-Real-IP")
            if real_ip and self._is_valid_ip(real_ip):
                return real_ip

        return direct_ip

    def _clean_old_entries(self, tracker: list, window_seconds: int, now: float) -> list:
        """Remove entries older than the time window."""
        cutoff = now - window_seconds
        return [t for t in tracker if t >= cutoff]

    def _cleanup_stale_ips(self):
        """Remove IPs with empty tracker lists to prevent memory leak."""
        for tracker in [self.second_tracker, self.minute_tracker, self.hour_tracker]:
            empty_ips = [ip for ip, timestamps in tracker.items() if not timestamps]
            for ip in empty_ips:
                del tracker[ip]

    async def dispatch(self, request: Request, call_next):
        if os.getenv("TESTING") == "true":
            print("Testing mode - skipping SlowDownMiddleware")
            return await call_next(request)
        
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/api/health"]:
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        now = time.time()

        async with self._lock:
            # Periodic cleanup of stale IPs to prevent memory leak
            if now - self._last_cleanup > self.cleanup_interval:
                self._cleanup_stale_ips()
                self._last_cleanup = now

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
        if os.getenv("TESTING") == "true":
            print("Testing mode - skipping SlowDownMiddleware")
            return await call_next(request) 
        
        if request.url.path in ["/health", "/api/health"]:
            return await call_next(request)
    
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Clean old entries (last minute)
        self.tracker[client_ip] = [t for t in self.tracker[client_ip] if t > now - 60]
        
        # Add delay if over threshold
        if len(self.tracker[client_ip]) > self.threshold:
            await asyncio.sleep(self.delay_ms / 1000)
        
        self.tracker[client_ip].append(now)
        return await call_next(request)
