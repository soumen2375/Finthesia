-- =============================================
-- Finthesia V3 Migration: Connectivity Triggers
-- Run this in Supabase SQL Editor
-- This strictly connects bank_transactions, assets, cards, liabilities, etc., 
-- to the net_worth_history automatically so it stays in sync real-time.
-- =============================================

-- Add foreign keys to legacy tables to strictly connect them at the schema level.
ALTER TABLE bank_transactions
  DROP CONSTRAINT IF EXISTS fk_bank_transactions_bank_id;
  
ALTER TABLE bank_transactions
  ADD CONSTRAINT fk_bank_transactions_bank_id 
  FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE;

-- =============================================
-- TRIGGER: Auto-Update Net Worth Snapshot
-- =============================================
-- We create a single trigger that detects changes in the balance/value
-- of our core asset and liability tables, and automatically refreshes 
-- the net worth snapshot for today.

CREATE OR REPLACE FUNCTION trigger_update_net_worth()
RETURNS TRIGGER AS $$
DECLARE
  v_uid UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_uid := OLD.user_id;
  ELSE
    v_uid := NEW.user_id;
  END IF;

  -- Fire the existing calculate function
  PERFORM update_net_worth_snapshot(v_uid);
  
  RETURN NULL; -- AFTER trigger
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Banks Trigger
DROP TRIGGER IF EXISTS tr_update_net_worth_banks ON banks;
CREATE TRIGGER tr_update_net_worth_banks
AFTER INSERT OR UPDATE OF balance OR DELETE ON banks
FOR EACH ROW EXECUTE FUNCTION trigger_update_net_worth();

-- 2. Assets Trigger
DROP TRIGGER IF EXISTS tr_update_net_worth_assets ON assets;
CREATE TRIGGER tr_update_net_worth_assets
AFTER INSERT OR UPDATE OF current_value OR DELETE ON assets
FOR EACH ROW EXECUTE FUNCTION trigger_update_net_worth();

-- 3. Liabilities Trigger
DROP TRIGGER IF EXISTS tr_update_net_worth_liabilities ON liabilities;
CREATE TRIGGER tr_update_net_worth_liabilities
AFTER INSERT OR UPDATE OF balance OR DELETE ON liabilities
FOR EACH ROW EXECUTE FUNCTION trigger_update_net_worth();

-- 4. Cards Trigger
DROP TRIGGER IF EXISTS tr_update_net_worth_cards ON cards;
CREATE TRIGGER tr_update_net_worth_cards
AFTER INSERT OR UPDATE OF available_credit, credit_limit OR DELETE ON cards
FOR EACH ROW EXECUTE FUNCTION trigger_update_net_worth();

-- 5. Investments Trigger
DROP TRIGGER IF EXISTS tr_update_net_worth_investments ON investments;
CREATE TRIGGER tr_update_net_worth_investments
AFTER INSERT OR UPDATE OF current_value OR DELETE ON investments
FOR EACH ROW EXECUTE FUNCTION trigger_update_net_worth();

-- 6. Real Estate Trigger
DROP TRIGGER IF EXISTS tr_update_net_worth_real_estate ON real_estate;
CREATE TRIGGER tr_update_net_worth_real_estate
AFTER INSERT OR UPDATE OF current_value OR DELETE ON real_estate
FOR EACH ROW EXECUTE FUNCTION trigger_update_net_worth();

-- 7. Retirement Funds Trigger
DROP TRIGGER IF EXISTS tr_update_net_worth_retirement_funds ON retirement_funds;
CREATE TRIGGER tr_update_net_worth_retirement_funds
AFTER INSERT OR UPDATE OF current_value OR DELETE ON retirement_funds
FOR EACH ROW EXECUTE FUNCTION trigger_update_net_worth();

-- 8. Other Assets Trigger
DROP TRIGGER IF EXISTS tr_update_net_worth_others_assets ON others_assets;
CREATE TRIGGER tr_update_net_worth_others_assets
AFTER INSERT OR UPDATE OF current_value OR DELETE ON others_assets
FOR EACH ROW EXECUTE FUNCTION trigger_update_net_worth();

-- Done. Now any bank_transaction -> updates banks -> triggers tr_update_net_worth_banks -> updates net_worth_history automatically.
