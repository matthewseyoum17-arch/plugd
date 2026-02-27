-- ============================================================
-- PLUGD: Payment Logistics — Budget, Escrow, Caps, Clearing
-- Adds: max_appointments, wallet/escrow, daily caps, locked
-- commissions, dispute tracking, 14-day payout clearing,
-- minimum payout threshold.
-- ============================================================

-- ─── 1. Listing budget controls ──────────────────────────────
-- Founders set how many appointments they're willing to pay for.
-- appointments_used tracks confirmed + auto_approved count.
ALTER TABLE listings ADD COLUMN IF NOT EXISTS max_appointments integer DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS appointments_used integer DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS daily_setter_cap integer DEFAULT 3;

-- ─── 2. Founder wallet / escrow ──────────────────────────────
-- Founders pre-fund a wallet. Confirmed appointments deduct from it.
-- All amounts in CENTS.
CREATE TABLE IF NOT EXISTS founder_wallets (
  founder_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance integer DEFAULT 0,
  total_deposited integer DEFAULT 0,
  total_spent integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE founder_wallets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'founder_wallets' AND policyname = 'Founders can read own wallet') THEN
    CREATE POLICY "Founders can read own wallet" ON founder_wallets
      FOR SELECT USING (auth.uid() = founder_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'founder_wallets' AND policyname = 'Founders can insert own wallet') THEN
    CREATE POLICY "Founders can insert own wallet" ON founder_wallets
      FOR INSERT WITH CHECK (auth.uid() = founder_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'founder_wallets' AND policyname = 'Founders can update own wallet') THEN
    CREATE POLICY "Founders can update own wallet" ON founder_wallets
      FOR UPDATE USING (auth.uid() = founder_id);
  END IF;
END $$;

-- Wallet transaction ledger for audit trail
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  founder_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'escrow_hold', 'escrow_release', 'payout_deduct', 'refund', 'withdrawal')),
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  reference_id uuid,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallet_transactions' AND policyname = 'Founders can read own transactions') THEN
    CREATE POLICY "Founders can read own transactions" ON wallet_transactions
      FOR SELECT USING (auth.uid() = founder_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallet_transactions' AND policyname = 'Founders can insert own transactions') THEN
    CREATE POLICY "Founders can insert own transactions" ON wallet_transactions
      FOR INSERT WITH CHECK (auth.uid() = founder_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_wallet_tx_founder ON wallet_transactions(founder_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created ON wallet_transactions(created_at DESC);

-- ─── 3. Lock commission at approval time ─────────────────────
-- When a founder approves a setter, lock the commission so it
-- can't be changed out from under them.
ALTER TABLE setter_applications ADD COLUMN IF NOT EXISTS locked_commission_per_appointment integer;
ALTER TABLE setter_applications ADD COLUMN IF NOT EXISTS locked_commission_per_close integer;

-- ─── 4. Payout clearing period ───────────────────────────────
-- 14-day clearing: setter can't withdraw until clears_at passes.
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS clears_at timestamptz;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS platform_fee integer DEFAULT 0;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS gross_amount integer DEFAULT 0;

-- ─── 5. Dispute tracking on founders ─────────────────────────
-- Track dispute rate to flag abusive founders.
ALTER TABLE founder_profiles ADD COLUMN IF NOT EXISTS total_appointments integer DEFAULT 0;
ALTER TABLE founder_profiles ADD COLUMN IF NOT EXISTS total_disputes integer DEFAULT 0;
ALTER TABLE founder_profiles ADD COLUMN IF NOT EXISTS flagged boolean DEFAULT false;

-- ─── 6. Setter withdrawal tracking ──────────────────────────
-- Minimum payout threshold = $50 (5000 cents).
CREATE TABLE IF NOT EXISTS setter_withdrawals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  setter_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL CHECK (amount >= 5000),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE setter_withdrawals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'setter_withdrawals' AND policyname = 'Setters can read own withdrawals') THEN
    CREATE POLICY "Setters can read own withdrawals" ON setter_withdrawals
      FOR SELECT USING (auth.uid() = setter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'setter_withdrawals' AND policyname = 'Setters can request withdrawals') THEN
    CREATE POLICY "Setters can request withdrawals" ON setter_withdrawals
      FOR INSERT WITH CHECK (auth.uid() = setter_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_setter_withdrawals_setter ON setter_withdrawals(setter_id);

-- ─── 7. Daily submission tracking index ──────────────────────
-- Used to enforce daily_setter_cap per (setter, listing, day).
CREATE INDEX IF NOT EXISTS idx_appointments_submitted_at ON appointments(submitted_at);
