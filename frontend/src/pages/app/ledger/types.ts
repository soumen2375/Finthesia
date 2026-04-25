// =============================================
// Ledger Module Types — Aligned with User Flow
// =============================================

export interface Ledger {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  is_default?: boolean;
  is_active?: boolean;
  registered_number?: string;
  business_address?: string;
  business_category?: string;
  business_type?: string;
  gstin?: string;
  bank_account?: string;
  staff_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UnifiedTransaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description?: string;
  transaction_date: string;
  type: 'income' | 'expense' | string;
  is_active: boolean;
  created_at: string;
  source_table: string;
}

export interface CashEntry {
  id: string;
  user_id: string;
  amount: number;
  entry_type: 'cash_in' | 'cash_out';
  category: string;
  note: string;
  entry_date: string;
  ledger_id?: string;
}

export interface PartyInfo {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  balance: number;
  total_gave: number;
  total_got: number;
  party_type?: 'customer' | 'vendor';
  ledger_id?: string;
  created_at?: string;
  updated_at?: string;
}

// =============================================
// Investment Types
// =============================================

export type InvestmentType =
  | 'stocks'
  | 'mutual_funds'
  | 'etfs'
  | 'index_funds'
  | 'cryptocurrency'
  | 'gold'
  | 'bonds'
  | 'fixed_deposit'
  | 'recurring_deposit'
  | 'startup_equity'
  | 'other';

export type RiskLevel = 'high' | 'medium' | 'low';

export interface Investment {
  id: string;
  user_id?: string;
  name: string;
  investment_type: InvestmentType;
  risk_level?: RiskLevel;
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
  property_type: string;  // residential, commercial, land, plot, warehouse
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
  transaction_type: 'rent_received' | 'emi_paid' | 'maintenance' | 'property_tax' | 'insurance' | 'purchase' | 'sale' | 'renovation';
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
  premium_frequency?: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly';
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
  asset_type?: string;  // gold_physical, silver, art, collectibles, digital, vehicle, jewelry, other
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
// Card Transaction Types (separate from general transactions)
// =============================================

export type CardPaymentMethod = 'upi' | 'card_swipe' | 'online' | 'tap_and_pay' | 'nfc';

export interface CardTransaction {
  id: string;
  user_id?: string;
  card_id: string;
  amount: number;
  merchant?: string;
  category?: string;
  transaction_date: string;
  transaction_type: 'purchase' | 'payment' | 'refund' | 'cashback' | 'fee' | 'emi';
  payment_method?: CardPaymentMethod;
  description?: string;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
}

// =============================================
// Payment Source & Method (for the Add Transaction flow)
// =============================================

export type PaymentSource = 'cash' | 'bank' | 'credit_card';

export type BankPaymentMethod = 'upi' | 'net_banking' | 'imps' | 'neft' | 'rtgs' | 'cheque' | 'debit_card';
