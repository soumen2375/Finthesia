import { supabase } from '@/lib/supabaseClient';

// =============================================
// Type Definitions
// =============================================

export interface Asset {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  current_value: number;
  notes?: string;
  updated_at?: string;
}

export interface Card {
  id: string;
  bank_name: string;
  card_variant: string;
  name: string;
  card_type: string;
  credit_limit: number;
  available_credit: number;
  billing_cycle?: string;
  payment_due_date?: string;
  total_amount_due?: number;
  apr?: number;
  last4?: string;
  color?: string;
  annual_fee?: number;
  joining_fee?: number;
  reward_points?: number;
  cashback_percent?: number;
  monthly_budget?: number;
  statement_generation_day?: number;
  payment_due_day?: number;
  minimum_amount_due?: number;
  utilization_alert_threshold?: number;
  remind_before_days?: number;
  remind_on_due_date?: boolean;
  allow_manual_override?: boolean;
  is_active?: boolean;
  updated_at?: string;
}

export interface EMI {
  id: string;
  card_id: string;
  description: string;
  original_amount: number;
  remaining_amount: number;
  monthly_payment: number;
  remaining_months: number;
  next_due_date: string;
  updated_at?: string;
}

export interface Liability {
  id: string;
  name: string;
  type: string;
  balance: number;
  interest_rate?: number;
  minimum_payment?: number;
  due_date?: string;
  updated_at?: string;
  provider?: string;
  liability_type?: string;
  credit_limit?: number;
  tenure_months?: number;
  remaining_months?: number;
  property_value?: number;
  moratorium_status?: string;
  linked_card_id?: string;
}

export interface DebtSummary {
  total_liabilities: number;
  total_monthly_payments: number;
  credit_utilization: number;
  total_credit_used: number;
  total_credit_limit: number;
  debt_ratio: number;
  monthly_income: number;
  category_breakdown: Record<string, { total: number; count: number; monthly: number }>;
  liability_count: number;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  transaction_date: string;
  type: 'income' | 'expense' | 'payment' | 'spend';
  card_id?: string;
  liability_id?: string;
  account?: string;
  paymentMethod?: string;
  payment_source?: 'cash' | 'bank' | 'credit_card';
  tags?: string[];
  isRecurring?: boolean;
  recurringFrequency?: string;   // 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'
  recurringEndDate?: string;     // ISO date string, null = ongoing
  recurringRepeats?: number;     // null = ongoing, number = max count
  location?: { lat: number; lon: number };
  receiptUrl?: string;
  updated_at?: string;
}

