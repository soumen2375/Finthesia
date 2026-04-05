import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Download, TrendingUp, TrendingDown, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { CashEntry, PartyInfo } from '../types';

type TimeFilter = 'today' | 'week' | 'month' | 'all';
type SortOption = 'latest' | 'oldest' | 'highest';

interface TransactionsViewProps {
  cashEntries: CashEntry[];
  parties: PartyInfo[];
  isLoading: boolean;
  isPrivacyMode: boolean;
  onDeleteEntry?: (id: string) => void;
  onRefresh?: () => void;
}

export default function TransactionsView({
  cashEntries, parties, isLoading, isPrivacyMode, onDeleteEntry, onRefresh
}: TransactionsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  // Summary calculations
  const totals = useMemo(() => {
    const cashIn = cashEntries.filter(e => e.entry_type === 'cash_in').reduce((s, e) => s + Number(e.amount), 0);
    const cashOut = cashEntries.filter(e => e.entry_type === 'cash_out').reduce((s, e) => s + Number(e.amount), 0);
    return { cashIn, cashOut, net: cashIn - cashOut };
  }, [cashEntries]);

  const filteredEntries = useMemo(() => {
    const now = new Date();
    let result = cashEntries.filter(e => {
      // Time filter (Issue 4g)
      if (timeFilter !== 'all') {
        const entryDate = new Date(e.entry_date + 'T00:00:00');
        const diffDays = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        if (timeFilter === 'today' && diffDays > 0) return false;
        if (timeFilter === 'week' && diffDays > 7) return false;
        if (timeFilter === 'month' && diffDays > 30) return false;
      }

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return e.note?.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      }
      return true;
    });

    // Sort (Issue 4g)
    switch (sortBy) {
      case 'latest':
        result.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());
        break;
      case 'highest':
        result.sort((a, b) => Math.abs(Number(b.amount)) - Math.abs(Number(a.amount)));
        break;
    }

    return result;
  }, [cashEntries, searchQuery, timeFilter, sortBy]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'TX';

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans tracking-tight">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Inflow */}
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border relative">
          <div className="flex justify-between items-start mb-6">
            <div className="p-2 bg-primary/10 text-secondary rounded-lg">
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">CASH IN</span>
          </div>
          <div>
            <p className="text-text-muted text-[11px] font-bold uppercase tracking-wider mb-1">TOTAL INFLOW</p>
            <h3 className="text-primary text-3xl font-extrabold font-headline tracking-tight">
              {formatCurrency(totals.cashIn, isPrivacyMode)}
            </h3>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-b-2xl w-2/3"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-background rounded-b-2xl -z-10"></div>
        </div>

        {/* Total Outflow */}
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border relative">
          <div className="flex justify-between items-start mb-6">
            <div className="p-2 bg-danger/10 text-danger rounded-lg">
              <TrendingDown size={20} strokeWidth={2.5} />
            </div>
             <span className="bg-background text-text-muted text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-border">CASH OUT</span>
          </div>
          <div>
            <p className="text-text-muted text-[11px] font-bold uppercase tracking-wider mb-1">TOTAL OUTFLOW</p>
            <h3 className="text-danger text-3xl font-extrabold font-headline tracking-tight">
              {formatCurrency(totals.cashOut, isPrivacyMode)}
            </h3>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-text-dark rounded-b-2xl w-1/3"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-background rounded-b-2xl -z-10"></div>
        </div>

        {/* Net Balance */}
        <div className="bg-primary p-6 rounded-2xl shadow-xl shadow-primary/20 text-white relative flex flex-col justify-between">
          <div className="absolute right-0 bottom-0 opacity-10">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
          </div>
          <div className="relative z-10">
            <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider mb-1">NET CASH BALANCE</p>
            <h3 className="text-white text-4xl font-extrabold font-headline tracking-tight">
              {formatCurrency(totals.net, isPrivacyMode)}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 mt-8 relative z-10 text-emerald-300 text-[11px] font-medium">
             <CheckCircle2 size={14} /> Reconciled 2 mins ago
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-border shadow-sm mt-8">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm font-bold text-text-dark hover:bg-border/30 transition-colors shadow-sm w-full sm:w-auto justify-center">
            <SlidersHorizontal size={16} /> All Filters
          </button>
          {/* Time Filter — functional (Issue 4g) */}
          <div className="flex items-center bg-background p-1 rounded-lg border border-border w-full sm:w-auto">
             {(['today', 'week', 'month', 'all'] as const).map(t => (
               <button key={t} onClick={() => setTimeFilter(t)}
                 className={cn("px-3 sm:px-4 py-1.5 rounded-md text-sm font-bold transition-all flex-1 sm:flex-none text-center",
                   timeFilter === t ? "bg-card text-primary shadow" : "text-text-muted hover:text-text-dark"
                 )}>
                 {t === 'today' ? 'Today' : t === 'week' ? 'Week' : t === 'month' ? 'Month' : 'All'}
               </button>
             ))}
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          {/* Sort — functional (Issue 4g) */}
          <div className="flex items-center gap-2 text-sm text-text-muted font-medium">
             Sort by: 
             <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)} className="bg-transparent font-bold text-text-dark focus:outline-none cursor-pointer">
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
             </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-bold text-text-dark hover:bg-background transition-colors shadow-sm">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-background/50 border-b border-border">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted">TRANSACTION DATE</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted">PARTY / DESCRIPTION</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-center">CATEGORY</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-center">PAYMENT MODE</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-right">AMOUNT</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-center w-24">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto" /></td></tr>
              ) : filteredEntries.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-text-muted font-medium">No transactions found.</td></tr>
              ) : (
                filteredEntries.map((entry, idx) => {
                  const isIncome = entry.entry_type === 'cash_in';
                  const note = entry.note || (isIncome ? 'Customer Payment' : 'Office Expense');
                  const avatarColor = isIncome ? 'bg-primary/10 text-secondary' : 'bg-background text-text-muted';
                  
                  return (
                    <tr key={entry.id || `txn-${idx}`} className="hover:bg-background transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          {/* Real date (Issue 4g fix) */}
                          <span className="text-sm font-bold text-text-dark line-clamp-1">{formatDate(entry.entry_date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm", avatarColor)}>
                             {getInitials(note)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-text-dark">{note}</span>
                            <span className="text-[12px] text-text-muted truncate max-w-[200px] mt-0.5">
                              {isIncome ? 'Service invoice' : 'Cash Payment'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={cn("px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest", 
                          isIncome ? "bg-success/10 text-success" : "bg-background text-text-muted border border-border"
                        )}>
                          {entry.category}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2 text-text-muted text-sm font-medium">
                           💳 {isIncome ? 'Bank Transfer' : 'Cash'}
                        </div>
                      </td>
                      <td className={cn("px-6 py-5 text-right font-headline font-bold text-lg", isIncome ? 'text-secondary' : 'text-danger')}>
                        {formatCurrency(Math.abs(entry.amount), isPrivacyMode)}
                      </td>
                      {/* Issue 4g: Add Edit/Delete actions */}
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => onDeleteEntry?.(entry.id)} className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={14} />
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
          <div className="px-6 py-4 bg-background/50 flex flex-wrap items-center justify-between border-t border-border">
            <span className="text-xs font-medium text-text-muted">Showing 1 to {Math.min(10, filteredEntries.length)} of {filteredEntries.length} transactions</span>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button disabled className="p-1.5 rounded-lg border border-border text-text-muted bg-card disabled:opacity-50">
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
    </div>
  );
}
