-- ============================================================
-- Finthesia Migration V5: Bug Fixes & Data Model Improvements
-- ============================================================
-- 1. Add balance columns to party_ledger_parties (merge party_balances)
-- 2. Fix is_active column error in cashbook & party triggers
-- 3. Fix EMI Mark-As-Paid to also reduce card outstanding balance
-- ============================================================


-- ============================================================
-- PART 1: Add balance columns directly to party_ledger_parties
-- ============================================================
-- This merges the party_balances VIEW into the actual table,
-- so Party data has total_gave, total_got, balance inline.
-- The hierarchy is now:
--   user(id)
--     → ledgers(id, user_id)
--       → party_ledger_parties(id, user_id, ledger_id, balance)
--         → party_ledger_txns(id, user_id, ledger_id, party_id)
--       → cashbook_entries(id, user_id, ledger_id)
-- ============================================================

ALTER TABLE party_ledger_parties
  ADD COLUMN IF NOT EXISTS total_gave DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_got  DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance    DECIMAL(15,2) DEFAULT 0;

-- Backfill existing data from transactions
UPDATE party_ledger_parties p
SET
  total_gave = COALESCE(sub.tg, 0),
  total_got  = COALESCE(sub.tr, 0),
  balance    = COALESCE(sub.tg, 0) - COALESCE(sub.tr, 0)
FROM (
  SELECT
    party_id,
    SUM(CASE WHEN txn_type = 'gave' THEN amount ELSE 0 END) AS tg,
    SUM(CASE WHEN txn_type = 'got'  THEN amount ELSE 0 END) AS tr
  FROM party_ledger_txns
  GROUP BY party_id
) sub
WHERE p.id = sub.party_id;

-- Trigger: Auto-update party balance columns on txn change
CREATE OR REPLACE FUNCTION sync_party_balance_columns()
RETURNS TRIGGER AS $$
DECLARE
  v_party_id TEXT;
  v_gave NUMERIC;
  v_got  NUMERIC;
BEGIN
  -- Which party was affected?
  IF TG_OP = 'DELETE' THEN
    v_party_id := OLD.party_id;
  ELSE
    v_party_id := NEW.party_id;
  END IF;

  -- Recalculate from all txns for this party
  SELECT
    COALESCE(SUM(CASE WHEN txn_type = 'gave' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN txn_type = 'got'  THEN amount ELSE 0 END), 0)
  INTO v_gave, v_got
  FROM party_ledger_txns
  WHERE party_id = v_party_id;

  UPDATE party_ledger_parties
  SET total_gave = v_gave,
      total_got  = v_got,
      balance    = v_gave - v_got,
      updated_at = NOW()
  WHERE id = v_party_id;

  -- Handle UPDATE that changes party_id (moved to different party)
  IF TG_OP = 'UPDATE' AND OLD.party_id <> NEW.party_id THEN
    SELECT
      COALESCE(SUM(CASE WHEN txn_type = 'gave' THEN amount ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN txn_type = 'got'  THEN amount ELSE 0 END), 0)
    INTO v_gave, v_got
    FROM party_ledger_txns
    WHERE party_id = OLD.party_id;

    UPDATE party_ledger_parties
    SET total_gave = v_gave,
        total_got  = v_got,
        balance    = v_gave - v_got,
        updated_at = NOW()
    WHERE id = OLD.party_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_party_balance_cols ON party_ledger_txns;
CREATE TRIGGER trg_sync_party_balance_cols
  AFTER INSERT OR UPDATE OR DELETE ON party_ledger_txns
  FOR EACH ROW
  EXECUTE FUNCTION sync_party_balance_columns();


-- Rebuild party_balances VIEW to pull from the new columns
-- (backward compatibility for any code still using the view)
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
  p.total_gave,
  p.total_got,
  p.balance
FROM party_ledger_parties p;


-- ============================================================
-- PART 2: Fix is_active column error in cashbook trigger
-- ============================================================
-- The cashbook_entries table does NOT have an is_active column.
-- The V4 trigger incorrectly references it. Fix by removing
-- the is_active filter from the cashbook sync trigger.
-- ============================================================

