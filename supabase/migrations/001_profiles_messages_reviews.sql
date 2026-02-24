-- ============================================================
-- PLUGD: Profiles, Messaging & Reviews
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ─── Extend setter_profiles ─────────────────────────────────
ALTER TABLE setter_profiles ADD COLUMN IF NOT EXISTS headline text;
ALTER TABLE setter_profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE setter_profiles ADD COLUMN IF NOT EXISTS industries text;
ALTER TABLE setter_profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE setter_profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE setter_profiles ADD COLUMN IF NOT EXISTS linkedin_url text;

-- ─── Extend founder_profiles ────────────────────────────────
ALTER TABLE founder_profiles ADD COLUMN IF NOT EXISTS headline text;
ALTER TABLE founder_profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE founder_profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE founder_profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE founder_profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE founder_profiles ADD COLUMN IF NOT EXISTS industry text;

-- ─── Messages table ─────────────────────────────────────────
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

-- ─── Reviews table ──────────────────────────────────────────
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

-- ─── RLS Policies ───────────────────────────────────────────

-- Messages: users can read their own messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can mark messages read" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Reviews: anyone can read, only reviewer can write
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
