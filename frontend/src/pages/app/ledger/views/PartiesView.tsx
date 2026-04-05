import React, { useMemo, useState, useEffect } from 'react';
import { Search, SlidersHorizontal, UserPlus, Download, TrendingUp, ChevronRight, ChevronDown, ArrowUpDown, X } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { PartyInfo } from '../types';

type SortOption = 'name_asc' | 'highest' | 'lowest' | 'recent';
type BalanceFilter = 'all' | 'get' | 'give';

interface PartiesViewProps {
  parties: PartyInfo[];
  isLoading: boolean;
  isPrivacyMode: boolean;
  onAddParty: (type?: 'customer' | 'vendor') => void;
  onSelectParty: (party: PartyInfo) => void;
  initialFilter?: 'all' | 'give' | 'get';
}

export default function PartiesView({
  parties, isLoading, isPrivacyMode, onAddParty, onSelectParty, initialFilter = 'all'
}: PartiesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Customer' | 'Vendor'>('Customer');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>(initialFilter);
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');

  // Sync initial filter from parent (Issue 4c)
  useEffect(() => {
    if (initialFilter !== 'all') {
      setBalanceFilter(initialFilter);
    }
  }, [initialFilter]);

  // Derived calculations
  const totals = useMemo(() => {
    const willGive = parties.filter(p => p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0);
    const willGet = parties.filter(p => p.balance > 0).reduce((s, p) => s + p.balance, 0);
    return { willGive, willGet, activeCount: parties.length };
  }, [parties]);

  const filteredParties = useMemo(() => {
    let result = parties.filter(p => {
      // Customer/Vendor toggle: use party_type if available, else fallback to balance heuristic
      const isCustomer = p.party_type ? p.party_type === 'customer' : p.balance >= 0;
      if (activeTab === 'Customer' && !isCustomer) return false;
      if (activeTab === 'Vendor' && isCustomer) return false;

      // Balance filter (from dashboard navigation)
      if (balanceFilter === 'get' && p.balance <= 0) return false;
      if (balanceFilter === 'give' && p.balance >= 0) return false;

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.phone?.includes(q);
      }
      return true;
    });

    // Sort
    switch (sortBy) {
      case 'highest':
        result.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
        break;
      case 'lowest':
        result.sort((a, b) => Math.abs(a.balance) - Math.abs(b.balance));
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
        // Keep original order (assumed to be recent)
        break;
    }

    return result;
  }, [parties, searchQuery, activeTab, balanceFilter, sortBy]);

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans tracking-tight">
      
      <div className="flex items-center justify-between mb-2">
         <h1 className="text-2xl font-bold font-headline text-text-dark hidden lg:block">Parties Ledger</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Receivables */}
        <div className="bg-primary/10 p-7 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 bottom-0 opacity-10">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-primary"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
          </div>
          <div className="relative z-10 w-full">
            <p className="text-primary/70 text-[11px] font-bold uppercase tracking-wider mb-1">TOTAL RECEIVABLES</p>
            <p className="text-primary text-xl md:text-2xl font-extrabold font-headline mb-0">You Will Get</p>
            <h3 className="text-primary text-3xl md:text-4xl font-extrabold font-headline tracking-tight mt-1">
              {formatCurrency(totals.willGet, isPrivacyMode)}
            </h3>
          </div>
          <div className="mt-6 flex items-center">
            <span className="inline-flex items-center gap-1 bg-success/10 text-success text-[10px] font-bold px-2 py-1 rounded-md">
              <TrendingUp size={12} strokeWidth={3} /> +12% from last month
            </span>
          </div>
        </div>

        {/* Total Payables */}
        <div className="bg-danger/10 p-7 rounded-2xl relative overflow-hidden flex flex-col justify-between">
           <div className="absolute right-0 bottom-0 opacity-10">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-danger"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
          </div>
          <div className="relative z-10">
            <p className="text-danger/70 text-[11px] font-bold uppercase tracking-wider mb-1">TOTAL PAYABLES</p>
            <p className="text-danger text-xl md:text-2xl font-extrabold font-headline mb-0">You Will Give</p>
            <h3 className="text-danger text-3xl md:text-4xl font-extrabold font-headline tracking-tight mt-1">
              {formatCurrency(totals.willGive, isPrivacyMode)}
            </h3>
          </div>
        </div>

        {/* Active Relationships */}
        <div className="bg-secondary p-7 rounded-2xl shadow-xl shadow-secondary/20 text-white flex flex-col justify-between">
          <div>
            <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider mb-1">Active Relationships</p>
            <h3 className="text-white text-4xl md:text-5xl font-extrabold font-headline tracking-tight mt-1">
              {totals.activeCount}
            </h3>
          </div>
          <button onClick={() => onAddParty(activeTab === 'Vendor' ? 'vendor' : 'customer')} className="mt-6 w-full py-3 bg-white text-secondary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-colors">
            <UserPlus size={18} /> Add {activeTab}
          </button>
        </div>
      </div>

      {/* Tabs Row Header */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-2">
         <div className="flex bg-background p-1 rounded-full items-center border border-border">
            <button onClick={() => setActiveTab('Customer')} className={cn("px-6 py-2 rounded-full text-sm font-bold transition-all", activeTab === 'Customer' ? "bg-primary text-white shadow" : "text-text-muted hover:text-text-dark")}>
              Customer
            </button>
            <button onClick={() => setActiveTab('Vendor')} className={cn("px-6 py-2 rounded-full text-sm font-bold transition-all", activeTab === 'Vendor' ? "bg-primary text-white shadow" : "text-text-muted hover:text-text-dark")}>
              Vendor
            </button>
         </div>
         <button onClick={() => onAddParty(activeTab === 'Vendor' ? 'vendor' : 'customer')} className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
           <UserPlus size={16} /> Add {activeTab}
         </button>
      </div>

      {/* List Section */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
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
                className="bg-background border border-border hover:border-border rounded-lg py-2 pl-9 pr-4 text-sm text-text-dark w-48 sm:w-64 md:w-80 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-card transition-all"
              />
            </div>
            
            {/* Filter Button with Dropdown (Issue 4d) */}
            <div className="relative">
              <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors", showFilterMenu || balanceFilter !== 'all' || sortBy !== 'name_asc' ? "bg-primary/10 text-primary border border-primary/20" : "bg-background text-text-dark hover:bg-border/30 border border-border")}>
                <SlidersHorizontal size={14} /> Filter
                {(balanceFilter !== 'all' || sortBy !== 'name_asc') && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
              
              {showFilterMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-card rounded-xl shadow-xl border border-border py-3 z-50">
                  <div className="px-4 pb-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Filters</span>
                    <button onClick={() => { setBalanceFilter('all'); setSortBy('name_asc'); }} className="text-xs text-primary font-bold hover:underline">Reset</button>
                  </div>

                  <div className="px-4 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Balance Type</p>
                    {(['all', 'get', 'give'] as const).map(f => (
                      <button key={f} onClick={() => setBalanceFilter(f)} className={cn("w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors", balanceFilter === f ? "bg-primary/10 text-primary font-bold" : "text-text-dark hover:bg-background")}>
                        {f === 'all' ? 'All Parties' : f === 'get' ? 'You Will Get' : 'You Will Give'}
                      </button>
                    ))}
                  </div>
                  
                  <div className="border-t border-border mx-4 my-2" />
                  
                  <div className="px-4 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Sort By</p>
                    {([
                      { id: 'name_asc', label: 'Name A-Z' },
                      { id: 'highest', label: 'Highest Amount' },
                      { id: 'lowest', label: 'Lowest Amount' },
                      { id: 'recent', label: 'Most Recent' },
                    ] as const).map(s => (
                      <button key={s.id} onClick={() => setSortBy(s.id)} className={cn("w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors", sortBy === s.id ? "bg-primary/10 text-primary font-bold" : "text-text-dark hover:bg-background")}>
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <div className="px-4 pt-2">
                    <button onClick={() => setShowFilterMenu(false)} className="w-full py-2 bg-primary text-white rounded-lg text-sm font-bold">
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm font-bold text-text-dark hover:bg-border/30 transition-colors">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Active filter indicators */}
        {(balanceFilter !== 'all' || sortBy !== 'name_asc') && (
          <div className="px-6 py-3 bg-primary/5 border-b border-border flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-text-muted">Active:</span>
            {balanceFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {balanceFilter === 'get' ? 'You Will Get' : 'You Will Give'}
                <button onClick={() => setBalanceFilter('all')} className="ml-1 hover:bg-primary/20 rounded-full p-0.5"><X size={12} /></button>
              </span>
            )}
            {sortBy !== 'name_asc' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                Sorted: {sortBy === 'highest' ? 'Highest' : sortBy === 'lowest' ? 'Lowest' : 'Recent'}
                <button onClick={() => setSortBy('name_asc')} className="ml-1 hover:bg-primary/20 rounded-full p-0.5"><X size={12} /></button>
              </span>
            )}
          </div>
        )}

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
                 <tr><td colSpan={4} className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto" /></td></tr>
               ) : filteredParties.length === 0 ? (
                 <tr><td colSpan={4} className="py-12 text-center text-text-muted font-medium">No parties found.</td></tr>
               ) : (
                 filteredParties.map((party, idx) => {
                    const isPositive = party.balance >= 0;
                    return (
                      <tr key={party.id} className="hover:bg-background transition-colors group cursor-pointer" onClick={() => onSelectParty(party)}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                              {getInitials(party.name)}
                            </div>
                            <div className="flex flex-col">
                              <h5 className="text-[15px] font-bold text-text-dark">{party.name}</h5>
                              <p className="text-[11px] text-text-muted font-medium uppercase mt-0.5">
                                {party.party_type === 'vendor' ? `Vendor ID: V-${99200 + idx}` : `Customer ID: C-${10100 + idx}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex justify-center">
                             <div className={cn("px-2.5 py-0.5 border rounded text-[10px] font-bold uppercase tracking-widest", 
                               idx % 4 === 1 ? "border-warning/30 text-warning bg-warning/10" : 
                               idx % 4 === 3 ? "border-danger/30 text-danger bg-danger/10" : 
                               "border-success/30 text-success bg-success/10")}>
                               {idx % 4 === 1 ? 'PENDING' : idx % 4 === 3 ? 'OVERDUE' : 'ACTIVE'}
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
                             <span className={cn("text-lg font-bold font-headline", isPositive ? "text-primary" : "text-danger")}>
                               {formatCurrency(Math.abs(party.balance), isPrivacyMode)}
                             </span>
                             <span className={cn("text-[10px] font-bold uppercase tracking-widest", isPositive ? "text-primary" : "text-danger")}>
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
        
        {/* Pagination */}
        {!isLoading && filteredParties.length > 0 && (
          <div className="px-6 py-4 bg-background/50 flex flex-wrap items-center justify-between border-t border-border">
            <span className="text-xs font-medium text-text-muted">Showing {Math.min(10, filteredParties.length)} of {filteredParties.length} parties</span>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button disabled className="p-1.5 rounded-lg border border-border text-text-muted bg-card disabled:opacity-50">
                <ChevronRight size={16} className="rotate-180" />
              </button>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg bg-primary text-white text-xs font-bold shadow">1</button>
                {filteredParties.length > 10 && <button className="w-8 h-8 rounded-lg text-text-muted hover:bg-background text-xs font-bold transition-colors">2</button>}
              </div>
              <button className="p-1.5 rounded-lg border border-border text-text-dark hover:bg-background transition-colors bg-card">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
