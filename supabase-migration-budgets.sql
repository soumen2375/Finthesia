-- =============================================
-- Finthesia Budgets Schema Migration
-- Run this in your Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  limit_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  spent_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  color TEXT,
  month TEXT NOT NULL, -- e.g., '2026-03'
  year INTEGER NOT NULL, -- e.g., 2026
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own budgets
CREATE POLICY "Users can view own budgets" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON budgets FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- INDEXES for performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_budgets_month_year ON budgets(user_id, month, year) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(user_id, category);
