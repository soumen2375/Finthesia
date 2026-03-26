import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, UserPlus, ChevronRight, ChevronDown, TrendingUp } from 'lucide-react';
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

  // Avatars for the "You Will Give/Get" sections (using initials)
  const willGiveParties = parties.filter(p => p.balance < 0);
  const willGetParties = parties.filter(p => p.balance > 0);

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans tracking-tight">
      {/* Summary Bento Row (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <div className="bg-[#0f6466] p-7 rounded-2xl shadow-xl shadow-primary/10 relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 opacity-10 text-white">
            <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-white/80 text-[11px] font-bold uppercase tracking-widest mb-1">Total Net Balance</p>
              <h2 className="text-white text-[32px] md:text-4xl font-extrabold font-headline tracking-tight mt-1">
                {formatCurrency(totals.totalNet, isPrivacyMode)}
              </h2>
            </div>
            <div className="mt-8 flex items-center gap-2 text-emerald-300 text-xs font-bold">
              <TrendingUp size={16} strokeWidth={3} />
              <span>+12.4% from last month</span>
            </div>
          </div>
        </div>

        {/* You Will Give */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-text-muted text-[11px] font-bold uppercase tracking-wider mb-1">You Will Give</p>
            <h3 className="text-[#de3b40] text-3xl font-extrabold font-headline tracking-tight mt-1">
              {formatCurrency(totals.willGive, isPrivacyMode)}
            </h3>
          </div>
          <div className="flex items-center justify-between mt-8">
            <div className="flex -space-x-2">
              {willGiveParties.slice(0, 3).map((p, i) => (
                <div key={p.party_id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white z-10" style={{ zIndex: 3 - i }}>
                  {getInitials(p.name)}
                </div>
              ))}
              {willGiveParties.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-text-muted z-0">
                  {"+"}{willGiveParties.length - 3}
                </div>
              )}
              {willGiveParties.length === 0 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-300">
                  -
                </div>
              )}
            </div>
            <button className="text-[#0f6466] text-xs font-bold flex items-center gap-1 hover:underline">
              View All <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* You Will Get */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-text-muted text-[11px] font-bold uppercase tracking-wider mb-1">You Will Get</p>
            <h3 className="text-[#0f6466] text-3xl font-extrabold font-headline tracking-tight mt-1">
              {formatCurrency(totals.willGet, isPrivacyMode)}
            </h3>
          </div>
          <div className="flex items-center justify-between mt-8">
            <div className="flex -space-x-2">
              {willGetParties.slice(0, 3).map((p, i) => (
                <div key={p.party_id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white z-10" style={{ zIndex: 3 - i }}>
                  {getInitials(p.name)}
                </div>
              ))}
              {willGetParties.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-text-muted z-0">
                  {"+"}{willGetParties.length - 3}
                </div>
              )}
              {willGetParties.length === 0 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-300">
                  -
                </div>
              )}
            </div>
            <button className="text-[#0f6466] text-xs font-bold flex items-center gap-1 hover:underline">
              View All <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
        {/* Header */}
        <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border">
          <div>
            <h4 className="text-xl font-bold font-headline text-text-dark">Recent Parties</h4>
            <p className="text-sm text-text-muted font-medium mt-1">Manage your active debtors and creditors</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search party name..."
                className="bg-slate-50 border border-transparent hover:border-border rounded-lg py-2 pl-9 pr-4 text-sm w-48 sm:w-64 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold text-text-dark hover:bg-slate-200 transition-colors">
              <SlidersHorizontal size={14} /> Filter
            </button>
            <button onClick={onAddParty} className="flex items-center gap-2 px-4 py-2 bg-[#0fbcd4] text-white rounded-lg text-sm font-bold hover:bg-[#0daabf] transition-colors shadow-sm shadow-[#0fbcd4]/20">
              <UserPlus size={16} /> Add Customer
            </button>
          </div>
        </div>

        {/* Party Rows */}
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0fbcd4]" /></div>
        ) : filteredParties.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-sm font-medium">No parties found matching your search.</div>
        ) : (
          <div className="divide-y divide-border">
            {filteredParties.map((party, idx) => (
              <div key={party.party_id} onClick={() => onSelectParty(party)}
                className="p-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer gap-4 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-border">
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-lg font-bold text-white uppercase">
                      {getInitials(party.name)}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h5 className="text-[15px] font-bold text-text-dark">{party.name}</h5>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                      <p className="text-xs text-text-muted font-medium">
                        {idx === 0 ? "Last active 2 hrs ago" : 
                         idx === 1 ? "Last active Yesterday" : 
                         idx === 2 ? "Last active 3 days ago" : 
                         "Last active 5 days ago"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 pl-16 sm:pl-0">
                  <p className={cn(
                    "text-lg font-bold font-headline",
                    party.balance < 0 ? "text-[#de3b40]" : "text-[#0f6466]"
                  )}>
                    {formatCurrency(Math.abs(party.balance), isPrivacyMode)}
                  </p>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-text-dark transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredParties.length > 0 && (
          <div className="py-4 bg-slate-50/50 flex items-center justify-center border-t border-border mt-2">
            <button className="text-sm font-bold text-[#0f6466] hover:opacity-80 transition-opacity flex items-center gap-1">
              View All Parties <ChevronDown size={14} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
