-- ============================================================
-- PLUGD — Complete Database Setup
-- ============================================================
-- Paste this ENTIRE file into Supabase Dashboard > SQL Editor
-- and click "Run". One paste, one click, done.
--
-- This consolidates all migrations (000–004) into a single
-- idempotent script. Safe to re-run — uses IF NOT EXISTS
-- everywhere.
-- ============================================================


-- ████████████████████████████████████████████████████████████
-- STEP 1: BASE TABLES
-- ████████████████████████████████████████████████████████████

-- ─── Users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text DEFAULT '',
  role text DEFAULT 'setter' CHECK (role IN ('founder', 'setter')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ALTER COLUMN full_name SET DEFAULT '';
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'setter';

-- ─── Setter Profiles ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS setter_profiles (
  setter_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- ─── Founder Profiles ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS founder_profiles (
  founder_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name text,
  created_at timestamptz DEFAULT now()
);

-- ─── Listings ───────────────────────────────────────────────
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


-- ████████████████████████████████████████████████████████████
-- STEP 2: PROFILE EXTENSIONS  (migration 001)
-- ████████████████████████████████████████████████████████████

ALTER TABLE setter_profiles ADD COLUMN IF NOT EXISTS headline text;
ALTER TABLE setter_profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE setter_profiles ADD COLUMN IF NOT EXISTS industries text;
ALTER TABLE setter_profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE setter_profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE setter_profiles ADD COLUMN IF NOT EXISTS linkedin_url text;

ALTER TABLE founder_profiles ADD COLUMN IF NOT EXISTS headline text;
ALTER TABLE founder_profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE founder_profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE founder_profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE founder_profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE founder_profiles ADD COLUMN IF NOT EXISTS industry text;

-- ─── Messages ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES users(id) NOT NULL,
  receiver_id uuid REFERENCES users(id) NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- ─── Reviews ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id uuid REFERENCES users(id) NOT NULL,
  reviewee_id uuid REFERENCES users(id) NOT NULL,
  appointment_id uuid REFERENCES appointments(id),
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(reviewer_id, appointment_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);


-- ████████████████████████████████████████████████████████████
-- STEP 3: CATEGORIES, IMAGES, ORDERS  (migration 004)
-- ████████████████████████████████████████████████████████████

-- ─── Categories ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text,
  description text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Seed default categories
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('AI & Automation', 'ai-automation', 'Bot', 1),
  ('SaaS', 'saas', 'Cloud', 2),
  ('Marketing', 'marketing', 'Megaphone', 3),
  ('Sales Tools', 'sales-tools', 'Target', 4),
  ('Developer Tools', 'developer-tools', 'Code', 5),
  ('Finance & Billing', 'finance-billing', 'DollarSign', 6),
  ('HR & Recruiting', 'hr-recruiting', 'Users', 7),
  ('Other', 'other', 'MoreHorizontal', 8)
ON CONFLICT (slug) DO NOTHING;

-- Add category + image columns to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS tags text[];

CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);

-- ─── Orders ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid REFERENCES listings(id) NOT NULL,
  buyer_id uuid REFERENCES users(id) NOT NULL,
  seller_id uuid REFERENCES users(id) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  total_cents integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);

-- ─── Storage bucket for listing images ──────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;


-- ████████████████████████████████████████████████████████████
-- STEP 4: AUTH TRIGGER  (migrations 002 + 003)
-- ████████████████████████████████████████████████████████████

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
  RAISE WARNING 'handle_new_user trigger failed: %', SQLERRM;
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ████████████████████████████████████████████████████████████
-- STEP 5: ALL RLS POLICIES
-- ████████████████████████████████████████████████████████████

-- ─── Users ──────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='Anyone can read users') THEN
    CREATE POLICY "Anyone can read users" ON users FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='Users can insert own row') THEN
    CREATE POLICY "Users can insert own row" ON users FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='Users can update own row') THEN
    CREATE POLICY "Users can update own row" ON users FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- ─── Setter Profiles ────────────────────────────────────────
ALTER TABLE setter_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='setter_profiles' AND policyname='Anyone can read setter profiles') THEN
    CREATE POLICY "Anyone can read setter profiles" ON setter_profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='setter_profiles' AND policyname='Setters can insert own profile') THEN
    CREATE POLICY "Setters can insert own profile" ON setter_profiles FOR INSERT WITH CHECK (auth.uid() = setter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='setter_profiles' AND policyname='Setters can update own profile') THEN
    CREATE POLICY "Setters can update own profile" ON setter_profiles FOR UPDATE USING (auth.uid() = setter_id);
  END IF;
END $$;

-- ─── Founder Profiles ───────────────────────────────────────
ALTER TABLE founder_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='founder_profiles' AND policyname='Anyone can read founder profiles') THEN
    CREATE POLICY "Anyone can read founder profiles" ON founder_profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='founder_profiles' AND policyname='Founders can insert own profile') THEN
    CREATE POLICY "Founders can insert own profile" ON founder_profiles FOR INSERT WITH CHECK (auth.uid() = founder_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='founder_profiles' AND policyname='Founders can update own profile') THEN
    CREATE POLICY "Founders can update own profile" ON founder_profiles FOR UPDATE USING (auth.uid() = founder_id);
  END IF;
