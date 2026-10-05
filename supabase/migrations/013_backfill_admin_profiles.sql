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
-- FIX:
-- 1. Create a profile row for every auth user that is missing one.
-- 2. The role defaults to 'admin' (matching the column default in migration 001).
--    This is a single-user portfolio application; the only auth user is the owner.
-- 3. Idempotent: ON CONFLICT DO NOTHING, so re-running the migration is safe.
-- 4. Also fixes the handle_new_user trigger to explicitly set role='admin' so the
--    default is not silently dependent on the column default.
-- ============================================================================

-- 1. Backfill missing profiles (idempotent)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
    'admin'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 2. Re-assert the trigger (in case it was dropped or the function body changed)
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