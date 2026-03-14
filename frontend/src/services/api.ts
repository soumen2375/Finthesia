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
  isActive?: boolean;
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
  updated_at?: string;
}

export interface NetWorthSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
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

import { auth } from '../lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${res.status}`);
  }
  return res;
}

export const api = {
  async getAssets(): Promise<Asset[]> {
    const res = await fetchWithAuth('/api/assets');
    return res.json();
  },
  async addAsset(asset: Asset): Promise<void> {
    await fetchWithAuth('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    });
  },
  async updateAsset(asset: Asset): Promise<void> {
    await fetchWithAuth(`/api/assets/${asset.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    });
  },
  async deleteAsset(id: string): Promise<void> {
    await fetchWithAuth(`/api/assets/${id}`, { method: 'DELETE' });
  },
  async getLiabilities(): Promise<Liability[]> {
    const res = await fetchWithAuth('/api/liabilities');
    return res.json();
  },
  async addLiability(liability: Liability): Promise<void> {
    await fetchWithAuth('/api/liabilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(liability),
    });
  },
  async updateLiability(id: string, data: Partial<Liability>): Promise<void> {
    await fetchWithAuth(`/api/liabilities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
  async deleteLiability(id: string): Promise<void> {
    await fetchWithAuth(`/api/liabilities/${id}`, { method: 'DELETE' });
  },
  async getDebtSummary(): Promise<DebtSummary> {
    const res = await fetchWithAuth('/api/debt-summary');
    return res.json();
  },
  async getCards(): Promise<Card[]> {
    const res = await fetchWithAuth('/api/cards');
    return res.json();
  },
  async addCard(card: Card): Promise<void> {
    await fetchWithAuth('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });
  },
  async getTransactions(): Promise<Transaction[]> {
    const res = await fetchWithAuth('/api/transactions');
    return res.json();
  },
  async addTransaction(transaction: Transaction): Promise<void> {
    await fetchWithAuth('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
  },
  async updateTransaction(transaction: Transaction): Promise<void> {
    await fetchWithAuth(`/api/transactions/${transaction.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
  },
  async deleteTransaction(id: string): Promise<void> {
    await fetchWithAuth(`/api/transactions/${id}`, { method: 'DELETE' });
  },
  async getNetWorth(): Promise<NetWorthSummary> {
    const res = await fetchWithAuth('/api/net-worth');
    return res.json();
  },
  async getEMIs(cardId: string): Promise<EMI[]> {
    const res = await fetchWithAuth(`/api/cards/${cardId}/emis`);
    return res.json();
  },
  async addEMI(emi: EMI): Promise<void> {
    await fetchWithAuth('/api/emis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emi),
    });
  },
  async deleteEMI(id: string): Promise<void> {
    await fetchWithAuth(`/api/emis/${id}`, { method: 'DELETE' });
  },
  async updateCard(card: Card): Promise<void> {
    await fetchWithAuth(`/api/cards/${card.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });
  },
  async deleteCard(id: string): Promise<void> {
    await fetchWithAuth(`/api/cards/${id}`, {
      method: 'DELETE',
    });
  },

  // ---- Bank & Financial Intelligence Module ----
  async getBanks(): Promise<BankAccount[]> {
    const res = await fetchWithAuth('/api/banks');
    return res.json();
  },
  async addBank(bank: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; id: string }> {
    const res = await fetchWithAuth('/api/banks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bank),
    });
    return res.json();
  },
  async updateBank(id: string, bank: Partial<BankAccount>): Promise<void> {
    await fetchWithAuth(`/api/banks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bank),
    });
  },
  async deleteBank(id: string): Promise<void> {
    await fetchWithAuth(`/api/banks/${id}`, { method: 'DELETE' });
  },
  async getBankTransactions(bankId?: string): Promise<BankTransaction[]> {
    const url = bankId ? `/api/bank-transactions?bank_id=${bankId}` : '/api/bank-transactions';
    const res = await fetchWithAuth(url);
    return res.json();
  },
  async addBankTransaction(tx: Omit<BankTransaction, 'id' | 'created_at'>): Promise<{ success: boolean; id: string }> {
    const res = await fetchWithAuth('/api/bank-transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    return res.json();
  },
  async uploadCSV(bankId: string, csvContent: string): Promise<CSVUploadResult> {
    const res = await fetchWithAuth('/api/upload-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bank_id: bankId, csv_content: csvContent }),
    });
    return res.json();
  },
  async getSubscriptions(): Promise<SubscriptionsResponse> {
    const res = await fetchWithAuth('/api/subscriptions');
    return res.json();
  },
  async addSubscription(sub: { name: string; amount: number; billing_cycle: string; next_payment_date?: string; bank_id?: string }): Promise<{ success: boolean; id: string }> {
    const res = await fetchWithAuth('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });
    return res.json();
  },
  async deleteSubscription(id: string): Promise<void> {
    await fetchWithAuth(`/api/subscriptions/${id}`, { method: 'DELETE' });
  },
  async getFinancialHealth(): Promise<FinancialHealth> {
    const res = await fetchWithAuth('/api/financial-health');
    return res.json();
  },
  async getSpendingPredictions(): Promise<SpendingPrediction> {
    const res = await fetchWithAuth('/api/spending-predictions');
    return res.json();
  },
  async getNetWorthHistory(): Promise<NetWorthHistory[]> {
    const res = await fetchWithAuth('/api/net-worth/history');
    return res.json();
  },
  async getSafeToSpend(): Promise<SafeToSpend> {
    const res = await fetchWithAuth('/api/safe-to-spend');
    return res.json();
  },
  async foreclosEMI(id: string): Promise<void> {
    await fetchWithAuth(`/api/emis/${id}/foreclose`, { method: 'POST' });
  },
  async updateBankTransaction(id: string, tx: Partial<BankTransaction>): Promise<void> {
    await fetchWithAuth(`/api/bank-transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
  },
  async deleteBankTransaction(id: string): Promise<void> {
    await fetchWithAuth(`/api/bank-transactions/${id}`, { method: 'DELETE' });
  },
};
