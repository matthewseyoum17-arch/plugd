-- ============================================================
-- FIVERR-STYLE FREELANCE MARKETPLACE — Complete Supabase Schema
-- Stack: Next.js 15 App Router + Supabase + Tailwind + shadcn/ui
-- ============================================================

-- ─── 0. Extensions ─────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fuzzy search

-- ─── 1. Profiles (extends auth.users) ─────────────────────
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  tagline text,               -- short one-liner ("I build stunning websites")
  country text,
  languages text[] DEFAULT '{}',
  skills text[] DEFAULT '{}',
  role text DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'both')),
  seller_level text DEFAULT 'new' CHECK (seller_level IN ('new', 'level_1', 'level_2', 'top_rated')),
  is_online boolean DEFAULT false,
  response_time_hours integer DEFAULT 24,
  total_earnings_cents bigint DEFAULT 0,
  completed_orders integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── 2. Categories & Subcategories ────────────────────────
CREATE TABLE categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,                  -- lucide icon name (e.g. "code", "palette")
  description text,
  image_url text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT USING (true);

CREATE TABLE subcategories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  display_order integer DEFAULT 0,
  UNIQUE(category_id, slug)
);

ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subcategories are viewable by everyone"
  ON subcategories FOR SELECT USING (true);

-- Seed default categories
INSERT INTO categories (name, slug, icon, display_order) VALUES
  ('Graphics & Design',    'graphics-design',    'palette',     1),
  ('Programming & Tech',   'programming-tech',   'code',        2),
  ('Digital Marketing',    'digital-marketing',  'megaphone',   3),
  ('Video & Animation',    'video-animation',    'video',       4),
  ('Writing & Translation','writing-translation','pen-tool',    5),
  ('Music & Audio',        'music-audio',        'music',       6),
  ('Business',             'business',           'briefcase',   7),
  ('AI Services',          'ai-services',        'brain',       8),
  ('Consulting',           'consulting',         'message-circle', 9);

-- ─── 3. Gigs ──────────────────────────────────────────────
CREATE TABLE gigs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id uuid REFERENCES subcategories(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL,    -- rich text / markdown
  search_tags text[] DEFAULT '{}',

  -- Pricing tiers (stored in cents)
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
  price_premium_revisions integer DEFAULT -1, -- -1 = unlimited

  -- Package features (JSON arrays of feature strings)
  features_basic jsonb DEFAULT '[]',
  features_standard jsonb DEFAULT '[]',
  features_premium jsonb DEFAULT '[]',

  -- Media
  thumbnail_url text,

  -- Stats
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  orders_completed integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,

  -- Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'denied', 'deleted')),
  is_featured boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(seller_id, slug)
);

ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active gigs are viewable by everyone"
  ON gigs FOR SELECT USING (status = 'active' OR seller_id = auth.uid());
CREATE POLICY "Sellers can insert own gigs"
  ON gigs FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own gigs"
  ON gigs FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete own gigs"
  ON gigs FOR DELETE USING (auth.uid() = seller_id);

-- Indexes for search & filtering
CREATE INDEX idx_gigs_seller ON gigs(seller_id);
CREATE INDEX idx_gigs_category ON gigs(category_id);
CREATE INDEX idx_gigs_status ON gigs(status);
CREATE INDEX idx_gigs_search ON gigs USING gin(search_tags);
CREATE INDEX idx_gigs_title_trgm ON gigs USING gin(title gin_trgm_ops);
CREATE INDEX idx_gigs_featured ON gigs(is_featured) WHERE is_featured = true;

-- ─── 4. Gig Images (gallery, up to 5) ────────────────────
CREATE TABLE gig_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gig_id uuid REFERENCES gigs(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gig_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gig images are viewable by everyone"
  ON gig_images FOR SELECT USING (true);
CREATE POLICY "Sellers can manage own gig images"
  ON gig_images FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM gigs WHERE gigs.id = gig_images.gig_id AND gigs.seller_id = auth.uid())
  );
CREATE POLICY "Sellers can delete own gig images"
  ON gig_images FOR DELETE USING (
    EXISTS (SELECT 1 FROM gigs WHERE gigs.id = gig_images.gig_id AND gigs.seller_id = auth.uid())
  );

-- ─── 5. Gig FAQs ─────────────────────────────────────────
CREATE TABLE gig_faqs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gig_id uuid REFERENCES gigs(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer DEFAULT 0
);

ALTER TABLE gig_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQs are viewable by everyone"
  ON gig_faqs FOR SELECT USING (true);
CREATE POLICY "Sellers can manage own FAQs"
  ON gig_faqs FOR ALL USING (
    EXISTS (SELECT 1 FROM gigs WHERE gigs.id = gig_faqs.gig_id AND gigs.seller_id = auth.uid())
  );

