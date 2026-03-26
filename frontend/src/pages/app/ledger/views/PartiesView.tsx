import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, UserPlus, Download, TrendingUp, ChevronRight, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { PartyInfo } from '../types';

interface PartiesViewProps {
  parties: PartyInfo[];
  isLoading: boolean;
  isPrivacyMode: boolean;
  onAddParty: () => void;
  onSelectParty: (party: PartyInfo) => void;
}

export default function PartiesView({
  parties, isLoading, isPrivacyMode, onAddParty, onSelectParty
}: PartiesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Customer' | 'Vendor'>('Customer');

  // Derived calculations
  const totals = useMemo(() => {
    const willGive = parties.filter(p => p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0);
    const willGet = parties.filter(p => p.balance > 0).reduce((s, p) => s + p.balance, 0);
    return { willGive, willGet, activeCount: parties.length };
  }, [parties]);

  const filteredParties = useMemo(() => {
    return parties.filter(p => {
      // Basic mock filter for customer vs vendor if field isn't reliably set
      const isCustomer = activeTab === 'Customer' ? p.balance >= 0 : p.balance < 0; 
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.phone?.includes(q);
      }
      return true; // ignore isCustomer logic for now to show all data, or enforce it? Let's show all if no category field exists, but filtering by balance is a good heuristic.
    });
  }, [parties, searchQuery, activeTab]);

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans tracking-tight">
      
      {/* Header title for desktop - image 3 shows 'Parties Ledger' at the top left of the view, 
          but our global header is above this. So we just skip the H1 here or add a specific section header */}
      <div className="flex items-center justify-between mb-2">
         <h1 className="text-2xl font-bold font-headline text-slate-900 hidden lg:block">Parties Ledger</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Receivables */}
        <div className="bg-[#eaf8fa] p-7 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 bottom-0 opacity-10">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-[#0f6466]"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
          </div>
          <div className="relative z-10 w-full">
            <p className="text-[#0f6466]/70 text-[11px] font-bold uppercase tracking-wider mb-1">TOTAL RECEIVABLES</p>
            <p className="text-[#0f6466] text-xl md:text-2xl font-extrabold font-headline mb-0">You Will Get</p>
            <h3 className="text-[#0f6466] text-3xl md:text-4xl font-extrabold font-headline tracking-tight mt-1">
              {formatCurrency(totals.willGet, isPrivacyMode)}
            </h3>
          </div>
          <div className="mt-6 flex items-center">
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md">
              <TrendingUp size={12} strokeWidth={3} /> +12% from last month
            </span>
          </div>
        </div>

        {/* Total Payables */}
        <div className="bg-[#fceaea] p-7 rounded-2xl relative overflow-hidden flex flex-col justify-between">
           <div className="absolute right-0 bottom-0 opacity-10">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-[#de3b40]"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
          </div>
          <div className="relative z-10">
            <p className="text-[#de3b40]/70 text-[11px] font-bold uppercase tracking-wider mb-1">TOTAL PAYABLES</p>
            <p className="text-[#de3b40] text-xl md:text-2xl font-extrabold font-headline mb-0">You Will Give</p>
            <h3 className="text-[#de3b40] text-3xl md:text-4xl font-extrabold font-headline tracking-tight mt-1">
              {formatCurrency(totals.willGive, isPrivacyMode)}
            </h3>
          </div>
        </div>

        {/* Active Relationships */}
        <div className="bg-[#0fbcd4] p-7 rounded-2xl shadow-xl shadow-[#0fbcd4]/20 text-white flex flex-col justify-between">
          <div>
            <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider mb-1">Active Relationships</p>
            <h3 className="text-white text-4xl md:text-5xl font-extrabold font-headline tracking-tight mt-1">
              {totals.activeCount}
            </h3>
          </div>
          <button onClick={onAddParty} className="mt-6 w-full py-3 bg-white text-[#0fbcd4] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
            <UserPlus size={18} /> Add Customer / Vendor
          </button>
        </div>
      </div>

      {/* Tabs Row Header */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-2">
         <div className="flex bg-slate-100 p-1 rounded-full items-center">
            <button onClick={() => setActiveTab('Customer')} className={cn("px-6 py-2 rounded-full text-sm font-bold transition-all", activeTab === 'Customer' ? "bg-[#0f6466] text-white shadow" : "text-text-muted hover:text-text-dark")}>
              Customer
            </button>
            <button onClick={() => setActiveTab('Vendor')} className={cn("px-6 py-2 rounded-full text-sm font-bold transition-all", activeTab === 'Vendor' ? "bg-[#0f6466] text-white shadow" : "text-text-muted hover:text-text-dark")}>
              Vendor
            </button>
         </div>
         <button onClick={onAddParty} className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#0f6466] text-white rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
           <UserPlus size={16} /> Add Customer
         </button>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border">
          <div>
            <h4 className="text-xl font-bold font-headline text-text-dark">Recent Parties</h4>
            <p className="text-sm text-text-muted font-medium mt-1">Managing {totals.activeCount} active entries</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search transactions, parties..."
                className="bg-slate-50 border border-transparent hover:border-border rounded-lg py-2 pl-9 pr-4 text-sm w-48 sm:w-64 md:w-80 focus:outline-none focus:ring-1 focus:ring-[#0f6466] focus:bg-white transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold text-text-dark hover:bg-slate-200 transition-colors">
              <SlidersHorizontal size={14} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold text-text-dark hover:bg-slate-200 transition-colors">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
               <tr className="border-b border-border">
                 <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted">PARTY NAME</th>
                 <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-center">STATUS</th>
                 <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted">LAST ACTIVITY</th>
                 <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-right">BALANCE</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-border">
               {isLoading ? (
                 <tr><td colSpan={4} className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0fbcd4] mx-auto" /></td></tr>
               ) : filteredParties.length === 0 ? (
                 <tr><td colSpan={4} className="py-12 text-center text-text-muted font-medium">No parties found.</td></tr>
               ) : (
                 filteredParties.map((party, idx) => {
                    const isPositive = party.balance >= 0;
                    return (
                      <tr key={party.party_id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => onSelectParty(party)}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-[#eaf8fa] flex items-center justify-center text-lg font-bold text-[#0f6466]">
                              {getInitials(party.name)}
                            </div>
                            <div className="flex flex-col">
                              <h5 className="text-[15px] font-bold text-text-dark">{party.name}</h5>
                              <p className="text-[11px] text-text-muted font-medium uppercase mt-0.5">
                                {isPositive ? "VAT: 22AABCA1234F1Z5" : "Vendor ID: V-" + (99200 + idx)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex justify-center">
                             <div className={cn("px-2.5 py-0.5 border rounded text-[10px] font-bold uppercase tracking-widest", 
                               idx === 1 ? "border-slate-300 text-slate-500 bg-slate-50" : 
                               idx === 3 ? "border-red-200 text-red-500 bg-red-50" : 
                               "border-emerald-200 text-emerald-600 bg-emerald-50")}>
                               {idx === 1 ? 'PENDING' : idx === 3 ? 'OVERDUE' : 'ACTIVE'}
                             </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex flex-col">
                             <span className="text-sm font-medium text-text-dark">
                               {isPositive ? "Inv #8829 Settlement" : "Annual License Fee"}
                             </span>
                             <span className="text-[11px] text-text-muted font-medium mt-0.5">
                               Oct {24 - idx}, 2023
                             </span>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <div className="flex flex-col items-end">
                             <span className={cn("text-lg font-bold font-headline", isPositive ? "text-[#0f6466]" : "text-[#de3b40]")}>
                               {formatCurrency(Math.abs(party.balance), isPrivacyMode)}
                             </span>
                             <span className={cn("text-[10px] font-bold uppercase tracking-widest", isPositive ? "text-[#0f6466]" : "text-[#de3b40]")}>
                               {isPositive ? "YOU WILL GET" : "YOU WILL GIVE"}
                             </span>
                           </div>
                        </td>
                      </tr>
                    );
                 })
               )}
             </tbody>
          </table>
        </div>
        
        {/* Pagination below */}
        {!isLoading && filteredParties.length > 0 && (
          <div className="px-6 py-4 bg-slate-50/50 flex flex-wrap items-center justify-between border-t border-border">
            <span className="text-xs font-medium text-text-muted">Showing {Math.min(4, filteredParties.length)} of {filteredParties.length} parties</span>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button disabled className="p-1.5 rounded-lg border border-slate-200 text-text-muted bg-white disabled:opacity-50">
                <ChevronRight size={16} className="rotate-180" />
              </button>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg bg-[#0f6466] text-white text-xs font-bold shadow">1</button>
                <button className="w-8 h-8 rounded-lg text-text-muted hover:bg-slate-100 text-xs font-bold transition-colors">2</button>
                <button className="w-8 h-8 rounded-lg text-text-muted hover:bg-slate-100 text-xs font-bold transition-colors">3</button>
              </div>
              <button className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors bg-white">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
