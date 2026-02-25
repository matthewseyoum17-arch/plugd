-- ============================================================
-- PLUGD: Make Auth Trigger Exception-Safe
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
--
-- The handle_new_user() trigger was crashing during signUp because
-- of a column mismatch or missing table, which rolled back the
-- entire auth.users INSERT (so the user was never created).
--
-- This version wraps the body in EXCEPTION WHEN OTHERS so the
-- trigger can NEVER block signup. If the trigger fails, it logs
-- a warning and lets signup proceed. The client-side code will
-- then create the missing rows.
-- ============================================================

-- Drop old trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _role text;
  _full_name text;
BEGIN
  _role := COALESCE(new.raw_user_meta_data->>'role', 'setter');
  _full_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new.id, new.email, _full_name, _role)
  ON CONFLICT (id) DO NOTHING;

  IF _role = 'founder' THEN
    INSERT INTO public.founder_profiles (founder_id, company_name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'company_name', NULL))
    ON CONFLICT (founder_id) DO NOTHING;
  ELSE
    INSERT INTO public.setter_profiles (setter_id)
    VALUES (new.id)
    ON CONFLICT (setter_id) DO NOTHING;
  END IF;

  RETURN new;

EXCEPTION WHEN OTHERS THEN
  -- Never let a trigger failure block auth signup.
  -- The client-side code will create the missing rows.
  RAISE WARNING 'handle_new_user trigger failed: %', SQLERRM;
  RETURN new;
END;
$$;

-- Re-attach trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
