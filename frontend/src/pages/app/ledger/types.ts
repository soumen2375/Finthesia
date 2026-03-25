export interface CashEntry {
  id: string;
  user_id: string;
  amount: number;
  entry_type: 'cash_in' | 'cash_out';
  category: string;
  note: string;
  entry_date: string;
}

export interface PartyInfo {
  party_id: string;
  user_id: string;
  name: string;
  phone?: string;
  balance: number;
  total_gave: number;
  total_got: number;
}
