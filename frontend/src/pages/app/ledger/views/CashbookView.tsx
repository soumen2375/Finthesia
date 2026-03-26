import React, { useMemo, useState } from 'react';
import { Search, Calendar, SlidersHorizontal, Download, Edit2, TrendingUp, TrendingDown, Landmark, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { CashEntry } from '../types';

interface CashbookViewProps {
  cashEntries: CashEntry[];
  isLoading: boolean;
  isPrivacyMode: boolean;
  onDeleteEntry: (id: string) => void;
  onAddEntry?: (type: 'cash_in' | 'cash_out') => void;
}

const CATEGORY_STYLES: Record<string, { bg: string, text: string }> = {
  'OPERATIONS': { bg: 'bg-[#daf1f4]', text: 'text-[#0f6466]' },
  'REVENUE': { bg: 'bg-[#0fbcd4]', text: 'text-white' },
  'MARKETING': { bg: 'bg-slate-200', text: 'text-slate-600' },
  'INTERNAL': { bg: 'bg-slate-100', text: 'text-slate-500 border border-slate-200' },
};

export default function CashbookView({
  cashEntries, isLoading, isPrivacyMode, onDeleteEntry, onAddEntry
}: CashbookViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'cash_in' | 'cash_out'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  const totals = useMemo(() => {
    const cashIn = cashEntries.filter(e => e.entry_type === 'cash_in').reduce((s, e) => s + Number(e.amount), 0);
    const cashOut = cashEntries.filter(e => e.entry_type === 'cash_out').reduce((s, e) => s + Number(e.amount), 0);
    return { cashIn, cashOut, net: cashIn - cashOut };
  }, [cashEntries]);

  const allCategories = useMemo(() => {
    const cats = new Set(cashEntries.map(e => e.category.toUpperCase()));
    return ['All Categories', ...Array.from(cats)].sort();
  }, [cashEntries]);

  const filteredEntries = useMemo(() => {
    return cashEntries.filter(e => {
      if (typeFilter !== 'all' && e.entry_type !== typeFilter) return false;
      if (categoryFilter !== 'All Categories' && e.category.toUpperCase() !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return e.category.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [cashEntries, typeFilter, categoryFilter, searchQuery]);

  const getCatStyle = (cat: string) => CATEGORY_STYLES[cat.toUpperCase()] || { bg: 'bg-[#daf1f4]', text: 'text-[#0f6466]' };

  return (
    <div className="space-y-6 animate-fade-in pb-24 font-sans tracking-tight relative min-h-[80vh]">
      
      {/* Top Banner specific to Cashbook in Image 4 */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
         <div className="flex-1 text-center sm:text-left">
           <h1 className="text-3xl font-extrabold font-headline text-text-dark text-center">Cashbook</h1>
         </div>
         <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors shrink-0">
            <Download size={18} /> Export PDF
         </button>
      </div>

      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cash In */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden h-36">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-dark font-bold text-[15px]">Cash In</span>
            <div className="p-1.5 bg-[#eaf8fa] text-[#0fbcd4] rounded-lg">
              <TrendingUp size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-[32px] font-extrabold font-headline text-[#0f6466] tracking-tight">
            {formatCurrency(totals.cashIn, isPrivacyMode)}
          </div>
          <div className="mt-1">
             <span className="text-emerald-500 font-bold text-[11px]">+12%</span>
             <span className="text-text-muted font-medium text-[11px] ml-1">vs last month</span>
          </div>
        </div>

        {/* Cash Out */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden h-36">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-dark font-bold text-[15px]">Cash Out</span>
            <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">
              <TrendingDown size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-[32px] font-extrabold font-headline text-[#de3b40] tracking-tight">
            {formatCurrency(totals.cashOut, isPrivacyMode)}
          </div>
          <div className="mt-1">
             <span className="text-red-500 font-bold text-[11px]">-4%</span>
             <span className="text-text-muted font-medium text-[11px] ml-1">vs last month</span>
          </div>
        </div>

        {/* Net Cash Balance */}
        <div className="bg-[#0f6466] text-white p-6 rounded-2xl shadow-xl shadow-primary/20 relative overflow-hidden h-36 flex flex-col justify-center">
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
      <div className="bg-white rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>
          <div className="flex items-center p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
            {(['all', 'cash_in', 'cash_out'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={cn("px-6 py-1.5 rounded-md text-[13px] font-bold transition-all flex-1 sm:flex-none text-center",
                  typeFilter === t ? "bg-white text-text-dark shadow-sm" : "text-text-muted hover:text-text-dark"
                )}>
                {t === 'all' ? 'All' : t === 'cash_in' ? 'Income' : 'Expense'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg text-sm font-bold py-2 px-4 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm appearance-none cursor-pointer shrink-0">
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-text-dark hover:bg-slate-50 transition-colors shadow-sm shrink-0">
            <Calendar size={16} /> <span className="flex flex-col text-left leading-none"><span className="text-[10px] text-text-muted font-normal">Date Range</span>Last 30 Days</span>
          </button>
          <button className="p-3 bg-white border border-slate-200 text-text-muted rounded-lg hover:bg-slate-50 transition-colors shadow-sm shrink-0">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto w-full border-t-4 border-[#eaf8fa]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted">DATE</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted">DESCRIPTION</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-center">CATEGORY</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-right">AMOUNT</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0fbcd4] mx-auto" /></td></tr>
              ) : filteredEntries.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-text-muted font-medium">No transctions found.</td></tr>
              ) : (
                filteredEntries.map((entry, idx) => {
                  const s = getCatStyle(entry.category);
                  const isIncome = entry.entry_type === 'cash_in';
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-text-dark">Oct {24 - (idx % 4)}, 2023</span>
                          <span className="text-[11px] text-text-muted font-medium">{idx === 0 ? "02:32 PM" : idx === 1 ? "09:15 AM" : "11:00 AM"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 w-1/3">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500">
                            {isIncome ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                          </div>
                          <span className="text-[14px] font-bold text-slate-800">{entry.note || entry.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest", s.bg, s.text)}>
                          {entry.category}
                        </span>
                      </td>
                      <td className={cn("px-6 py-5 text-right font-headline font-bold text-lg", isIncome ? 'text-[#0fbcd4]' : 'text-[#de3b40]')}>
                        {formatCurrency(Math.abs(entry.amount), isPrivacyMode)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button onClick={() => onDeleteEntry(entry.id)} 
                          className="p-2 text-text-dark hover:bg-slate-200 transition-all rounded-full bg-slate-100 mx-auto block">
                          <Edit2 size={16} strokeWidth={2.5}/>
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
          <div className="px-6 py-4 flex flex-wrap items-center justify-between border-t border-border bg-white">
            <span className="text-sm font-medium text-text-muted">Showing 1-10 of 254 entries</span>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button disabled className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 bg-slate-50 disabled:opacity-50">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg bg-[#0f6466] text-white text-[13px] font-bold shadow-md">1</button>
                <button className="w-8 h-8 rounded-lg pb-0.5 text-slate-700 hover:bg-slate-100 text-[13px] font-bold transition-colors">2</button>
                <button className="w-8 h-8 rounded-lg pb-0.5 text-slate-700 hover:bg-slate-100 text-[13px] font-bold transition-colors">3</button>
              </div>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors bg-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Buttons for Cashbook */}
      <div className="fixed bottom-8 right-8 md:bottom-12 md:right-12 flex items-center gap-4 z-40">
        <button 
          onClick={() => onAddEntry?.('cash_out')}
          className="w-14 h-14 bg-[#de3b40] text-white rounded-2xl shadow-xl shadow-[#de3b40]/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <Minus size={28} strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => onAddEntry?.('cash_in')}
          className="w-14 h-14 bg-[#0f6466] text-white rounded-2xl shadow-xl shadow-[#0f6466]/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
