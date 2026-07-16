// lib/security/rate-limit.ts
// Sliding-window rate limiting backed by Upstash Redis (REST API, works
// from Edge and Node runtimes alike). Applied to auth endpoints, lead
// form submissions, the public analytics RPC, and the Enterprise API.

import 'server-only';

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

const REDIS_URL = process.env.API_RATE_LIMIT_REDIS_URL;
const REDIS_TOKEN = process.env.API_RATE_LIMIT_REDIS_TOKEN;

function isConfiguredRedisUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    // Guards against placeholder values like "your-upstash-redis-url"
    // left over from .env.example — these are truthy strings but not
    // valid URLs, and would otherwise throw deep inside fetch().
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

let hasWarnedAboutMissingConfig = false;

async function redisCommand(command: (string | number)[]): Promise<unknown> {
  if (!isConfiguredRedisUrl(REDIS_URL) || !REDIS_TOKEN) {
    // Fail-open when Redis isn't configured (or is misconfigured), but
    // warn once per server instance rather than on every single call.
    if (!hasWarnedAboutMissingConfig) {
      console.warn(
        'Rate limiting disabled: API_RATE_LIMIT_REDIS_URL/TOKEN are missing or invalid. ' +
          'Requests are allowed through unrestricted until this is configured.',
      );
      hasWarnedAboutMissingConfig = true;
    }
    return null;
  }

  const response = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error(`Redis command failed with status ${response.status}`);
  }

  const json = await response.json();
  return json.result;
}

/**
 * Fixed-window rate limiter. `key` should already be namespaced by the
 * caller (e.g. `otp:${email}` or `lead-form:${profileId}:${ip}`).
 */
export async function rateLimit(
  key: string,
  { windowSeconds, maxRequests }: { windowSeconds: number; maxRequests: number },
): Promise<RateLimitResult> {
  const windowKey = `ratelimit:${key}:${Math.floor(Date.now() / 1000 / windowSeconds)}`;

  try {
    const count = (await redisCommand(['INCR', windowKey])) as number | null;

    if (count === null) {
      // Redis unavailable — fail open.
      return { success: true, limit: maxRequests, remaining: maxRequests, resetAt: Date.now() + windowSeconds * 1000 };
    }

    if (count === 1) {
      await redisCommand(['EXPIRE', windowKey, windowSeconds]);
    }

    const remaining = Math.max(0, maxRequests - count);
    return {
      success: count <= maxRequests,
      limit: maxRequests,
      remaining,
      resetAt: (Math.floor(Date.now() / 1000 / windowSeconds) + 1) * windowSeconds * 1000,
    };
  } catch (err) {
    console.error('Rate limit check failed, failing open:', err);
    return { success: true, limit: maxRequests, remaining: maxRequests, resetAt: Date.now() + windowSeconds * 1000 };
  }
}

export const RATE_LIMITS = {
  OTP_REQUEST: { windowSeconds: 300, maxRequests: 5 },
  OTP_VERIFY: { windowSeconds: 300, maxRequests: 10 },
  PASSWORD_SIGNUP: { windowSeconds: 300, maxRequests: 5 },
  PASSWORD_SIGNIN: { windowSeconds: 300, maxRequests: 10 },
  LEAD_FORM_SUBMIT: { windowSeconds: 60, maxRequests: 5 },
  ANALYTICS_EVENT: { windowSeconds: 60, maxRequests: 30 },
  PUBLIC_API: { windowSeconds: 60, maxRequests: 120 },
} as const;
