-- ============================================================
-- PLUGD: Lead Registrations
-- Prevents duplicate outreach by letting setters "claim" a prospect
-- for a given listing. Expires after 30 days.
-- ============================================================

CREATE TABLE IF NOT EXISTS lead_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  setter_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  contact_email text NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz DEFAULT now(),
  UNIQUE (listing_id, contact_email)
);

ALTER TABLE lead_registrations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lead_registrations' AND policyname = 'Setters can read own leads') THEN
    CREATE POLICY "Setters can read own leads" ON lead_registrations
      FOR SELECT USING (auth.uid() = setter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lead_registrations' AND policyname = 'Setters can register leads') THEN
    CREATE POLICY "Setters can register leads" ON lead_registrations
      FOR INSERT WITH CHECK (auth.uid() = setter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lead_registrations' AND policyname = 'Anyone can check lead existence') THEN
    CREATE POLICY "Anyone can check lead existence" ON lead_registrations
      FOR SELECT USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_lead_reg_listing ON lead_registrations(listing_id);
CREATE INDEX IF NOT EXISTS idx_lead_reg_setter ON lead_registrations(setter_id);
CREATE INDEX IF NOT EXISTS idx_lead_reg_email ON lead_registrations(listing_id, contact_email);
CREATE INDEX IF NOT EXISTS idx_lead_reg_expires ON lead_registrations(expires_at);