END $$;

-- ─── Listings ───────────────────────────────────────────────
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='listings' AND policyname='Anyone can read active listings') THEN
    CREATE POLICY "Anyone can read active listings" ON listings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='listings' AND policyname='Founders can create listings') THEN
    CREATE POLICY "Founders can create listings" ON listings FOR INSERT WITH CHECK (auth.uid() = company_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='listings' AND policyname='Founders can update own listings') THEN
    CREATE POLICY "Founders can update own listings" ON listings FOR UPDATE USING (auth.uid() = company_id);
  END IF;
END $$;

-- ─── Categories ─────────────────────────────────────────────
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='categories' AND policyname='Anyone can read categories') THEN
    CREATE POLICY "Anyone can read categories" ON categories FOR SELECT USING (true);
  END IF;
END $$;

-- ─── Setter Applications ────────────────────────────────────
ALTER TABLE setter_applications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='setter_applications' AND policyname='Setters can read own applications') THEN
    CREATE POLICY "Setters can read own applications" ON setter_applications FOR SELECT USING (auth.uid() = setter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='setter_applications' AND policyname='Founders can read applications for their listings') THEN
    CREATE POLICY "Founders can read applications for their listings" ON setter_applications FOR SELECT USING (
      EXISTS (SELECT 1 FROM listings WHERE listings.id = setter_applications.listing_id AND listings.company_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='setter_applications' AND policyname='Setters can create applications') THEN
    CREATE POLICY "Setters can create applications" ON setter_applications FOR INSERT WITH CHECK (auth.uid() = setter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='setter_applications' AND policyname='Founders can update applications for their listings') THEN
    CREATE POLICY "Founders can update applications for their listings" ON setter_applications FOR UPDATE USING (
      EXISTS (SELECT 1 FROM listings WHERE listings.id = setter_applications.listing_id AND listings.company_id = auth.uid())
    );
  END IF;
END $$;

-- ─── Appointments ───────────────────────────────────────────
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='appointments' AND policyname='Setters can read own appointments') THEN
    CREATE POLICY "Setters can read own appointments" ON appointments FOR SELECT USING (auth.uid() = setter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='appointments' AND policyname='Founders can read their appointments') THEN
    CREATE POLICY "Founders can read their appointments" ON appointments FOR SELECT USING (auth.uid() = company_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='appointments' AND policyname='Setters can create appointments') THEN
    CREATE POLICY "Setters can create appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = setter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='appointments' AND policyname='Founders can update their appointments') THEN
    CREATE POLICY "Founders can update their appointments" ON appointments FOR UPDATE USING (auth.uid() = company_id);
  END IF;
END $$;

-- ─── Payouts ────────────────────────────────────────────────
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payouts' AND policyname='Founders can read own payouts') THEN
    CREATE POLICY "Founders can read own payouts" ON payouts FOR SELECT USING (auth.uid() = founder_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payouts' AND policyname='Setters can read own payouts') THEN
    CREATE POLICY "Setters can read own payouts" ON payouts FOR SELECT USING (auth.uid() = setter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payouts' AND policyname='Founders can create payouts') THEN
    CREATE POLICY "Founders can create payouts" ON payouts FOR INSERT WITH CHECK (auth.uid() = founder_id);
  END IF;
END $$;

-- ─── Messages ───────────────────────────────────────────────
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='messages' AND policyname='Users can read own messages') THEN
    CREATE POLICY "Users can read own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='messages' AND policyname='Users can send messages') THEN
    CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='messages' AND policyname='Receivers can mark messages read') THEN
    CREATE POLICY "Receivers can mark messages read" ON messages FOR UPDATE USING (auth.uid() = receiver_id);
  END IF;
END $$;

-- ─── Reviews ────────────────────────────────────────────────
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Anyone can read reviews') THEN
    CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Users can create reviews') THEN
    CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
  END IF;
END $$;

-- ─── Orders ─────────────────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Users can read own orders') THEN
    CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Buyers can create orders') THEN
    CREATE POLICY "Buyers can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Participants can update orders') THEN
    CREATE POLICY "Participants can update orders" ON orders FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
  END IF;
END $$;

-- ─── Storage policies ───────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='Anyone can view listing images') THEN
    CREATE POLICY "Anyone can view listing images" ON storage.objects FOR SELECT USING (bucket_id = 'listing-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='Authenticated users can upload listing images') THEN
    CREATE POLICY "Authenticated users can upload listing images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='Users can update own listing images') THEN
    CREATE POLICY "Users can update own listing images" ON storage.objects FOR UPDATE USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='Users can delete own listing images') THEN
    CREATE POLICY "Users can delete own listing images" ON storage.objects FOR DELETE USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;


-- ════════════════════════════════════════════════════════════
-- DONE. Your database is ready for the Plugd MVP.
-- ════════════════════════════════════════════════════════════
