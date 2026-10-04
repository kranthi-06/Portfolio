-- Enhanced Analytics Helper Functions
-- Separate migration for PL/pgSQL functions to avoid parsing issues

-- ============================================
-- Helper: Check if current user is admin
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role text;
BEGIN
    SELECT role INTO v_role
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN COALESCE(v_role = 'admin', false);
END;
$$;

-- ============================================
-- Function to get or create visitor by visitor_id (first-party cookie)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_or_create_visitor(
    p_visitor_id text,
    p_visitor_hash text,
    p_country text,
    p_region text,
    p_city text,
    p_timezone text,
    p_browser text,
    p_os text,
    p_device_type text,
    p_device_brand text,
    p_resolution text,
    p_language text,
    p_referrer_source text,
    p_landing_page text
) RETURNS uuid AS $$
DECLARE
    v_visitor_id uuid;
BEGIN
    -- Try to find by visitor_id (first-party cookie)
    IF p_visitor_id IS NOT NULL THEN
        SELECT id INTO v_visitor_id 
        FROM public.analytics_visitors 
        WHERE visitor_id = p_visitor_id;
        
        IF v_visitor_id IS NOT NULL THEN
            UPDATE public.analytics_visitors 
            SET last_seen_at = now(),
                country = COALESCE(p_country, country),
                region = COALESCE(p_region, region),
                city = COALESCE(p_city, city)
            WHERE id = v_visitor_id;
            RETURN v_visitor_id;
        END IF;
    END IF;
    
    -- Try to find by visitor_hash (fallback for backward compatibility)
    IF p_visitor_hash IS NOT NULL THEN
        SELECT id INTO v_visitor_id 
        FROM public.analytics_visitors 
        WHERE visitor_hash = p_visitor_hash;
        
        IF v_visitor_id IS NOT NULL THEN
            UPDATE public.analytics_visitors 
            SET last_seen_at = now(),
                visitor_id = COALESCE(visitor_id, p_visitor_id),
                is_returning = true,
                country = COALESCE(p_country, country),
                region = COALESCE(p_region, region),
                city = COALESCE(p_city, city)
            WHERE id = v_visitor_id;
            RETURN v_visitor_id;
        END IF;
    END IF;
    
    -- Create new visitor
    INSERT INTO public.analytics_visitors (
        visitor_id, visitor_hash, country, region, city, timezone,
        browser, os, device_type, device_brand, resolution, language,
        referrer_source, landing_page, is_returning, first_seen_at, last_seen_at
    ) VALUES (
        p_visitor_id, p_visitor_hash, p_country, p_region, p_city, p_timezone,
        p_browser, p_os, p_device_type, p_device_brand, p_resolution, p_language,
        p_referrer_source, p_landing_page, false, now(), now()
    ) RETURNING id INTO v_visitor_id;
    
    RETURN v_visitor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or create session
CREATE OR REPLACE FUNCTION public.get_or_create_session(
    p_visitor_id uuid,
    p_session_id text,
    p_referrer text,
    p_referrer_source text,
    p_landing_page text,
    p_exit_page text,
    p_country text,
    p_region text,
    p_city text,
    p_browser text,
    p_os text,
    p_device_type text,
    p_device_brand text
) RETURNS uuid AS $$
DECLARE
    v_session_id uuid;
    v_session_started timestamptz;
BEGIN
    -- Try to find existing session
    IF p_session_id IS NOT NULL THEN
        SELECT id, started_at INTO v_session_id, v_session_started
        FROM public.analytics_sessions
        WHERE id = p_session_id;
        
        IF v_session_id IS NOT NULL THEN
            -- Check if session expired (30 minutes inactivity)
            IF now() - v_session_started < interval '30 minutes' THEN
                UPDATE public.analytics_sessions
                SET exit_page = p_exit_page,
                    ended_at = now(),
                    duration = EXTRACT(EPOCH FROM (now() - started_at))::int,
                    is_bounced = false
                WHERE id = v_session_id;
                RETURN v_session_id;
            END IF;
        END IF;
    END IF;
    
    -- Create new session
    INSERT INTO public.analytics_sessions (
        visitor_id, referrer, referrer_source, landing_page, exit_page,
        country, region, city, browser, os, device_type, device_brand,
        started_at, ended_at, duration, is_bounced
    ) VALUES (
        p_visitor_id, p_referrer, p_referrer_source, p_landing_page, p_exit_page,
        p_country, p_region, p_city, p_browser, p_os, p_device_type, p_device_brand,
        now(), now(), 0, true
    ) RETURNING id INTO v_session_id;
    
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get geolocation from cache or resolve
CREATE OR REPLACE FUNCTION public.resolve_geolocation(
    p_ip text,
    p_provider text DEFAULT 'maxmind'
) RETURNS TABLE (
    country text,
    country_code text,
    region text,
    region_code text,
    city text,
    latitude numeric,
    longitude numeric,
    accuracy_radius integer
) AS $$
DECLARE
    v_ip_prefix text;
    v_result RECORD;
