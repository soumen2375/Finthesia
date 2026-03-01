export interface Asset {
  id: string;
  name: string;
  category: string;
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
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  transaction_date: string;
  type: 'income' | 'expense';
  card_id?: string;
  updated_at?: string;
}

export interface NetWorthSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export const api = {
  async getAssets(): Promise<Asset[]> {
    const res = await fetch('/api/assets');
    return res.json();
  },
  async addAsset(asset: Asset): Promise<void> {
    await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    });
  },
  async getLiabilities(): Promise<Liability[]> {
    const res = await fetch('/api/liabilities');
    return res.json();
  },
  async addLiability(liability: Liability): Promise<void> {
    await fetch('/api/liabilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(liability),
    });
  },
  async getCards(): Promise<Card[]> {
    const res = await fetch('/api/cards');
    return res.json();
  },
  async addCard(card: Card): Promise<void> {
    await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });
  },
  async getTransactions(): Promise<Transaction[]> {
    const res = await fetch('/api/transactions');
    return res.json();
  },
  async addTransaction(transaction: Transaction): Promise<void> {
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
  },
  async getNetWorth(): Promise<NetWorthSummary> {
    const res = await fetch('/api/net-worth');
    return res.json();
  },
  async getEMIs(cardId: string): Promise<EMI[]> {
    const res = await fetch(`/api/cards/${cardId}/emis`);
    return res.json();
  },
  async addEMI(emi: EMI): Promise<void> {
    await fetch('/api/emis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emi),
    });
  },
  async deleteEMI(id: string): Promise<void> {
    await fetch(`/api/emis/${id}`, { method: 'DELETE' });
  },
  async updateCard(card: Card): Promise<void> {
    await fetch(`/api/cards/${card.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });
  }
};
