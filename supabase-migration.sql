-- =============================================
-- Finthesia Supabase Migration: Transaction Table Refinement
-- Run this in your Supabase SQL Editor
-- =============================================

-- ─────────────────────────────────────────────
-- STEP 1: Add / Refine columns in transactions table
-- ─────────────────────────────────────────────
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS account          TEXT,
  ADD COLUMN IF NOT EXISTS payment_method   TEXT,
  ADD COLUMN IF NOT EXISTS is_recurring     BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS recurring_frequency TEXT,      -- e.g. 'Monthly', 'Weekly', 'Daily', 'Yearly'
  ADD COLUMN IF NOT EXISTS recurring_end_date  DATE,       -- null = ongoing
  ADD COLUMN IF NOT EXISTS recurring_repeats   INTEGER,    -- null = ongoing, number = max count
  ADD COLUMN IF NOT EXISTS receipt_url      TEXT,
  ADD COLUMN IF NOT EXISTS location         JSONB,
  ADD COLUMN IF NOT EXISTS tags             TEXT[] DEFAULT '{}';

-- ─────────────────────────────────────────────
-- STEP 2: Drop old RPC (to avoid signature conflicts)
-- ─────────────────────────────────────────────
DROP FUNCTION IF EXISTS add_transaction_with_sync(TEXT, UUID, DECIMAL, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS add_transaction_with_sync(TEXT, UUID, DECIMAL, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], BOOLEAN, JSONB, TEXT);

-- ─────────────────────────────────────────────
-- STEP 3: Create refined RPC with all current fields
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION add_transaction_with_sync(
  p_id                   TEXT,
  p_user_id              UUID,
  p_amount               DECIMAL,
  p_category             TEXT,
  p_description          TEXT,
  p_transaction_date     TEXT,
  p_type                 TEXT,
  p_card_id              TEXT    DEFAULT NULL,
  p_liability_id         TEXT    DEFAULT NULL,
  p_account              TEXT    DEFAULT NULL,
  p_payment_method       TEXT    DEFAULT NULL,
  p_is_recurring         BOOLEAN DEFAULT FALSE,
  p_recurring_frequency  TEXT    DEFAULT NULL,
  p_recurring_end_date   TEXT    DEFAULT NULL,  -- ISO date string e.g. '2027-03-19'
  p_recurring_repeats    INTEGER DEFAULT NULL,
  p_receipt_url          TEXT    DEFAULT NULL,
  p_location             JSONB   DEFAULT NULL,
  p_tags                 TEXT[]  DEFAULT '{}'
) RETURNS VOID AS $$
DECLARE
  v_cash_asset_id TEXT;
  v_cashback      DECIMAL;
  v_card          RECORD;
BEGIN
  -- ── Insert the transaction ──────────────────
  INSERT INTO transactions (
    id, user_id, amount, category, description, transaction_date, type,
    card_id, liability_id, is_active,
    account, payment_method,
    is_recurring, recurring_frequency, recurring_end_date, recurring_repeats,
    receipt_url, location, tags
  )
  VALUES (
    p_id, p_user_id, p_amount, p_category, p_description, p_transaction_date::DATE, p_type,
    p_card_id, p_liability_id, TRUE,
    p_account, p_payment_method,
    p_is_recurring, p_recurring_frequency,
    CASE WHEN p_recurring_end_date IS NOT NULL AND p_recurring_end_date != '' THEN p_recurring_end_date::DATE ELSE NULL END,
    p_recurring_repeats,
    p_receipt_url, p_location, p_tags
  );

  -- ── Sync related tables ────────────────────
  IF p_card_id IS NOT NULL AND p_type = 'spend' THEN
    -- Deduct from card available credit
    UPDATE cards
    SET available_credit = available_credit - p_amount
    WHERE id = p_card_id AND user_id = p_user_id;

    -- Reward accrual (cashback)
    SELECT cashback_percent INTO v_card FROM cards WHERE id = p_card_id;
    IF v_card.cashback_percent > 0 THEN
      v_cashback := ROUND(p_amount * (v_card.cashback_percent / 100));
      IF v_cashback > 0 THEN
        UPDATE cards SET reward_points = reward_points + v_cashback::INTEGER WHERE id = p_card_id;
      END IF;
    END IF;

  ELSIF p_liability_id IS NOT NULL AND p_type = 'payment' THEN
    -- Reduce liability balance
    UPDATE liabilities SET balance = balance - p_amount WHERE id = p_liability_id;

  ELSIF p_card_id IS NULL AND p_liability_id IS NULL THEN
    -- Cash / Bank wallet sync
    SELECT id INTO v_cash_asset_id FROM assets
    WHERE user_id = p_user_id AND category = 'bank_accounts' AND subcategory = 'Cash Wallet' AND is_active = TRUE
    LIMIT 1;

    IF v_cash_asset_id IS NULL THEN
      v_cash_asset_id := substr(md5(random()::text || clock_timestamp()::text), 1, 16);
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

-- ─────────────────────────────────────────────
-- STEP 4: Add performance indexes
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions (user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category  ON transactions (category);
CREATE INDEX IF NOT EXISTS idx_transactions_type      ON transactions (type);
CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions (is_recurring) WHERE is_recurring = TRUE;
CREATE INDEX IF NOT EXISTS idx_transactions_card      ON transactions (card_id) WHERE card_id IS NOT NULL;

-- ─────────────────────────────────────────────
-- STEP 5: Row Level Security (ensure users only see their data)
-- ─────────────────────────────────────────────
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
CREATE POLICY "Users can insert their own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
CREATE POLICY "Users can update their own transactions"
ON transactions FOR UPDATE
USING (auth.uid() = user_id);
