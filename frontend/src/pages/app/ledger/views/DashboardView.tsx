import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Search, UserPlus, ChevronRight, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Wallet, Users, CreditCard, PieChart,
  BarChart3, Plus, Minus
} from 'lucide-react';
import { formatCurrency, formatCurrencyCompact } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { CashEntry, PartyInfo } from '../types';

interface DashboardViewProps {
  cashEntries: CashEntry[];
  parties: PartyInfo[];
  isLoading: boolean;
  isPrivacyMode: boolean;
  onAddParty: () => void;
  onSelectParty: (party: PartyInfo) => void;
  onNavigateToParties?: (filter: 'give' | 'get') => void;
  onNavigateToTab?: (tab: string) => void;
  onAddCashEntry?: (type: 'cash_in' | 'cash_out') => void;
  userName?: string;
}

export default function DashboardView({
  cashEntries, parties, isLoading, isPrivacyMode, onAddParty, onSelectParty, onNavigateToParties, onNavigateToTab, onAddCashEntry, userName
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [chartRange, setChartRange] = useState<'6m' | '1y'>('6m');

  // Derived calculations
  const totals = useMemo(() => {
    const cashIn = cashEntries.filter(e => e.entry_type === 'cash_in').reduce((s, e) => s + Number(e.amount), 0);
    const cashOut = cashEntries.filter(e => e.entry_type === 'cash_out').reduce((s, e) => s + Number(e.amount), 0);
    const willGive = parties.filter(p => p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0);
    const willGet = parties.filter(p => p.balance > 0).reduce((s, p) => s + p.balance, 0);
    return { cashIn, cashOut, netCash: cashIn - cashOut, willGive, willGet, totalNet: (cashIn - cashOut) + willGet - willGive };
  }, [cashEntries, parties]);

  const filteredParties = useMemo(() => {
    if (!searchQuery) return parties;
    const q = searchQuery.toLowerCase();
    return parties.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q));
  }, [parties, searchQuery]);

  // --- Cashflow chart data (grouped by month) ---
  const cashflowChartData = useMemo(() => {
    const monthsCount = chartRange === '6m' ? 6 : 12;
    const now = new Date();
    const months: { label: string; cashIn: number; cashOut: number }[] = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-IN', { month: 'short' });
      months.push({ label, cashIn: 0, cashOut: 0 });

      cashEntries.forEach(e => {
        const eMonth = e.entry_date.substring(0, 7);
        if (eMonth === key) {
          if (e.entry_type === 'cash_in') months[months.length - 1].cashIn += Number(e.amount);
          else months[months.length - 1].cashOut += Number(e.amount);
        }
      });
    }
    return months;
  }, [cashEntries, chartRange]);

  const chartMax = useMemo(() => Math.max(...cashflowChartData.flatMap(d => [d.cashIn, d.cashOut]), 1), [cashflowChartData]);

  // --- Spend by category ---
  const spendByCategory = useMemo(() => {
    const catMap: Record<string, number> = {};
    cashEntries.filter(e => e.entry_type === 'cash_out').forEach(e => {
      const cat = e.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + Number(e.amount);
    });
    const entries = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = Math.max(...entries.map(e => e[1]), 1);
    return entries.map(([name, amount]) => ({ name, amount, pct: Math.round((amount / max) * 100) }));
  }, [cashEntries]);

  // --- Recent transactions (last 5) ---
  const recentTxns = useMemo(() => cashEntries.slice(0, 5), [cashEntries]);

  const willGiveParties = parties.filter(p => p.balance < 0);
  const willGetParties = parties.filter(p => p.balance > 0);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const CATEGORY_COLORS: Record<string, string> = {
    'Sales': 'bg-emerald-500', 'Revenue': 'bg-emerald-500',
    'Purchase': 'bg-amber-500', 'Expense': 'bg-red-500',
    'Salary': 'bg-blue-500', 'Salary Paid': 'bg-blue-500',
    'Rent': 'bg-purple-500', 'Utility': 'bg-cyan-500',
    'Travel': 'bg-indigo-500', 'Food': 'bg-orange-500',
    'Maintenance': 'bg-gray-500',
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans tracking-tight">

      {/* Greeting + Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-headline text-text-dark tracking-tight">
            Good morning, {userName || 'User'}
          </h1>
          <p className="text-sm text-text-muted font-medium mt-1">
            {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} · All figures in INR
          </p>
        </div>
      </div>

      {/* Sub-nav tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto hide-scrollbar">
        {['Dashboard', 'Parties', 'Cashbook', 'Transactions', 'Settings'].map(tab => (
          <button
            key={tab}
            onClick={() => tab !== 'Dashboard' && onNavigateToTab?.(tab.toLowerCase())}
            className={cn(
              "px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-all",
              tab === 'Dashboard'
                ? "text-primary border-primary"
                : "text-text-muted border-transparent hover:text-text-dark hover:border-border"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ===== KPI STAT CARDS ROW ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Balance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
          className="bg-card p-5 rounded-2xl shadow-sm border border-border relative overflow-hidden group hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-muted text-[11px] font-bold uppercase tracking-wider">Net balance</span>
            <div className="p-1.5 bg-primary/10 rounded-lg"><Wallet size={14} className="text-primary" /></div>
          </div>
          <h3 className="text-2xl md:text-[28px] font-extrabold font-headline text-text-dark tracking-tight">
            {formatCurrency(totals.totalNet, isPrivacyMode)}
          </h3>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-emerald-500 text-[11px] font-bold flex items-center gap-0.5">
              <TrendingUp size={12} strokeWidth={3} /> +12.4%
            </span>
            <span className="text-text-muted text-[10px]">vs last month</span>
          </div>
          {/* Mini sparkbar */}
          <div className="flex items-end gap-[2px] mt-3 h-5">
            {[40, 55, 35, 60, 45, 70, 50, 65].map((h, i) => (
              <div key={i} className="flex-1 bg-primary/30 rounded-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        </motion.div>

        {/* Cash In */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card p-5 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-muted text-[11px] font-bold uppercase tracking-wider">Cash in</span>
            <div className="p-1.5 bg-emerald-500/10 rounded-lg"><TrendingUp size={14} className="text-emerald-500" /></div>
          </div>
          <h3 className="text-2xl md:text-[28px] font-extrabold font-headline text-primary tracking-tight">
            {formatCurrency(totals.cashIn, isPrivacyMode)}
          </h3>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-emerald-500 text-[11px] font-bold flex items-center gap-0.5">
              <ArrowUpRight size={12} strokeWidth={3} /> +18%
            </span>
          </div>
          <div className="mt-3 h-1.5 bg-background rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, totals.cashIn / (totals.cashIn + totals.cashOut + 1) * 100)}%` }} />
          </div>
        </motion.div>

        {/* Cash Out */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card p-5 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-muted text-[11px] font-bold uppercase tracking-wider">Cash out</span>
            <div className="p-1.5 bg-danger/10 rounded-lg"><TrendingDown size={14} className="text-danger" /></div>
          </div>
          <h3 className="text-2xl md:text-[28px] font-extrabold font-headline text-danger tracking-tight">
            {formatCurrency(totals.cashOut, isPrivacyMode)}
          </h3>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-danger text-[11px] font-bold flex items-center gap-0.5">
              <ArrowDownRight size={12} strokeWidth={3} /> -4%
            </span>
          </div>
          <div className="mt-3 h-1.5 bg-background rounded-full overflow-hidden">
            <div className="h-full bg-danger rounded-full" style={{ width: `${Math.min(100, totals.cashOut / (totals.cashIn + totals.cashOut + 1) * 100)}%` }} />
          </div>
        </motion.div>

        {/* Party Balances */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card p-5 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-muted text-[11px] font-bold uppercase tracking-wider">Party balances</span>
            <div className="p-1.5 bg-secondary/10 rounded-lg"><Users size={14} className="text-secondary" /></div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-text-muted font-bold uppercase">You'll get</span>
              <p className="text-lg font-extrabold text-primary">{formatCurrency(totals.willGet, isPrivacyMode)}</p>
            </div>
            <div>
              <span className="text-[10px] text-text-muted font-bold uppercase">You'll give</span>
              <p className="text-lg font-extrabold text-danger">{formatCurrency(totals.willGive, isPrivacyMode)}</p>
            </div>
          </div>
          {/* Split bar */}
          <div className="mt-3 h-1.5 bg-background rounded-full overflow-hidden flex">
            <div className="h-full bg-primary rounded-l-full" style={{ width: `${totals.willGet / (totals.willGet + totals.willGive + 1) * 100}%` }} />
            <div className="h-full bg-danger rounded-r-full" style={{ width: `${totals.willGive / (totals.willGet + totals.willGive + 1) * 100}%` }} />
          </div>
        </motion.div>
      </div>

      {/* ===== CASHFLOW CHART + ACTIVE PARTIES ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Cashflow Overview (3 col) */}
        <div className="lg:col-span-3 bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-bold font-headline text-text-dark">Cashflow overview</h4>
              <div className="flex items-center gap-4 mt-2 text-xs font-bold text-text-muted">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Cash in</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-danger" /> Cash out</span>
              </div>
            </div>
            <div className="flex items-center bg-background p-1 rounded-lg border border-border">
              <button onClick={() => setChartRange('6m')} className={cn("px-3 py-1 rounded-md text-xs font-bold transition-all", chartRange === '6m' ? "bg-card text-text-dark shadow-sm" : "text-text-muted")}>6m</button>
              <button onClick={() => setChartRange('1y')} className={cn("px-3 py-1 rounded-md text-xs font-bold transition-all", chartRange === '1y' ? "bg-card text-text-dark shadow-sm" : "text-text-muted")}>1y</button>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-2 sm:gap-3 h-48 px-2">
            {cashflowChartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full flex items-end gap-[2px] h-40">
                  <div className="flex-1 relative group/bar cursor-pointer">
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: `${(d.cashIn / chartMax) * 100}%` }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className="w-full bg-primary rounded-t-md hover:opacity-80 transition-opacity absolute bottom-0"
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-dark text-white text-[9px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                      {formatCurrencyCompact(d.cashIn)}
                    </div>
                  </div>
                  <div className="flex-1 relative group/bar cursor-pointer">
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: `${(d.cashOut / chartMax) * 100}%` }}
                      transition={{ delay: i * 0.05 + 0.1, duration: 0.4 }}
                      className="w-full bg-danger rounded-t-md hover:opacity-80 transition-opacity absolute bottom-0"
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-dark text-white text-[9px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                      {formatCurrencyCompact(d.cashOut)}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-text-muted mt-1">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Parties (2 col) */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-bold font-headline text-text-dark">Active parties</h4>
              <p className="text-xs text-text-muted font-medium mt-0.5">{parties.length} contacts total</p>
            </div>
            <button onClick={() => onNavigateToTab?.('parties')} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              View all <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>

          {/* Will receive / Will pay summary */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={() => onNavigateToParties?.('get')} className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-left hover:bg-primary/10 transition-colors">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Will receive</span>
              <p className="text-lg font-extrabold text-primary mt-0.5">{formatCurrency(totals.willGet, isPrivacyMode)}</p>
            </button>
            <button onClick={() => onNavigateToParties?.('give')} className="p-3 rounded-xl bg-danger/5 border border-danger/20 text-left hover:bg-danger/10 transition-colors">
              <span className="text-[10px] font-bold text-danger uppercase tracking-wider">Will pay</span>
              <p className="text-lg font-extrabold text-danger mt-0.5">{formatCurrency(totals.willGive, isPrivacyMode)}</p>
            </button>
          </div>

          {/* Party list */}
          <div className="flex-1 space-y-1 overflow-y-auto max-h-[280px] custom-scrollbar">
            {filteredParties.slice(0, 6).map(party => {
              const isPositive = party.balance >= 0;
              return (
                <button
                  key={party.id}
                  onClick={() => onSelectParty(party)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-background transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0",
                      isPositive ? "bg-primary" : "bg-danger"
                    )}>
                      {getInitials(party.name)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-dark">{party.name}</p>
                      <p className="text-[10px] text-text-muted font-medium capitalize">{party.party_type || 'Customer'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-sm font-bold", isPositive ? "text-primary" : "text-danger")}>
                      {formatCurrency(Math.abs(party.balance), isPrivacyMode)}
                    </p>
                    <p className={cn("text-[9px] font-bold uppercase", isPositive ? "text-primary" : "text-danger")}>
                      {isPositive ? 'will get' : 'will pay'}
                    </p>
                  </div>
                </button>
              );
            })}
            {filteredParties.length === 0 && (
              <div className="text-center py-6 text-text-muted text-sm">No parties found</div>
            )}
          </div>
        </div>
      </div>

      {/* ===== RECENT TRANSACTIONS + SPEND BY CATEGORY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Recent Transactions (3 col) */}
        <div className="lg:col-span-3 bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-border">
            <div>
              <h4 className="text-lg font-bold font-headline text-text-dark">Recent transactions</h4>
              <p className="text-xs text-text-muted font-medium mt-0.5">Last 7 days</p>
            </div>
            <button onClick={() => onNavigateToTab?.('cashbook')} className="text-xs font-bold text-primary flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg hover:bg-background transition-colors">
              View all <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>

          <div className="divide-y divide-border">
            {recentTxns.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm font-medium">No recent transactions</div>
            ) : (
              recentTxns.map((entry, idx) => {
                const isIncome = entry.entry_type === 'cash_in';
                return (
                  <div key={entry.id || `txn-${idx}`} className="px-5 py-4 flex items-center justify-between hover:bg-background/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        isIncome ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"
                      )}>
                        {isIncome ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-dark">{entry.note || entry.category}</p>
                        <p className="text-[11px] text-text-muted font-medium capitalize">{entry.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-bold font-headline", isIncome ? "text-primary" : "text-danger")}>
                        {isIncome ? '+' : '-'}{formatCurrency(Number(entry.amount), isPrivacyMode)}
                      </p>
                      <p className="text-[10px] text-text-muted font-medium">{formatDate(entry.entry_date)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Spend by Category (2 col) */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-lg font-bold font-headline text-text-dark">Spend by category</h4>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">This month</span>
          </div>

          <div className="space-y-4">
            {spendByCategory.length === 0 ? (
              <div className="py-6 text-center text-text-muted text-sm">No expense data</div>
            ) : (
              spendByCategory.map((cat, i) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-text-dark">{cat.name}</span>
                    <span className="text-sm font-bold text-text-dark">{formatCurrency(cat.amount, isPrivacyMode)}</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.pct}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className={cn("h-full rounded-full", CATEGORY_COLORS[cat.name] || 'bg-primary')}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
