import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, ChevronRight, ChevronLeft, UserPlus,
  Download, ArrowUpDown, Users, Building2
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { PartyInfo, CashEntry } from '../types';
import ReportsView from './ReportsView';

const ITEMS_PER_PAGE = 50;

interface PartiesViewProps {
  parties: PartyInfo[];
  cashEntries: CashEntry[];
  isLoading: boolean;
  isPrivacyMode: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onAddParty: (type?: 'customer' | 'vendor') => void;
  onSelectParty: (party: PartyInfo) => void;
  activeLedgerId?: string;
}

export default function PartiesView({
  parties, cashEntries, isLoading, isPrivacyMode,
  searchQuery, setSearchQuery,
  onAddParty, onSelectParty, activeLedgerId
}: PartiesViewProps) {
  const [partyMode, setPartyMode] = useState<'customer' | 'vendor'>('customer');
  const [filterBalance, setFilterBalance] = useState<'all' | 'will_get' | 'will_give' | 'settled'>('all');
  const [sortKey, setSortKey] = useState<'name' | 'balance' | 'recent'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportPartyId, setReportPartyId] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const customerCount = useMemo(() => parties.filter(p => (p.party_type || 'customer') === 'customer').length, [parties]);
  const vendorCount = useMemo(() => parties.filter(p => p.party_type === 'vendor').length, [parties]);
  const totalWillGet = useMemo(() => parties.filter(p => p.balance > 0).reduce((s, p) => s + p.balance, 0), [parties]);
  const totalWillGive = useMemo(() => parties.filter(p => p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0), [parties]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilterMenu(false);
    };
    if (showFilterMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showFilterMenu]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, partyMode, filterBalance, sortKey, sortDir]);

  const filteredParties = useMemo(() => {
    let list = [...parties].filter(p => (p.party_type || 'customer') === partyMode);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q));
    }
    if (filterBalance === 'will_get') list = list.filter(p => p.balance > 0);
    else if (filterBalance === 'will_give') list = list.filter(p => p.balance < 0);
    else if (filterBalance === 'settled') list = list.filter(p => p.balance === 0);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'balance') cmp = Math.abs(a.balance) - Math.abs(b.balance);
      else cmp = new Date(b.updated_at || b.created_at || '').getTime() - new Date(a.updated_at || a.created_at || '').getTime();
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return list;
  }, [parties, searchQuery, partyMode, filterBalance, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredParties.length / ITEMS_PER_PAGE));
  const paginatedParties = filteredParties.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  if (reportPartyId) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => setReportPartyId(null)} className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-dark transition-colors">
          <ChevronLeft size={18} /> Back to Parties
        </button>
        <ReportsView parties={parties} cashEntries={cashEntries} isPrivacyMode={isPrivacyMode} activeLedgerId={activeLedgerId || ''} preSelectedPartyId={reportPartyId} />
      </div>
    );
  }

  if (isLoading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-2xl shadow-sm border border-border">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">You Will Get</span>
          <p className="text-xl font-extrabold text-primary mt-1 font-headline">{formatCurrency(totalWillGet, isPrivacyMode)}</p>
          <p className="text-[10px] font-bold text-primary mt-0.5">{parties.filter(p => p.balance > 0).length} parties</p>
        </div>
        <div className="bg-card p-5 rounded-2xl shadow-sm border border-border">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">You Will Give</span>
          <p className="text-xl font-extrabold text-danger mt-1 font-headline">{formatCurrency(totalWillGive, isPrivacyMode)}</p>
          <p className="text-[10px] font-bold text-danger mt-0.5">{parties.filter(p => p.balance < 0).length} parties</p>
        </div>
        <div className="bg-card p-5 rounded-2xl shadow-sm border border-border">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Net Balance</span>
          <p className={cn("text-xl font-extrabold mt-1 font-headline", (totalWillGet - totalWillGive) >= 0 ? "text-primary" : "text-danger")}>
            {(totalWillGet - totalWillGive) >= 0 ? '+' : ''}{formatCurrency(totalWillGet - totalWillGive, isPrivacyMode)}
          </p>
        </div>
        <button onClick={() => onAddParty(partyMode)} className="bg-primary/5 border-2 border-dashed border-primary/30 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 transition-colors group">
          <UserPlus size={24} className="text-primary group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold text-primary">Add {partyMode === 'customer' ? 'Customer' : 'Vendor'}</span>
        </button>
      </div>

      {/* ─── Customer / Vendor Mode Toggle ─── */}
      <div className="flex items-center gap-1 bg-background border border-border rounded-2xl p-1.5 w-fit shadow-sm">
        {(['customer', 'vendor'] as const).map(mode => {
          const Icon = mode === 'customer' ? Users : Building2;
          const count = mode === 'customer' ? customerCount : vendorCount;
          const isActive = partyMode === mode;
          return (
            <button
              key={mode}
              onClick={() => setPartyMode(mode)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                isActive ? "bg-primary text-white shadow-md shadow-primary/25" : "text-text-muted hover:text-text-dark hover:bg-card"
              )}
            >
              <Icon size={15} strokeWidth={2.5} />
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
              {count > 0 && (
                <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none", isActive ? "bg-white/20" : "bg-primary/10 text-primary")}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table container */}
      <div className="bg-card rounded-2xl shadow-sm border border-border">
        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold font-headline text-text-dark">
              {partyMode === 'customer' ? 'Customers' : 'Vendors'}
            </h2>
            <p className="text-sm text-text-muted font-medium mt-0.5">{filteredParties.length} entries</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Search ${partyMode}s…`}
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="relative" ref={filterRef}>
              <button onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors",
                  showFilterMenu ? "bg-primary/5 border-primary/30 text-primary" : "bg-card border-border text-text-muted hover:text-text-dark")}>
                <Filter size={14} /> Filter
              </button>
              <AnimatePresence>
                {showFilterMenu && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-12 z-50 w-60 bg-card rounded-2xl shadow-xl border border-border p-4 space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 block">Balance</label>
                      <div className="flex flex-wrap gap-2">
                        {[{v:'all',l:'All'},{v:'will_get',l:'Will Get'},{v:'will_give',l:'Will Give'},{v:'settled',l:'Settled'}].map(f => (
                          <button key={f.v} onClick={() => setFilterBalance(f.v as any)}
                            className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                              filterBalance === f.v ? "bg-primary text-white" : "bg-background text-text-muted border border-border")}>
                            {f.l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 block">Sort By</label>
                      <div className="flex gap-2">
                        {[{v:'name',l:'Name'},{v:'balance',l:'Amount'},{v:'recent',l:'Recent'}].map(s => (
                          <button key={s.v} onClick={() => { setSortKey(s.v as any); setSortDir(p => p === 'asc' ? 'desc' : 'asc'); }}
                            className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1",
                              sortKey === s.v ? "bg-primary text-white" : "bg-background text-text-muted border border-border")}>
                            {s.l} {sortKey === s.v && <ArrowUpDown size={10} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setReportPartyId('__ALL__')} className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-bold text-text-muted hover:text-primary hover:border-primary/30 transition-colors">
              <Download size={14} /> Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[2fr_1.5fr_1fr] px-6 py-3 border-t border-border bg-background/30 text-[10px] font-black text-text-muted uppercase tracking-widest">
          <span>Party Name</span><span>Last Activity</span><span className="text-right">Balance</span>
        </div>

        <div className="divide-y divide-border">
          {paginatedParties.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              {partyMode === 'customer' ? <Users size={40} className="mx-auto text-border" /> : <Building2 size={40} className="mx-auto text-border" />}
              <p className="font-bold text-text-dark">{searchQuery ? `No ${partyMode}s found` : `No ${partyMode}s yet`}</p>
              <p className="text-text-muted text-sm">{searchQuery ? 'Try a different search' : `Add your first ${partyMode} to get started`}</p>
              {!searchQuery && (
                <button onClick={() => onAddParty(partyMode)} className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-opacity">
                  <UserPlus size={16} /> Add {partyMode === 'customer' ? 'Customer' : 'Vendor'}
                </button>
              )}
            </div>
          ) : paginatedParties.map((party, i) => {
            const isPositive = party.balance >= 0;
            return (
              <motion.div key={party.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.015 }}
                onClick={() => onSelectParty(party)}
                className="grid grid-cols-[2fr_1.5fr_1fr] items-center px-6 py-4 cursor-pointer hover:bg-background/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm", isPositive ? "bg-primary" : "bg-danger")}>
                    {getInitials(party.name)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-dark group-hover:text-primary transition-colors">{party.name}</p>
                    <p className="text-[11px] text-text-muted font-medium">{party.phone || `ID: ${party.id?.substring(0, 6).toUpperCase()}`}</p>
                  </div>
                </div>
                <div className="text-sm text-text-muted font-medium">{getRelativeTime(party.updated_at || party.created_at)}</div>
                <div className="text-right flex items-center justify-end gap-2">
                  <div>
                    <p className={cn("text-sm font-bold font-headline", isPositive ? "text-primary" : "text-danger")}>{formatCurrency(Math.abs(party.balance), isPrivacyMode)}</p>
                    <p className={cn("text-[9px] font-bold uppercase tracking-wider", isPositive ? "text-primary" : "text-danger")}>
                      {party.balance > 0 ? 'will get' : party.balance < 0 ? 'will give' : 'settled'}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-border bg-background/30 flex items-center justify-between">
          <p className="text-xs text-text-muted font-medium">
            {filteredParties.length === 0 ? '0 entries' : `${Math.min(filteredParties.length, (currentPage-1)*ITEMS_PER_PAGE+1)}–${Math.min(filteredParties.length, currentPage*ITEMS_PER_PAGE)} of ${filteredParties.length}`}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="p-2 rounded-lg border border-border hover:bg-card text-text-muted disabled:opacity-30 transition-colors"><ChevronLeft size={16}/></button>
            {Array.from({length: Math.min(totalPages,5)},(_,i)=>(
              <button key={i+1} onClick={() => setCurrentPage(i+1)} className={cn("w-8 h-8 rounded-lg text-xs font-bold transition-colors", currentPage===i+1?"bg-primary text-white shadow-sm":"border border-border text-text-muted hover:bg-card")}>{i+1}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="p-2 rounded-lg border border-border hover:bg-card text-text-muted disabled:opacity-30 transition-colors"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
