-- =============================================
-- Finthesia V2 Migration: Aligned with User Flow Diagram
-- Run this AFTER all previous migrations in Supabase SQL Editor
-- =============================================
-- This migration:
--   1. Creates new tables for all asset types from the user flow
--   2. Adds columns to existing tables for payment source/method tracking
--   3. Creates the multi-ledger system
--   4. Sets up RLS, indexes, and RPC functions
-- =============================================

-- ─────────────────────────────────────────────
-- TABLE 1: ledgers (Multi-ledger book support)
-- A user can maintain multiple ledger books (e.g. "My Shop", "Freelance", "Personal")
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ledgers (
  id           TEXT PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  is_default   BOOLEAN DEFAULT FALSE,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE 2: cards_transactions
-- Credit card specific transaction log (per the user flow: UPI, Card Swipe, Online, Tap & Pay, NFC)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cards_transactions (
  id                TEXT PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id           TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  amount            DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  merchant          TEXT,
  category          TEXT,
  transaction_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_type  TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'payment', 'refund', 'cashback', 'fee', 'emi')),
  payment_method    TEXT CHECK (payment_method IN ('upi', 'card_swipe', 'online', 'tap_and_pay', 'nfc')),
  description       TEXT,
  notes             TEXT,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE 3: investments
-- Tracks individual investment accounts (Stocks, MF, ETF, Crypto, Gold, Bonds, FD, RD, etc.)
-- Risk levels: high (Stocks, Crypto, Startup), medium (MF, ETF, Index, Gold), low (Bonds, FD, RD)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investments (
  id               TEXT PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  investment_type  TEXT NOT NULL,
    -- Valid types: stocks, mutual_funds, etfs, index_funds, cryptocurrency,
    --   gold, bonds, fixed_deposit, recurring_deposit, startup_equity, other
  risk_level       TEXT CHECK (risk_level IN ('high', 'medium', 'low')),
  platform         TEXT,            -- e.g. Zerodha, Groww, Kuvera, Bank
  current_value    DECIMAL(15, 2) NOT NULL DEFAULT 0,
  invested_amount  DECIMAL(15, 2) NOT NULL DEFAULT 0,
  units            DECIMAL(15, 6),  -- shares/units held
  maturity_date    DATE,            -- for FD, RD, Bonds
  interest_rate    DECIMAL(5, 2),   -- annual interest/return rate
  notes            TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE 4: investment_transactions
-- Buy/Sell/Dividend/Interest/SIP entries per investment
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investment_transactions (
  id                TEXT PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id     TEXT NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  amount            DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  units             DECIMAL(15, 6),
  transaction_type  TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'dividend', 'interest', 'sip', 'switch')),
  transaction_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  nav_price         DECIMAL(15, 4),   -- price per unit at time of transaction
  notes             TEXT,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE 5: real_estate
