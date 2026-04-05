import React, { useMemo, useState } from 'react';
import { Search, Calendar, SlidersHorizontal, Download, Edit2, Trash2, TrendingUp, TrendingDown, Landmark, Plus, Minus, X } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { CashEntry } from '../types';

interface CashbookViewProps {
  cashEntries: CashEntry[];
  isLoading: boolean;
  isPrivacyMode: boolean;
  onDeleteEntry: (id: string) => void;
  onAddEntry?: (type: 'cash_in' | 'cash_out') => void;
  onRefresh?: () => void;
}

const CATEGORY_STYLES: Record<string, { bg: string, text: string }> = {
  'OPERATIONS': { bg: 'bg-primary/10', text: 'text-primary' },
  'REVENUE': { bg: 'bg-secondary', text: 'text-white' },
  'MARKETING': { bg: 'bg-background', text: 'text-text-muted' },
  'INTERNAL': { bg: 'bg-background', text: 'text-text-muted' },
  'SALES': { bg: 'bg-success/10', text: 'text-success' },
  'PURCHASE': { bg: 'bg-warning/10', text: 'text-warning' },
  'EXPENSE': { bg: 'bg-danger/10', text: 'text-danger' },
};

type DateRange = '7d' | '30d' | '90d' | 'all';

export default function CashbookView({
  cashEntries, isLoading, isPrivacyMode, onDeleteEntry, onAddEntry, onRefresh
}: CashbookViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'cash_in' | 'cash_out'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const allCategories = useMemo(() => {
    const cats = new Set(cashEntries.map(e => e.category.toUpperCase()));
    return ['All Categories', ...Array.from(cats)].sort();
  }, [cashEntries]);

  const filteredEntries = useMemo(() => {
    const now = new Date();
    return cashEntries.filter(e => {
      if (typeFilter !== 'all' && e.entry_type !== typeFilter) return false;
      if (categoryFilter !== 'All Categories' && e.category.toUpperCase() !== categoryFilter) return false;
      
      // Date range filter (Issue 4h)
      if (dateRange !== 'all') {
        const entryDate = new Date(e.entry_date + 'T00:00:00');
        const daysAgo = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dateRange === '7d' && daysAgo > 7) return false;
        if (dateRange === '30d' && daysAgo > 30) return false;
        if (dateRange === '90d' && daysAgo > 90) return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return e.category.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [cashEntries, typeFilter, categoryFilter, searchQuery, dateRange]);

  const totals = useMemo(() => {
    const cashIn = filteredEntries.filter(e => e.entry_type === 'cash_in').reduce((s, e) => s + Number(e.amount), 0);
    const cashOut = filteredEntries.filter(e => e.entry_type === 'cash_out').reduce((s, e) => s + Number(e.amount), 0);
    return { cashIn, cashOut, net: cashIn - cashOut };
  }, [filteredEntries]);

  const getCatStyle = (cat: string) => CATEGORY_STYLES[cat.toUpperCase()] || { bg: 'bg-primary/10', text: 'text-primary' };

  // Format actual entry date (Issue 4h fix — was hardcoded)
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24 font-sans tracking-tight relative min-h-[80vh]">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card rounded-2xl p-4 shadow-sm border border-border mb-6">
         <div className="flex-1 text-center sm:text-left">
           <h1 className="text-3xl font-extrabold font-headline text-text-dark text-center">Cashbook</h1>
         </div>
         <button className="flex items-center gap-2 px-6 py-3 bg-background text-text-dark font-bold rounded-xl hover:bg-border/30 transition-colors shrink-0 border border-border">
            <Download size={18} /> Export PDF
         </button>
      </div>

      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cash In */}
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-center relative overflow-hidden h-36">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-dark font-bold text-[15px]">Cash In</span>
            <div className="p-1.5 bg-primary/10 text-secondary rounded-lg">
              <TrendingUp size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-[32px] font-extrabold font-headline text-primary tracking-tight">
            {formatCurrency(totals.cashIn, isPrivacyMode)}
          </div>
          <div className="mt-1">
             <span className="text-success font-bold text-[11px]">+12%</span>
             <span className="text-text-muted font-medium text-[11px] ml-1">vs last month</span>
          </div>
        </div>

        {/* Cash Out */}
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-center relative overflow-hidden h-36">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-dark font-bold text-[15px]">Cash Out</span>
            <div className="p-1.5 bg-danger/10 text-danger rounded-lg">
              <TrendingDown size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-[32px] font-extrabold font-headline text-danger tracking-tight">
            {formatCurrency(totals.cashOut, isPrivacyMode)}
          </div>
          <div className="mt-1">
             <span className="text-danger font-bold text-[11px]">-4%</span>
             <span className="text-text-muted font-medium text-[11px] ml-1">vs last month</span>
          </div>
        </div>

        {/* Net Cash Balance */}
        <div className="bg-primary p-6 rounded-2xl shadow-xl shadow-primary/20 text-white relative overflow-hidden h-36 flex flex-col justify-center">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <span className="text-white/90 font-bold text-[15px]">Net Cash Balance</span>
              <div className="p-2 bg-white/20 rounded-lg">
                <Landmark size={18} strokeWidth={2} />
              </div>
            </div>
            <div className="text-4xl font-extrabold font-headline tracking-tight">
              {formatCurrency(totals.net, isPrivacyMode)}
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <Landmark size={120} />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-4 border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-text-dark focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>
          <div className="flex items-center p-1 bg-background rounded-lg w-full sm:w-auto border border-border">
            {(['all', 'cash_in', 'cash_out'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={cn("px-6 py-1.5 rounded-md text-[13px] font-bold transition-all flex-1 sm:flex-none text-center",
                  typeFilter === t ? "bg-card text-text-dark shadow-sm" : "text-text-muted hover:text-text-dark"
                )}>
                {t === 'all' ? 'All' : t === 'cash_in' ? 'Income' : 'Expense'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="bg-card border border-border rounded-lg text-sm font-bold py-2 px-4 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm appearance-none cursor-pointer shrink-0 text-text-dark">
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          {/* Date Range Filter (Issue 4h) */}
          <div className="relative">
            <button onClick={() => setShowDatePicker(!showDatePicker)} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-bold text-text-dark hover:bg-background transition-colors shadow-sm shrink-0">
              <Calendar size={16} /> <span className="flex flex-col text-left leading-none"><span className="text-[10px] text-text-muted font-normal">Date Range</span>{dateRange === '7d' ? 'Last 7 Days' : dateRange === '30d' ? 'Last 30 Days' : dateRange === '90d' ? 'Last 90 Days' : 'All Time'}</span>
            </button>
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-xl shadow-xl border border-border py-2 z-50">
                {([
                  { id: '7d', label: 'Last 7 Days' },
                  { id: '30d', label: 'Last 30 Days' },
                  { id: '90d', label: 'Last 90 Days' },
                  { id: 'all', label: 'All Time' },
                ] as const).map(option => (
                  <button key={option.id} onClick={() => { setDateRange(option.id); setShowDatePicker(false); }}
                    className={cn("w-full text-left px-4 py-2.5 text-sm font-medium transition-colors", dateRange === option.id ? "bg-primary/10 text-primary font-bold" : "text-text-dark hover:bg-background")}>
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button className="p-3 bg-card border border-border text-text-muted rounded-lg hover:bg-background transition-colors shadow-sm shrink-0">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto w-full border-t-4 border-primary/10">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-background/50 border-b border-border">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted">DATE</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted">DESCRIPTION</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-center">CATEGORY</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-right">AMOUNT</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto" /></td></tr>
              ) : filteredEntries.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-text-muted font-medium">No transactions found.</td></tr>
              ) : (
                filteredEntries.map((entry, idx) => {
                  const s = getCatStyle(entry.category);
                  const isIncome = entry.entry_type === 'cash_in';
                  return (
                    <tr key={entry.id || `cashbook-entry-${idx}`} className="hover:bg-background/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          {/* Issue 4h: Show actual entry date instead of hardcoded */}
                          <span className="text-sm font-bold text-text-dark">{formatDate(entry.entry_date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 w-1/3">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border text-text-muted">
                            {isIncome ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                          </div>
                          <span className="text-[14px] font-bold text-text-dark">{entry.note || entry.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest", s.bg, s.text)}>
                          {entry.category}
                        </span>
                      </td>
                      <td className={cn("px-6 py-5 text-right font-headline font-bold text-lg", isIncome ? 'text-secondary' : 'text-danger')}>
                        {formatCurrency(Math.abs(entry.amount), isPrivacyMode)}
                      </td>
                      {/* Issue 4h: Separate Edit & Delete actions */}
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 text-text-dark hover:bg-primary/10 hover:text-primary transition-all rounded-lg bg-background"
                            title="Edit"
                          >
                            <Edit2 size={14} strokeWidth={2.5}/>
                          </button>
                          <button 
                            onClick={() => onDeleteEntry(entry.id)} 
                            className="p-2 text-text-dark hover:bg-danger/10 hover:text-danger transition-all rounded-lg bg-background"
                            title="Delete"
                          >
                            <Trash2 size={14} strokeWidth={2.5}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredEntries.length > 0 && (
          <div className="px-6 py-4 flex flex-wrap items-center justify-between border-t border-border bg-card">
            <span className="text-sm font-medium text-text-muted">Showing 1-{Math.min(10, filteredEntries.length)} of {filteredEntries.length} entries</span>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button disabled className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-muted bg-background disabled:opacity-50">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg bg-primary text-white text-[13px] font-bold shadow-md">1</button>
                {filteredEntries.length > 10 && <button className="w-8 h-8 rounded-lg pb-0.5 text-text-dark hover:bg-background text-[13px] font-bold transition-colors">2</button>}
              </div>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-dark hover:bg-background transition-colors bg-card">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Buttons for Cashbook */}
      <div className="fixed bottom-20 lg:bottom-8 right-4 md:right-12 flex items-center gap-4 z-40">
        <button 
          onClick={() => onAddEntry?.('cash_out')}
          className="w-14 h-14 bg-danger text-white rounded-2xl shadow-xl shadow-danger/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <Minus size={28} strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => onAddEntry?.('cash_in')}
          className="w-14 h-14 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
