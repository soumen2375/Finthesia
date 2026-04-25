-- ============================================================
-- Finthesia Migration V7: Ledger Settings & Business Info
-- ============================================================
-- Adds business detail columns to the ledgers table so each
-- ledger can store: Registered Number, Business Address,
-- Business Category, Business Type, GSTIN, Bank Account, Staff
-- ============================================================

ALTER TABLE ledgers
  ADD COLUMN IF NOT EXISTS registered_number TEXT,
  ADD COLUMN IF NOT EXISTS business_address  TEXT,
  ADD COLUMN IF NOT EXISTS business_category TEXT,
  ADD COLUMN IF NOT EXISTS business_type     TEXT,
  ADD COLUMN IF NOT EXISTS gstin             TEXT,
  ADD COLUMN IF NOT EXISTS bank_account      TEXT,
  ADD COLUMN IF NOT EXISTS staff_count       INTEGER DEFAULT 0;

-- ============================================================
-- DONE — Migration V7 Summary
-- ============================================================
-- Added 7 new columns to the ledgers table for business info:
--   registered_number, business_address, business_category,
--   business_type, gstin, bank_account, staff_count
-- ============================================================
