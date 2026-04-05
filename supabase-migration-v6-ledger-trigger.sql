-- =============================================
-- Finthesia Migration v6: Ledger Cleanup & Auto-provision
-- Run this in your Supabase SQL Editor
-- =============================================

-- 0. Drop the redundant party_balances VIEW (merged into party_ledger_parties)
DROP VIEW IF EXISTS party_balances;

-- 1. Remove any existing triggers/functions if migrating
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_ledger();

-- 2. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_ledger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ledgers (id, user_id, name, description, is_default, is_active, created_at, updated_at)
  VALUES (
    gen_random_uuid()::TEXT,
    NEW.id,
    'My Personal Ledger',
    'Your default personal ledger for all cash and party transactions.',
    true,
    true,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Bind the function to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_ledger();

-- 4. Backfill: Create default ledger for existing users who don't have one
INSERT INTO public.ledgers (id, user_id, name, description, is_default, is_active, created_at, updated_at)
SELECT
  gen_random_uuid()::TEXT,
  u.id,
  'My Personal Ledger',
  'Your default personal ledger for all cash and party transactions.',
  true,
  true,
  NOW(),
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.ledgers l WHERE l.user_id = u.id
);

-- 5. Backfill NULL ledger_id in existing party_ledger_txns
-- Sets ledger_id from the party's ledger_id in party_ledger_parties
UPDATE public.party_ledger_txns t
SET ledger_id = p.ledger_id
FROM public.party_ledger_parties p
WHERE t.party_id = p.id
  AND (t.ledger_id IS NULL OR t.ledger_id = '');
