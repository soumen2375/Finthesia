import React, { useEffect, useState, useMemo } from 'react';
import { useUI } from '@/context/UIContext';
import { supabase } from '@/lib/supabaseClient';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/context/ToastContext';
import {
  Plus, Minus, ArrowUpCircle, ArrowDownCircle,
  Search, Filter, Calendar, Download, ChevronDown,
  BookOpen, TrendingUp, Wallet, X, Check, Edit2, Trash2
} from 'lucide-react';

interface CashEntry {
  id: string;
  user_id: string;
  amount: number;
  entry_type: 'cash_in' | 'cash_out';
  category: string;
  note: string;
  entry_date: string;
  created_at?: string;
}

const CASH_IN_CATEGORIES = [
  'Sales', 'Collection', 'Salary', 'Investment Return',
  'Loan Received', 'Gift', 'Refund', 'Other Income'
];

const CASH_OUT_CATEGORIES = [
  'Purchase', 'Expense', 'Salary Paid', 'Rent', 'Utility',
  'Loan Payment', 'Travel', 'Food', 'Maintenance', 'Other Expense'
];

const CATEGORY_EMOJI: Record<string, string> = {
  'Sales': '🛒', 'Collection': '💰', 'Salary': '💼', 'Investment Return': '📈',
  'Loan Received': '🏦', 'Gift': '🎁', 'Refund': '↩️', 'Other Income': '💵',
  'Purchase': '🛍️', 'Expense': '💸', 'Salary Paid': '👷', 'Rent': '🏠',
  'Utility': '💡', 'Loan Payment': '📋', 'Travel': '✈️', 'Food': '🍽️',
  'Maintenance': '🔧', 'Other Expense': '📌',
};

