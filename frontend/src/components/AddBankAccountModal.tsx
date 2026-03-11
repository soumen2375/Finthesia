import React, { useState } from 'react';
import { api, BankAccount } from '../services/api';
import { X, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingBank: BankAccount | null;
}

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

export function AddBankAccountModal({ isOpen, onClose, onSaved, editingBank }: Props) {
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState<'savings' | 'current' | 'credit_card'>('savings');
  const [nickname, setNickname] = useState('');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editing
  React.useEffect(() => {
    if (editingBank) {
      setBankName(editingBank.bank_name);
      setAccountType(editingBank.account_type);
      setNickname(editingBank.nickname || '');
      setBalance(editingBank.balance.toString());
      setCurrency(editingBank.currency || 'INR');
      setNotes(editingBank.notes || '');
    } else {
      setBankName('');
      setAccountType('savings');
      setNickname('');
      setBalance('');
      setCurrency('INR');
      setNotes('');
    }
    setError('');
  }, [editingBank, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = {
        bank_name: bankName.trim(),
        account_type: accountType,
        nickname: nickname.trim() || undefined,
        balance: parseFloat(balance),
        currency,
        notes: notes.trim() || undefined,
      };

      if (editingBank) {
        await api.updateBank(editingBank.id, data);
      } else {
        await api.addBank(data);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save bank account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card rounded-[2rem] shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Landmark size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-text-dark">
                    {editingBank ? 'Edit Bank Account' : 'Add Bank Account'}
                  </h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-background text-text-muted transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Bank Name *</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g., HDFC Bank"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Account Type *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['savings', 'current', 'credit_card'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAccountType(type)}
                        className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                          accountType === type
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-text-muted hover:border-primary/50'
                        }`}
                      >
                        {type === 'credit_card' ? 'Credit Card' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Account Nickname</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g., My Primary Account"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Current Balance *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      placeholder="0.00"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="input-field"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes..."
                    className="input-field resize-none h-20"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !bankName.trim() || !balance}
                    className="btn-primary flex-1 py-3 font-bold"
                  >
                    {isSubmitting ? 'Saving...' : editingBank ? 'Update Account' : 'Add Account'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary px-6 py-3"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
