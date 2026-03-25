-- =============================================
-- Finthesia Migration: CashBook + Party Ledger
-- Run in Supabase SQL Editor
-- =============================================

-- ─────────────────────────────────────────────
-- TABLE 1: cashbook_entries
-- Personal daily cash in/out tracker (like Khatabook cashbook)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cashbook_entries (
  id           TEXT PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount       DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  entry_type   TEXT NOT NULL CHECK (entry_type IN ('cash_in', 'cash_out')),
  category     TEXT NOT NULL,
  note         TEXT DEFAULT '',
  entry_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE cashbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cashbook_entries"
  ON cashbook_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cashbook_entries"
  ON cashbook_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cashbook_entries"
  ON cashbook_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cashbook_entries"
  ON cashbook_entries FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cashbook_user_date
  ON cashbook_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_cashbook_type
  ON cashbook_entries(user_id, entry_type);


-- ─────────────────────────────────────────────
-- TABLE 2: party_ledger_parties
-- Each person/business you track money with
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS party_ledger_parties (
  id         TEXT PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  phone      TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE party_ledger_parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own parties"
  ON party_ledger_parties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own parties"
  ON party_ledger_parties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own parties"
  ON party_ledger_parties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own parties"
  ON party_ledger_parties FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_party_user
  ON party_ledger_parties(user_id);


-- ─────────────────────────────────────────────
-- TABLE 3: party_ledger_txns
-- Each money exchange with a party
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS party_ledger_txns (
  id         TEXT PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  party_id   TEXT NOT NULL REFERENCES party_ledger_parties(id) ON DELETE CASCADE,
  amount     DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  txn_type   TEXT NOT NULL CHECK (txn_type IN ('gave', 'got')),
  -- 'gave' = you gave money to this party (their balance decreases / you are owed less)
  -- 'got'  = you received money from this party (they owe you less)
  note       TEXT DEFAULT '',
  txn_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE party_ledger_txns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own party_ledger_txns"
  ON party_ledger_txns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own party_ledger_txns"
  ON party_ledger_txns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own party_ledger_txns"
  ON party_ledger_txns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own party_ledger_txns"
  ON party_ledger_txns FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_party_txns_party
  ON party_ledger_txns(party_id, txn_date DESC);
CREATE INDEX IF NOT EXISTS idx_party_txns_user
  ON party_ledger_txns(user_id);


-- ─────────────────────────────────────────────
-- HELPER VIEW: Party balances (optional convenience)
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW party_balances WITH (security_invoker = on) AS
SELECT
  p.id           AS party_id,
  p.user_id,
  p.name,
  p.phone,
  COALESCE(SUM(CASE WHEN t.txn_type = 'gave' THEN t.amount ELSE 0 END), 0) AS total_gave,
  COALESCE(SUM(CASE WHEN t.txn_type = 'got'  THEN t.amount ELSE 0 END), 0) AS total_got,
  COALESCE(SUM(CASE WHEN t.txn_type = 'gave' THEN t.amount ELSE -t.amount END), 0) AS balance
  -- positive balance = party owes you, negative = you owe them
FROM party_ledger_parties p
LEFT JOIN party_ledger_txns t ON t.party_id = p.id
GROUP BY p.id, p.user_id, p.name, p.phone;
