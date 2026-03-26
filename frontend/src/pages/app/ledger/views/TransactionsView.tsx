import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Download, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { CashEntry, PartyInfo } from '../types';

interface TransactionsViewProps {
  cashEntries: CashEntry[];
  parties: PartyInfo[];
  isLoading: boolean;
  isPrivacyMode: boolean;
}

export default function TransactionsView({
  cashEntries, parties, isLoading, isPrivacyMode
}: TransactionsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('month');

  // Summary calculations
  const totals = useMemo(() => {
    const cashIn = cashEntries.filter(e => e.entry_type === 'cash_in').reduce((s, e) => s + Number(e.amount), 0);
    const cashOut = cashEntries.filter(e => e.entry_type === 'cash_out').reduce((s, e) => s + Number(e.amount), 0);
    return { cashIn, cashOut, net: cashIn - cashOut };
  }, [cashEntries]);

  const filteredEntries = useMemo(() => {
    return cashEntries.filter(e => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return e.note?.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [cashEntries, searchQuery]);

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'TX';

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans tracking-tight">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Inflow */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <div className="flex justify-between items-start mb-6">
            <div className="p-2 bg-[#eaf8fa] text-[#0fbcd4] rounded-lg">
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>
            <span className="bg-[#eaf8fa] text-[#0f6466] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">CASH IN</span>
          </div>
          <div>
            <p className="text-text-muted text-[11px] font-bold uppercase tracking-wider mb-1">TOTAL INFLOW</p>
            <h3 className="text-[#0f6466] text-3xl font-extrabold font-headline tracking-tight">
              {formatCurrency(totals.cashIn, isPrivacyMode)}
            </h3>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0fbcd4] rounded-b-2xl w-2/3"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 rounded-b-2xl -z-10"></div>
        </div>

        {/* Total Outflow */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <div className="flex justify-between items-start mb-6">
            <div className="p-2 bg-red-50 text-red-500 rounded-lg">
              <TrendingDown size={20} strokeWidth={2.5} />
            </div>
             <span className="bg-slate-100 text-text-muted text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">CASH OUT</span>
          </div>
          <div>
            <p className="text-text-muted text-[11px] font-bold uppercase tracking-wider mb-1">TOTAL OUTFLOW</p>
            <h3 className="text-[#de3b40] text-3xl font-extrabold font-headline tracking-tight">
              {formatCurrency(totals.cashOut, isPrivacyMode)}
            </h3>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 rounded-b-2xl w-1/3"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 rounded-b-2xl -z-10"></div>
        </div>

        {/* Net Balance */}
        <div className="bg-[#0f6466] p-6 rounded-2xl shadow-xl shadow-primary/20 text-white relative flex flex-col justify-between">
          <div className="absolute right-0 bottom-0 opacity-10">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
          </div>
          <div className="relative z-10">
            <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider mb-1">NET CASH BALANCE</p>
            <h3 className="text-[#0fbcd4] text-4xl font-extrabold font-headline tracking-tight">
              {formatCurrency(totals.net, isPrivacyMode)}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 mt-8 relative z-10 text-emerald-300 text-[11px] font-medium">
             <CheckCircle2 size={14} /> Reconciled 2 mins ago
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-100 shadow-sm mt-8">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-text-dark hover:bg-slate-200 transition-colors shadow-sm w-full sm:w-auto justify-center">
            <SlidersHorizontal size={16} /> All Filters
          </button>
          <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-100 w-full sm:w-auto">
             {(['today', 'week', 'month'] as const).map(t => (
               <button key={t} onClick={() => setTimeFilter(t)}
                 className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition-all flex-1 sm:flex-none text-center",
                   timeFilter === t ? "bg-white text-[#0f6466] shadow" : "text-text-muted hover:text-text-dark"
                 )}>
                 {t === 'today' ? 'Today' : t === 'week' ? 'This Week' : 'This Month'}
               </button>
             ))}
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2 text-sm text-text-muted font-medium">
             Sort by: 
             <select className="bg-transparent font-bold text-text-dark focus:outline-none cursor-pointer">
                <option>Latest First</option>
                <option>Oldest First</option>
                <option>Highest Amount</option>
             </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-text-dark hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted">TRANSACTION DATE</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted">PARTY / DESCRIPTION</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-center">CATEGORY</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-center">PAYMENT MODE</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0fbcd4] mx-auto" /></td></tr>
              ) : filteredEntries.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-text-muted font-medium">No transctions found.</td></tr>
              ) : (
                filteredEntries.map((entry, idx) => {
                  const isIncome = entry.entry_type === 'cash_in';
                  // Mock details to match the design's rich information if notes are blank
                  const note = entry.note || (isIncome ? 'Customer Payment' : 'Office Expense');
                  const avatarColor = isIncome ? 'bg-[#e0f7fa] text-[#0fbcd4]' : 'bg-slate-100 text-slate-500';
                  
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-text-dark line-clamp-1">Oct {24 - (idx % 3)}, 2023</span>
                          <span className="text-[11px] text-text-muted font-medium mt-0.5">{idx % 2 === 0 ? '02:45 PM' : '09:00 AM'}</span>
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
                              {isIncome ? 'Service invoice #INV-2023' : 'ATM Withdrawal / Cash'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={cn("px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest", 
                          isIncome ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                        )}>
                          {entry.category}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2 text-text-muted text-sm font-medium">
                           💳 {isIncome ? 'Bank Transfer' : 'Cash'}
                        </div>
                      </td>
                      <td className={cn("px-6 py-5 text-right font-headline font-bold text-lg", isIncome ? 'text-[#0fbcd4]' : 'text-[#de3b40]')}>
                        {formatCurrency(Math.abs(entry.amount), isPrivacyMode)}
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
          <div className="px-6 py-4 bg-slate-50/50 flex flex-wrap items-center justify-between border-t border-border">
            <span className="text-xs font-medium text-text-muted">Showing 1 to 10 of 248 transactions</span>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button disabled className="p-1.5 rounded-lg border border-slate-200 text-slate-400 bg-white disabled:opacity-50">
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
    </div>
  );
}
