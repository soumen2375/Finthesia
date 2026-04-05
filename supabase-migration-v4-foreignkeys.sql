-- ============================================================
-- Finthesia Migration V4: Foreign Keys, Triggers & Connectivity
-- ============================================================
-- This migration establishes formal FK constraints between all
-- interconnected tables and adds triggers for automatic syncing
-- of Cash Wallet and Party Ledger balances.
-- ============================================================

-- ============================================================
-- PART 1: Foreign Key Constraints
-- ============================================================

-- 1. emis.card_id -> cards.id (CASCADE on delete — if card is removed, EMIs go too)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_emis_card_id' AND table_name = 'emis'
  ) THEN
    ALTER TABLE emis ADD CONSTRAINT fk_emis_card_id
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. transactions.card_id -> cards.id (SET NULL — keep transaction if card removed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_transactions_card_id' AND table_name = 'transactions'
  ) THEN
    ALTER TABLE transactions ADD CONSTRAINT fk_transactions_card_id
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. transactions.liability_id -> liabilities.id (SET NULL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_transactions_liability_id' AND table_name = 'transactions'
  ) THEN
    ALTER TABLE transactions ADD CONSTRAINT fk_transactions_liability_id
      FOREIGN KEY (liability_id) REFERENCES liabilities(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. cashbook_entries.ledger_id -> ledgers.id (SET NULL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_cashbook_ledger_id' AND table_name = 'cashbook_entries'
  ) THEN
    ALTER TABLE cashbook_entries ADD CONSTRAINT fk_cashbook_ledger_id
      FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. party_ledger_parties.ledger_id -> ledgers.id (SET NULL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_party_ledger_parties_ledger_id' AND table_name = 'party_ledger_parties'
  ) THEN
    ALTER TABLE party_ledger_parties ADD CONSTRAINT fk_party_ledger_parties_ledger_id
      FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 6. party_ledger_txns.ledger_id -> ledgers.id (SET NULL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_party_ledger_txns_ledger_id' AND table_name = 'party_ledger_txns'
  ) THEN
    ALTER TABLE party_ledger_txns ADD CONSTRAINT fk_party_ledger_txns_ledger_id
      FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 7. subscriptions.bank_id -> banks.id (SET NULL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_subscriptions_bank_id' AND table_name = 'subscriptions'
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT fk_subscriptions_bank_id
      FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE SET NULL;
  END IF;
END $$;


-- ============================================================
-- PART 2: Cashbook → Cash Wallet Auto-Sync Trigger
-- ============================================================
-- When a cashbook entry is inserted/deleted/updated, recalculate
-- the Cash Wallet asset value for that user from the sum of all
-- cashbook entries. If no Cash Wallet asset exists, create one.
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

  -- Calculate net cash balance from all cashbook entries for this user
  SELECT COALESCE(
    SUM(CASE WHEN entry_type = 'cash_in' THEN amount ELSE -amount END),
    0
  ) INTO v_total
  FROM cashbook_entries
  WHERE user_id = v_user_id AND is_active = true;

  -- Check if a Cash Wallet asset already exists for this user
  SELECT id INTO v_asset_id
  FROM assets
  WHERE user_id = v_user_id
    AND category = 'bank_accounts'
    AND subcategory = 'Cash Wallet'
    AND is_active = true
  LIMIT 1;

  IF v_asset_id IS NOT NULL THEN
    -- Update existing Cash Wallet
    UPDATE assets
    SET current_value = v_total,
        updated_at = NOW()
    WHERE id = v_asset_id;
  ELSE
    -- Create new Cash Wallet asset
    INSERT INTO assets (id, user_id, name, category, subcategory, current_value, is_active, notes)
    VALUES (
      gen_random_uuid()::text,
      v_user_id,
      'Cash Wallet',
      'bank_accounts',
      'Cash Wallet',
      v_total,
      true,
      'Auto-managed from Cashbook Ledger'
    );
  END IF;

  RETURN NULL; -- AFTER trigger return value is ignored
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS trg_sync_cashbook_wallet ON cashbook_entries;
CREATE TRIGGER trg_sync_cashbook_wallet
  AFTER INSERT OR UPDATE OR DELETE ON cashbook_entries
  FOR EACH ROW
  EXECUTE FUNCTION sync_cashbook_to_cash_wallet();


-- ============================================================
-- PART 3: Party Ledger → Assets/Liabilities Auto-Sync Trigger
-- ============================================================
-- When a party_ledger_txn is inserted/updated/deleted, recalculate:
--   - Party Receivables (amount others owe you) → assets table
--   - Party Payables (amount you owe others) → liabilities table
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
  -- Determine user_id
  IF TG_OP = 'DELETE' THEN
    v_user_id := OLD.user_id;
  ELSE
    v_user_id := NEW.user_id;
  END IF;

  -- Calculate total receivables (what others owe you)
  -- "given" type = you gave money, so they owe you
  SELECT COALESCE(SUM(amount), 0) INTO v_receivables
  FROM party_ledger_txns
  WHERE user_id = v_user_id
    AND txn_type = 'given'
    AND is_active = true;

  -- Calculate total payables (what you received/owe)
  -- "received" type = you received money, so you owe them
  SELECT COALESCE(SUM(amount), 0) INTO v_payables
  FROM party_ledger_txns
  WHERE user_id = v_user_id
    AND txn_type = 'received'
    AND is_active = true;

  -- Net receivables (given - received, if positive = others owe you)
  v_receivables := GREATEST(v_receivables - v_payables, 0);
  -- Net payables (received - given, if positive = you owe others)
  v_payables := GREATEST(v_payables - (
    SELECT COALESCE(SUM(amount), 0) FROM party_ledger_txns
    WHERE user_id = v_user_id AND txn_type = 'given' AND is_active = true
  ), 0);

  -- ---- Sync Party Receivables to Assets ----
  SELECT id INTO v_asset_id
  FROM assets
  WHERE user_id = v_user_id
    AND name = 'Party Receivables'
    AND category = 'other'
    AND is_active = true
  LIMIT 1;

  IF v_asset_id IS NOT NULL THEN
    UPDATE assets
    SET current_value = v_receivables, updated_at = NOW()
    WHERE id = v_asset_id;
  ELSIF v_receivables > 0 THEN
    INSERT INTO assets (id, user_id, name, category, subcategory, current_value, is_active, notes)
    VALUES (
      gen_random_uuid()::text,
      v_user_id,
      'Party Receivables',
      'other',
      'Business Ownership',
      v_receivables,
      true,
      'Auto-managed from Party Ledger'
    );
  END IF;

  -- ---- Sync Party Payables to Liabilities ----
  SELECT id INTO v_liability_id
  FROM liabilities
  WHERE user_id = v_user_id
    AND name = 'Party Payables'
    AND type = 'other'
    AND is_active = true
  LIMIT 1;

  IF v_liability_id IS NOT NULL THEN
    UPDATE liabilities
    SET balance = v_payables, updated_at = NOW()
    WHERE id = v_liability_id;
  ELSIF v_payables > 0 THEN
    INSERT INTO liabilities (id, user_id, name, type, liability_type, balance, is_active)
    VALUES (
      gen_random_uuid()::text,
      v_user_id,
      'Party Payables',
      'other',
      'other',
      v_payables,
      true
    );
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS trg_sync_party_balances ON party_ledger_txns;
CREATE TRIGGER trg_sync_party_balances
  AFTER INSERT OR UPDATE OR DELETE ON party_ledger_txns
  FOR EACH ROW
  EXECUTE FUNCTION sync_party_ledger_balances();


-- ============================================================
-- PART 4: EMI Payment Helper RPC
-- ============================================================
-- Marks a single EMI installment as paid: decrements remaining
-- months, reduces remaining amount, and advances next_due_date.
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
  WHERE id = p_emi_id AND user_id = p_user_id AND is_active = true;

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

  -- If EMI is now fully paid, deactivate it
  IF v_remaining_months <= 1 THEN
    UPDATE emis
    SET is_active = false, updated_at = NOW()
    WHERE id = p_emi_id;
  END IF;

  -- Also record a card transaction for the EMI payment
  INSERT INTO cards_transactions (id, user_id, card_id, amount, transaction_type, category, description, transaction_date, is_active)
  VALUES (
    gen_random_uuid()::text,
    p_user_id,
    v_card_id,
    v_monthly_payment,
    'emi',
    'EMI Payment',
    'EMI installment payment',
    CURRENT_DATE,
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- PART 5: Mark Card Bill as Paid RPC
-- ============================================================

CREATE OR REPLACE FUNCTION mark_card_bill_paid(
  p_card_id TEXT,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE cards
  SET total_amount_due = 0,
      remind_before_days = 0,
      updated_at = NOW()
  WHERE id = p_card_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Card not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
