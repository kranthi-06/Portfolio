// Simple in-memory rate limiter
// Note: In a true serverless environment (like Vercel), memory is not shared across instances.
// This provides basic protection per lambda instance. For strict global rate limiting, 
// a Redis store (e.g., Upstash) would be required.

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Rate limit requests by IP address
 * @param ip The IP address to limit
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
export function rateLimit(ip: string = "global", limit = 60, windowMs = 60000): RateLimitResult {
  const now = Date.now();
  
  // Cleanup expired entries periodically to prevent memory leaks
  if (Math.random() < 0.01) {
    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    }
  }

  if (!store[ip]) {
    store[ip] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return { success: true, limit, remaining: limit - 1, resetTime: store[ip].resetTime };
  }

  if (store[ip].resetTime < now) {
    store[ip].count = 1;
    store[ip].resetTime = now + windowMs;
    return { success: true, limit, remaining: limit - 1, resetTime: store[ip].resetTime };
  }

  store[ip].count++;

  const remaining = Math.max(0, limit - store[ip].count);
  
  return {
    success: store[ip].count <= limit,
    limit,
    remaining,
    resetTime: store[ip].resetTime,
  };
}
