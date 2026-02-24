-- ============================================================
-- PLUGD: Fix Auth Trigger & RLS Policies
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- This fixes the "Account setup failed" signup error.
-- ============================================================

-- ─── 1. Drop the broken trigger (if it exists) ───────────────
-- The existing trigger on auth.users is crashing during signUp,
-- causing "Database error" which blocks account creation.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ─── 2. Recreate a working trigger ───────────────────────────
-- This trigger auto-creates a public.users row + role profile
-- whenever a new auth user signs up.
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

  -- Insert into public.users (ignore if row already exists)
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new.id, new.email, _full_name, _role)
  ON CONFLICT (id) DO NOTHING;

  -- Create role-specific profile
  IF _role = 'founder' THEN
    INSERT INTO public.founder_profiles (founder_id, company_name)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'company_name', NULL)
    )
    ON CONFLICT (founder_id) DO NOTHING;
  ELSE
    INSERT INTO public.setter_profiles (setter_id)
    VALUES (new.id)
    ON CONFLICT (setter_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

-- Re-attach trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 3. Ensure users table columns have sensible defaults ────
-- If full_name or role are NOT NULL without defaults, the trigger
-- could still fail. Make them nullable or add defaults.
ALTER TABLE public.users ALTER COLUMN full_name SET DEFAULT '';
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'setter';

-- ─── 4. RLS policies for users table ─────────────────────────
-- Without these, the client-side upsert in the signup flow
-- will silently fail (RLS blocks it).
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Anyone can read users (needed for profiles, messages, etc.)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Anyone can read users'
  ) THEN
    CREATE POLICY "Anyone can read users" ON public.users
      FOR SELECT USING (true);
  END IF;

  -- Users can insert their own row (signup flow)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert own row'
  ) THEN
    CREATE POLICY "Users can insert own row" ON public.users
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  -- Users can update their own row
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own row'
  ) THEN
    CREATE POLICY "Users can update own row" ON public.users
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- ─── 5. RLS policies for setter_profiles ──────────────────────
ALTER TABLE public.setter_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'setter_profiles' AND policyname = 'Anyone can read setter profiles'
  ) THEN
    CREATE POLICY "Anyone can read setter profiles" ON public.setter_profiles
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'setter_profiles' AND policyname = 'Setters can insert own profile'
  ) THEN
    CREATE POLICY "Setters can insert own profile" ON public.setter_profiles
      FOR INSERT WITH CHECK (auth.uid() = setter_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'setter_profiles' AND policyname = 'Setters can update own profile'
  ) THEN
    CREATE POLICY "Setters can update own profile" ON public.setter_profiles
      FOR UPDATE USING (auth.uid() = setter_id);
  END IF;
END $$;

-- ─── 6. RLS policies for founder_profiles ─────────────────────
ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'founder_profiles' AND policyname = 'Anyone can read founder profiles'
  ) THEN
    CREATE POLICY "Anyone can read founder profiles" ON public.founder_profiles
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'founder_profiles' AND policyname = 'Founders can insert own profile'
  ) THEN
    CREATE POLICY "Founders can insert own profile" ON public.founder_profiles
      FOR INSERT WITH CHECK (auth.uid() = founder_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'founder_profiles' AND policyname = 'Founders can update own profile'
  ) THEN
    CREATE POLICY "Founders can update own profile" ON public.founder_profiles
      FOR UPDATE USING (auth.uid() = founder_id);
  END IF;
END $$;
