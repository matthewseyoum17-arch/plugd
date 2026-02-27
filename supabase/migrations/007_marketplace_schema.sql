-- ============================================================
-- GIGFLOW: Fiverr-Style Freelance Marketplace Schema
-- Replaces the B2B appointment-setting model with gig marketplace
-- ============================================================

-- ─── 1. Categories ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  description text,
  image_url text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='categories' AND policyname='Categories viewable by all') THEN
    CREATE POLICY "Categories viewable by all" ON categories FOR SELECT USING (true);
  END IF;
END $$;

INSERT INTO categories (name, slug, icon, display_order) VALUES
  ('Graphics & Design',    'graphics-design',    'palette',       1),
  ('Programming & Tech',   'programming-tech',   'code',          2),
  ('Digital Marketing',    'digital-marketing',  'megaphone',     3),
  ('Video & Animation',    'video-animation',    'video',         4),
  ('Writing & Translation','writing-translation','pen-tool',      5),
  ('Music & Audio',        'music-audio',        'music',         6),
  ('Business',             'business',           'briefcase',     7),
  ('AI Services',          'ai-services',        'brain',         8),
  ('Consulting',           'consulting',         'message-circle',9)
ON CONFLICT (slug) DO NOTHING;

-- ─── 2. Profiles (extend users) ───────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS username text UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tagline text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS seller_level text DEFAULT 'new';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS response_time_hours integer DEFAULT 24;
ALTER TABLE users ADD COLUMN IF NOT EXISTS completed_orders integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS average_rating numeric(3,2) DEFAULT 0;

-- ─── 3. Gigs ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gigs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL DEFAULT '',
  search_tags text[] DEFAULT '{}',
  price_basic_cents integer NOT NULL DEFAULT 500,
  price_basic_name text DEFAULT 'Basic',
  price_basic_description text DEFAULT '',
  price_basic_delivery_days integer DEFAULT 7,
  price_basic_revisions integer DEFAULT 1,
  price_standard_cents integer,
  price_standard_name text DEFAULT 'Standard',
  price_standard_description text DEFAULT '',
  price_standard_delivery_days integer DEFAULT 5,
  price_standard_revisions integer DEFAULT 3,
  price_premium_cents integer,
  price_premium_name text DEFAULT 'Premium',
  price_premium_description text DEFAULT '',
  price_premium_delivery_days integer DEFAULT 3,
  price_premium_revisions integer DEFAULT -1,
  features_basic jsonb DEFAULT '[]',
  features_standard jsonb DEFAULT '[]',
  features_premium jsonb DEFAULT '[]',
  thumbnail_url text,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  orders_completed integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('draft','active','paused','denied','deleted')),
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(seller_id, slug)
);

ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gigs' AND policyname='Gigs viewable when active or own') THEN
    CREATE POLICY "Gigs viewable when active or own" ON gigs FOR SELECT USING (status = 'active' OR seller_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gigs' AND policyname='Sellers insert own gigs') THEN
    CREATE POLICY "Sellers insert own gigs" ON gigs FOR INSERT WITH CHECK (auth.uid() = seller_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gigs' AND policyname='Sellers update own gigs') THEN
    CREATE POLICY "Sellers update own gigs" ON gigs FOR UPDATE USING (auth.uid() = seller_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gigs' AND policyname='Sellers delete own gigs') THEN
    CREATE POLICY "Sellers delete own gigs" ON gigs FOR DELETE USING (auth.uid() = seller_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_gigs_seller ON gigs(seller_id);
CREATE INDEX IF NOT EXISTS idx_gigs_category ON gigs(category_id);
CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status);
CREATE INDEX IF NOT EXISTS idx_gigs_featured ON gigs(is_featured) WHERE is_featured = true;

-- ─── 4. Gig Images ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS gig_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gig_id uuid REFERENCES gigs(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gig_images ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gig_images' AND policyname='Gig images viewable by all') THEN
    CREATE POLICY "Gig images viewable by all" ON gig_images FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gig_images' AND policyname='Sellers manage own gig images') THEN
    CREATE POLICY "Sellers manage own gig images" ON gig_images FOR ALL USING (
      EXISTS (SELECT 1 FROM gigs WHERE gigs.id = gig_images.gig_id AND gigs.seller_id = auth.uid())
    );
  END IF;
END $$;

-- ─── 5. Orders ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text UNIQUE NOT NULL DEFAULT 'ORD-' || substr(gen_random_uuid()::text, 1, 8),
  buyer_id uuid REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  seller_id uuid REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  gig_id uuid REFERENCES gigs(id) ON DELETE SET NULL NOT NULL,
  package_tier text NOT NULL CHECK (package_tier IN ('basic','standard','premium')),
  package_name text NOT NULL,
  package_description text,
  price_cents integer NOT NULL,
  service_fee_cents integer DEFAULT 0,
  total_cents integer NOT NULL,
  delivery_days integer NOT NULL,
  revisions_included integer DEFAULT 1,
  revisions_used integer DEFAULT 0,
  requirements text,
  requirements_submitted boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending','in_progress','delivered','revision','completed','cancelled','disputed')),
  started_at timestamptz,
  delivered_at timestamptz,
  completed_at timestamptz,
  due_at timestamptz,
  auto_complete_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Users view own orders') THEN
    CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Buyers create orders') THEN
    CREATE POLICY "Buyers create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Participants update orders') THEN
    CREATE POLICY "Participants update orders" ON orders FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);

-- ─── 6. Reviews ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gig_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
  gig_id uuid REFERENCES gigs(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  seller_id uuid REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  seller_response text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gig_reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gig_reviews' AND policyname='Reviews viewable by all') THEN
    CREATE POLICY "Reviews viewable by all" ON gig_reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gig_reviews' AND policyname='Buyers create reviews') THEN
    CREATE POLICY "Buyers create reviews" ON gig_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gig_reviews' AND policyname='Sellers respond to reviews') THEN
    CREATE POLICY "Sellers respond to reviews" ON gig_reviews FOR UPDATE USING (auth.uid() = seller_id);
  END IF;
END $$;

-- ─── 7. Favorites ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  gig_id uuid REFERENCES gigs(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, gig_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='favorites' AND policyname='Users manage own favorites') THEN
    CREATE POLICY "Users manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─── 8. Conversations & Messages ──────────────────────────
-- (conversations and messages tables may already exist from the old schema,
--  keeping compatibility)

-- ─── 9. Notifications ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  body text,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Users view own notifications') THEN
    CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Anyone insert notifications') THEN
    CREATE POLICY "Anyone insert notifications" ON notifications FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Users update own notifications') THEN
    CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
