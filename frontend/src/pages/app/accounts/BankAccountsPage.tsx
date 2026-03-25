import React, { useEffect, useState } from 'react';
import { useUI } from '@/context/UIContext';
import { api, BankAccount } from '@/services/api';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Landmark, Plus, Pencil, Trash2, Eye, Wallet,
  ChevronRight, Building2, CreditCard, Banknote
} from 'lucide-react';
import { AddBankAccountModal } from '@/components/app/AddBankAccountModal';

const ACCOUNT_TYPE_CONFIG = {
  savings: { label: 'Savings Account', icon: Banknote, color: 'bg-emerald-500', textColor: 'text-emerald-500', bgLight: 'bg-emerald-500/10' },
  current: { label: 'Current Account', icon: Building2, color: 'bg-blue-500', textColor: 'text-blue-500', bgLight: 'bg-blue-500/10' },
  credit_card: { label: 'Credit Card', icon: CreditCard, color: 'bg-purple-500', textColor: 'text-purple-500', bgLight: 'bg-purple-500/10' },
};

export default function BankAccountsPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchBanks = async () => {
    setIsLoading(true);
    try {
      const data = await api.getBanks();
      setBanks(data);
    } catch (error) {
      console.error('Failed to fetch banks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBanks(); }, [refreshKey]);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteBank(id);
      setBanks(prev => prev.filter(b => b.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete bank:', error);
    }
  };

  const totalBalance = banks.reduce((sum, b) => sum + b.balance, 0);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-48 bg-slate-200/20 rounded-[2rem]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-slate-200/20 rounded-[2rem]" />
          <div className="h-48 bg-slate-200/20 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-sans tracking-tight">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1C1C1E] border border-white/5 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl animate-slam">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-1.5 bg-[#27C4E1] text-white text-[10px] font-bold uppercase rounded-full tracking-widest mb-1">
              <Landmark size={14} className="mr-2 stroke-[3]" />
              Bank Accounts
            </div>
            <div className="space-y-1">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
                {formatCurrency(totalBalance, isPrivacyMode)}
              </h1>
              <p className="text-white/50 text-sm font-medium">
                Total across {banks.length} account{banks.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setEditingBank(null); setIsModalOpen(true); }}
            className="h-[4.5rem] w-[4.5rem] bg-white text-black hover:bg-gray-200 rounded-3xl flex items-center justify-center transition-all shadow-xl group"
          >
            <Plus size={32} className="group-hover:rotate-90 transition-transform stroke-[2.5]" />
          </button>
        </div>
      </section>

      {/* Bank Cards Grid */}
      {banks.length === 0 ? (
        <section className="bg-card p-12 rounded-[2.5rem] shadow-xl border border-border text-center animate-slam" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col items-center space-y-4">
            <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center border border-border">
              <Landmark size={32} className="text-border" strokeWidth={2} />
            </div>
            <p className="font-bold text-text-dark text-lg">No bank accounts yet</p>
            <p className="text-text-muted text-sm">Add your first bank account to start tracking your finances.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary mt-4 flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Add Bank Account</span>
            </button>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {banks.map((bank, i) => {
              const config = ACCOUNT_TYPE_CONFIG[bank.account_type] || ACCOUNT_TYPE_CONFIG.savings;
              const Icon = config.icon;
              return (
                <motion.div
                  key={bank.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card p-6 lg:p-8 rounded-[2rem] shadow-xl border border-border hover:-translate-y-1 transition-all group relative"
                >
                  {/* Delete confirmation overlay */}
                  {deleteConfirm === bank.id && (
                    <div className="absolute inset-0 bg-card/95 backdrop-blur-sm rounded-[2rem] z-10 flex flex-col items-center justify-center space-y-4 p-8">
                      <p className="font-bold text-text-dark text-center">Delete this bank account and all its transactions?</p>
                      <div className="flex space-x-3">
                        <button onClick={() => handleDelete(bank.id)} className="px-5 py-2 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors">
                          Delete
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2 bg-background border border-border text-text-dark rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-6">
                    <div className={cn("h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg", config.color, "text-white")}>
                      <Icon size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => { setEditingBank(bank); setIsModalOpen(true); }}
                        className="p-2 rounded-xl bg-background border border-border text-text-muted hover:text-text-dark transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(bank.id)}
                        className="p-2 rounded-xl bg-background border border-border text-text-muted hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 mb-6">
                    <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">{bank.nickname || config.label}</p>
                    <h3 className="text-2xl font-bold tracking-tight text-text-dark">{bank.bank_name}</h3>
                    <div className={cn("inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mt-1", config.bgLight, config.textColor)}>
                      {config.label}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Balance</p>
                      <p className="text-3xl font-bold tracking-tighter text-text-dark">
                        {formatCurrency(bank.balance, isPrivacyMode)}
                      </p>
                      <p className="text-text-muted text-xs mt-1">{bank.currency}</p>
                    </div>
                    <Link
                      to={`/banks/${bank.id}`}
                      className="flex items-center space-x-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all"
                    >
                      <Eye size={16} />
                      <span>Transactions</span>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </section>
      )}

      <AddBankAccountModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingBank(null); }}
        onSaved={fetchBanks}
        editingBank={editingBank}
      />
    </div>
  );
}
