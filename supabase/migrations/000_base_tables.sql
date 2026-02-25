-- ============================================================
-- PLUGD: Base Tables
-- This migration creates ALL base tables required for the MVP.
-- Run this FIRST in Supabase SQL Editor before any other migration.
-- ============================================================

-- ─── Users table ────────────────────────────────────────────
-- Stores every registered user (both founders and setters).
-- The auth trigger (migration 002/003) auto-creates rows here.
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text DEFAULT '',
  role text DEFAULT 'setter' CHECK (role IN ('founder', 'setter')),
  created_at timestamptz DEFAULT now()
);

-- ─── Setter profiles ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS setter_profiles (
  setter_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- ─── Founder profiles ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS founder_profiles (
  founder_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name text,
  created_at timestamptz DEFAULT now()
);

-- ─── Listings ───────────────────────────────────────────────
-- Each listing represents a product a founder wants setters to promote.
-- commission amounts are stored in CENTS (integer).
CREATE TABLE IF NOT EXISTS listings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  company_name text DEFAULT '',
  title text NOT NULL,
  description text,
  ideal_customer text,
  product_url text,
  commission_per_appointment integer DEFAULT 0,
  commission_per_close integer DEFAULT 0,
  qualified_meeting_definition text,
  pitch_kit_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listings_company ON listings(company_id);

-- ─── Setter Applications ────────────────────────────────────
-- A setter applies to promote a listing.
CREATE TABLE IF NOT EXISTS setter_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  setter_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  sample_email text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(setter_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_setter_applications_setter ON setter_applications(setter_id);
CREATE INDEX IF NOT EXISTS idx_setter_applications_listing ON setter_applications(listing_id);

-- ─── Appointments ───────────────────────────────────────────
-- A setter submits a booked appointment/meeting for a listing.
CREATE TABLE IF NOT EXISTS appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  setter_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  contact_name text,
  contact_email text,
  contact_company text,
  calendly_event_url text,
  appointment_type text DEFAULT 'appointment' CHECK (appointment_type IN ('appointment', 'close')),
  notes text,
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'confirmed', 'disputed', 'auto_approved')),
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_setter ON appointments(setter_id);
CREATE INDEX IF NOT EXISTS idx_appointments_company ON appointments(company_id);
CREATE INDEX IF NOT EXISTS idx_appointments_listing ON appointments(listing_id);

-- ─── Payouts ────────────────────────────────────────────────
-- Created when a founder confirms an appointment. Amount is in CENTS.
CREATE TABLE IF NOT EXISTS payouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  founder_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  setter_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE NOT NULL UNIQUE,
  amount integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payouts_founder ON payouts(founder_id);
CREATE INDEX IF NOT EXISTS idx_payouts_setter ON payouts(setter_id);

-- ─── RLS Policies ───────────────────────────────────────────

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Anyone can read users') THEN
    CREATE POLICY "Anyone can read users" ON users FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert own row') THEN
    CREATE POLICY "Users can insert own row" ON users FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own row') THEN
    CREATE POLICY "Users can update own row" ON users FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Setter Profiles
ALTER TABLE setter_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'setter_profiles' AND policyname = 'Anyone can read setter profiles') THEN
    CREATE POLICY "Anyone can read setter profiles" ON setter_profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'setter_profiles' AND policyname = 'Setters can insert own profile') THEN
    CREATE POLICY "Setters can insert own profile" ON setter_profiles FOR INSERT WITH CHECK (auth.uid() = setter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'setter_profiles' AND policyname = 'Setters can update own profile') THEN
    CREATE POLICY "Setters can update own profile" ON setter_profiles FOR UPDATE USING (auth.uid() = setter_id);
  END IF;
END $$;

-- Founder Profiles
ALTER TABLE founder_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'founder_profiles' AND policyname = 'Anyone can read founder profiles') THEN
    CREATE POLICY "Anyone can read founder profiles" ON founder_profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'founder_profiles' AND policyname = 'Founders can insert own profile') THEN
    CREATE POLICY "Founders can insert own profile" ON founder_profiles FOR INSERT WITH CHECK (auth.uid() = founder_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'founder_profiles' AND policyname = 'Founders can update own profile') THEN
    CREATE POLICY "Founders can update own profile" ON founder_profiles FOR UPDATE USING (auth.uid() = founder_id);
  END IF;
END $$;

-- Listings
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'listings' AND policyname = 'Anyone can read active listings') THEN
    CREATE POLICY "Anyone can read active listings" ON listings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'listings' AND policyname = 'Founders can create listings') THEN
    CREATE POLICY "Founders can create listings" ON listings FOR INSERT WITH CHECK (auth.uid() = company_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'listings' AND policyname = 'Founders can update own listings') THEN
    CREATE POLICY "Founders can update own listings" ON listings FOR UPDATE USING (auth.uid() = company_id);
  END IF;
END $$;

-- Setter Applications
ALTER TABLE setter_applications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'setter_applications' AND policyname = 'Setters can read own applications') THEN
    CREATE POLICY "Setters can read own applications" ON setter_applications
      FOR SELECT USING (auth.uid() = setter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'setter_applications' AND policyname = 'Founders can read applications for their listings') THEN
    CREATE POLICY "Founders can read applications for their listings" ON setter_applications
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM listings WHERE listings.id = setter_applications.listing_id AND listings.company_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'setter_applications' AND policyname = 'Setters can create applications') THEN
    CREATE POLICY "Setters can create applications" ON setter_applications
      FOR INSERT WITH CHECK (auth.uid() = setter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'setter_applications' AND policyname = 'Founders can update applications for their listings') THEN
    CREATE POLICY "Founders can update applications for their listings" ON setter_applications
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM listings WHERE listings.id = setter_applications.listing_id AND listings.company_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Setters can read own appointments') THEN
    CREATE POLICY "Setters can read own appointments" ON appointments
      FOR SELECT USING (auth.uid() = setter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Founders can read their appointments') THEN
    CREATE POLICY "Founders can read their appointments" ON appointments
      FOR SELECT USING (auth.uid() = company_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Setters can create appointments') THEN
    CREATE POLICY "Setters can create appointments" ON appointments
      FOR INSERT WITH CHECK (auth.uid() = setter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Founders can update their appointments') THEN
    CREATE POLICY "Founders can update their appointments" ON appointments
      FOR UPDATE USING (auth.uid() = company_id);
  END IF;
END $$;

-- Payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payouts' AND policyname = 'Founders can read own payouts') THEN
    CREATE POLICY "Founders can read own payouts" ON payouts
      FOR SELECT USING (auth.uid() = founder_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payouts' AND policyname = 'Setters can read own payouts') THEN
    CREATE POLICY "Setters can read own payouts" ON payouts
      FOR SELECT USING (auth.uid() = setter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payouts' AND policyname = 'Founders can create payouts') THEN
    CREATE POLICY "Founders can create payouts" ON payouts
      FOR INSERT WITH CHECK (auth.uid() = founder_id);
  END IF;
END $$;
