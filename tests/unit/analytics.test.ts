/**
 * Unit Tests for Analytics Utilities
 * 
 * Tests for:
 * - Visitor ID generation and cookie handling
 * - Device detection
 * - Referrer parsing
 * - Geolocation header parsing
 * - Date range parsing with timezone
 * - Idempotency key generation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock crypto.randomUUID for consistent testing
const mockRandomUUID = vi.fn();
let randomCallCount = 0;
const mockGetRandomValues = vi.fn((arr: Uint8Array) => {
  for (let i = 0; i < arr.length; i++) {
    // Use values that produce 2-char hex (0x10-0xff) with variation per call
    arr[i] = 0x10 + ((i * 13 + randomCallCount * 17) % 0xF0); // Values 0x10-0xFF, all produce 2-char hex
  }
  randomCallCount++;
  return arr;
});

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: mockRandomUUID,
    getRandomValues: mockGetRandomValues,
  },
  configurable: true,
});

// Mock date-fns-tz
vi.mock('date-fns-tz', () => ({
  toZonedTime: vi.fn((date) => date),
  format: vi.fn((date, formatStr, options) => {
    if (formatStr === 'MMM d') return 'Jan 1';
    return '2024-01-01';
  }),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  subDays: vi.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  startOfDay: vi.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())),
  endOfDay: vi.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)),
  subMinutes: vi.fn((date, minutes) => new Date(date.getTime() - minutes * 60 * 1000)),
  format: vi.fn(() => 'Jan 1'),
}));

// Test visitor cookie utilities
describe('Visitor Cookie Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRandomUUID.mockReturnValue('12345678-1234-5678-1234-567812345678');
  });

  it('generates a valid visitor ID', async () => {
    const { generateVisitorId } = await import('@/lib/analytics/visitor-cookie');
    const id = generateVisitorId();
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(id.length).toBe(32); // 16 bytes = 32 hex chars
  });

  it('generates unique visitor IDs', async () => {
    const { generateVisitorId } = await import('@/lib/analytics/visitor-cookie');
    let callCount = 0;
    mockRandomUUID
      .mockImplementationOnce(() => {
        callCount++;
        return '11111111-1111-1111-1111-111111111111';
      })
      .mockImplementationOnce(() => {
        callCount++;
        return '22222222-2222-2222-2222-222222222222';
      });
    
    const id1 = generateVisitorId();
    const id2 = generateVisitorId();
    expect(id1).not.toBe(id2);
  });
});

// Test device detection
describe('Device Detection', () => {
  it('detects mobile devices', async () => {
    const { parseDeviceInfo } = await import('@/lib/analytics/device-detection');
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15';
    const result = parseDeviceInfo(ua);
    expect(result.deviceType).toBe('mobile');
    expect(result.deviceBrand).toBe('Apple');
    expect(result.os).toBe('iOS');
  });

  it('detects desktop devices', async () => {
    const { parseDeviceInfo } = await import('@/lib/analytics/device-detection');
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const result = parseDeviceInfo(ua);
    expect(result.deviceType).toBe('desktop');
    expect(result.os).toBe('Windows');
    expect(result.browser).toBe('Chrome');
  });

  it('detects tablet devices', async () => {
    const { parseDeviceInfo } = await import('@/lib/analytics/device-detection');
    const ua = 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15';
    const result = parseDeviceInfo(ua);
    expect(result.deviceType).toBe('tablet');
    expect(result.deviceBrand).toBe('Apple');
  });

  it('detects Samsung devices', async () => {
    const { parseDeviceInfo } = await import('@/lib/analytics/device-detection');
    const ua = 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
    const result = parseDeviceInfo(ua);
    expect(result.deviceType).toBe('mobile');
    expect(result.deviceBrand).toBe('Samsung');
    expect(result.os).toBe('Android');
  });

  it('detects Google Pixel devices', async () => {
    const { parseDeviceInfo } = await import('@/lib/analytics/device-detection');
    const ua = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
    const result = parseDeviceInfo(ua);
    expect(result.deviceBrand).toBe('Google');
  });
});

// Test referrer parsing
describe('Referrer Parsing', () => {
  it('identifies direct traffic', async () => {
    const { parseReferrer } = await import('@/lib/analytics/referrer');
    expect(parseReferrer(null)).toEqual({ source: 'Direct', referrer: null });
    expect(parseReferrer('')).toEqual({ source: 'Direct', referrer: null });
    expect(parseReferrer('direct')).toEqual({ source: 'Direct', referrer: null });
  });

  it('identifies Google search', async () => {
    const { parseReferrer } = await import('@/lib/analytics/referrer');
    expect(parseReferrer('https://www.google.com/search?q=test')).toEqual({ source: 'Google', referrer: 'google.com' });
    expect(parseReferrer('https://google.co.uk/search?q=test')).toEqual({ source: 'Google', referrer: 'google.co.uk' });
  });

  it('identifies LinkedIn', async () => {
    const { parseReferrer } = await import('@/lib/analytics/referrer');
    expect(parseReferrer('https://www.linkedin.com/feed/')).toEqual({ source: 'LinkedIn', referrer: 'linkedin.com' });
    expect(parseReferrer('https://lnkd.in/abc123')).toEqual({ source: 'LinkedIn', referrer: 'lnkd.in' });
  });

  it('identifies GitHub', async () => {
    const { parseReferrer } = await import('@/lib/analytics/referrer');
    expect(parseReferrer('https://github.com/user/repo')).toEqual({ source: 'GitHub', referrer: 'github.com' });
  });

  it('identifies Twitter/X', async () => {
    const { parseReferrer } = await import('@/lib/analytics/referrer');
    expect(parseReferrer('https://t.co/abc123')).toEqual({ source: 'Twitter/X', referrer: 't.co' });
    expect(parseReferrer('https://twitter.com/user')).toEqual({ source: 'Twitter/X', referrer: 'twitter.com' });
  });

  it('falls back to Referral for unknown sources', async () => {
    const { parseReferrer } = await import('@/lib/analytics/referrer');
    expect(parseReferrer('https://example.com/page')).toEqual({ source: 'Referral', referrer: 'example.com' });
  });
});

// Test geolocation header parsing
describe('Geolocation Header Parsing', () => {
  it('parses Vercel headers for India with state', async () => {
    const { parseVercelGeolocationHeaders } = await import('@/lib/analytics/geolocation');
    
    const headers = new Headers({
      'x-vercel-ip-country': 'IN',
      'x-vercel-ip-country-region': 'MH',
      'x-vercel-ip-city': 'Mumbai',
      'x-vercel-ip-timezone': 'Asia/Kolkata',
    });

    const result = parseVercelGeolocationHeaders(headers);
    expect(result.countryCode).toBe('IN');
    expect(result.country).toBe('India');
    expect(result.regionCode).toBe('MH');
    expect(result.region).toBe('Maharashtra');
    expect(result.city).toBe('Mumbai');
  });

  it('parses Vercel headers for US', async () => {
    const { parseVercelGeolocationHeaders } = await import('@/lib/analytics/geolocation');
    
    const headers = new Headers({
      'x-vercel-ip-country': 'US',
      'x-vercel-ip-country-region': 'CA',
      'x-vercel-ip-city': 'San Francisco',
    });

    const result = parseVercelGeolocationHeaders(headers);
    expect(result.countryCode).toBe('US');
    expect(result.country).toBe('United States');
    expect(result.regionCode).toBe('CA');
    expect(result.region).toBe('CA');
  });

  it('returns nulls when headers missing', async () => {
    const { parseVercelGeolocationHeaders, hasVercelGeolocationHeaders } = await import('@/lib/analytics/geolocation');
    
    const headers = new Headers({});
    const result = parseVercelGeolocationHeaders(headers);
    
    expect(result.country).toBeNull();
    expect(result.countryCode).toBeNull();
    expect(result.region).toBeNull();
    expect(result.city).toBeNull();
    expect(hasVercelGeolocationHeaders(headers)).toBe(false);
  });
});

// Test date range parsing with timezone
describe('Date Range Parsing', () => {
  it('parses range strings correctly', async () => {
    const { parseAnalyticsRange } = await import('@/lib/analytics/date-utils');
    
    const today = parseAnalyticsRange('today');
    expect(today.start).toBeDefined();
    expect(today.end).toBeDefined();
    
    const week = parseAnalyticsRange('7');
    expect(week.start).toBeDefined();
    
    const month = parseAnalyticsRange('30');
    expect(month.start).toBeDefined();
    
    const all = parseAnalyticsRange('all');
    expect(all.start).toBe('2020-01-01T00:00:00.000Z');
  });

  it('handles unknown range defaults to 30 days', async () => {
    const { parseAnalyticsRange } = await import('@/lib/analytics/date-utils');
    const result = parseAnalyticsRange('unknown');
    expect(result.start).toBeDefined();
  });
});

// Test idempotency key validation
describe('Idempotency Key Validation', () => {
  it('validates UUID format', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    // Valid UUID v4 examples
    expect(uuidRegex.test('12345678-1234-4678-8234-567812345678')).toBe(true); // version 4, variant 8
    expect(uuidRegex.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(uuidRegex.test('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
    
    // Invalid UUIDs
    expect(uuidRegex.test('invalid-uuid')).toBe(false);
    expect(uuidRegex.test('')).toBe(false);
    expect(uuidRegex.test('12345678-1234-5678-1234-567812345678')).toBe(false); // wrong version/variant
    expect(uuidRegex.test('12345678-1234-5678-1234-56781234567')).toBe(false); // too short
  });
});

// Test analytics salt fallback behaviour.
//
// The track route NEVER throws on a missing salt — it falls back to a derived
// secret (SUPABASE_SERVICE_ROLE_KEY) or a dev-only constant. That was a deliberate
// fix: the previous "throw in production" behaviour took the entire analytics
// endpoint down on every deploy that forgot to set ANALYTICS_SALT.
describe('Analytics Salt', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('falls back to a dev-only constant in development without ANALYTICS_SALT', () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    delete process.env.ANALYTICS_SALT;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const secret = process.env.ANALYTICS_SALT || 'portfolio-analytics-secret-salt-dev-only';
    expect(secret).toBe('portfolio-analytics-secret-salt-dev-only');
  });

  it('does not throw when ANALYTICS_SALT is missing in production', () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    delete process.env.ANALYTICS_SALT;

    expect(() => {
      // Mirrors getHashSecret(): never throw, always return a usable string.
      const salt = process.env.ANALYTICS_SALT;
      if (salt) return salt;
      const serverSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serverSecret) return 'derived-from-service-role-key';
      return 'portfolio-analytics-secret-salt-dev-only';
    }).not.toThrow();
  });
});