BEGIN
    -- Create IP prefix for caching (first 3 octets for IPv4)
    IF p_ip LIKE '%.%.%.%' THEN
        v_ip_prefix = split_part(p_ip, '.', 1) || '.' || split_part(p_ip, '.', 2) || '.' || split_part(p_ip, '.', 3) || '.0/24';
    ELSE
        v_ip_prefix = p_ip;
    END IF;
    
    -- Try cache first
    SELECT * INTO v_result
    FROM public.geolocation_cache
    WHERE ip_prefix = v_ip_prefix
      AND expires_at > now()
    LIMIT 1;
    
    IF FOUND THEN
        RETURN QUERY SELECT v_result.country, v_result.country_code, v_result.region, v_result.region_code,
                          v_result.city, v_result.latitude, v_result.longitude, v_result.accuracy_radius;
        RETURN;
    END IF;
    
    -- Return NULLs - the API layer will use Vercel headers as fallback
    RETURN QUERY SELECT NULL::text, NULL::text, NULL::text, NULL::text, NULL::text, NULL::numeric, NULL::numeric, NULL::integer;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cache geolocation result
CREATE OR REPLACE FUNCTION public.cache_geolocation(
    p_ip text,
    p_country text,
    p_country_code text,
    p_region text,
    p_region_code text,
    p_city text,
    p_latitude numeric,
    p_longitude numeric,
    p_accuracy_radius integer,
    p_provider text DEFAULT 'maxmind'
) RETURNS void AS $$
DECLARE
    v_ip_prefix text;
BEGIN
    IF p_ip LIKE '%.%.%.%' THEN
        v_ip_prefix = split_part(p_ip, '.', 1) || '.' || split_part(p_ip, '.', 2) || '.' || split_part(p_ip, '.', 3) || '.0/24';
    ELSE
        v_ip_prefix = p_ip;
    END IF;
    
    INSERT INTO public.geolocation_cache (
        ip_prefix, country, country_code, region, region_code, city,
        latitude, longitude, accuracy_radius, provider, resolved_at, expires_at
    ) VALUES (
        v_ip_prefix, p_country, p_country_code, p_region, p_region_code, p_city,
        p_latitude, p_longitude, p_accuracy_radius, p_provider, now(), now() + interval '30 days'
    )
    ON CONFLICT (ip_prefix) DO UPDATE SET
        country = EXCLUDED.country,
        country_code = EXCLUDED.country_code,
        region = EXCLUDED.region,
        region_code = EXCLUDED.region_code,
        city = EXCLUDED.city,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        accuracy_radius = EXCLUDED.accuracy_radius,
        provider = EXCLUDED.provider,
        resolved_at = EXCLUDED.resolved_at,
        expires_at = EXCLUDED.expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean expired geolocation cache
CREATE OR REPLACE FUNCTION public.clean_geolocation_cache() RETURNS integer AS $$
DECLARE
    v_deleted integer;
BEGIN
    DELETE FROM public.geolocation_cache WHERE expires_at < now();
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to service role
GRANT EXECUTE ON FUNCTION public.get_or_create_visitor TO service_role;
GRANT EXECUTE ON FUNCTION public.get_or_create_session TO service_role;
GRANT EXECUTE ON FUNCTION public.resolve_geolocation TO service_role;
GRANT EXECUTE ON FUNCTION public.cache_geolocation TO service_role;
GRANT EXECUTE ON FUNCTION public.clean_geolocation_cache TO service_role;

NOTIFY pgrst, 'reload schema';