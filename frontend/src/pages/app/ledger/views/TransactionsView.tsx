import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabaseClient';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import {
  Search, ArrowUpRight, ArrowDownRight, CreditCard,
  Wallet, Landmark, Building2, TrendingUp, ChevronLeft, ChevronRight,
  Calendar, X, Filter
} from 'lucide-react';
import type { UnifiedTransaction } from '../types';

interface TransactionsViewProps {
  isPrivacyMode: boolean;
}

const SOURCE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  general: { label: 'General', color: 'bg-slate-500', icon: Wallet },
  cashbook: { label: 'Cashbook', color: 'bg-emerald-500', icon: Wallet },
  party_ledger: { label: 'Party', color: 'bg-primary', icon: Building2 },
  bank: { label: 'Bank', color: 'bg-blue-500', icon: Landmark },
  cards: { label: 'Card', color: 'bg-purple-500', icon: CreditCard },
  investments: { label: 'Investment', color: 'bg-amber-500', icon: TrendingUp },
  real_estate: { label: 'Real Estate', color: 'bg-orange-500', icon: Building2 },
  retirement: { label: 'Retirement', color: 'bg-cyan-500', icon: TrendingUp },
  insurance: { label: 'Insurance', color: 'bg-pink-500', icon: CreditCard },
  others_assets: { label: 'Other', color: 'bg-gray-500', icon: Wallet },
};

const ITEMS_PER_PAGE = 20;

type DatePreset = '7d' | '30d' | '90d' | '6m' | '1y' | 'all' | 'custom';

const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: '6m', label: 'Last 6 Months' },
  { id: '1y', label: 'Last Year' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Custom Range' },
];

function getPresetDateRange(preset: DatePreset): { start: string | null; end: string | null } {
  if (preset === 'all' || preset === 'custom') return { start: null, end: null };
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  const startDate = new Date(now);
  if (preset === '7d') startDate.setDate(startDate.getDate() - 7);
  else if (preset === '30d') startDate.setDate(startDate.getDate() - 30);
  else if (preset === '90d') startDate.setDate(startDate.getDate() - 90);
  else if (preset === '6m') startDate.setMonth(startDate.getMonth() - 6);
  else if (preset === '1y') startDate.setFullYear(startDate.getFullYear() - 1);
  return { start: startDate.toISOString().split('T')[0], end };
}