-- ─── 6. Orders ────────────────────────────────────────────
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text UNIQUE NOT NULL DEFAULT 'ORD-' || substr(gen_random_uuid()::text, 1, 8),
  buyer_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  seller_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  gig_id uuid REFERENCES gigs(id) ON DELETE SET NULL NOT NULL,

  -- Package info snapshot (in case gig changes later)
  package_tier text NOT NULL CHECK (package_tier IN ('basic', 'standard', 'premium')),
  package_name text NOT NULL,
  package_description text,

  price_cents integer NOT NULL,
  service_fee_cents integer DEFAULT 0,        -- platform fee
  total_cents integer NOT NULL,               -- price + service fee
  delivery_days integer NOT NULL,
  revisions_included integer DEFAULT 1,
  revisions_used integer DEFAULT 0,

  -- Requirements from buyer (filled after purchase)
  requirements text,
  requirements_submitted boolean DEFAULT false,

  -- Status tracking
  status text DEFAULT 'pending' CHECK (status IN (
    'pending',          -- awaiting requirements
    'in_progress',      -- seller working
    'delivered',        -- seller delivered
    'revision',         -- buyer requested revision
    'completed',        -- buyer accepted / auto-complete
    'cancelled',        -- cancelled
    'disputed'          -- dispute opened
  )),

  started_at timestamptz,
  delivered_at timestamptz,
  completed_at timestamptz,
  due_at timestamptz,             -- deadline
  auto_complete_at timestamptz,   -- 3 days after delivery

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Participants can update orders"
  ON orders FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ─── 7. Order Deliveries ──────────────────────────────────
CREATE TABLE order_deliveries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  seller_id uuid REFERENCES profiles(id) NOT NULL,
  message text,
  file_urls text[] DEFAULT '{}',
  is_revision boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order participants can view deliveries"
  ON order_deliveries FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_deliveries.order_id
            AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid()))
  );
CREATE POLICY "Sellers can create deliveries"
  ON order_deliveries FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- ─── 8. Reviews ───────────────────────────────────────────
CREATE TABLE reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
  gig_id uuid REFERENCES gigs(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  seller_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,

  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  communication_rating integer CHECK (communication_rating BETWEEN 1 AND 5),
  service_rating integer CHECK (service_rating BETWEEN 1 AND 5),
  recommendation_rating integer CHECK (recommendation_rating BETWEEN 1 AND 5),

  comment text,
  seller_response text,          -- seller can respond to review
  seller_responded_at timestamptz,

  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);
CREATE POLICY "Buyers can create reviews for their orders"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Sellers can respond to reviews"
  ON reviews FOR UPDATE USING (auth.uid() = seller_id);

CREATE INDEX idx_reviews_gig ON reviews(gig_id);
CREATE INDEX idx_reviews_seller ON reviews(seller_id);

-- ─── 9. Favorites / Saved Gigs ───────────────────────────
CREATE TABLE favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  gig_id uuid REFERENCES gigs(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, gig_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE USING (auth.uid() = user_id);

-- ─── 10. Conversations & Messages ─────────────────────────
CREATE TABLE conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2 uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  gig_id uuid REFERENCES gigs(id) ON DELETE SET NULL,  -- optional context
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view conversations"
  ON conversations FOR SELECT USING (
    auth.uid() = participant_1 OR auth.uid() = participant_2
  );
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT WITH CHECK (
    auth.uid() = participant_1 OR auth.uid() = participant_2
  );

CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  content text NOT NULL,
  file_urls text[] DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- ─── 11. Notifications ────────────────────────────────────
CREATE TABLE notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,            -- 'order', 'message', 'review', 'system'
  title text NOT NULL,
  body text,
  link text,                     -- relative URL to navigate to
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ─── 12. Seller Earnings / Payouts ────────────────────────
CREATE TABLE seller_payouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  amount_cents integer NOT NULL,
  fee_cents integer DEFAULT 0,        -- platform commission
  net_cents integer NOT NULL,         -- amount - fee
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'withdrawn', 'cancelled')),
  clears_at timestamptz,              -- when funds become available
  withdrawn_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE seller_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view own payouts"
  ON seller_payouts FOR SELECT USING (auth.uid() = seller_id);

-- ─── 13. Storage Buckets ──────────────────────────────────
-- Run these in Supabase Dashboard > Storage or via API:
--
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gig-images', 'gig-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('deliveries', 'deliveries', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('message-files', 'message-files', false);
--
-- Storage RLS policies:
-- avatars: anyone can read, authenticated users can upload to their own folder
-- gig-images: anyone can read, sellers can upload to gigs they own
-- deliveries: only order participants can read/write
-- message-files: only conversation participants can read/write

-- ─── 14. Useful Views ─────────────────────────────────────

-- Gig card view (for listing pages)
CREATE OR REPLACE VIEW gig_cards AS
SELECT
  g.id,
  g.title,
  g.slug,
  g.thumbnail_url,
  g.price_basic_cents,
  g.average_rating,
  g.review_count,
  g.orders_completed,
  g.category_id,
  g.is_featured,
  g.created_at,
  p.id AS seller_id,
  p.username AS seller_username,
  p.full_name AS seller_name,
  p.avatar_url AS seller_avatar,
  p.seller_level,
  c.name AS category_name,
  c.slug AS category_slug
FROM gigs g
JOIN profiles p ON g.seller_id = p.id
LEFT JOIN categories c ON g.category_id = c.id
WHERE g.status = 'active';

-- ─── 15. Helper Functions ─────────────────────────────────

-- Update gig rating when a review is added
CREATE OR REPLACE FUNCTION update_gig_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE gigs SET
    average_rating = (SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE gig_id = NEW.gig_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE gig_id = NEW.gig_id),
    updated_at = now()
  WHERE id = NEW.gig_id;

  -- Also update seller profile
  UPDATE profiles SET
    average_rating = (SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE seller_id = NEW.seller_id),
    completed_orders = (SELECT COUNT(*) FROM orders WHERE seller_id = NEW.seller_id AND status = 'completed'),
    updated_at = now()
  WHERE id = NEW.seller_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_gig_rating();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gigs_updated_at
  BEFORE UPDATE ON gigs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
