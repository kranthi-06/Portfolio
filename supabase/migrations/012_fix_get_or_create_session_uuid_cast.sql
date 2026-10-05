-- ============================================================================
-- 012 — Fix get_or_create_session(): uuid = text comparison (error 42883)
-- ============================================================================
--
-- BUG (production analytics were empty):
--    public.get_or_create_session() looked the stored session up with
--        WHERE id = p_session_id
--    where `id` is uuid and `p_session_id` is text. PostgreSQL has no implicit
--    text -> uuid cast, so every call that carried a session id failed with:
--        ERROR 42883: operator does not exist: uuid = text
--
--    The browser tracker always sends a session id — `temp_<random>` on the
--    first visit, then the real uuid it gets back from the API — so *every*
--    pageview after the first and *every* 30s heartbeat returned 500 before any
--    row was written. That is why the analytics dashboard stayed empty even
--    after the RLS/service-role wiring was fixed.
--
-- FIX:
--    Validate the incoming value and cast it explicitly. Only a well-formed uuid
--    is looked up; placeholders (`temp_*`) and malformed values fall through to
--    the "create new session" path, which is the intended behaviour.
--
-- Also pins search_path on this SECURITY DEFINER function (hardening).
-- ============================================================================

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
    v_session_uuid uuid;
BEGIN
    -- The tracker sends `temp_<random>` until the first response arrives, so the
    -- value must be validated *and* cast before it can be compared to a uuid.
    IF p_session_id IS NOT NULL
       AND p_session_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        v_session_uuid := p_session_id::uuid;
    END IF;

    -- Try to find an existing, non-expired session (30 minutes of inactivity)
    IF v_session_uuid IS NOT NULL THEN
        SELECT id, started_at INTO v_session_id, v_session_started
        FROM public.analytics_sessions
        WHERE id = v_session_uuid;

        IF v_session_id IS NOT NULL
           AND now() - v_session_started < interval '30 minutes' THEN
            UPDATE public.analytics_sessions
            SET exit_page = p_exit_page,
                ended_at = now(),
                duration = EXTRACT(EPOCH FROM (now() - started_at))::int,
                is_bounced = false
            WHERE id = v_session_id;
            RETURN v_session_id;
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-assert the service-role grant (route handlers write with the service role).
GRANT EXECUTE ON FUNCTION public.get_or_create_session TO service_role;