export default function TransactionsView({ isPrivacyMode }: TransactionsViewProps) {
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Date range
  const [datePreset, setDatePreset] = useState<DatePreset>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Category filter
  const [filterCategory, setFilterCategory] = useState('all');

  // Fetch from unified_transactions_view
  const fetchTransactions = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    const { data, error } = await supabase
      .from('unified_transactions_view')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(500);

    if (error) {
      console.error('Error fetching unified transactions:', error);
      setTransactions([]);
    } else {
      setTransactions(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, []);

  // Available categories
  const uniqueCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [transactions]);

  const filtered = useMemo(() => {
    let list = transactions;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t =>
        t.category?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.source_table?.toLowerCase().includes(q)
      );
    }

    if (filterSource !== 'all') {
      list = list.filter(t => t.source_table === filterSource);
    }

    if (filterType !== 'all') {
      list = list.filter(t => t.type === filterType);
    }

    if (filterCategory !== 'all') {
      list = list.filter(t => t.category === filterCategory);
    }

    // Date range filter
    let startDate: string | null = null;
    let endDate: string | null = null;

    if (datePreset === 'custom') {
      startDate = customStartDate || null;
      endDate = customEndDate || null;
    } else if (datePreset !== 'all') {
      const range = getPresetDateRange(datePreset);
      startDate = range.start;
      endDate = range.end;
    }

    if (startDate) {
      list = list.filter(t => t.transaction_date >= startDate!);
    }
    if (endDate) {
      list = list.filter(t => t.transaction_date <= endDate!);
    }

    return list;
  }, [transactions, searchQuery, filterSource, filterType, filterCategory, datePreset, customStartDate, customEndDate]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterSource, filterType, filterCategory, datePreset, customStartDate, customEndDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const totals = useMemo(() => {
    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    return { income, expense, net: income - expense };
  }, [filtered]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const uniqueSources = useMemo(() => {
    const sources = new Set(transactions.map(t => t.source_table));
    return Array.from(sources);
  }, [transactions]);

  const activeFilterCount = [
    filterSource !== 'all',
    filterType !== 'all',
    filterCategory !== 'all',
    datePreset !== '30d',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setFilterSource('all');
    setFilterType('all');
    setFilterCategory('all');
    setDatePreset('30d');
    setCustomStartDate('');
    setCustomEndDate('');
    setSearchQuery('');
  };

  const dateLabel = datePreset === 'custom'
    ? (customStartDate && customEndDate 
        ? `${new Date(customStartDate+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – ${new Date(customEndDate+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'})}`
        : 'Custom')
    : DATE_PRESETS.find(p => p.id === datePreset)?.label || 'All Time';

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-2xl shadow-sm border border-border">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Income</span>
          <p className="text-xl font-extrabold text-primary mt-1">{formatCurrency(totals.income, isPrivacyMode)}</p>
        </div>
        <div className="bg-card p-5 rounded-2xl shadow-sm border border-border">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Expense</span>
          <p className="text-xl font-extrabold text-danger mt-1">{formatCurrency(totals.expense, isPrivacyMode)}</p>
        </div>
        <div className="bg-card p-5 rounded-2xl shadow-sm border border-border">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Net</span>
          <p className={cn("text-xl font-extrabold mt-1", totals.net >= 0 ? "text-primary" : "text-danger")}>
            {totals.net >= 0 ? '+' : ''}{formatCurrency(totals.net, isPrivacyMode)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Type filter */}
        <div className="flex rounded-xl overflow-hidden border border-border bg-card">
          {(['all', 'income', 'expense'] as const).map(type => (
            <button key={type} onClick={() => setFilterType(type)}
              className={cn("px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap",
                filterType === type ? "bg-primary text-white" : "text-text-muted hover:text-text-dark"
              )}>
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Date Range Picker */}
        <div className="relative">
          <button onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-bold text-text-dark hover:bg-background transition-colors shadow-sm"
          >
            <Calendar size={16} className="text-text-muted" />
            <span className="text-xs">{dateLabel}</span>
          </button>

          {showDatePicker && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-card rounded-xl shadow-xl border border-border py-2 z-50">
              {DATE_PRESETS.map(p => (
                <button key={p.id} onClick={() => {
                  setDatePreset(p.id);
                  if (p.id !== 'custom') setShowDatePicker(false);
                }}
                  className={cn("w-full text-left px-4 py-2.5 text-sm font-medium transition-colors",
                    datePreset === p.id ? "bg-primary/10 text-primary font-bold" : "text-text-dark hover:bg-background"
                  )}>
                  {p.label}
                </button>
              ))}
              {datePreset === 'custom' && (
                <div className="px-4 py-3 border-t border-border space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)}
                      className="flex-1 bg-background border border-border rounded-lg text-sm font-bold text-text-dark px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)}
                      className="flex-1 bg-background border border-border rounded-lg text-sm font-bold text-text-dark px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <button onClick={() => setShowDatePicker(false)}
                    className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">
                    Apply
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* More Filters */}
        <button onClick={() => setShowFilterPanel(!showFilterPanel)}
          className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors shadow-sm",
            showFilterPanel || activeFilterCount > 0
              ? "bg-primary/5 border-primary/30 text-primary"
              : "bg-card border-border text-text-muted hover:text-text-dark"
          )}>
          <Filter size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button onClick={clearAllFilters}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-text-muted hover:text-danger transition-colors">
            <X size={12} /> Clear All
          </button>
        )}
      </div>

      {/* Expanded filter panel */}
      {showFilterPanel && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} 
          className="bg-card rounded-2xl border border-border p-4 shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Source filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Source</label>
              <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Sources</option>
                {uniqueSources.map(s => (
                  <option key={s} value={s}>{SOURCE_CONFIG[s]?.label || s}</option>
                ))}
              </select>
            </div>

            {/* Category filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Category</label>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-text-muted">
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Transactions List */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-sm font-medium">No transactions found</div>
        ) : (
          <div className="divide-y divide-border">
            {paginated.map((txn, idx) => {
              const isIncome = txn.type === 'income';
              const cfg = SOURCE_CONFIG[txn.source_table] || SOURCE_CONFIG.general;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={txn.id || `txn-${idx}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.01 }}
                  className="px-5 py-4 flex items-center justify-between hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      isIncome ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"
                    )}>
                      {isIncome ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-text-dark truncate">{txn.description || txn.category || 'Transaction'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded text-white", cfg.color)}>
                          {cfg.label}
                        </span>
                        <span className="text-[10px] text-text-muted font-medium">{txn.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className={cn("text-sm font-bold font-headline", isIncome ? "text-primary" : "text-danger")}>
                      {isIncome ? '+' : '-'}{formatCurrency(Number(txn.amount), isPrivacyMode)}
                    </p>
                    <p className="text-[10px] text-text-muted font-medium">{formatDate(txn.transaction_date)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filtered.length > ITEMS_PER_PAGE && (
          <div className="px-5 py-4 border-t border-border bg-background/30 flex items-center justify-between">
            <p className="text-xs text-text-muted font-medium">
              {Math.min(filtered.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}–{Math.min(filtered.length, currentPage * ITEMS_PER_PAGE)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border hover:bg-card text-text-muted disabled:opacity-30 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-text-muted">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border hover:bg-card text-text-muted disabled:opacity-30 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
