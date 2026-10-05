-- 013 — Backfill missing profiles for existing auth users
-- ============================================================================
-- ROOT CAUSE of "403 — Admin access required" on /admin:
--
-- The admin user was created with supabase.auth.admin.createUser(), which inserts
-- directly into auth.users WITHOUT firing database triggers. The
-- `handle_new_user()` trigger (migration 001) that creates the matching
-- public.profiles row therefore never ran for that user.
--
-- The middleware and withAdminAuth both look up `public.profiles.role === 'admin'`.
-- With no profile row, `maybeSingle()` returns null → state = "forbidden" → 403.
--
-- This migration is SCHEMA-AGNOSTIC: it inspects the actual columns of
-- public.profiles at runtime and only inserts columns that exist. This makes it
-- safe to apply on any baseline, including projects whose profiles table was
-- created with a different column set.
-- ============================================================================

-- 1. Backfill missing profiles (schema-agnostic, idempotent)
--    Uses dynamic SQL so it works regardless of which columns profiles has.
DO $$
DECLARE
    v_has_email boolean;
    v_has_full_name boolean;
    v_has_role boolean;
    v_sql text;
BEGIN
    -- Inspect the actual profiles table columns
    SELECT
        EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='email'),
        EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='full_name'),
        EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='role')
    INTO v_has_email, v_has_full_name, v_has_role;

    -- Build the column list dynamically
    v_sql := 'INSERT INTO public.profiles (id';
    IF v_has_email THEN v_sql := v_sql || ', email'; END IF;
    IF v_has_full_name THEN v_sql := v_sql || ', full_name'; END IF;
    IF v_has_role THEN v_sql := v_sql || ', role'; END IF;
    v_sql := v_sql || ') SELECT u.id';

    IF v_has_email THEN
        v_sql := v_sql || ', u.email';
    END IF;
    IF v_has_full_name THEN
        v_sql := v_sql || ', COALESCE(u.raw_user_meta_data->>''full_name'', split_part(u.email, ''@'', 1))';
    END IF;
    IF v_has_role THEN
        v_sql := v_sql || ', ''admin''';
    END IF;

    v_sql := v_sql || E'\nFROM auth.users u'
        || E'\nLEFT JOIN public.profiles p ON p.id = u.id'
        || E'\nWHERE p.id IS NULL'
        || E'\nON CONFLICT (id) DO NOTHING';

    EXECUTE v_sql;
END $$;

-- 2. Re-assert the trigger (idempotent — safe to re-run)
--    The trigger must explicitly set role='admin' so the default is not silently
--    dependent on the column default.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'admin')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';