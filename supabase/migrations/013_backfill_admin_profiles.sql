-- 013 — Backfill missing profiles for existing users
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
-- This migration is FULLY DYNAMIC: it inspects the actual profiles table schema
-- and foreign-key constraint at runtime, then builds the INSERT accordingly.
-- It works on any baseline, including projects whose profiles table was created
-- with a different column set or a different FK target (auth.users vs public.users).
-- ============================================================================

-- 1. Backfill missing profiles (fully dynamic, idempotent)
DO $$
DECLARE
    v_fk_target_schema text;
    v_fk_target_table text;
    v_has_full_name boolean;
    v_has_role boolean;
    v_has_email boolean;
    v_target_has_email boolean;
    v_target_has_full_name boolean;
    v_sql text;
    v_col_list text := 'id';
    v_val_list text := 't.id';
BEGIN
    -- Discover the FK target (e.g. auth.users or public.users)
    SELECT
        COALESCE(ns.nspname, 'public'),
        ct.relname
    INTO v_fk_target_schema, v_fk_target_table
    FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    JOIN pg_class ct ON ct.oid = c.confrelid
    JOIN pg_namespace ns ON ns.oid = ct.relnamespace
    WHERE n.nspname = 'public'
      AND cl.relname = 'profiles'
      AND c.contype = 'f'
      AND c.conname = 'profiles_id_fkey'
    LIMIT 1;

    -- Fallback: if the FK name differs, find any FK on profiles(id)
    IF v_fk_target_table IS NULL THEN
        SELECT COALESCE(ns.nspname, 'public'), ct.relname
        INTO v_fk_target_schema, v_fk_target_table
        FROM pg_constraint c
        JOIN pg_class cl ON cl.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = cl.relnamespace
        JOIN pg_class ct ON ct.oid = c.confrelid
        JOIN pg_namespace ns ON ns.oid = ct.relnamespace
        JOIN pg_attribute a ON a.attrelid = cl.oid AND a.attnum = c.conkey[1] AND a.attname = 'id'
        WHERE n.nspname = 'public'
          AND cl.relname = 'profiles'
          AND c.contype = 'f'
        LIMIT 1;
    END IF;

    -- Final fallback: assume auth.users
    IF v_fk_target_table IS NULL THEN
        v_fk_target_schema := 'auth';
        v_fk_target_table := 'users';
    END IF;

    -- Discover which columns exist in profiles
    SELECT
        EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='email'),
        EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='full_name'),
        EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='role')
    INTO v_has_email, v_has_full_name, v_has_role;

    -- Discover which columns exist in the FK target table
    SELECT
        EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=v_fk_target_schema AND table_name=v_fk_target_table AND column_name='email'),
        EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=v_fk_target_schema AND table_name=v_fk_target_table AND column_name='full_name')
    INTO v_target_has_email, v_target_has_full_name;

    -- Build column list and value list dynamically
    IF v_has_email AND v_target_has_email THEN
        v_col_list := v_col_list || ', email';
        v_val_list := v_val_list || ', t.email';
    END IF;
    IF v_has_full_name AND v_target_has_full_name THEN
        v_col_list := v_col_list || ', full_name';
        v_val_list := v_val_list || ', COALESCE(t.raw_user_meta_data->>''full_name'', split_part(t.email, ''@'', 1))';
    END IF;
    IF v_has_role THEN
        v_col_list := v_col_list || ', role';
        v_val_list := v_val_list || ', ''admin''';
    END IF;

    -- Build and execute the INSERT
    v_sql := 'INSERT INTO public.profiles (' || v_col_list || ')'
        || ' SELECT ' || v_val_list
        || ' FROM ' || v_fk_target_schema || '.' || v_fk_target_table || ' t'
        || ' LEFT JOIN public.profiles p ON p.id = t.id'
        || ' WHERE p.id IS NULL'
        || ' ON CONFLICT (id) DO NOTHING';

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