-- Property tracking (residential, commercial, land, plot)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS real_estate (
  id              TEXT PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  property_type   TEXT NOT NULL,   -- residential, commercial, land, plot, warehouse
  current_value   DECIMAL(15, 2) NOT NULL DEFAULT 0,
  purchase_value  DECIMAL(15, 2),
  purchase_date   DATE,
  location        TEXT,
  area_sqft       DECIMAL(10, 2),
  rental_income   DECIMAL(15, 2) DEFAULT 0,  -- monthly rental income
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE 6: real_estate_transactions
-- Rent received, EMI paid, maintenance, tax payments for properties
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS real_estate_transactions (
  id                TEXT PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  real_estate_id    TEXT NOT NULL REFERENCES real_estate(id) ON DELETE CASCADE,
  amount            DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  transaction_type  TEXT NOT NULL CHECK (transaction_type IN ('rent_received', 'emi_paid', 'maintenance', 'property_tax', 'insurance', 'purchase', 'sale', 'renovation')),
  transaction_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  notes             TEXT,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE 7: retirement_funds
-- EPF, PPF, NPS, VPF tracking
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS retirement_funds (
  id                     TEXT PRIMARY KEY,
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                   TEXT NOT NULL,
  fund_type              TEXT NOT NULL CHECK (fund_type IN ('epf', 'ppf', 'nps', 'vpf', 'other')),
  current_value          DECIMAL(15, 2) NOT NULL DEFAULT 0,
  employer_contribution  DECIMAL(15, 2) DEFAULT 0,
  employee_contribution  DECIMAL(15, 2) DEFAULT 0,
  interest_rate          DECIMAL(5, 2),
  maturity_date          DATE,
  account_number         TEXT,
  notes                  TEXT,
  is_active              BOOLEAN DEFAULT TRUE,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE 8: retirement_fund_transactions
-- Contributions, withdrawals, interest accruals
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS retirement_fund_transactions (
  id                  TEXT PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  retirement_fund_id  TEXT NOT NULL REFERENCES retirement_funds(id) ON DELETE CASCADE,
  amount              DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  transaction_type    TEXT NOT NULL CHECK (transaction_type IN ('contribution', 'withdrawal', 'interest', 'employer_match')),
  transaction_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  notes               TEXT,
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE 9: insurance
-- Life, Health, Vehicle, Home, Travel insurance policies
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insurance (
  id                 TEXT PRIMARY KEY,
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  policy_type        TEXT NOT NULL CHECK (policy_type IN ('life', 'health', 'vehicle', 'home', 'travel', 'other')),
  provider           TEXT,
  policy_number      TEXT,
  premium_amount     DECIMAL(15, 2) NOT NULL DEFAULT 0,
  premium_frequency  TEXT DEFAULT 'yearly' CHECK (premium_frequency IN ('monthly', 'quarterly', 'half_yearly', 'yearly')),
  sum_assured        DECIMAL(15, 2),
  cover_amount       DECIMAL(15, 2),  -- for health insurance
  start_date         DATE,
  end_date           DATE,
  nominee            TEXT,
  notes              TEXT,
  is_active          BOOLEAN DEFAULT TRUE,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE 10: insurance_transactions
-- Premium payments, claims, maturity payouts
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insurance_transactions (
  id                TEXT PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insurance_id      TEXT NOT NULL REFERENCES insurance(id) ON DELETE CASCADE,
  amount            DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  transaction_type  TEXT NOT NULL CHECK (transaction_type IN ('premium_paid', 'claim_received', 'maturity', 'surrender', 'bonus')),
  transaction_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  notes             TEXT,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE 11: others_assets
-- Miscellaneous assets: Gold (physical), Art, Collectibles, Digital assets, etc.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS others_assets (
  id              TEXT PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  asset_type      TEXT,   -- gold_physical, silver, art, collectibles, digital, vehicle, jewelry, other
  current_value   DECIMAL(15, 2) NOT NULL DEFAULT 0,
  purchase_value  DECIMAL(15, 2),
  purchase_date   DATE,
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE 12: others_transactions
-- Buy/Sell/Valuation updates for miscellaneous assets
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS others_transactions (
  id                TEXT PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id          TEXT NOT NULL REFERENCES others_assets(id) ON DELETE CASCADE,
  amount            DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  transaction_type  TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'valuation_update')),
  transaction_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  notes             TEXT,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);


-- ─────────────────────────────────────────────
-- ALTER EXISTING TABLES: Add columns per user flow
-- ─────────────────────────────────────────────

-- transactions: add payment_source (Cash / Bank / Credit Card per user flow)
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS payment_source TEXT;
  -- Values: 'cash', 'bank', 'credit_card'

-- bank_transactions: add payment_method (UPI, Net Banking, IMPS, NEFT, RTGS, Cheque, Debit Card)
ALTER TABLE bank_transactions
  ADD COLUMN IF NOT EXISTS payment_method TEXT;
  -- Values: 'upi', 'net_banking', 'imps', 'neft', 'rtgs', 'cheque', 'debit_card'

-- cashbook_entries: link to a specific ledger
ALTER TABLE cashbook_entries
  ADD COLUMN IF NOT EXISTS ledger_id TEXT;

-- party_ledger_parties: add party_type (customer/vendor), ledger_id, and extra fields
ALTER TABLE party_ledger_parties
  ADD COLUMN IF NOT EXISTS party_type TEXT DEFAULT 'customer',
  ADD COLUMN IF NOT EXISTS ledger_id  TEXT,
  ADD COLUMN IF NOT EXISTS email      TEXT,
  ADD COLUMN IF NOT EXISTS address    TEXT,
  ADD COLUMN IF NOT EXISTS gstin      TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- party_ledger_txns: add ledger_id for multi-ledger filtering
ALTER TABLE party_ledger_txns
  ADD COLUMN IF NOT EXISTS ledger_id TEXT;


-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY for all new tables
-- ─────────────────────────────────────────────

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'ledgers',
    'cards_transactions',
    'investments', 'investment_transactions',
    'real_estate', 'real_estate_transactions',
    'retirement_funds', 'retirement_fund_transactions',
    'insurance', 'insurance_transactions',
    'others_assets', 'others_transactions'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);

    -- SELECT
    EXECUTE format('DROP POLICY IF EXISTS "Users can view own %1$s" ON %1$s', tbl);
    EXECUTE format(
      'CREATE POLICY "Users can view own %1$s" ON %1$s FOR SELECT USING (auth.uid() = user_id)',
      tbl
    );
    -- INSERT
    EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %1$s" ON %1$s', tbl);
    EXECUTE format(
      'CREATE POLICY "Users can insert own %1$s" ON %1$s FOR INSERT WITH CHECK (auth.uid() = user_id)',
      tbl
    );
    -- UPDATE
    EXECUTE format('DROP POLICY IF EXISTS "Users can update own %1$s" ON %1$s', tbl);
    EXECUTE format(
      'CREATE POLICY "Users can update own %1$s" ON %1$s FOR UPDATE USING (auth.uid() = user_id)',
      tbl
    );
    -- DELETE
    EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %1$s" ON %1$s', tbl);
    EXECUTE format(
      'CREATE POLICY "Users can delete own %1$s" ON %1$s FOR DELETE USING (auth.uid() = user_id)',
      tbl
    );
  END LOOP;
END
$$;


-- ─────────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────────

-- Ledgers
CREATE INDEX IF NOT EXISTS idx_ledgers_user ON ledgers(user_id) WHERE is_active = TRUE;

-- Cards Transactions
CREATE INDEX IF NOT EXISTS idx_cards_txns_user ON cards_transactions(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_cards_txns_card ON cards_transactions(card_id, transaction_date DESC) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_cards_txns_date ON cards_transactions(user_id, transaction_date DESC) WHERE is_active = TRUE;

-- Investments
CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_investments_type ON investments(user_id, investment_type) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_investment_txns_user ON investment_transactions(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_investment_txns_inv ON investment_transactions(investment_id, transaction_date DESC) WHERE is_active = TRUE;

-- Real Estate
CREATE INDEX IF NOT EXISTS idx_real_estate_user ON real_estate(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_real_estate_txns_user ON real_estate_transactions(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_real_estate_txns_prop ON real_estate_transactions(real_estate_id, transaction_date DESC) WHERE is_active = TRUE;

-- Retirement Funds
CREATE INDEX IF NOT EXISTS idx_retirement_funds_user ON retirement_funds(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_retirement_fund_txns_user ON retirement_fund_transactions(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_retirement_fund_txns_fund ON retirement_fund_transactions(retirement_fund_id, transaction_date DESC) WHERE is_active = TRUE;

-- Insurance
CREATE INDEX IF NOT EXISTS idx_insurance_user ON insurance(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_insurance_txns_user ON insurance_transactions(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_insurance_txns_ins ON insurance_transactions(insurance_id, transaction_date DESC) WHERE is_active = TRUE;

-- Others
CREATE INDEX IF NOT EXISTS idx_others_assets_user ON others_assets(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_others_txns_user ON others_transactions(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_others_txns_asset ON others_transactions(asset_id, transaction_date DESC) WHERE is_active = TRUE;

-- Existing table new columns
CREATE INDEX IF NOT EXISTS idx_transactions_payment_source ON transactions(payment_source) WHERE payment_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bank_txns_payment_method ON bank_transactions(payment_method) WHERE payment_method IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cashbook_ledger ON cashbook_entries(ledger_id) WHERE ledger_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_party_ledger_type ON party_ledger_parties(user_id, party_type);
CREATE INDEX IF NOT EXISTS idx_party_ledger_ledger ON party_ledger_parties(ledger_id) WHERE ledger_id IS NOT NULL;


-- ─────────────────────────────────────────────
-- DATABASE FUNCTIONS (RPCs)
-- ─────────────────────────────────────────────

-- ─────────────────────────────────────────────
-- Function: Add card transaction with balance sync
-- Updates card available_credit based on purchase/payment/refund
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION add_card_transaction_with_sync(
  p_id               TEXT,
  p_user_id          UUID,
  p_card_id          TEXT,
  p_amount           DECIMAL,
  p_merchant         TEXT    DEFAULT NULL,
  p_category         TEXT    DEFAULT NULL,
  p_transaction_date TEXT    DEFAULT NULL,
  p_transaction_type TEXT    DEFAULT 'purchase',
  p_payment_method   TEXT    DEFAULT NULL,
  p_description      TEXT    DEFAULT NULL,
  p_notes            TEXT    DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_date DATE;
  v_cashback DECIMAL;
  v_card RECORD;
BEGIN
  v_date := COALESCE(p_transaction_date::DATE, CURRENT_DATE);

  -- Insert the card transaction
  INSERT INTO cards_transactions (
    id, user_id, card_id, amount, merchant, category,
    transaction_date, transaction_type, payment_method,
    description, notes, is_active
  ) VALUES (
    p_id, p_user_id, p_card_id, p_amount, p_merchant, p_category,
    v_date, p_transaction_type, p_payment_method,
    p_description, p_notes, TRUE
  );

  -- Sync card balance
  IF p_transaction_type = 'purchase' OR p_transaction_type = 'emi' OR p_transaction_type = 'fee' THEN
    -- Deduct from available credit
    UPDATE cards SET
      available_credit = available_credit - p_amount,
      updated_at = NOW()
    WHERE id = p_card_id AND user_id = p_user_id;

    -- Cashback / reward accrual
    SELECT cashback_percent INTO v_card FROM cards WHERE id = p_card_id;
    IF v_card.cashback_percent > 0 THEN
      v_cashback := ROUND(p_amount * (v_card.cashback_percent / 100));
      IF v_cashback > 0 THEN
        UPDATE cards SET reward_points = reward_points + v_cashback::INTEGER
        WHERE id = p_card_id;
      END IF;
    END IF;

  ELSIF p_transaction_type = 'payment' THEN
    -- Payment restores available credit
    UPDATE cards SET
      available_credit = LEAST(credit_limit, available_credit + p_amount),
      updated_at = NOW()
    WHERE id = p_card_id AND user_id = p_user_id;

  ELSIF p_transaction_type = 'refund' OR p_transaction_type = 'cashback' THEN
    -- Refund/cashback restores available credit
    UPDATE cards SET
      available_credit = LEAST(credit_limit, available_credit + p_amount),
      updated_at = NOW()
    WHERE id = p_card_id AND user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────
-- Function: Add investment transaction with value sync
-- Updates investment current_value and invested_amount on buy/sell
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION add_investment_transaction_with_sync(
  p_id               TEXT,
  p_user_id          UUID,
  p_investment_id    TEXT,
  p_amount           DECIMAL,
  p_units            DECIMAL  DEFAULT NULL,
  p_transaction_type TEXT     DEFAULT 'buy',
  p_transaction_date TEXT     DEFAULT NULL,
  p_nav_price        DECIMAL  DEFAULT NULL,
  p_notes            TEXT     DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_date DATE;
BEGIN
  v_date := COALESCE(p_transaction_date::DATE, CURRENT_DATE);

  -- Insert transaction
  INSERT INTO investment_transactions (
    id, user_id, investment_id, amount, units,
    transaction_type, transaction_date, nav_price, notes, is_active
  ) VALUES (
    p_id, p_user_id, p_investment_id, p_amount, p_units,
    p_transaction_type, v_date, p_nav_price, p_notes, TRUE
  );

  -- Sync investment values
  IF p_transaction_type = 'buy' OR p_transaction_type = 'sip' THEN
    UPDATE investments SET
      invested_amount = invested_amount + p_amount,
      current_value = current_value + p_amount,
      units = COALESCE(units, 0) + COALESCE(p_units, 0),
      updated_at = NOW()
    WHERE id = p_investment_id AND user_id = p_user_id;

  ELSIF p_transaction_type = 'sell' THEN
    UPDATE investments SET
      current_value = GREATEST(0, current_value - p_amount),
      units = GREATEST(0, COALESCE(units, 0) - COALESCE(p_units, 0)),
      updated_at = NOW()
    WHERE id = p_investment_id AND user_id = p_user_id;

  ELSIF p_transaction_type = 'dividend' OR p_transaction_type = 'interest' THEN
    UPDATE investments SET
      current_value = current_value + p_amount,
      updated_at = NOW()
    WHERE id = p_investment_id AND user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────
-- Function: Comprehensive Net Worth Snapshot
-- Aggregates all asset classes and liabilities into one record
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_net_worth_snapshot(
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  v_total_assets      DECIMAL := 0;
  v_total_liabilities DECIMAL := 0;
  v_today             TEXT;
  v_id                TEXT;
  v_bank_total        DECIMAL;
  v_asset_total       DECIMAL;
  v_investment_total  DECIMAL;
  v_realestate_total  DECIMAL;
  v_retirement_total  DECIMAL;
  v_others_total      DECIMAL;
  v_liability_total   DECIMAL;
  v_card_debt_total   DECIMAL;
BEGIN
  v_today := TO_CHAR(NOW(), 'YYYY-MM-DD');

  -- Bank balances
  SELECT COALESCE(SUM(balance), 0) INTO v_bank_total
  FROM banks WHERE user_id = p_user_id AND is_active = TRUE;

  -- Manual assets (Cash Wallet, etc.)
  SELECT COALESCE(SUM(current_value), 0) INTO v_asset_total
  FROM assets WHERE user_id = p_user_id AND is_active = TRUE;

  -- Investments
  SELECT COALESCE(SUM(current_value), 0) INTO v_investment_total
  FROM investments WHERE user_id = p_user_id AND is_active = TRUE;

  -- Real Estate
  SELECT COALESCE(SUM(current_value), 0) INTO v_realestate_total
  FROM real_estate WHERE user_id = p_user_id AND is_active = TRUE;

  -- Retirement Funds
  SELECT COALESCE(SUM(current_value), 0) INTO v_retirement_total
  FROM retirement_funds WHERE user_id = p_user_id AND is_active = TRUE;

  -- Other Assets
  SELECT COALESCE(SUM(current_value), 0) INTO v_others_total
  FROM others_assets WHERE user_id = p_user_id AND is_active = TRUE;

  v_total_assets := v_bank_total + v_asset_total + v_investment_total
                  + v_realestate_total + v_retirement_total + v_others_total;

  -- Liabilities (manual)
  SELECT COALESCE(SUM(balance), 0) INTO v_liability_total
  FROM liabilities WHERE user_id = p_user_id AND is_active = TRUE;

  -- Credit card debt
  SELECT COALESCE(SUM(credit_limit - available_credit), 0) INTO v_card_debt_total
  FROM cards WHERE user_id = p_user_id AND is_active = TRUE;

  v_total_liabilities := v_liability_total + v_card_debt_total;

  -- Upsert today's snapshot
  v_id := substr(md5(random()::text || clock_timestamp()::text), 1, 16);

  -- Delete existing today entry to replace
  DELETE FROM net_worth_history
  WHERE user_id = p_user_id AND date = v_today;

  INSERT INTO net_worth_history (id, user_id, date, total_assets, total_liabilities, net_worth)
  VALUES (v_id, p_user_id, v_today, v_total_assets, v_total_liabilities, v_total_assets - v_total_liabilities);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────
-- UPDATE: party_balances view to include party_type and ledger_id
-- Must DROP first because column list is changing (PG cannot rename via CREATE OR REPLACE)
-- ─────────────────────────────────────────────
DROP VIEW IF EXISTS party_balances;
CREATE VIEW party_balances WITH (security_invoker = on) AS
SELECT
  p.id           AS party_id,
  p.user_id,
  p.name,
  p.phone,
  p.party_type,
  p.ledger_id,
  p.email,
  p.address,
  p.gstin,
  COALESCE(SUM(CASE WHEN t.txn_type = 'gave' THEN t.amount ELSE 0 END), 0) AS total_gave,
  COALESCE(SUM(CASE WHEN t.txn_type = 'got'  THEN t.amount ELSE 0 END), 0) AS total_got,
  COALESCE(SUM(CASE WHEN t.txn_type = 'gave' THEN t.amount ELSE -t.amount END), 0) AS balance
  -- positive balance = party owes you, negative = you owe them
FROM party_ledger_parties p
LEFT JOIN party_ledger_txns t ON t.party_id = p.id
GROUP BY p.id, p.user_id, p.name, p.phone, p.party_type, p.ledger_id, p.email, p.address, p.gstin;


-- ─────────────────────────────────────────────
-- DONE
-- ─────────────────────────────────────────────
-- Summary of changes:
--   NEW TABLES (12):
--     ledgers, cards_transactions,
--     investments, investment_transactions,
--     real_estate, real_estate_transactions,
--     retirement_funds, retirement_fund_transactions,
--     insurance, insurance_transactions,
--     others_assets, others_transactions
--
--   ALTERED TABLES (5):
--     transactions (+payment_source)
--     bank_transactions (+payment_method)
--     cashbook_entries (+ledger_id)
--     party_ledger_parties (+party_type, +ledger_id, +email, +address, +gstin, +updated_at)
--     party_ledger_txns (+ledger_id)
--
--   NEW RPCs (3):
--     add_card_transaction_with_sync
--     add_investment_transaction_with_sync
--     update_net_worth_snapshot
--
--   UPDATED VIEW (1):
--     party_balances (now includes party_type, ledger_id, email, address, gstin)
-- =============================================

-- ─────────────────────────────────────────────
-- UNIFIED TRANSACTIONS VIEW
-- This connects all siloed modules to the main Finthesia dashboard.
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW unified_transactions_view WITH (security_invoker = on) AS
SELECT 
  id, user_id, amount, category, description, transaction_date::TEXT, type, is_active, created_at, 'general' as source_table
FROM transactions
UNION ALL
SELECT 
  id, user_id, amount, category, note as description, entry_date::TEXT as transaction_date, 
  CASE WHEN entry_type = 'cash_in' THEN 'income' ELSE 'expense' END as type, 
  TRUE as is_active, created_at, 'cashbook' as source_table
FROM cashbook_entries
UNION ALL
SELECT 
  t.id, t.user_id, t.amount, 'Party Ledger' as category, p.name as description, t.txn_date::TEXT as transaction_date,
  CASE WHEN t.txn_type = 'got' THEN 'income' ELSE 'expense' END as type,
  TRUE as is_active, t.created_at, 'party_ledger' as source_table
FROM party_ledger_txns t
JOIN party_ledger_parties p ON t.party_id = p.id
UNION ALL
SELECT 
  id, user_id, amount, category, description, transaction_date::TEXT, transaction_type as type,
  is_active, created_at, 'bank' as source_table
FROM bank_transactions
UNION ALL
SELECT 
  id, user_id, amount, category, merchant as description, transaction_date::TEXT,
  CASE WHEN transaction_type IN ('payment', 'refund', 'cashback') THEN 'income' ELSE 'expense' END as type,
  is_active, created_at, 'cards' as source_table
FROM cards_transactions
UNION ALL
SELECT 
  t.id, t.user_id, t.amount, 'Investment' as category, i.name as description, t.transaction_date::TEXT,
  CASE WHEN t.transaction_type IN ('sell', 'dividend', 'interest') THEN 'income' ELSE 'expense' END as type,
  t.is_active, t.created_at, 'investments' as source_table
FROM investment_transactions t
JOIN investments i ON t.investment_id = i.id
UNION ALL
SELECT 
  t.id, t.user_id, t.amount, 'Real Estate' as category, r.name as description, t.transaction_date::TEXT,
  CASE WHEN t.transaction_type IN ('rent_received', 'sale') THEN 'income' ELSE 'expense' END as type,
  t.is_active, t.created_at, 'real_estate' as source_table
FROM real_estate_transactions t
JOIN real_estate r ON t.real_estate_id = r.id
UNION ALL
SELECT 
  t.id, t.user_id, t.amount, 'Retirement' as category, r.name as description, t.transaction_date::TEXT,
  CASE WHEN t.transaction_type = 'withdrawal' THEN 'income' ELSE 'expense' END as type,
  t.is_active, t.created_at, 'retirement' as source_table
FROM retirement_fund_transactions t
JOIN retirement_funds r ON t.retirement_fund_id = r.id
UNION ALL
SELECT 
  t.id, t.user_id, t.amount, 'Insurance' as category, i.name as description, t.transaction_date::TEXT,
  CASE WHEN t.transaction_type IN ('claim_received', 'maturity', 'surrender', 'bonus') THEN 'income' ELSE 'expense' END as type,
  t.is_active, t.created_at, 'insurance' as source_table
FROM insurance_transactions t
JOIN insurance i ON t.insurance_id = i.id
UNION ALL
SELECT 
  t.id, t.user_id, t.amount, 'Other Assets' as category, o.name as description, t.transaction_date::TEXT,
  CASE WHEN t.transaction_type = 'sale' THEN 'income' ELSE 'expense' END as type,
  t.is_active, t.created_at, 'others_assets' as source_table
FROM others_transactions t
JOIN others_assets o ON t.asset_id = o.id;
