-- ============================================================
-- PLUGD: Categories + Gig Images + Orders
-- Run in Supabase SQL Editor as a new query
-- ============================================================

-- ─── Categories table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text,
  description text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Anyone can read categories'
  ) THEN
    CREATE POLICY "Anyone can read categories" ON categories FOR SELECT USING (true);
  END IF;
END $$;

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

-- ─── Add category + image columns to listings ─────────────────
ALTER TABLE listings ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS tags text[];

CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);

-- ─── Orders table ─────────────────────────────────────────────
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

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can read own orders'
  ) THEN
    CREATE POLICY "Users can read own orders" ON orders
      FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Buyers can create orders'
  ) THEN
    CREATE POLICY "Buyers can create orders" ON orders
      FOR INSERT WITH CHECK (auth.uid() = buyer_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Participants can update orders'
  ) THEN
    CREATE POLICY "Participants can update orders" ON orders
      FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);

-- ─── Storage bucket for listing images ────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can view listing images'
  ) THEN
    CREATE POLICY "Anyone can view listing images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'listing-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload listing images'
  ) THEN
    CREATE POLICY "Authenticated users can upload listing images"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update own listing images'
  ) THEN
    CREATE POLICY "Users can update own listing images"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete own listing images'
  ) THEN
    CREATE POLICY "Users can delete own listing images"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;
