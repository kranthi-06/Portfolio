-- Rate Limiting Infrastructure
-- Provides database-backed rate limiting for contact form and analytics

-- ============================================
-- Rate Limit Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    identifier text NOT NULL,           -- IP address or email
    endpoint text NOT NULL,             -- e.g., 'contact', 'analytics'
    count integer NOT NULL DEFAULT 1,
    window_start timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_identifier_endpoint 
ON public.rate_limits (identifier, endpoint);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start 
ON public.rate_limits (window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limits
CREATE POLICY "Service role full access rate_limits" ON public.rate_limits
  FOR ALL USING (auth.role() = 'service_role');

GRANT ALL ON public.rate_limits TO service_role;

-- ============================================
-- Rate Limit Check Function
-- ============================================
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_identifier text,
    p_endpoint text,
    p_limit integer,
    p_window_seconds integer
) RETURNS TABLE (
    allowed boolean,
    remaining integer,
    reset_at timestamptz
) AS $$
DECLARE
    v_window_start timestamptz := now() - (p_window_seconds || ' seconds')::interval;
    v_current_count integer;
    v_reset_at timestamptz;
BEGIN
    -- Clean old entries
    DELETE FROM public.rate_limits 
    WHERE window_start < v_window_start;
    
    -- Get or create rate limit entry
    INSERT INTO public.rate_limits (identifier, endpoint, count, window_start)
    VALUES (p_identifier, p_endpoint, 1, now())
    ON CONFLICT (identifier, endpoint) DO UPDATE SET
        count = CASE 
            WHEN rate_limits.window_start < v_window_start THEN 1
            ELSE rate_limits.count + 1
        END,
        window_start = CASE 
            WHEN rate_limits.window_start < v_window_start THEN now()
            ELSE rate_limits.window_start
        END,
        updated_at = now()
    RETURNING count, window_start INTO v_current_count, v_reset_at;
    
    -- If no row returned (shouldn't happen), get it
    IF v_current_count IS NULL THEN
        SELECT count, window_start INTO v_current_count, v_reset_at
        FROM public.rate_limits
        WHERE identifier = p_identifier AND endpoint = p_endpoint;
    END IF;
    
    v_reset_at := v_window_start + (p_window_seconds || ' seconds')::interval;
    
    RETURN QUERY SELECT 
        v_current_count <= p_limit,
        GREATEST(0, p_limit - v_current_count),
        v_reset_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grant execution to service role
-- ============================================
GRANT EXECUTE ON FUNCTION public.check_rate_limit TO service_role;

-- ============================================
-- Notification
-- ============================================
NOTIFY pgrst, 'reload schema';