-- ============================================================
-- PLUGD: Doc Changes — Max Setters, Waitlist, Lead Registration,
-- Meeting Date, Contact Fields, Activity Tracking
-- ============================================================

-- ─── 1. Max setters per listing ──────────────────────────────
ALTER TABLE listings ADD COLUMN IF NOT EXISTS max_setters integer DEFAULT 5;

-- ─── 2. Waitlist + inactive status for applications ─────────
-- Expand the status check constraint to include waitlisted and inactive
ALTER TABLE setter_applications DROP CONSTRAINT IF EXISTS setter_applications_status_check;
ALTER TABLE setter_applications ADD CONSTRAINT setter_applications_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted', 'inactive'));

-- Activity tracking: when did this setter last submit for this listing?
ALTER TABLE setter_applications ADD COLUMN IF NOT EXISTS last_submission_at timestamptz;

-- ─── 3. Lead registration table ─────────────────────────────
-- Setters claim a prospect email before outreach. Prevents double-claiming.
CREATE TABLE IF NOT EXISTS lead_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  setter_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  contact_email text NOT NULL,
  registered_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  UNIQUE(listing_id, contact_email)
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
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lead_registrations' AND policyname = 'Founders can read leads for their listings') THEN
    CREATE POLICY "Founders can read leads for their listings" ON lead_registrations
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM listings WHERE listings.id = lead_registrations.listing_id AND listings.company_id = auth.uid()
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_lead_reg_listing ON lead_registrations(listing_id);
CREATE INDEX IF NOT EXISTS idx_lead_reg_setter ON lead_registrations(setter_id);
CREATE INDEX IF NOT EXISTS idx_lead_reg_email ON lead_registrations(contact_email);

-- ─── 4. Extra contact fields on appointments ────────────────
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_date timestamptz;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS contact_linkedin text;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS contact_website text;

-- ─── 5. Dispute window on payouts ───────────────────────────
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS dispute_window_expires_at timestamptz;
