import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, UserPlus, ChevronRight, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { CashEntry, PartyInfo } from '../types';

interface DashboardViewProps {
  cashEntries: CashEntry[];
  parties: PartyInfo[];
  isLoading: boolean;
  isPrivacyMode: boolean;
  onAddParty: () => void;
  onSelectParty: (party: PartyInfo) => void;
}

export default function DashboardView({
  cashEntries, parties, isLoading, isPrivacyMode, onAddParty, onSelectParty
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Derived calculations
  const totals = useMemo(() => {
    const cashIn = cashEntries.filter(e => e.entry_type === 'cash_in').reduce((s, e) => s + Number(e.amount), 0);
    const cashOut = cashEntries.filter(e => e.entry_type === 'cash_out').reduce((s, e) => s + Number(e.amount), 0);
    const willGive = parties.filter(p => p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0);
    const willGet = parties.filter(p => p.balance > 0).reduce((s, p) => s + p.balance, 0);
    return { netCash: cashIn - cashOut, willGive, willGet, totalNet: (cashIn - cashOut) + willGet - willGive };
  }, [cashEntries, parties]);

  const filteredParties = useMemo(() => {
    if (!searchQuery) return parties;
    const q = searchQuery.toLowerCase();
    return parties.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q));
  }, [parties, searchQuery]);

  // Avatars for the "You Will Give/Get" sections (using initials instead of images)
  const willGiveParties = parties.filter(p => p.balance < 0);
  const willGetParties = parties.filter(p => p.balance > 0);

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Summary Bento Row (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <div className="bg-gradient-to-br from-primary to-blue-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform text-white">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
          </div>
          <div className="relative z-10">
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Total Net Balance</p>
            <h2 className="text-white text-4xl font-extrabold font-headline tracking-tight mt-2 pb-6">
              {formatCurrency(totals.totalNet, isPrivacyMode)}
            </h2>
            <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
              <span>Includes cash and party balance</span>
            </div>
          </div>
        </div>

        {/* You Will Give */}
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-between">
          <div>
            <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">You Will Give</p>
            <h3 className="text-red-500 text-3xl font-bold font-headline mt-2">
              {formatCurrency(totals.willGive, isPrivacyMode)}
            </h3>
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="flex -space-x-2">
              {willGiveParties.slice(0, 3).map((p, i) => (
                <div key={p.party_id} className="w-8 h-8 rounded-full border-2 border-card bg-slate-200 flex items-center justify-center text-[10px] font-bold text-text-dark z-10" style={{ zIndex: 3 - i }}>
                  {p.name.substring(0, 2).toUpperCase()}
                </div>
              ))}
              {willGiveParties.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-card bg-background flex items-center justify-center text-[10px] font-bold text-text-muted z-0">
                  +{willGiveParties.length - 3}
                </div>
              )}
            </div>
            <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
              View All <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* You Will Get */}
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-between">
          <div>
            <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">You Will Get</p>
            <h3 className="text-emerald-500 text-3xl font-bold font-headline mt-2">
              {formatCurrency(totals.willGet, isPrivacyMode)}
            </h3>
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="flex -space-x-2">
              {willGetParties.slice(0, 3).map((p, i) => (
                <div key={p.party_id} className="w-8 h-8 rounded-full border-2 border-card bg-primary-10 flex items-center justify-center text-[10px] font-bold text-primary z-10" style={{ zIndex: 3 - i }}>
                  {p.name.substring(0, 2).toUpperCase()}
                </div>
              ))}
              {willGetParties.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-card bg-background flex items-center justify-center text-[10px] font-bold text-text-muted z-0">
                  +{willGetParties.length - 3}
                </div>
              )}
            </div>
            <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
              View All <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        {/* Header */}
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border bg-slate-50/50">
          <div>
            <h4 className="text-lg font-bold font-headline text-text-dark">Recent Parties</h4>
            <p className="text-sm text-text-muted font-medium mt-1">Manage your active debtors and creditors</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search party name..."
                className="bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-bold text-text-muted hover:bg-slate-50 transition-colors shadow-sm">
              <SlidersHorizontal size={16} /> Filter
            </button>
            <button onClick={onAddParty} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors">
              <UserPlus size={16} /> Add Customer
            </button>
          </div>
        </div>

        {/* Party Rows */}
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : filteredParties.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-sm font-medium">No parties found matching your search.</div>
        ) : (
          <div className="divide-y divide-border">
            {filteredParties.map(party => (
              <div key={party.party_id} onClick={() => onSelectParty(party)}
                className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/80 transition-colors group cursor-pointer gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border border-border shrink-0", 
                    party.balance > 0 ? "bg-primary/10 text-primary" : 
                    party.balance < 0 ? "bg-red-500/10 text-red-600" :
                    "bg-background text-text-dark")}>
                    {party.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-[15px] font-bold text-text-dark leading-tight group-hover:text-primary transition-colors">{party.name}</h5>
                    <p className="text-xs text-text-muted font-medium flex items-center gap-1.5 mt-1">
                      {party.phone ? party.phone : 'No phone visible'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 justify-between md:justify-end">
                  <div className="text-right">
                    {party.balance > 0 ? (
                      <>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">You Will Get</p>
                        <p className="text-lg font-bold font-headline text-text-dark">{formatCurrency(party.balance, isPrivacyMode)}</p>
                      </>
                    ) : party.balance < 0 ? (
                      <>
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-0.5">You Will Give</p>
                        <p className="text-lg font-bold font-headline text-text-dark">{formatCurrency(Math.abs(party.balance), isPrivacyMode)}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Balance</p>
                        <p className="text-lg font-bold font-headline text-text-dark">{formatCurrency(0, isPrivacyMode)}</p>
                      </>
                    )}
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-primary group-hover:bg-white border border-transparent group-hover:border-border transition-all shadow-sm">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredParties.length > 0 && (
          <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-center border-t border-border">
            <button className="text-sm font-bold text-primary hover:text-primary-hover transition-colors flex items-center gap-1">
              View All Parties <ChevronDown size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
