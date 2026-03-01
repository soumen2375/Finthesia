import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { api, Card, Transaction } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useUI } from '../context/UIContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const categories = [
  'Housing', 'Food', 'Transport', 'Entertainment', 'Utilities', 'Technology', 'Health', 'Income', 'Other'
];

export function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const { showToast } = useToast();
  const { triggerRefresh } = useUI();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getCards().then(setCards);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const amount = Number(formData.get('amount'));
      const category = formData.get('category') as string;
      const type = category === 'Income' ? 'income' : 'expense';
      
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        amount,
        category,
        description: formData.get('description') as string,
        transaction_date: formData.get('date') as string,
        type,
        card_id: formData.get('card_id') as string || undefined,
      };

      await api.addTransaction(newTransaction);
      showToast('Transaction recorded!', 'success');
      triggerRefresh();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to add transaction', error);
      showToast('Failed to record transaction', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Transaction">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input 
          name="amount" 
          label="Amount (₹)" 
          type="number" 
          step="0.01" 
          placeholder="0" 
          required 
          autoFocus
        />
        <Input 
          name="description" 
          label="Description" 
          placeholder="e.g. Grocery Shopping" 
          required 
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 ml-1">Category</label>
            <select 
              name="category" 
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
              required
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input 
            name="date" 
            label="Date" 
            type="date" 
            defaultValue={new Date().toISOString().split('T')[0]} 
            required 
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">Payment Method (Optional)</label>
          <select 
            name="card_id" 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
          >
            <option value="">Cash / Other</option>
            {cards.map(card => (
              <option key={card.id} value={card.id}>{card.name} (****{card.last4})</option>
            ))}
          </select>
        </div>
        <div className="pt-4">
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Record Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
}