CREATE OR REPLACE FUNCTION sync_cashbook_to_cash_wallet()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_total NUMERIC;
  v_asset_id TEXT;
BEGIN
  -- Determine user_id from the affected row
  IF TG_OP = 'DELETE' THEN
    v_user_id := OLD.user_id;
  ELSE
    v_user_id := NEW.user_id;
  END IF;

  -- Calculate net cash balance (NO is_active filter — column doesn't exist)
  SELECT COALESCE(
    SUM(CASE WHEN entry_type = 'cash_in' THEN amount ELSE -amount END),
    0
  ) INTO v_total
  FROM cashbook_entries
  WHERE user_id = v_user_id;

  -- Check if a Cash Wallet asset already exists
  SELECT id INTO v_asset_id
  FROM assets
  WHERE user_id = v_user_id
    AND category = 'bank_accounts'
    AND subcategory = 'Cash Wallet'
  LIMIT 1;

  IF v_asset_id IS NOT NULL THEN
    UPDATE assets
    SET current_value = v_total, updated_at = NOW()
    WHERE id = v_asset_id;
  ELSE
    INSERT INTO assets (id, user_id, name, category, subcategory, current_value, notes)
    VALUES (
      gen_random_uuid()::text,
      v_user_id,
      'Cash Wallet',
      'bank_accounts',
      'Cash Wallet',
      v_total,
      'Auto-managed from Cashbook Ledger'
    );
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
DROP TRIGGER IF EXISTS trg_sync_cashbook_wallet ON cashbook_entries;
CREATE TRIGGER trg_sync_cashbook_wallet
  AFTER INSERT OR UPDATE OR DELETE ON cashbook_entries
  FOR EACH ROW
  EXECUTE FUNCTION sync_cashbook_to_cash_wallet();


-- ============================================================
-- PART 3: Fix is_active column error in party ledger trigger
-- ============================================================
-- Same issue: party_ledger_txns doesn't have is_active column.
-- ============================================================

CREATE OR REPLACE FUNCTION sync_party_ledger_balances()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_receivables NUMERIC;
  v_payables NUMERIC;
  v_asset_id TEXT;
  v_liability_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_user_id := OLD.user_id;
  ELSE
    v_user_id := NEW.user_id;
  END IF;

  -- Total gave (they owe you)
  SELECT COALESCE(SUM(amount), 0) INTO v_receivables
  FROM party_ledger_txns
  WHERE user_id = v_user_id AND txn_type = 'gave';

  -- Total got (you owe them)
  SELECT COALESCE(SUM(amount), 0) INTO v_payables
  FROM party_ledger_txns
  WHERE user_id = v_user_id AND txn_type = 'got';

  -- Net values
  v_receivables := GREATEST(v_receivables - v_payables, 0);
  v_payables := GREATEST(v_payables - (
    SELECT COALESCE(SUM(amount), 0) FROM party_ledger_txns
    WHERE user_id = v_user_id AND txn_type = 'gave'
  ), 0);

  -- Sync Party Receivables to Assets
  SELECT id INTO v_asset_id
  FROM assets
  WHERE user_id = v_user_id AND name = 'Party Receivables' AND category = 'other'
  LIMIT 1;

  IF v_asset_id IS NOT NULL THEN
    UPDATE assets SET current_value = v_receivables, updated_at = NOW()
    WHERE id = v_asset_id;
  ELSIF v_receivables > 0 THEN
    INSERT INTO assets (id, user_id, name, category, subcategory, current_value, notes)
    VALUES (
      gen_random_uuid()::text, v_user_id, 'Party Receivables', 'other',
      'Business Ownership', v_receivables, 'Auto-managed from Party Ledger'
    );
  END IF;

  -- Sync Party Payables to Liabilities
  SELECT id INTO v_liability_id
  FROM liabilities
  WHERE user_id = v_user_id AND name = 'Party Payables' AND type = 'other'
  LIMIT 1;

  IF v_liability_id IS NOT NULL THEN
    UPDATE liabilities SET balance = v_payables, updated_at = NOW()
    WHERE id = v_liability_id;
  ELSIF v_payables > 0 THEN
    INSERT INTO liabilities (id, user_id, name, type, liability_type, balance)
    VALUES (
      gen_random_uuid()::text, v_user_id, 'Party Payables', 'other', 'other', v_payables
    );
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_party_balances ON party_ledger_txns;
CREATE TRIGGER trg_sync_party_balances
  AFTER INSERT OR UPDATE OR DELETE ON party_ledger_txns
  FOR EACH ROW
  EXECUTE FUNCTION sync_party_ledger_balances();


-- ============================================================
-- PART 4: Fix EMI Mark-As-Paid to also reduce card outstanding
-- ============================================================
-- Previously mark_emi_installment_paid only updated the EMI row
-- and added a card_transaction. But it didn't decrease the card's
-- total_amount_due or increase available_credit.
-- ============================================================

CREATE OR REPLACE FUNCTION mark_emi_installment_paid(
  p_emi_id TEXT,
  p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_monthly_payment NUMERIC;
  v_remaining_amount NUMERIC;
  v_remaining_months INT;
  v_next_due_date DATE;
  v_card_id TEXT;
BEGIN
  SELECT monthly_payment, remaining_amount, remaining_months, next_due_date, card_id
  INTO v_monthly_payment, v_remaining_amount, v_remaining_months, v_next_due_date, v_card_id
  FROM emis
  WHERE id = p_emi_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'EMI not found or not active';
  END IF;

  -- Update EMI
  UPDATE emis
  SET remaining_amount = GREATEST(v_remaining_amount - v_monthly_payment, 0),
      remaining_months = GREATEST(v_remaining_months - 1, 0),
      next_due_date = (v_next_due_date + INTERVAL '1 month')::date,
      updated_at = NOW()
  WHERE id = p_emi_id;

  -- If EMI is now fully paid, mark completed
  IF v_remaining_months <= 1 THEN
    UPDATE emis
    SET is_active = false, updated_at = NOW()
    WHERE id = p_emi_id;
  END IF;

  -- Record a card transaction for the EMI payment
  INSERT INTO cards_transactions (id, user_id, card_id, amount, transaction_type, category, description, transaction_date)
  VALUES (
    gen_random_uuid()::text,
    p_user_id,
    v_card_id,
    v_monthly_payment,
    'emi',
    'EMI Payment',
    'EMI installment payment',
    CURRENT_DATE
  );

  -- ** FIX: Also decrease card outstanding balance and increase available credit **
  UPDATE cards
  SET total_amount_due = GREATEST(COALESCE(total_amount_due, 0) - v_monthly_payment, 0),
      available_credit = LEAST(
        COALESCE(available_credit, 0) + v_monthly_payment,
        COALESCE(credit_limit, 0)
      ),
      updated_at = NOW()
  WHERE id = v_card_id AND user_id = p_user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- DONE — Migration V5 Summary
-- ============================================================
-- 1. Added total_gave, total_got, balance columns to party_ledger_parties
-- 2. Created sync_party_balance_columns trigger for auto-update
-- 3. Rebuilt party_balances VIEW from table columns (backward compat)
-- 4. Fixed cashbook trigger (removed is_active reference)
-- 5. Fixed party ledger trigger (removed is_active reference)
-- 6. Fixed mark_emi_installment_paid to also update cards table
--
-- Hierarchy enforced:
--   user(id)
--     → ledgers(id, user_id)
--       → party_ledger_parties(id, user_id, ledger_id)
--         → party_ledger_txns(id, user_id, ledger_id, party_id)
--       → cashbook_entries(id, user_id, ledger_id)
--     → cards(id, user_id)
--       → emis(id, user_id, card_id)
--       → cards_transactions(id, user_id, card_id)
-- ============================================================
