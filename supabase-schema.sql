-- =============================================
-- Finthesia Supabase Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  current_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS liabilities (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  interest_rate DECIMAL(5, 2),
  minimum_payment DECIMAL(15, 2),
  due_date TEXT,
  provider TEXT,
  liability_type TEXT,
  credit_limit DECIMAL(15, 2),
  tenure_months INTEGER,
  remaining_months INTEGER,
  property_value DECIMAL(15, 2),
  moratorium_status TEXT,
  linked_card_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name TEXT,
  card_variant TEXT,
  name TEXT NOT NULL,
  card_type TEXT NOT NULL,
  credit_limit DECIMAL(15, 2) NOT NULL DEFAULT 0,
  available_credit DECIMAL(15, 2) NOT NULL DEFAULT 0,
  billing_cycle TEXT,
  payment_due_date TEXT,
  total_amount_due DECIMAL(15, 2),
  apr DECIMAL(5, 2),
  last4 TEXT,
  color TEXT,
  annual_fee DECIMAL(15, 2) DEFAULT 0,
  joining_fee DECIMAL(15, 2) DEFAULT 0,
  reward_points INTEGER DEFAULT 0,
  cashback_percent DECIMAL(5, 2) DEFAULT 0,
  monthly_budget DECIMAL(15, 2) DEFAULT 0,
  statement_generation_day INTEGER,
  payment_due_day INTEGER,
  minimum_amount_due DECIMAL(15, 2) DEFAULT 0,
  utilization_alert_threshold DECIMAL(5, 2) DEFAULT 70,
  remind_before_days INTEGER DEFAULT 3,
  remind_on_due_date BOOLEAN DEFAULT TRUE,
  allow_manual_override BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  transaction_date TEXT NOT NULL,
  type TEXT NOT NULL,
  card_id TEXT,
  liability_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emis (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  description TEXT NOT NULL,
  original_amount DECIMAL(15, 2) NOT NULL,
  remaining_amount DECIMAL(15, 2) NOT NULL,
  monthly_payment DECIMAL(15, 2) NOT NULL,
  remaining_months INTEGER NOT NULL,
  next_due_date TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS banks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  nickname TEXT,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  notes TEXT,
  bank_provider TEXT,
  provider_account_id TEXT,
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'manual',
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_id TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  merchant TEXT,
  category TEXT,
  transaction_date TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  source TEXT DEFAULT 'manual',
  csv_hash TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly',
  next_payment_date TEXT,
  bank_id TEXT,
  status TEXT DEFAULT 'active',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS net_worth_history (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  total_assets DECIMAL(15, 2) NOT NULL,
  total_liabilities DECIMAL(15, 2) NOT NULL,
  net_worth DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emis ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_worth_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'assets', 'liabilities', 'cards', 'transactions', 'emis',
    'banks', 'bank_transactions', 'subscriptions', 'net_worth_history'
  ])
  LOOP
    EXECUTE format(
      'CREATE POLICY "Users can view own %1$s" ON %1$s FOR SELECT USING (auth.uid() = user_id)',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Users can insert own %1$s" ON %1$s FOR INSERT WITH CHECK (auth.uid() = user_id)',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Users can update own %1$s" ON %1$s FOR UPDATE USING (auth.uid() = user_id)',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Users can delete own %1$s" ON %1$s FOR DELETE USING (auth.uid() = user_id)',
      tbl
    );
  END LOOP;
END
$$;

-- =============================================
-- INDEXES for performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_assets_user ON assets(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_liabilities_user ON liabilities(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_cards_user ON cards(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(user_id, transaction_date DESC) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_emis_user ON emis(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_banks_user ON banks(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_bank_transactions_user ON bank_transactions(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_bank_transactions_bank ON bank_transactions(bank_id, user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_bank_transactions_csv_hash ON bank_transactions(csv_hash, user_id, bank_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_net_worth_history_user ON net_worth_history(user_id, date);

-- =============================================
-- DATABASE FUNCTIONS (for transactional operations)
-- =============================================

-- Helper: Generate a short random ID
CREATE OR REPLACE FUNCTION generate_short_id() RETURNS TEXT AS $$
BEGIN
  RETURN substr(md5(random()::text || clock_timestamp()::text), 1, 16);
END;
$$ LANGUAGE plpgsql;

-- Function: Add transaction with sync cascades
CREATE OR REPLACE FUNCTION add_transaction_with_sync(
  p_id TEXT, p_user_id UUID, p_amount DECIMAL, p_category TEXT,
  p_description TEXT, p_transaction_date TEXT, p_type TEXT,
  p_card_id TEXT DEFAULT NULL, p_liability_id TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_cash_asset_id TEXT;
  v_cashback DECIMAL;
  v_card RECORD;
BEGIN
  -- Insert the transaction
  INSERT INTO transactions (id, user_id, amount, category, description, transaction_date, type, card_id, liability_id, is_active)
  VALUES (p_id, p_user_id, p_amount, p_category, p_description, p_transaction_date, p_type, p_card_id, p_liability_id, TRUE);

  -- Sync logic
  IF p_card_id IS NOT NULL AND p_type = 'spend' THEN
    UPDATE cards SET available_credit = available_credit - p_amount WHERE id = p_card_id AND user_id = p_user_id;
    -- Reward accrual
    SELECT cashback_percent INTO v_card FROM cards WHERE id = p_card_id;
    IF v_card.cashback_percent > 0 THEN
      v_cashback := ROUND(p_amount * (v_card.cashback_percent / 100));
      IF v_cashback > 0 THEN
        UPDATE cards SET reward_points = reward_points + v_cashback::INTEGER WHERE id = p_card_id;
      END IF;
    END IF;
  ELSIF p_liability_id IS NOT NULL AND p_type = 'payment' THEN
    UPDATE liabilities SET balance = balance - p_amount WHERE id = p_liability_id;
  ELSIF p_card_id IS NULL AND p_liability_id IS NULL THEN
    -- Cash wallet sync
    SELECT id INTO v_cash_asset_id FROM assets
    WHERE user_id = p_user_id AND category = 'bank_accounts' AND subcategory = 'Cash Wallet' AND is_active = TRUE
    LIMIT 1;

    IF v_cash_asset_id IS NULL THEN
      v_cash_asset_id := generate_short_id();
      INSERT INTO assets (id, user_id, name, category, subcategory, current_value, is_active)
      VALUES (v_cash_asset_id, p_user_id, 'Cash Wallet', 'bank_accounts', 'Cash Wallet', 0, TRUE);
    END IF;

    IF p_type = 'income' THEN
      UPDATE assets SET current_value = current_value + p_amount WHERE id = v_cash_asset_id;
    ELSE
      UPDATE assets SET current_value = current_value - p_amount WHERE id = v_cash_asset_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Delete transaction with reverse sync
CREATE OR REPLACE FUNCTION delete_transaction_with_sync(
  p_id TEXT, p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  v_tx RECORD;
  v_cash_asset_id TEXT;
BEGIN
  SELECT * INTO v_tx FROM transactions WHERE id = p_id AND user_id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  -- Soft-delete
  UPDATE transactions SET is_active = FALSE WHERE id = p_id;

  -- Reverse sync
  IF v_tx.card_id IS NOT NULL AND v_tx.type = 'spend' THEN
    UPDATE cards SET available_credit = available_credit + v_tx.amount WHERE id = v_tx.card_id AND user_id = p_user_id;
  ELSIF v_tx.liability_id IS NOT NULL AND v_tx.type = 'payment' THEN
    UPDATE liabilities SET balance = balance + v_tx.amount WHERE id = v_tx.liability_id;
  ELSIF v_tx.card_id IS NULL AND v_tx.liability_id IS NULL THEN
    SELECT id INTO v_cash_asset_id FROM assets
    WHERE user_id = p_user_id AND category = 'bank_accounts' AND subcategory = 'Cash Wallet' AND is_active = TRUE
    LIMIT 1;
    IF v_cash_asset_id IS NOT NULL THEN
      IF v_tx.type = 'income' THEN
        UPDATE assets SET current_value = current_value - v_tx.amount WHERE id = v_cash_asset_id;
      ELSE
        UPDATE assets SET current_value = current_value + v_tx.amount WHERE id = v_cash_asset_id;
      END IF;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Add EMI with card block
CREATE OR REPLACE FUNCTION add_emi_with_card_block(
  p_id TEXT, p_user_id UUID, p_card_id TEXT, p_description TEXT,
  p_original_amount DECIMAL, p_remaining_amount DECIMAL,
  p_monthly_payment DECIMAL, p_remaining_months INTEGER, p_next_due_date TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO emis (id, user_id, card_id, description, original_amount, remaining_amount, monthly_payment, remaining_months, next_due_date, is_active)
  VALUES (p_id, p_user_id, p_card_id, p_description, p_original_amount, p_remaining_amount, p_monthly_payment, p_remaining_months, p_next_due_date, TRUE);

  UPDATE cards SET available_credit = available_credit - p_original_amount WHERE id = p_card_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Foreclose EMI
CREATE OR REPLACE FUNCTION foreclose_emi(
  p_emi_id TEXT, p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  v_emi RECORD;
  v_tx_id TEXT;
BEGIN
  SELECT * INTO v_emi FROM emis WHERE id = p_emi_id AND user_id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'EMI not found';
  END IF;

  -- 1. Mark as inactive
  UPDATE emis SET is_active = FALSE WHERE id = p_emi_id;

  -- 2. Release blocked card limit
  UPDATE cards SET available_credit = available_credit + v_emi.remaining_amount WHERE id = v_emi.card_id AND user_id = p_user_id;

  -- 3. Create expense transaction
  v_tx_id := generate_short_id();
  INSERT INTO transactions (id, user_id, amount, category, description, transaction_date, type, card_id, is_active)
  VALUES (v_tx_id, p_user_id, v_emi.remaining_amount, 'EMI Foreclosure', 'Foreclosure: ' || v_emi.description, TO_CHAR(NOW(), 'YYYY-MM-DD'), 'expense', v_emi.card_id, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Add bank transaction with balance update
CREATE OR REPLACE FUNCTION add_bank_transaction_with_balance(
  p_user_id UUID, p_bank_id TEXT, p_amount DECIMAL, p_merchant TEXT,
  p_category TEXT, p_transaction_date TEXT, p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL, p_notes TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  v_id TEXT;
  v_adjustment DECIMAL;
BEGIN
  v_id := generate_short_id();

  INSERT INTO bank_transactions (id, user_id, bank_id, amount, merchant, category, transaction_date, transaction_type, description, notes, source, is_active)
  VALUES (v_id, p_user_id, p_bank_id, p_amount, p_merchant, p_category, p_transaction_date, p_transaction_type, p_description, p_notes, 'manual', TRUE);

  IF p_transaction_type = 'credit' THEN
    v_adjustment := p_amount;
  ELSE
    v_adjustment := -p_amount;
  END IF;

  UPDATE banks SET balance = balance + v_adjustment, updated_at = NOW() WHERE id = p_bank_id AND user_id = p_user_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Delete bank transaction with balance reversal
CREATE OR REPLACE FUNCTION delete_bank_transaction_with_balance(
  p_id TEXT, p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  v_tx RECORD;
  v_adjustment DECIMAL;
BEGIN
  SELECT * INTO v_tx FROM bank_transactions WHERE id = p_id AND user_id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bank transaction not found';
  END IF;

  UPDATE bank_transactions SET is_active = FALSE WHERE id = p_id;

  IF v_tx.transaction_type = 'credit' THEN
    v_adjustment := -v_tx.amount;
  ELSE
    v_adjustment := v_tx.amount;
  END IF;

  UPDATE banks SET balance = balance + v_adjustment, updated_at = NOW() WHERE id = v_tx.bank_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