export default function CashBookPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'cash_in' | 'cash_out'>('cash_in');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'cash_in' | 'cash_out'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editingEntry, setEditingEntry] = useState<CashEntry | null>(null);

  // Form state
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchEntries = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const startDate = `${selectedMonth}-01`;
    const endDate = `${selectedMonth}-31`;

    const { data, error } = await supabase
      .from('cashbook_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist yet, show empty state
      console.error('CashBook fetch error:', error);
      setEntries([]);
    } else {
      setEntries(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchEntries(); }, [selectedMonth, refreshKey]);

  const resetForm = () => {
    setFormAmount('');
    setFormCategory('');
    setFormNote('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setEditingEntry(null);
  };

  const openAdd = (type: 'cash_in' | 'cash_out') => {
    resetForm();
    setAddType(type);
    setFormCategory(type === 'cash_in' ? CASH_IN_CATEGORIES[0] : CASH_OUT_CATEGORIES[0]);
    setShowAddModal(true);
  };

  const openEdit = (entry: CashEntry) => {
    setEditingEntry(entry);
    setAddType(entry.entry_type);
    setFormAmount(entry.amount.toString());
    setFormCategory(entry.category);
    setFormNote(entry.note || '');
    setFormDate(entry.entry_date);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) { showToast('Enter a valid amount', 'error'); return; }
    if (!formCategory) { showToast('Select a category', 'error'); return; }
    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      amount,
      entry_type: addType,
      category: formCategory,
      note: formNote.trim(),
      entry_date: formDate,
    };

    try {
      if (editingEntry) {
        const { error } = await supabase.from('cashbook_entries').update(payload).eq('id', editingEntry.id);
        if (error) throw error;
        showToast('Entry updated', 'success');
      } else {
        const { error } = await supabase.from('cashbook_entries').insert({ ...payload, id: crypto.randomUUID() });
        if (error) throw error;
        showToast(addType === 'cash_in' ? 'Cash in recorded ✓' : 'Cash out recorded ✓', 'success');
      }
      setShowAddModal(false);
      resetForm();
      fetchEntries();
    } catch (e: any) {
      showToast(e.message || 'Failed to save', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    const { error } = await supabase.from('cashbook_entries').delete().eq('id', id);
    if (error) { showToast('Failed to delete', 'error'); return; }
    showToast('Entry deleted', 'success');
    fetchEntries();
  };

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (filterType !== 'all' && e.entry_type !== filterType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return e.category.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [entries, filterType, searchQuery]);

  const totals = useMemo(() => {
    const cashIn = filtered.filter(e => e.entry_type === 'cash_in').reduce((s, e) => s + e.amount, 0);
    const cashOut = filtered.filter(e => e.entry_type === 'cash_out').reduce((s, e) => s + e.amount, 0);
    return { cashIn, cashOut, net: cashIn - cashOut };
  }, [filtered]);

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, CashEntry[]> = {};
    filtered.forEach(e => {
      if (!map[e.entry_date]) map[e.entry_date] = [];
      map[e.entry_date].push(e);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', weekday: 'short' });
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0, 7);
  });

  return (
    <div className="space-y-6 pb-12 font-sans tracking-tight">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C1C1E] to-[#2D2D30] rounded-[2.5rem] p-8 text-white shadow-2xl animate-slam">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-[#27C4E1] rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Cash Book</h1>
                <p className="text-white/50 text-sm">Daily cash flow tracker</p>
              </div>
            </div>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm font-medium text-white focus:outline-none"
            >
              {months.map(m => (
                <option key={m} value={m} className="text-black">
                  {new Date(m + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>

          {/* Balance Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Cash In</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totals.cashIn, isPrivacyMode)}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Cash Out</p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(totals.cashOut, isPrivacyMode)}</p>
            </div>
            <div className="bg-[#27C4E1]/20 border border-[#27C4E1]/30 rounded-2xl p-4 text-center">
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Net Balance</p>
              <p className={`text-2xl font-bold ${totals.net >= 0 ? 'text-[#27C4E1]' : 'text-red-400'}`}>
                {totals.net >= 0 ? '+' : ''}{formatCurrency(totals.net, isPrivacyMode)}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
      </section>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => openAdd('cash_in')}
          className="flex items-center justify-center space-x-3 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/20 transition-colors"
        >
          <div className="h-8 w-8 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus size={20} />
          </div>
          <span>Cash In</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => openAdd('cash_out')}
          className="flex items-center justify-center space-x-3 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/20 transition-colors"
        >
          <div className="h-8 w-8 bg-white/20 rounded-xl flex items-center justify-center">
            <Minus size={20} />
          </div>
          <span>Cash Out</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex rounded-xl overflow-hidden border border-border bg-card">
          {(['all', 'cash_in', 'cash_out'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-4 py-2.5 text-sm font-bold transition-colors whitespace-nowrap",
                filterType === type ? "bg-primary text-white" : "text-text-muted hover:text-text-dark"
              )}
            >
              {type === 'all' ? 'All' : type === 'cash_in' ? 'In' : 'Out'}
            </button>
          ))}
        </div>
      </div>

      {/* Entries grouped by date */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-[2rem] border border-border p-12 text-center">
          <BookOpen size={48} className="mx-auto text-border mb-4" />
          <h3 className="text-xl font-bold text-text-dark mb-2">No entries yet</h3>
          <p className="text-text-muted text-sm">Start adding cash in/out entries to track your daily finances</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, dayEntries]) => {
            const dayIn = dayEntries.filter(e => e.entry_type === 'cash_in').reduce((s, e) => s + e.amount, 0);
            const dayOut = dayEntries.filter(e => e.entry_type === 'cash_out').reduce((s, e) => s + e.amount, 0);
            return (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <h3 className="font-bold text-text-dark">{formatDate(date)}</h3>
                    <span className="text-text-muted text-xs">
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-bold">
                    {dayIn > 0 && <span className="text-emerald-500">+{formatCurrency(dayIn, isPrivacyMode)}</span>}
                    {dayOut > 0 && <span className="text-red-500">-{formatCurrency(dayOut, isPrivacyMode)}</span>}
                  </div>
                </div>

                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  {dayEntries.map((entry, i) => (
                    <motion.div
                      key={entry.id || `cb-${date}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between p-4 hover:bg-background/50 transition-colors group border-b border-border last:border-b-0"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shrink-0",
                          entry.entry_type === 'cash_in' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                        )}>
                          {CATEGORY_EMOJI[entry.category] || '📌'}
                        </div>
                        <div>
                          <p className="font-bold text-text-dark">{entry.category}</p>
                          {entry.note && <p className="text-text-muted text-xs mt-0.5">{entry.note}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <p className={`text-lg font-bold ${entry.entry_type === 'cash_in' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {entry.entry_type === 'cash_in' ? '+' : '-'}{formatCurrency(entry.amount, isPrivacyMode)}
                        </p>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(entry)} className="p-1.5 rounded-lg hover:bg-background text-text-muted hover:text-text-dark transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(entry.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowAddModal(false); resetForm(); }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[2rem] shadow-2xl border-t border-border p-6 space-y-5 max-w-2xl mx-auto"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-dark">
                  {editingEntry ? 'Edit Entry' : addType === 'cash_in' ? '💰 Cash In' : '💸 Cash Out'}
                </h2>
                <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 rounded-xl hover:bg-background text-text-muted">
                  <X size={20} />
                </button>
              </div>

              {/* Type toggle (only for new entry) */}
              {!editingEntry && (
                <div className="flex rounded-xl overflow-hidden border border-border">
                  <button
                    onClick={() => { setAddType('cash_in'); setFormCategory(CASH_IN_CATEGORIES[0]); }}
                    className={cn("flex-1 py-2.5 text-sm font-bold transition-colors", addType === 'cash_in' ? 'bg-emerald-500 text-white' : 'text-text-muted hover:bg-background')}
                  >
                    + Cash In
                  </button>
                  <button
                    onClick={() => { setAddType('cash_out'); setFormCategory(CASH_OUT_CATEGORIES[0]); }}
                    className={cn("flex-1 py-2.5 text-sm font-bold transition-colors", addType === 'cash_out' ? 'bg-red-500 text-white' : 'text-text-muted hover:bg-background')}
                  >
                    - Cash Out
                  </button>
                </div>
              )}

              {/* Amount */}
              <div className="text-center py-2">
                <div className="flex items-center justify-center">
                  <span className={`text-4xl font-black mr-2 ${addType === 'cash_in' ? 'text-emerald-500' : 'text-red-500'}`}>₹</span>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value)}
                    placeholder="0"
                    autoFocus
                    className={`text-5xl font-black bg-transparent focus:outline-none w-40 text-center ${addType === 'cash_in' ? 'text-emerald-500' : 'text-red-500'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1.5">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {(addType === 'cash_in' ? CASH_IN_CATEGORIES : CASH_OUT_CATEGORIES).map(c => (
                      <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1.5">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1.5">Note (optional)</label>
                <input
                  type="text"
                  value={formNote}
                  onChange={e => setFormNote(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving || !formAmount}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-lg text-white transition-all active:scale-95 disabled:opacity-50",
                  addType === 'cash_in' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20' : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20'
                )}
              >
                {isSaving ? 'Saving...' : editingEntry ? 'Update Entry' : `Record ${addType === 'cash_in' ? 'Cash In' : 'Cash Out'}`}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

