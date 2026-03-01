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
  name: string;
  card_type: string;
  credit_limit: number;
  current_balance: number;
  payment_due_date?: string;
  apr?: number;
  last4?: string;
  color?: string;
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
  }
};
