#!/usr/bin/env node
/**
 * Cleanup Script for Analytics Data
 * 
 * This script can be run as a scheduled job (cron, Supabase pg_cron, GitHub Actions, etc.)
 * to clean up expired data from analytics tables.
 * 
 * Usage: node scripts/cleanup-analytics.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function cleanup() {
  console.log('Starting analytics cleanup...');
  const startTime = Date.now();

  try {
    // 1. Clean expired geolocation cache (older than 30 days)
    console.log('Cleaning geolocation cache...');
    const { data: geoResult, error: geoError } = await supabase.rpc('clean_geolocation_cache');
    if (geoError) {
      console.error('Geolocation cleanup failed:', geoError);
    } else {
      console.log(`Geolocation cache cleaned: ${geoResult} entries removed`);
    }

    // 2. Clean expired rate limits (cleanup happens in check_rate_limit function, but we can also run manual cleanup)
    console.log('Cleaning rate limits...');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error: rlError, count: rlCount } = await supabase
      .from('rate_limits')
      .delete()
      .lt('window_start', thirtyDaysAgo);
    if (rlError) {
      console.error('Rate limit cleanup failed:', rlError);
    } else {
      console.log(`Rate limits cleaned: ${rlCount || 0} entries removed`);
    }

    // 3. Clean old raw analytics events (older than 90 days)
    console.log('Cleaning old analytics events...');
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { error: eventsError, count: eventsCount } = await supabase
      .from('analytics_events')
      .delete()
      .lt('created_at', ninetyDaysAgo);
    if (eventsError) {
      console.error('Analytics events cleanup failed:', eventsError);
    } else {
      console.log(`Analytics events cleaned: ${eventsCount || 0} entries removed`);
    }

    // 4. Clean old page views (older than 90 days)
    console.log('Cleaning old page views...');
    const { error: pvError, count: pvCount } = await supabase
      .from('analytics_page_views')
      .delete()
      .lt('created_at', ninetyDaysAgo);
    if (pvError) {
      console.error('Page views cleanup failed:', pvError);
    } else {
      console.log(`Page views cleaned: ${pvCount || 0} entries removed`);
    }

    // 5. Clean old sessions (older than 90 days)
    console.log('Cleaning old sessions...');
    const { error: sessionsError, count: sessionsCount } = await supabase
      .from('analytics_sessions')
      .delete()
      .lt('started_at', ninetyDaysAgo);
    if (sessionsError) {
      console.error('Sessions cleanup failed:', sessionsError);
    } else {
      console.log(`Sessions cleaned: ${sessionsCount || 0} entries removed`);
    }

    console.log(`Cleanup completed in ${Date.now() - startTime}ms`);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
}

cleanup();