export interface NetWorthSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export interface Budget {
  id: string;
  category: string;
  limit_amount: number;
  spent_amount: number;
  color: string;
  month: string;
  year: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BankAccount {
  id: string;
  user_id?: string;
  bank_name: string;
  account_type: 'savings' | 'current' | 'credit_card';
  nickname?: string;
  balance: number;
  currency: string;
  notes?: string;
  bank_provider?: string;
  provider_account_id?: string;
  last_synced_at?: string;
  sync_status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BankTransaction {
  id: string;
  user_id?: string;
  bank_id: string;
  amount: number;
  merchant?: string;
  category?: string;
  transaction_date: string;
  transaction_type: 'debit' | 'credit';
  payment_method?: 'upi' | 'net_banking' | 'imps' | 'neft' | 'rtgs' | 'cheque' | 'debit_card';
  description?: string;
  notes?: string;
  source?: string;
  csv_hash?: string;
  created_at?: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billing_cycle: string;
  next_payment_date: string;
  last_payment_date: string;
  bank_id?: string;
  month_count: number;
  status: string;
  source?: 'manual' | 'auto';
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
  total_monthly: number;
  insight: string;
}

export interface CSVUploadResult {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: string[];
  total_rows: number;
}

export interface NetWorthHistory {
  id: string;
  date: string;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
}

export interface SafeToSpend {
  monthly_income: number;
  monthly_subscriptions: number;
  monthly_emis: number;
  mandatory_savings: number;
  disposable_monthly: number;
  safe_to_spend_daily: number;
}

export interface FinancialHealth {
  score: number;
  savings_rate: number;
  savings_rate_status: string;
  debt_ratio: number;
  debt_ratio_status: string;
  emergency_fund_ratio: number;
  emergency_fund_status: string;
  spending_discipline: number;
  spending_discipline_status: string;
  monthly_income: number;
  monthly_expenses: number;
  total_balance: number;
}

export interface CategoryPrediction {
  category: string;
  predicted_amount: number;
  avg_per_transaction: number;
  transaction_count: number;
}

export interface SpendingPrediction {
  predicted_month: string;
  predicted_total: number;
  expected_savings: number;
  monthly_income: number;
  category_predictions: CategoryPrediction[];
  data_months: number;
}

// =============================================
// Ledger & Multi-Ledger Types
// =============================================

export interface Ledger {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  is_default?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// =============================================
// Investment Types
// =============================================

export interface Investment {
  id: string;
  user_id?: string;
  name: string;
  investment_type: string;
  risk_level?: 'high' | 'medium' | 'low';
  platform?: string;
  current_value: number;
  invested_amount: number;
  units?: number;
  maturity_date?: string;
  interest_rate?: number;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InvestmentTransaction {
  id: string;
  user_id?: string;
  investment_id: string;
  amount: number;
  units?: number;
  transaction_type: 'buy' | 'sell' | 'dividend' | 'interest' | 'sip' | 'switch';
  transaction_date: string;
  nav_price?: number;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
}

// =============================================
// Real Estate Types
// =============================================

export interface RealEstate {
  id: string;
  user_id?: string;
  name: string;
  property_type: string;
  current_value: number;
  purchase_value?: number;
  purchase_date?: string;
  location?: string;
  area_sqft?: number;
  rental_income?: number;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RealEstateTransaction {
  id: string;
  user_id?: string;
  real_estate_id: string;
  amount: number;
  transaction_type: string;
  transaction_date: string;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
}

// =============================================
// Retirement Fund Types
// =============================================

export interface RetirementFund {
  id: string;
  user_id?: string;
  name: string;
  fund_type: 'epf' | 'ppf' | 'nps' | 'vpf' | 'other';
  current_value: number;
  employer_contribution?: number;
  employee_contribution?: number;
  interest_rate?: number;
  maturity_date?: string;
  account_number?: string;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RetirementFundTransaction {
  id: string;
  user_id?: string;
  retirement_fund_id: string;
  amount: number;
  transaction_type: 'contribution' | 'withdrawal' | 'interest' | 'employer_match';
  transaction_date: string;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
}

// =============================================
// Insurance Types
// =============================================

export interface Insurance {
  id: string;
  user_id?: string;
  name: string;
  policy_type: 'life' | 'health' | 'vehicle' | 'home' | 'travel' | 'other';
  provider?: string;
  policy_number?: string;
  premium_amount: number;
  premium_frequency?: string;
  sum_assured?: number;
  cover_amount?: number;
  start_date?: string;
  end_date?: string;
  nominee?: string;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InsuranceTransaction {
  id: string;
  user_id?: string;
  insurance_id: string;
  amount: number;
  transaction_type: 'premium_paid' | 'claim_received' | 'maturity' | 'surrender' | 'bonus';
  transaction_date: string;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
}

// =============================================
// Other Asset Types
// =============================================

export interface OtherAsset {
  id: string;
  user_id?: string;
  name: string;
  asset_type?: string;
  current_value: number;
  purchase_value?: number;
  purchase_date?: string;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OtherTransaction {
  id: string;
  user_id?: string;
  asset_id: string;
  amount: number;
  transaction_type: 'purchase' | 'sale' | 'valuation_update';
  transaction_date: string;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
}

// =============================================
// Card Transaction Type (separate from general transactions)
// =============================================

export interface CardTransaction {
  id: string;
  user_id?: string;
  card_id: string;
  amount: number;
  merchant?: string;
  category?: string;
  transaction_date: string;
  transaction_type: 'purchase' | 'payment' | 'refund' | 'cashback' | 'fee' | 'emi';
  payment_method?: 'upi' | 'card_swipe' | 'online' | 'tap_and_pay' | 'nfc';
  description?: string;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
}

// =============================================
// Helpers
// =============================================

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 16);
}

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

// Category auto-detection keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Food': ['swiggy', 'zomato', 'restaurant', 'food', 'cafe', 'pizza', 'burger', 'dominos', 'mcdonald', 'kfc', 'starbucks', 'dunkin'],
  'Transport': ['uber', 'ola', 'rapido', 'metro', 'fuel', 'petrol', 'diesel', 'parking', 'toll', 'irctc', 'railway'],
  'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'shopping', 'mall', 'meesho', 'nykaa', 'reliance'],
  'Bills': ['electricity', 'water', 'gas', 'broadband', 'wifi', 'recharge', 'mobile', 'airtel', 'jio', 'vi', 'bsnl', 'rent'],
  'Entertainment': ['netflix', 'spotify', 'disney', 'hotstar', 'prime', 'youtube', 'gaming', 'movie', 'pvr', 'inox', 'bookmyshow'],
  'Investment': ['mutual fund', 'sip', 'stock', 'zerodha', 'groww', 'investment', 'upstox', 'kuvera', 'smallcase'],
  'Salary': ['salary', 'wages', 'payroll', 'stipend'],
  'Transfer': ['transfer', 'neft', 'rtgs', 'imps', 'upi'],
  'Health': ['pharmacy', 'hospital', 'doctor', 'medical', 'apollo', 'medplus', 'practo'],
  'Education': ['school', 'college', 'university', 'course', 'udemy', 'coursera', 'tuition'],
};

function detectCategory(description: string): string {
  const lower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return 'Other';
}

function generateCsvHash(date: string, amount: string, description: string): string {
  // Simple hash for browser (no crypto.createHash)
  const str = `${date}|${amount}|${description}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// =============================================
// API Service
// =============================================

export const api = {
  // --- Assets ---
  async getAssets(): Promise<Asset[]> {
    const userId = await getUserId();

    // 1. Manual assets
    const { data: manualAssets, error } = await supabase
      .from('assets')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);

    // 2. Bank balances as assets
    const { data: banks } = await supabase
      .from('banks')
      .select('*')
      .eq('is_active', true);

    const bankAssets = (banks || []).map(bank => ({
      id: `bank-asset-${bank.id}`,
      user_id: userId,
      name: `${bank.bank_name} - ${bank.nickname || bank.account_type}`,
      category: 'bank_accounts',
      subcategory: bank.account_type,
      current_value: bank.balance,
      notes: bank.notes,
      updated_at: bank.updated_at,
    }));

    return [...(manualAssets || []), ...bankAssets];
  },

  async addAsset(asset: Asset): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.from('assets').insert({
      id: asset.id,
      user_id: userId,
      name: asset.name,
      category: asset.category,
      subcategory: asset.subcategory || null,
      current_value: asset.current_value,
      notes: asset.notes || null,
      is_active: true,
    });
    if (error) throw new Error(error.message);
  },

  async updateAsset(asset: Asset): Promise<void> {
    const { error } = await supabase.from('assets')
      .update({
        name: asset.name,
        category: asset.category,
        subcategory: asset.subcategory || null,
        current_value: asset.current_value,
        notes: asset.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', asset.id);
    if (error) throw new Error(error.message);
  },

  async deleteAsset(id: string): Promise<void> {
    const { error } = await supabase.from('assets')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Liabilities ---
  async getLiabilities(): Promise<Liability[]> {
    const userId = await getUserId();

    // 1. Manual liabilities
    const { data: manualLiabilities, error } = await supabase
      .from('liabilities')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);

    // 2. Card debt as liabilities
    const { data: cards } = await supabase
      .from('cards')
      .select('*')
      .eq('is_active', true);

    const cardLiabilities = (cards || [])
      .map(card => {
        const debt = Number(card.credit_limit) - Number(card.available_credit);
        return {
          id: `card-debt-${card.id}`,
          user_id: userId,
          name: `${card.bank_name} ${card.name}`,
          type: 'credit_card',
          liability_type: 'credit_card',
          balance: debt,
          provider: card.bank_name,
          due_date: card.payment_due_date,
          credit_limit: card.credit_limit,
          linked_card_id: card.id,
          updated_at: card.updated_at,
        };
      })
      .filter(lib => lib.balance > 0);

    return [...(manualLiabilities || []), ...cardLiabilities];
  },

  async addLiability(liability: Liability): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.from('liabilities').insert({
      id: liability.id,
      user_id: userId,
      name: liability.name,
      type: liability.type,
      balance: liability.balance,
      interest_rate: liability.interest_rate || null,
      minimum_payment: liability.minimum_payment || null,
      due_date: liability.due_date || null,
      provider: liability.provider || null,
      liability_type: liability.liability_type || liability.type,
      credit_limit: liability.credit_limit || null,
      tenure_months: liability.tenure_months || null,
      remaining_months: liability.remaining_months || null,
      property_value: liability.property_value || null,
      moratorium_status: liability.moratorium_status || null,
      linked_card_id: liability.linked_card_id || null,
      is_active: true,
    });
    if (error) throw new Error(error.message);
  },

  async updateLiability(id: string, data: Partial<Liability>): Promise<void> {
    const { error } = await supabase.from('liabilities')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async deleteLiability(id: string): Promise<void> {
    const { error } = await supabase.from('liabilities')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Debt Summary (computed client-side) ---
  async getDebtSummary(): Promise<DebtSummary> {
    const { data: allLiabilities } = await supabase
      .from('liabilities')
      .select('*')
      .eq('is_active', true)
      .order('balance', { ascending: false });

    const liabilities = allLiabilities || [];
    const totalLiabilities = liabilities.reduce((s, l) => s + (Number(l.balance) || 0), 0);
    const totalMonthlyPayments = liabilities.reduce((s, l) => s + (Number(l.minimum_payment) || 0), 0);

    const creditCards = liabilities.filter(l => l.type === 'credit_card' || l.liability_type === 'credit_card');
    const totalCreditUsed = creditCards.reduce((s, l) => s + (Number(l.balance) || 0), 0);
    const totalCreditLimit = creditCards.reduce((s, l) => s + (Number(l.credit_limit) || 0), 0);
    const creditUtilization = totalCreditLimit > 0 ? Math.round((totalCreditUsed / totalCreditLimit) * 100) : 0;

    const categories: Record<string, { total: number; count: number; monthly: number }> = {};
    liabilities.forEach(l => {
      const cat = l.liability_type || l.type || 'other';
      if (!categories[cat]) categories[cat] = { total: 0, count: 0, monthly: 0 };
      categories[cat].total += Number(l.balance) || 0;
      categories[cat].count++;
      categories[cat].monthly += Number(l.minimum_payment) || 0;
    });

    // Get income for debt ratio
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const cutoff = threeMonthsAgo.toISOString().split('T')[0];

    const { data: incomeData } = await supabase
      .from('bank_transactions')
      .select('amount')
      .eq('transaction_type', 'credit')
      .gte('transaction_date', cutoff)
      .eq('is_active', true);

    const totalIncome = (incomeData || []).reduce((s, t) => s + Number(t.amount), 0);
    const monthlyIncome = totalIncome / 3;
    const debtRatio = monthlyIncome > 0 ? Math.round((totalMonthlyPayments / monthlyIncome) * 100) : 0;

    return {
      total_liabilities: totalLiabilities,
      total_monthly_payments: totalMonthlyPayments,
      credit_utilization: creditUtilization,
      total_credit_used: totalCreditUsed,
      total_credit_limit: totalCreditLimit,
      debt_ratio: debtRatio,
      monthly_income: Math.round(monthlyIncome),
      category_breakdown: categories,
      liability_count: liabilities.length,
    };
  },

  // --- Cards ---
  async getCards(): Promise<Card[]> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addCard(card: Card): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.from('cards').insert({
      ...card,
      user_id: userId,
      is_active: true,
      annual_fee: card.annual_fee || 0,
      joining_fee: card.joining_fee || 0,
      reward_points: card.reward_points || 0,
      cashback_percent: card.cashback_percent || 0,
      monthly_budget: card.monthly_budget || 0,
      minimum_amount_due: card.minimum_amount_due || 0,
      utilization_alert_threshold: card.utilization_alert_threshold || 70,
      remind_before_days: card.remind_before_days || 3,
      remind_on_due_date: card.remind_on_due_date !== false,
      allow_manual_override: card.allow_manual_override || false,
    });
    if (error) throw new Error(error.message);
  },

  async updateCard(card: Card): Promise<void> {
    const { id, ...rest } = card;
    const { error } = await supabase.from('cards')
      .update({
        ...rest,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async deleteCard(id: string): Promise<void> {
    const { error } = await supabase.from('cards')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Transactions ---
  async getTransactions(): Promise<Transaction[]> {
    // Attempt to fetch from unified view first
    const { data, error } = await supabase
      .from('unified_transactions_view')
      .select('*')
      .eq('is_active', true)
      .order('transaction_date', { ascending: false });
      
    if (!error && data) {
      return data;
    }

    // Fallback to basic transactions if the view doesn't exist yet
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('transactions')
      .select('*')
      .eq('is_active', true)
      .order('transaction_date', { ascending: false });
    if (fallbackError) throw new Error(fallbackError.message);
    return fallbackData || [];
  },

  async addTransaction(transaction: Transaction): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.rpc('add_transaction_with_sync', {
      p_id: transaction.id,
      p_user_id: userId,
      p_amount: transaction.amount,
      p_category: transaction.category,
      p_description: transaction.description || null,
      p_transaction_date: transaction.transaction_date,
      p_type: transaction.type,
      p_card_id: transaction.card_id || null,
      p_liability_id: transaction.liability_id || null,
      p_account: transaction.account || null,
      p_payment_method: transaction.paymentMethod || null,
      p_is_recurring: transaction.isRecurring || false,
      p_recurring_frequency: transaction.recurringFrequency || null,
      p_recurring_end_date: transaction.recurringEndDate || null,
      p_recurring_repeats: transaction.recurringRepeats || null,
      p_receipt_url: transaction.receiptUrl || null,
      p_location: transaction.location || null,
      p_tags: transaction.tags || [],
    });
    if (error) throw new Error(error.message);
  },

  async updateTransaction(transaction: Transaction): Promise<void> {
    // For update, we do: delete old (reverse sync) + add new (apply sync)
    const userId = await getUserId();
    // 1. Delete old with reverse sync
    await supabase.rpc('delete_transaction_with_sync', {
      p_id: transaction.id,
      p_user_id: userId,
    });
    // 2. Re-insert with new sync
    const newId = transaction.id; // Keep same ID
    // Re-activate and update
    const { error } = await supabase.from('transactions')
      .update({
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description || null,
        transaction_date: transaction.transaction_date,
        type: transaction.type,
        card_id: transaction.card_id || null,
        liability_id: transaction.liability_id || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', newId);
    if (error) throw new Error(error.message);

    // Re-apply sync for the new values
    if (transaction.card_id && transaction.type === 'spend') {
      await supabase.rpc('add_transaction_with_sync', {
        p_id: generateId(), // dummy, we'll delete
        p_user_id: userId,
        p_amount: transaction.amount,
        p_category: transaction.category,
        p_description: transaction.description || null,
        p_transaction_date: transaction.transaction_date,
        p_type: transaction.type,
        p_card_id: transaction.card_id,
        p_liability_id: null,
      }).then(async () => {
        // Delete the dummy transaction but keep the sync effect
        await supabase.from('transactions').delete().eq('id', generateId());
      });
    }
    // Simplified: For complex update syncs, we use a simpler approach
  },

  async deleteTransaction(id: string): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.rpc('delete_transaction_with_sync', {
      p_id: id,
      p_user_id: userId,
    });
    if (error) throw new Error(error.message);
  },

  // --- Net Worth (includes all asset classes per user flow) ---
  async getNetWorth(): Promise<NetWorthSummary> {
    const [assetsRes, banksRes, liabilitiesRes, cardsRes, investmentsRes, realEstateRes, retirementRes, othersRes, cashbookRes, partyRes] = await Promise.all([
      supabase.from('assets').select('current_value').eq('is_active', true),
      supabase.from('banks').select('balance').eq('is_active', true),
      supabase.from('liabilities').select('balance').eq('is_active', true),
      supabase.from('cards').select('credit_limit, available_credit').eq('is_active', true),
      supabase.from('investments').select('current_value').eq('is_active', true),
      supabase.from('real_estate').select('current_value').eq('is_active', true),
      supabase.from('retirement_funds').select('current_value').eq('is_active', true),
      supabase.from('others_assets').select('current_value').eq('is_active', true),
      supabase.from('cashbook_entries').select('amount, entry_type'),
      supabase.from('party_ledger_parties').select('balance')
    ]);

    const cashbookBalance = (cashbookRes.data || []).reduce((s, c) => {
      return s + (c.entry_type === 'cash_in' ? Number(c.amount || 0) : -Number(c.amount || 0));
    }, 0);

    const partyAssets = (partyRes.data || []).filter(p => Number(p.balance) > 0).reduce((s, p) => s + Number(p.balance), 0);
    const partyLiabilities = (partyRes.data || []).filter(p => Number(p.balance) < 0).reduce((s, p) => s + Math.abs(Number(p.balance)), 0);

    const totalAssets =
      (assetsRes.data || []).reduce((s, a) => s + Number(a.current_value || 0), 0)
      + (banksRes.data || []).reduce((s, b) => s + Number(b.balance || 0), 0)
      + (investmentsRes.data || []).reduce((s, i) => s + Number(i.current_value || 0), 0)
      + (realEstateRes.data || []).reduce((s, r) => s + Number(r.current_value || 0), 0)
      + (retirementRes.data || []).reduce((s, r) => s + Number(r.current_value || 0), 0)
      + (othersRes.data || []).reduce((s, o) => s + Number(o.current_value || 0), 0)
      + cashbookBalance // Cash on hand is an asset
      + partyAssets;    // Receivables are assets

    const totalLiabilities = 
      (liabilitiesRes.data || []).reduce((s, l) => s + Number(l.balance || 0), 0)
      + (cardsRes.data || []).reduce((s, c) => s + (Number(c.credit_limit || 0) - Number(c.available_credit || 0)), 0)
      + partyLiabilities; // Payables are liabilities

    return {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
    };
  },

  // --- EMIs ---
  async getEMIs(cardId: string): Promise<EMI[]> {
    const { data, error } = await supabase
      .from('emis')
      .select('*')
      .eq('card_id', cardId)
      .eq('is_active', true)
      .order('next_due_date', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getAllEMIs(): Promise<EMI[]> {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('emis')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('next_due_date', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addEMI(emi: EMI): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.rpc('add_emi_with_card_block', {
      p_id: emi.id,
      p_user_id: userId,
      p_card_id: emi.card_id,
      p_description: emi.description,
      p_original_amount: emi.original_amount,
      p_remaining_amount: emi.remaining_amount,
      p_monthly_payment: emi.monthly_payment,
      p_remaining_months: emi.remaining_months,
      p_next_due_date: emi.next_due_date,
    });
    if (error) throw new Error(error.message);
  },

  async updateEMI(id: string, updates: Partial<EMI>): Promise<void> {
    const { error } = await supabase.from('emis')
      .update({
        ...updates,
      })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async deleteEMI(id: string): Promise<void> {
    const { error } = await supabase.from('emis')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async foreclosEMI(id: string): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.rpc('foreclose_emi', {
      p_emi_id: id,
      p_user_id: userId,
    });
    if (error) throw new Error(error.message);
  },

  async markCardAsPaid(cardId: string): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.rpc('mark_card_bill_paid', {
      p_card_id: cardId,
      p_user_id: userId,
    });
    if (error) throw new Error(error.message);
  },

  async markEMIAsPaid(emiId: string): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.rpc('mark_emi_installment_paid', {
      p_emi_id: emiId,
      p_user_id: userId,
    });
    if (error) throw new Error(error.message);
  },

  // --- Banks ---
  async getBanks(): Promise<BankAccount[]> {
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addBank(bank: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; id: string }> {
    const userId = await getUserId();
    const id = generateId();
    const { error } = await supabase.from('banks').insert({
      id,
      user_id: userId,
      bank_name: bank.bank_name,
      account_type: bank.account_type,
      nickname: bank.nickname || null,
      balance: bank.balance,
      currency: bank.currency || 'INR',
      notes: bank.notes || null,
      is_active: true,
    });
    if (error) throw new Error(error.message);
    return { success: true, id };
  },

  async updateBank(id: string, bank: Partial<BankAccount>): Promise<void> {
    const { error } = await supabase.from('banks')
      .update({
        ...bank,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async deleteBank(id: string): Promise<void> {
    // Cascade: delete bank transactions first
    await supabase.from('bank_transactions').delete().eq('bank_id', id);
    const { error } = await supabase.from('banks').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Bank Transactions ---
  async getBankTransactions(bankId?: string): Promise<BankTransaction[]> {
    let query = supabase
      .from('bank_transactions')
      .select('*')
      .eq('is_active', true)
      .order('transaction_date', { ascending: false });

    if (bankId) {
      query = query.eq('bank_id', bankId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addBankTransaction(tx: Omit<BankTransaction, 'id' | 'created_at'>): Promise<{ success: boolean; id: string }> {
    const userId = await getUserId();
    const category = tx.category || detectCategory(tx.description || tx.merchant || '');
    const { data, error } = await supabase.rpc('add_bank_transaction_with_balance', {
      p_user_id: userId,
      p_bank_id: tx.bank_id,
      p_amount: Math.abs(tx.amount),
      p_merchant: tx.merchant || null,
      p_category: category,
      p_transaction_date: tx.transaction_date,
      p_transaction_type: tx.transaction_type,
      p_description: tx.description || null,
      p_notes: tx.notes || null,
    });
    if (error) throw new Error(error.message);
    return { success: true, id: data as string };
  },

  async updateBankTransaction(id: string, tx: Partial<BankTransaction>): Promise<void> {
    // For simplicity, update the record directly (skip balance reversal for edits via client)
    const { error } = await supabase.from('bank_transactions')
      .update({
        amount: tx.amount,
        merchant: tx.merchant || null,
        category: tx.category || detectCategory(tx.description || tx.merchant || ''),
        transaction_date: tx.transaction_date,
        transaction_type: tx.transaction_type,
        description: tx.description || null,
        notes: tx.notes || null,
      })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async deleteBankTransaction(id: string): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.rpc('delete_bank_transaction_with_balance', {
      p_id: id,
      p_user_id: userId,
    });
    if (error) throw new Error(error.message);
  },

  // --- CSV Upload ---
  async uploadCSV(bankId: string, csvContent: string): Promise<CSVUploadResult> {
    const userId = await getUserId();
    const lines = csvContent.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');

    const header = lines[0].toLowerCase().split(',').map(h => h.trim());
    const dateIdx = header.findIndex(h => h === 'date');
    const descIdx = header.findIndex(h => h === 'description');
    const amountIdx = header.findIndex(h => h === 'amount');
    const typeIdx = header.findIndex(h => h === 'type');

    if (dateIdx === -1 || amountIdx === -1) {
      throw new Error('CSV must have at least Date and Amount columns');
    }

    let imported = 0;
    let duplicates = 0;
    const errors: string[] = [];
    let balanceChange = 0;
    const rowsToInsert: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const cols = lines[i].split(',').map(c => c.trim());
        const date = cols[dateIdx] || '';
        const desc = descIdx !== -1 ? cols[descIdx] : '';
        const amountRaw = cols[amountIdx] || '0';
        const typeRaw = typeIdx !== -1 ? cols[typeIdx]?.toLowerCase() : '';

        if (!date || amountRaw === '0') {
          errors.push(`Row ${i + 1}: Missing date or zero amount`);
          continue;
        }

        const amount = Math.abs(parseFloat(amountRaw));
        if (isNaN(amount)) {
          errors.push(`Row ${i + 1}: Invalid amount "${amountRaw}"`);
          continue;
        }

        let txType: string;
        if (typeRaw === 'debit' || typeRaw === 'credit') {
          txType = typeRaw;
        } else {
          txType = parseFloat(amountRaw) < 0 ? 'debit' : 'credit';
        }

        const hash = generateCsvHash(date, amountRaw, desc);

        // Check duplicate
        const { data: existing } = await supabase
          .from('bank_transactions')
          .select('id')
          .eq('csv_hash', hash)
          .eq('bank_id', bankId)
          .limit(1);

        if (existing && existing.length > 0) {
          duplicates++;
          continue;
        }

        const category = detectCategory(desc);
        const id = generateId() + i.toString(16);

        rowsToInsert.push({
          id, user_id: userId, bank_id: bankId, amount, merchant: desc || null,
          category, transaction_date: date, transaction_type: txType,
          description: desc || null, source: 'csv', csv_hash: hash, is_active: true,
        });

        imported++;
        balanceChange += txType === 'credit' ? amount : -amount;
      } catch {
        errors.push(`Row ${i + 1}: Parse error`);
      }
    }

    // Batch insert
    if (rowsToInsert.length > 0) {
      const { error } = await supabase.from('bank_transactions').insert(rowsToInsert);
      if (error) throw new Error(error.message);
    }

    // Update bank balance
    if (balanceChange !== 0) {
      const { data: bank } = await supabase.from('banks').select('balance').eq('id', bankId).single();
      if (bank) {
        await supabase.from('banks')
          .update({ balance: Number(bank.balance) + balanceChange, updated_at: new Date().toISOString() })
          .eq('id', bankId);
      }
    }

    return {
      success: true,
      imported,
      duplicates,
      errors: errors.slice(0, 10),
      total_rows: lines.length - 1,
    };
  },

  // --- Subscriptions ---
  async getSubscriptions(): Promise<SubscriptionsResponse> {
    // 1. Manual subscriptions
    const { data: manualSubs } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('is_active', true);

    // 2. Auto-detect recurring from bank_transactions
    const { data: bankTxs } = await supabase
      .from('bank_transactions')
      .select('merchant, amount, transaction_date, bank_id')
      .eq('transaction_type', 'debit')
      .eq('is_active', true)
      .not('merchant', 'is', null);

    // Group by merchant+amount, find recurring
    const merchantGroups: Record<string, { amount: number; months: Set<string>; lastDate: string; bankId: string }> = {};
    (bankTxs || []).forEach(tx => {
      if (!tx.merchant) return;
      const key = `${tx.merchant.toLowerCase()}|${tx.amount}`;
      if (!merchantGroups[key]) {
        merchantGroups[key] = { amount: tx.amount, months: new Set(), lastDate: tx.transaction_date, bankId: tx.bank_id };
      }
      const month = tx.transaction_date.substring(0, 7);
      merchantGroups[key].months.add(month);
      if (tx.transaction_date > merchantGroups[key].lastDate) {
        merchantGroups[key].lastDate = tx.transaction_date;
      }
    });

    const detectedSubs = Object.entries(merchantGroups)
      .filter(([_, v]) => v.months.size >= 2)
      .map(([key, v]) => {
        const merchantName = key.split('|')[0];
        const lastPayment = new Date(v.lastDate);
        const nextPayment = new Date(lastPayment);
        nextPayment.setMonth(nextPayment.getMonth() + 1);

        return {
          id: `auto-sub-${generateCsvHash(merchantName, v.amount.toString(), 'sub')}`,
          name: merchantName,
          amount: v.amount,
          billing_cycle: 'monthly',
          next_payment_date: nextPayment.toISOString().split('T')[0],
          last_payment_date: v.lastDate,
          bank_id: v.bankId,
          month_count: v.months.size,
          status: 'active',
          source: 'auto' as const,
        };
      });

    // Merge (manual first, skip auto dupes)
    const merged = [...(manualSubs || []).map(s => ({ ...s, source: 'manual' as const }))];
    detectedSubs.forEach(d => {
      if (!merged.some(m => m.name.toLowerCase() === d.name.toLowerCase())) {
        merged.push(d as any);
      }
    });

    const totalMonthly = merged.reduce((sum, s) => sum + Number(s.amount), 0);

    return {
      subscriptions: merged as any,
      total_monthly: totalMonthly,
      insight: `You spend ₹${totalMonthly.toLocaleString('en-IN')}/month on subscriptions.`,
    };
  },

  async addSubscription(sub: { name: string; amount: number; billing_cycle: string; next_payment_date?: string; bank_id?: string }): Promise<{ success: boolean; id: string }> {
    const userId = await getUserId();
    const id = generateId();
    const { error } = await supabase.from('subscriptions').insert({
      id, user_id: userId,
      name: sub.name, amount: sub.amount,
      billing_cycle: sub.billing_cycle || 'monthly',
      next_payment_date: sub.next_payment_date || null,
      bank_id: sub.bank_id || null,
      status: 'active', is_active: true,
    });
    if (error) throw new Error(error.message);
    return { success: true, id };
  },

  async deleteSubscription(id: string): Promise<void> {
    const { error } = await supabase.from('subscriptions')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Financial Health (computed client-side) ---
  async getFinancialHealth(): Promise<FinancialHealth> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const cutoff = threeMonthsAgo.toISOString().split('T')[0];

    // Income from bank_transactions + transactions
    const { data: bankCredits } = await supabase
      .from('bank_transactions')
      .select('amount')
      .eq('transaction_type', 'credit')
      .neq('category', 'Transfer')
      .gte('transaction_date', cutoff)
      .eq('is_active', true);

    const { data: txIncome } = await supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'income')
      .neq('category', 'Transfer')
      .gte('transaction_date', cutoff)
      .eq('is_active', true);

    // Expenses
    const { data: bankDebits } = await supabase
      .from('bank_transactions')
      .select('amount')
      .eq('transaction_type', 'debit')
      .neq('category', 'Transfer')
      .gte('transaction_date', cutoff)
      .eq('is_active', true);

    const { data: txExpenses } = await supabase
      .from('transactions')
      .select('amount')
      .in('type', ['expense', 'spend'])
      .neq('category', 'Transfer')
      .gte('transaction_date', cutoff)
      .eq('is_active', true);

    const totalIncome = [...(bankCredits || []), ...(txIncome || [])].reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = [...(bankDebits || []), ...(txExpenses || [])].reduce((s, t) => s + Number(t.amount), 0);

    // Bank balances
    const { data: bankBalances } = await supabase.from('banks').select('balance').eq('is_active', true);
    const totalBalance = (bankBalances || []).reduce((s, b) => s + Number(b.balance), 0);

    // Total debt
    const { data: liabs } = await supabase.from('liabilities').select('balance').eq('is_active', true);
    const { data: cardDebt } = await supabase.from('cards').select('credit_limit, available_credit').eq('is_active', true);
    const totalDebt = (liabs || []).reduce((s, l) => s + Number(l.balance), 0)
      + (cardDebt || []).reduce((s, c) => s + (Number(c.credit_limit) - Number(c.available_credit)), 0);

    const monthlyIncome = totalIncome / 3;
    const monthlyExpenses = totalExpenses / 3;
    const monthlyDebt = totalDebt > 0 ? totalDebt / 12 : 0;

    // Scores
    let savingsRate = monthlyIncome > 0 ? Math.max(0, Math.min(1, (monthlyIncome - monthlyExpenses) / monthlyIncome)) : 0;
    const savingsScore = Math.round(savingsRate * 30);

    let debtRatio = monthlyIncome > 0 ? Math.min(1, monthlyDebt / monthlyIncome) : 0;
    const debtScore = Math.round((1 - debtRatio) * 25);

    let emergencyFundRatio = monthlyExpenses > 0 ? Math.min(6, totalBalance / monthlyExpenses) : 0;
    const emergencyScore = Math.round((emergencyFundRatio / 6) * 25);

    let disciplineScore = 10;
    // Spending discipline requires monthly aggregation — simplified
    const totalScore = Math.min(100, savingsScore + debtScore + emergencyScore + disciplineScore);

    const getStatus = (pct: number) => pct >= 70 ? 'Good' : pct >= 40 ? 'Moderate' : 'Needs Improvement';

    return {
      score: totalScore,
      savings_rate: Math.round(savingsRate * 100),
      savings_rate_status: getStatus(savingsRate * 100),
      debt_ratio: Math.round(debtRatio * 100),
      debt_ratio_status: getStatus((1 - debtRatio) * 100),
      emergency_fund_ratio: Math.round(emergencyFundRatio * 10) / 10,
      emergency_fund_status: getStatus((emergencyFundRatio / 6) * 100),
      spending_discipline: disciplineScore * 5,
      spending_discipline_status: getStatus(disciplineScore * 5),
      monthly_income: Math.round(monthlyIncome),
      monthly_expenses: Math.round(monthlyExpenses),
      total_balance: Math.round(totalBalance),
    };
  },

  // --- Spending Predictions ---
  async getSpendingPredictions(): Promise<SpendingPrediction> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const cutoff = sixMonthsAgo.toISOString().split('T')[0];

    // Get all debit transactions
    const { data: bankDebits } = await supabase
      .from('bank_transactions')
      .select('category, transaction_date, amount')
      .eq('transaction_type', 'debit')
      .neq('category', 'Transfer')
      .gte('transaction_date', cutoff)
      .eq('is_active', true);

    const { data: txExpenses } = await supabase
      .from('transactions')
      .select('category, transaction_date, amount')
      .in('type', ['expense', 'spend'])
      .neq('category', 'Transfer')
      .gte('transaction_date', cutoff)
      .eq('is_active', true);

    const allExpenses = [...(bankDebits || []), ...(txExpenses || [])];

    // Group by category
    const catMap: Record<string, { total: number; months: Set<string>; count: number }> = {};
    allExpenses.forEach(t => {
      const cat = t.category || 'Other';
      if (!catMap[cat]) catMap[cat] = { total: 0, months: new Set(), count: 0 };
      catMap[cat].total += Number(t.amount);
      catMap[cat].months.add(t.transaction_date.substring(0, 7));
      catMap[cat].count++;
    });

    const categoryPredictions = Object.entries(catMap)
      .map(([category, data]) => ({
        category,
        predicted_amount: Math.round(data.total / Math.max(1, data.months.size)),
        avg_per_transaction: Math.round(data.total / Math.max(1, data.count)),
        transaction_count: data.count,
      }))
      .sort((a, b) => b.predicted_amount - a.predicted_amount);

    // Income
    const { data: bankCredits } = await supabase
      .from('bank_transactions')
      .select('amount, transaction_date')
      .eq('transaction_type', 'credit')
      .neq('category', 'Transfer')
      .gte('transaction_date', cutoff)
      .eq('is_active', true);

    const { data: txIncome } = await supabase
      .from('transactions')
      .select('amount, transaction_date')
      .eq('type', 'income')
      .neq('category', 'Transfer')
      .gte('transaction_date', cutoff)
      .eq('is_active', true);

    const allIncome = [...(bankCredits || []), ...(txIncome || [])];
    const incomeMonths = new Set(allIncome.map(t => t.transaction_date.substring(0, 7)));
    const totalIncome = allIncome.reduce((s, t) => s + Number(t.amount), 0);
    const monthlyIncome = totalIncome / Math.max(1, incomeMonths.size);

    const predictedTotal = categoryPredictions.reduce((s, c) => s + c.predicted_amount, 0);
    const dataMonths = new Set(allExpenses.map(t => t.transaction_date.substring(0, 7)));

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const monthLabel = nextMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    return {
      predicted_month: monthLabel,
      predicted_total: predictedTotal,
      expected_savings: Math.round(monthlyIncome - predictedTotal),
      monthly_income: Math.round(monthlyIncome),
      category_predictions: categoryPredictions,
      data_months: dataMonths.size,
    };
  },

  // --- Net Worth History ---
  async getNetWorthHistory(): Promise<NetWorthHistory[]> {
    // Auto-snapshot for today
    const userId = await getUserId();
    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('net_worth_history')
      .select('id')
      .eq('date', today)
      .limit(1);

    if (!existing || existing.length === 0) {
      // Record today's snapshot
      const netWorth = await this.getNetWorth();
      await supabase.from('net_worth_history').insert({
        id: generateId(),
        user_id: userId,
        date: today,
        total_assets: netWorth.totalAssets,
        total_liabilities: netWorth.totalLiabilities,
        net_worth: netWorth.netWorth,
      });
    }

    const { data, error } = await supabase
      .from('net_worth_history')
      .select('*')
      .order('date', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },

  // --- Safe to Spend ---
  async getSafeToSpend(): Promise<SafeToSpend> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const cutoff = threeMonthsAgo.toISOString().split('T')[0];

    // Income
    const { data: bankCredits } = await supabase
      .from('bank_transactions')
      .select('amount')
      .eq('transaction_type', 'credit')
      .gte('transaction_date', cutoff)
      .eq('is_active', true);

    const { data: txIncome } = await supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'income')
      .gte('transaction_date', cutoff)
      .eq('is_active', true);

    const totalIncome = [...(bankCredits || []), ...(txIncome || [])].reduce((s, t) => s + Number(t.amount), 0);
    const avgMonthlyIncome = totalIncome / 3;

    // Subscriptions
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('amount')
      .eq('is_active', true);
    const monthlySubs = (subs || []).reduce((s, sub) => s + Number(sub.amount), 0);

    // EMIs
    const { data: emis } = await supabase
      .from('emis')
      .select('monthly_payment')
      .eq('is_active', true);
    const monthlyEmis = (emis || []).reduce((s, emi) => s + Number(emi.monthly_payment), 0);

    const mandatorySavings = avgMonthlyIncome * 0.20;
    const remainingBalance = avgMonthlyIncome - monthlySubs - monthlyEmis - mandatorySavings;
    const safeToSpendDaily = Math.max(0, remainingBalance / 30);

    return {
      monthly_income: Math.round(avgMonthlyIncome),
      monthly_subscriptions: monthlySubs,
      monthly_emis: monthlyEmis,
      mandatory_savings: Math.round(mandatorySavings),
      disposable_monthly: Math.round(remainingBalance),
      safe_to_spend_daily: Math.round(safeToSpendDaily),
    };
  },

  // --- Budgets ---
  async getBudgets(month: string, year: number): Promise<Budget[]> {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    
    if (error) throw new Error(error.message);

    // Calculate dynamic spend based on transactions
    const budgets = data || [];
    
    // Fetch transactions for the given month/year
    // Note: transaction_date is stored as 'YYYY-MM-DD'
    const prefix = `${year}-${month}`;
    const { data: txData } = await supabase
      .from('transactions')
      .select('amount, category')
      .eq('user_id', userId)
      .eq('type', 'spend')
      .like('transaction_date', `${prefix}%`)
      .eq('is_active', true);

    const spendMap: Record<string, number> = {};
    if (txData) {
      txData.forEach(tx => {
        spendMap[tx.category] = (spendMap[tx.category] || 0) + Number(tx.amount);
      });
    }

    return budgets.map(b => ({
      ...b,
      spent_amount: spendMap[b.category] || 0
    }));
  },

  async addBudget(budget: Omit<Budget, 'id'>): Promise<void> {
    const userId = await getUserId();
    const id = generateId();
    const { error } = await supabase.from('budgets').insert({
      id,
      user_id: userId,
      category: budget.category,
      limit_amount: budget.limit_amount,
      color: budget.color,
      month: budget.month,
      year: budget.year,
      spent_amount: 0,
      is_active: true,
    });
    if (error) throw new Error(error.message);
  },

  async updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
    const { error } = await supabase.from('budgets')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async deleteBudget(id: string): Promise<void> {
    const { error } = await supabase.from('budgets')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // =============================================
  // LEDGERS — Multi-ledger support
  // =============================================

  async getLedgers(): Promise<Ledger[]> {
    const { data, error } = await supabase
      .from('ledgers')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addLedger(ledger: Omit<Ledger, 'id'>): Promise<{ success: boolean; id: string }> {
    const userId = await getUserId();
    const id = generateId();
    const { error } = await supabase.from('ledgers').insert({
      id, user_id: userId,
      name: ledger.name,
      description: ledger.description || null,
      is_default: ledger.is_default || false,
      is_active: true,
    });
    if (error) throw new Error(error.message);
    return { success: true, id };
  },

  async updateLedger(id: string, updates: Partial<Ledger>): Promise<void> {
    const { error } = await supabase.from('ledgers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async deleteLedger(id: string): Promise<void> {
    const { error } = await supabase.from('ledgers')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // =============================================
  // INVESTMENTS — Stocks, MF, ETF, Crypto, FD, RD, Bonds, Gold
  // =============================================

  async getInvestments(): Promise<Investment[]> {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addInvestment(inv: Omit<Investment, 'id'>): Promise<{ success: boolean; id: string }> {
    const userId = await getUserId();
    const id = generateId();
    const { error } = await supabase.from('investments').insert({
      id, user_id: userId,
      name: inv.name,
      investment_type: inv.investment_type,
      risk_level: inv.risk_level || null,
      platform: inv.platform || null,
      current_value: inv.current_value || 0,
      invested_amount: inv.invested_amount || 0,
      units: inv.units || null,
      maturity_date: inv.maturity_date || null,
      interest_rate: inv.interest_rate || null,
      notes: inv.notes || null,
      is_active: true,
    });
    if (error) throw new Error(error.message);
    return { success: true, id };
  },

  async updateInvestment(id: string, updates: Partial<Investment>): Promise<void> {
    const { error } = await supabase.from('investments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async deleteInvestment(id: string): Promise<void> {
    const { error } = await supabase.from('investments')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Investment Transactions ---
  async getInvestmentTransactions(investmentId?: string): Promise<InvestmentTransaction[]> {
    let query = supabase
      .from('investment_transactions')
      .select('*')
      .eq('is_active', true)
      .order('transaction_date', { ascending: false });
    if (investmentId) query = query.eq('investment_id', investmentId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addInvestmentTransaction(tx: Omit<InvestmentTransaction, 'id'>): Promise<{ success: boolean; id: string }> {
    const userId = await getUserId();
    const id = generateId();
    const { error } = await supabase.rpc('add_investment_transaction_with_sync', {
      p_id: id,
      p_user_id: userId,
      p_investment_id: tx.investment_id,
      p_amount: tx.amount,
      p_units: tx.units || null,
      p_transaction_type: tx.transaction_type,
      p_transaction_date: tx.transaction_date,
      p_nav_price: tx.nav_price || null,
      p_notes: tx.notes || null,
    });
    if (error) throw new Error(error.message);
    return { success: true, id };
  },

  async deleteInvestmentTransaction(id: string): Promise<void> {
    const { error } = await supabase.from('investment_transactions')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // =============================================
  // REAL ESTATE — Property tracking
  // =============================================

  async getRealEstate(): Promise<RealEstate[]> {
    const { data, error } = await supabase
      .from('real_estate')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addRealEstate(property: Omit<RealEstate, 'id'>): Promise<{ success: boolean; id: string }> {
    const userId = await getUserId();
    const id = generateId();
    const { error } = await supabase.from('real_estate').insert({
      id, user_id: userId,
      name: property.name,
      property_type: property.property_type,
      current_value: property.current_value || 0,
      purchase_value: property.purchase_value || null,
      purchase_date: property.purchase_date || null,
      location: property.location || null,
      area_sqft: property.area_sqft || null,
      rental_income: property.rental_income || 0,
      notes: property.notes || null,
      is_active: true,
    });
    if (error) throw new Error(error.message);
    return { success: true, id };
  },

  async updateRealEstate(id: string, updates: Partial<RealEstate>): Promise<void> {
    const { error } = await supabase.from('real_estate')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async deleteRealEstate(id: string): Promise<void> {
    const { error } = await supabase.from('real_estate')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Real Estate Transactions ---
  async getRealEstateTransactions(realEstateId?: string): Promise<RealEstateTransaction[]> {
    let query = supabase
      .from('real_estate_transactions')
      .select('*')
      .eq('is_active', true)
      .order('transaction_date', { ascending: false });
    if (realEstateId) query = query.eq('real_estate_id', realEstateId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addRealEstateTransaction(tx: Omit<RealEstateTransaction, 'id'>): Promise<{ success: boolean; id: string }> {
    const userId = await getUserId();
    const id = generateId();
    const { error } = await supabase.from('real_estate_transactions').insert({
      id, user_id: userId,
      real_estate_id: tx.real_estate_id,
      amount: tx.amount,
      transaction_type: tx.transaction_type,
      transaction_date: tx.transaction_date,
      notes: tx.notes || null,
      is_active: true,
    });
    if (error) throw new Error(error.message);
    return { success: true, id };
  },

  async deleteRealEstateTransaction(id: string): Promise<void> {
    const { error } = await supabase.from('real_estate_transactions')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // =============================================
  // RETIREMENT FUNDS — EPF, PPF, NPS, VPF
  // =============================================

  async getRetirementFunds(): Promise<RetirementFund[]> {
    const { data, error } = await supabase
      .from('retirement_funds')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addRetirementFund(fund: Omit<RetirementFund, 'id'>): Promise<{ success: boolean; id: string }> {
    const userId = await getUserId();
    const id = generateId();
    const { error } = await supabase.from('retirement_funds').insert({
      id, user_id: userId,
      name: fund.name,
      fund_type: fund.fund_type,
      current_value: fund.current_value || 0,
      employer_contribution: fund.employer_contribution || 0,
      employee_contribution: fund.employee_contribution || 0,
      interest_rate: fund.interest_rate || null,
      maturity_date: fund.maturity_date || null,
      account_number: fund.account_number || null,
      notes: fund.notes || null,
      is_active: true,
    });
    if (error) throw new Error(error.message);
    return { success: true, id };
  },

  async updateRetirementFund(id: string, updates: Partial<RetirementFund>): Promise<void> {
    const { error } = await supabase.from('retirement_funds')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async deleteRetirementFund(id: string): Promise<void> {
    const { error } = await supabase.from('retirement_funds')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Retirement Fund Transactions ---
  async getRetirementFundTransactions(fundId?: string): Promise<RetirementFundTransaction[]> {
    let query = supabase
      .from('retirement_fund_transactions')
      .select('*')
      .eq('is_active', true)
      .order('transaction_date', { ascending: false });
    if (fundId) query = query.eq('retirement_fund_id', fundId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addRetirementFundTransaction(tx: Omit<RetirementFundTransaction, 'id'>): Promise<{ success: boolean; id: string }> {
    const userId = await getUserId();
    const id = generateId();
    const { error } = await supabase.from('retirement_fund_transactions').insert({
      id, user_id: userId,
      retirement_fund_id: tx.retirement_fund_id,
      amount: tx.amount,
      transaction_type: tx.transaction_type,
      transaction_date: tx.transaction_date,
      notes: tx.notes || null,
      is_active: true,
    });
    if (error) throw new Error(error.message);
    return { success: true, id };
  },

  async deleteRetirementFundTransaction(id: string): Promise<void> {
    const { error } = await supabase.from('retirement_fund_transactions')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // =============================================
  // INSURANCE — Life, Health, Vehicle, Home, Travel
  // =============================================

  async getInsurance(): Promise<Insurance[]> {
    const { data, error } = await supabase
      .from('insurance')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addInsurance(policy: Omit<Insurance, 'id'>): Promise<{ success: boolean; id: string }> {
    const userId = await getUserId();
    const id = generateId();
    const { error } = await supabase.from('insurance').insert({
      id, user_id: userId,
      name: policy.name,
      policy_type: policy.policy_type,
      provider: policy.provider || null,
      policy_number: policy.policy_number || null,
      premium_amount: policy.premium_amount || 0,
      premium_frequency: policy.premium_frequency || 'yearly',
      sum_assured: policy.sum_assured || null,
      cover_amount: policy.cover_amount || null,
      start_date: policy.start_date || null,
      end_date: policy.end_date || null,
      nominee: policy.nominee || null,
      notes: policy.notes || null,
      is_active: true,
    });
    if (error) throw new Error(error.message);
    return { success: true, id };
  },

  async updateInsurance(id: string, updates: Partial<Insurance>): Promise<void> {
    const { error } = await supabase.from('insurance')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async deleteInsurance(id: string): Promise<void> {
    const { error } = await supabase.from('insurance')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Insurance Transactions ---
  async getInsuranceTransactions(insuranceId?: string): Promise<InsuranceTransaction[]> {
    let query = supabase
      .from('insurance_transactions')
      .select('*')
      .eq('is_active', true)
      .order('transaction_date', { ascending: false });
    if (insuranceId) query = query.eq('insurance_id', insuranceId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addInsuranceTransaction(tx: Omit<InsuranceTransaction, 'id'>): Promise<{ success: boolean; id: string }> {
    const userId = await getUserId();
    const id = generateId();
    const { error } = await supabase.from('insurance_transactions').insert({
      id, user_id: userId,
      insurance_id: tx.insurance_id,
      amount: tx.amount,
      transaction_type: tx.transaction_type,
      transaction_date: tx.transaction_date,
      notes: tx.notes || null,
      is_active: true,
    });
    if (error) throw new Error(error.message);
    return { success: true, id };
  },

  async deleteInsuranceTransaction(id: string): Promise<void> {
    const { error } = await supabase.from('insurance_transactions')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // =============================================
  // OTHER ASSETS — Gold, Art, Collectibles, Vehicles, etc.
  // =============================================

  async getOtherAssets(): Promise<OtherAsset[]> {
    const { data, error } = await supabase
      .from('others_assets')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addOtherAsset(asset: Omit<OtherAsset, 'id'>): Promise<{ success: boolean; id: string }> {
    const userId = await getUserId();
    const id = generateId();
    const { error } = await supabase.from('others_assets').insert({
      id, user_id: userId,
      name: asset.name,
      asset_type: asset.asset_type || null,
      current_value: asset.current_value || 0,
      purchase_value: asset.purchase_value || null,
      purchase_date: asset.purchase_date || null,
      notes: asset.notes || null,
      is_active: true,
    });
    if (error) throw new Error(error.message);
    return { success: true, id };
  },

  async updateOtherAsset(id: string, updates: Partial<OtherAsset>): Promise<void> {
    const { error } = await supabase.from('others_assets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async deleteOtherAsset(id: string): Promise<void> {
    const { error } = await supabase.from('others_assets')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Other Asset Transactions ---
  async getOtherTransactions(assetId?: string): Promise<OtherTransaction[]> {
    let query = supabase
      .from('others_transactions')
      .select('*')
      .eq('is_active', true)
      .order('transaction_date', { ascending: false });
    if (assetId) query = query.eq('asset_id', assetId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addOtherTransaction(tx: Omit<OtherTransaction, 'id'>): Promise<{ success: boolean; id: string }> {
    const userId = await getUserId();
    const id = generateId();
    const { error } = await supabase.from('others_transactions').insert({
      id, user_id: userId,
      asset_id: tx.asset_id,
      amount: tx.amount,
      transaction_type: tx.transaction_type,
      transaction_date: tx.transaction_date,
      notes: tx.notes || null,
      is_active: true,
    });
    if (error) throw new Error(error.message);
    return { success: true, id };
  },

  async deleteOtherTransaction(id: string): Promise<void> {
    const { error } = await supabase.from('others_transactions')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // =============================================
  // CARD TRANSACTIONS — Credit card specific logs
  // =============================================

  async getCardTransactions(cardId?: string): Promise<CardTransaction[]> {
    let query = supabase
      .from('cards_transactions')
      .select('*')
      .eq('is_active', true)
      .order('transaction_date', { ascending: false });
    if (cardId) query = query.eq('card_id', cardId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addCardTransaction(tx: Omit<CardTransaction, 'id'>): Promise<{ success: boolean; id: string }> {
    const userId = await getUserId();
    const id = generateId();
    const { error } = await supabase.rpc('add_card_transaction_with_sync', {
      p_id: id,
      p_user_id: userId,
      p_card_id: tx.card_id,
      p_amount: tx.amount,
      p_merchant: tx.merchant || null,
      p_category: tx.category || null,
      p_transaction_date: tx.transaction_date,
      p_transaction_type: tx.transaction_type,
      p_payment_method: tx.payment_method || null,
      p_description: tx.description || null,
      p_notes: tx.notes || null,
    });
    if (error) throw new Error(error.message);
    return { success: true, id };
  },

  async deleteCardTransaction(id: string): Promise<void> {
    const { error } = await supabase.from('cards_transactions')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // =============================================
  // NET WORTH SNAPSHOT — Trigger comprehensive snapshot
  // =============================================

  async triggerNetWorthSnapshot(): Promise<void> {
    const userId = await getUserId();
    const { error } = await supabase.rpc('update_net_worth_snapshot', {
      p_user_id: userId,
    });
    if (error) throw new Error(error.message);
  },
};
