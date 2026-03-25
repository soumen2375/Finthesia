import React, { useMemo, useState } from 'react';
import { Search, Calendar, SlidersHorizontal, MoreVertical, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import type { CashEntry } from '../types';

interface CashbookViewProps {
  cashEntries: CashEntry[];
  isLoading: boolean;
  isPrivacyMode: boolean;
  onDeleteEntry: (id: string) => void;
}

const CATEGORY_STYLES: Record<string, { bg: string, text: string }> = {
  'Sales': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  'Revenue': { bg: 'bg-primary/10', text: 'text-primary' },
  'Marketing': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  'Operations': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  'Payroll': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
};

export default function CashbookView({
  cashEntries, isLoading, isPrivacyMode, onDeleteEntry
}: CashbookViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'cash_in' | 'cash_out'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  // Summary calculations
  const totals = useMemo(() => {
    const cashIn = cashEntries.filter(e => e.entry_type === 'cash_in').reduce((s, e) => s + Number(e.amount), 0);
    const cashOut = cashEntries.filter(e => e.entry_type === 'cash_out').reduce((s, e) => s + Number(e.amount), 0);
    return { cashIn, cashOut, net: cashIn - cashOut };
  }, [cashEntries]);

  // Derived filters
  const allCategories = useMemo(() => {
    const cats = new Set(cashEntries.map(e => e.category));
    return ['All Categories', ...Array.from(cats)].sort();
  }, [cashEntries]);

  const filteredEntries = useMemo(() => {
    return cashEntries.filter(e => {
      if (typeFilter !== 'all' && e.entry_type !== typeFilter) return false;
      if (categoryFilter !== 'All Categories' && e.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return e.category.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [cashEntries, typeFilter, categoryFilter, searchQuery]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: '12:00 PM' // Assuming no time in DB yet, mock it or leave blank
    };
  };

  const getCatStyle = (cat: string) => CATEGORY_STYLES[cat] || { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Cash In */}
        <div className="col-span-4 bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex justify-between items-start mb-4">
            <span className="text-text-muted font-bold text-sm uppercase tracking-wider">Cash In</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            </div>
          </div>
          <div className="text-3xl font-extrabold font-headline text-emerald-500 mb-1">
            {formatCurrency(totals.cashIn, isPrivacyMode)}
          </div>
        </div>

        {/* Cash Out */}
        <div className="col-span-4 bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex justify-between items-start mb-4">
            <span className="text-text-muted font-bold text-sm uppercase tracking-wider">Cash Out</span>
            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
            </div>
          </div>
          <div className="text-3xl font-extrabold font-headline text-text-dark mb-1">
            {formatCurrency(totals.cashOut, isPrivacyMode)}
          </div>
        </div>

        {/* Net Cash Balance */}
        <div className="col-span-4 bg-primary text-white p-6 rounded-2xl shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <span className="text-white/80 font-bold text-sm uppercase tracking-wider">Net Cash Balance</span>
              <div className="p-2 bg-white/20 rounded-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
              </div>
            </div>
            <div className="text-3xl font-extrabold font-headline mb-1">
              {formatCurrency(totals.net, isPrivacyMode)}
            </div>
            <div className="text-xs font-medium text-white/80">Available for operations</div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-border shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm w-64 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-background rounded-xl border border-border">
            {(['all', 'cash_in', 'cash_out'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-colors",
                  typeFilter === t ? "bg-card text-text-dark shadow-sm" : "text-text-muted hover:text-text-dark hover:bg-slate-50/50"
                )}>
                {t === 'all' ? 'All' : t === 'cash_in' ? 'Income' : 'Expense'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="bg-card border border-border rounded-xl text-sm font-bold py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm appearance-none cursor-pointer">
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-bold text-text-muted hover:bg-background transition-colors shadow-sm">
            <Calendar size={16} /> Last 30 Days
          </button>
          <button className="p-2.5 bg-card border border-border text-text-muted rounded-xl hover:bg-background transition-colors shadow-sm">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-background/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Description</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" /></td></tr>
              ) : filteredEntries.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-text-muted font-medium">No transactions found.</td></tr>
              ) : (
                filteredEntries.map((entry) => {
                  const { date, time } = formatDate(entry.entry_date);
                  const s = getCatStyle(entry.category);
                  const isIncome = entry.entry_type === 'cash_in';
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-text-dark">{date}</span>
                          <span className="text-[10px] text-text-muted font-medium">{time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-lg">
                            {isIncome ? '💰' : '💸'}
                          </div>
                          <span className="text-sm font-semibold text-text-dark">{entry.note || entry.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide", s.bg, s.text)}>
                          {entry.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className={cn("flex items-center gap-1.5 font-bold text-xs uppercase", isIncome ? 'text-primary' : 'text-red-500')}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", isIncome ? 'bg-primary' : 'bg-red-500')}></span>
                          {isIncome ? 'Income' : 'Expense'}
                        </div>
                      </td>
                      <td className={cn("px-6 py-5 text-right font-headline font-bold", isIncome ? 'text-primary' : 'text-text-dark')}>
                        {isIncome ? '+' : '-'}{formatCurrency(entry.amount, isPrivacyMode)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => onDeleteEntry(entry.id)} 
                          className="opacity-0 group-hover:opacity-100 p-2 text-text-muted hover:text-red-500 transition-all rounded-lg hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Dummy */}
        {!isLoading && filteredEntries.length > 0 && (
          <div className="px-6 py-4 bg-background/50 flex flex-wrap items-center justify-between border-t border-border">
            <span className="text-xs font-medium text-text-muted">Showing 1-{filteredEntries.length} entries</span>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button disabled className="p-1.5 rounded-lg border border-border text-text-muted disabled:opacity-30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg bg-primary text-white text-xs font-bold">1</button>
              </div>
              <button disabled className="p-1.5 rounded-lg border border-border text-text-muted disabled:opacity-30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
