import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { api, BankAccount, BankTransaction } from '../services/api';
import { formatCurrency } from '../lib/formatters';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import {
  ArrowLeft, ArrowUpRight, ArrowDownLeft, Upload,
  Filter, Search, Calendar
} from 'lucide-react';
import { CSVUploadModal } from '../components/CSVUploadModal';

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-orange-500/10 text-orange-500',
  Transport: 'bg-blue-500/10 text-blue-500',
  Shopping: 'bg-pink-500/10 text-pink-500',
  Bills: 'bg-yellow-500/10 text-yellow-500',
  Entertainment: 'bg-purple-500/10 text-purple-500',
  Investment: 'bg-green-500/10 text-green-500',
  Salary: 'bg-emerald-500/10 text-emerald-500',
  Transfer: 'bg-cyan-500/10 text-cyan-500',
  Health: 'bg-red-500/10 text-red-500',
  Education: 'bg-indigo-500/10 text-indigo-500',
  Other: 'bg-gray-500/10 text-gray-500',
};

export default function BankTransactionsPage() {
  const { bankId } = useParams<{ bankId: string }>();
  const { isPrivacyMode } = useUI();
  const [bank, setBankAccount] = useState<BankAccount | null>(null);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'debit' | 'credit'>('all');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [banks, txs] = await Promise.all([
        api.getBanks(),
        api.getBankTransactions(bankId),
      ]);
      setBankAccount(banks.find(b => b.id === bankId) || null);
      setTransactions(txs);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [bankId]);

  const categories = ['all', ...new Set(transactions.map(t => t.category || 'Other'))];

  const filtered = transactions.filter(tx => {
    if (filterCategory !== 'all' && tx.category !== filterCategory) return false;
    if (filterType !== 'all' && tx.transaction_type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (tx.merchant?.toLowerCase().includes(q) || tx.description?.toLowerCase().includes(q) || tx.category?.toLowerCase().includes(q));
    }
    return true;
  });

  const totalDebits = filtered.filter(t => t.transaction_type === 'debit').reduce((s, t) => s + t.amount, 0);
  const totalCredits = filtered.filter(t => t.transaction_type === 'credit').reduce((s, t) => s + t.amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200/20 rounded-[2rem]" />
        <div className="h-96 bg-slate-200/20 rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans tracking-tight">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link to="/banks" className="p-2.5 rounded-xl bg-card border border-border shadow-sm hover:bg-background transition-colors text-text-muted">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-dark">{bank?.bank_name || 'Bank'}</h1>
            <p className="text-text-muted text-sm">{bank?.nickname || bank?.account_type} • Balance: {formatCurrency(bank?.balance || 0, isPrivacyMode)}</p>
          </div>
        </div>
        <button
          onClick={() => setIsCSVModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all"
        >
          <Upload size={18} />
          <span>Import CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slam">
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Transactions</p>
          <p className="text-2xl font-bold text-text-dark mt-1">{filtered.length}</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Money In</p>
          <p className="text-2xl font-bold text-emerald-500 mt-1">+{formatCurrency(totalCredits, isPrivacyMode)}</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Money Out</p>
          <p className="text-2xl font-bold text-red-500 mt-1">-{formatCurrency(totalDebits, isPrivacyMode)}</p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-wrap items-center gap-3 animate-slam" style={{ animationDelay: '0.1s' }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium text-text-dark focus:outline-none"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
          ))}
        </select>
        <div className="flex rounded-xl overflow-hidden border border-border">
          {(['all', 'credit', 'debit'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-4 py-2.5 text-sm font-bold transition-colors",
                filterType === type ? "bg-primary text-white" : "bg-background text-text-muted hover:text-text-dark"
              )}
            >
              {type === 'all' ? 'All' : type === 'credit' ? 'Income' : 'Expense'}
            </button>
          ))}
        </div>
      </section>

      {/* Transaction List */}
      <section className="bg-card rounded-[2rem] shadow-xl border border-border overflow-hidden animate-slam" style={{ animationDelay: '0.2s' }}>
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-text-muted space-y-4">
            <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center border border-border">
              <Calendar size={32} className="text-border" strokeWidth={2} />
            </div>
            <p className="font-bold">No transactions found</p>
            <p className="text-sm">Import a CSV statement or adjust your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                className="flex items-center justify-between p-5 hover:bg-background/50 transition-all group"
              >
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                    tx.transaction_type === 'credit' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {tx.transaction_type === 'credit' ? <ArrowDownLeft size={20} strokeWidth={2.5} /> : <ArrowUpRight size={20} strokeWidth={2.5} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-text-dark truncate">{tx.merchant || tx.description || 'Transaction'}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {tx.category && (
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.Other)}>
                          {tx.category}
                        </span>
                      )}
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{tx.transaction_date}</span>
                      {tx.source === 'csv' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#27C4E1]/10 text-[#27C4E1]">CSV</span>
                      )}
                    </div>
                  </div>
                </div>
                <p className={cn(
                  "font-bold text-lg shrink-0 ml-4",
                  tx.transaction_type === 'credit' ? "text-emerald-500" : "text-text-dark"
                )}>
                  {tx.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount, isPrivacyMode)}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <CSVUploadModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        bankId={bankId || ''}
        onUploaded={fetchData}
      />
    </div>
  );
}
