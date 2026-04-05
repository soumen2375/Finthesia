import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { FileText, Download, Search, Calendar, ChevronDown } from 'lucide-react';
import type { PartyInfo } from '../types';

interface PartyTx {
  id: string;
  party_id: string;
  txn_type: 'gave' | 'got';
  amount: number;
  note?: string;
  txn_date: string;
  party_ledger_parties?: {
    name: string;
    party_type: string;
  };
}

interface ReportsViewProps {
  isPrivacyMode: boolean;
  parties: PartyInfo[];
  ledgerId?: string;
}

type PartyTab = 'customers' | 'suppliers';
type PeriodOption = 'this_month' | 'last_month' | 'custom';

function getMonthRange(period: PeriodOption): { start: string; end: string } {
  const now = new Date();
  if (period === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  }
  if (period === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  }
  // custom — return full month as default
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ReportsView({ isPrivacyMode, parties, ledgerId }: ReportsViewProps) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<PartyTab>('customers');
  const [period, setPeriod] = useState<PeriodOption>('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [txns, setTxns] = useState<PartyTx[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize dates based on period
  useEffect(() => {
    const range = getMonthRange(period);
    setStartDate(range.start);
    setEndDate(range.end);
  }, [period]);

  // Fetch transactions within date range for this ledger
  useEffect(() => {
    if (!ledgerId || !startDate || !endDate) return;
    const fetchTxns = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('party_ledger_txns')
        .select('*, party_ledger_parties(name, party_type)')
        .eq('ledger_id', ledgerId)
        .gte('txn_date', startDate)
        .lte('txn_date', endDate)
        .order('txn_date', { ascending: false })
        .order('created_at', { ascending: false });
      setTxns(data || []);
      setLoading(false);
    };
    fetchTxns();
  }, [ledgerId, startDate, endDate]);

  // Count parties by type
  const customerCount = parties.filter(p => (p.party_type || 'customer') === 'customer').length;
  const supplierCount = parties.filter(p => (p.party_type || 'customer') === 'vendor').length;

  // Filter transactions by tab and search
  const filteredTxns = useMemo(() => {
    const tabType = activeTab === 'customers' ? 'customer' : 'vendor';
    let filtered = txns.filter(tx => {
      const pType = tx.party_ledger_parties?.party_type || 'customer';
      return pType === tabType;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.party_ledger_parties?.name?.toLowerCase().includes(q) ||
        tx.note?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [txns, activeTab, searchQuery]);

  // Summary calculations
  const totalGave = filteredTxns
    .filter(tx => tx.txn_type === 'gave')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalGot = filteredTxns
    .filter(tx => tx.txn_type === 'got')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const netBalance = totalGot - totalGave;

  // Download CSV
  const handleDownloadCSV = () => {
    const headers = ['Date', activeTab === 'customers' ? 'Customer Name' : 'Supplier Name', 'Details', 'You Gave', 'You Got'];
    const rows = filteredTxns.map(tx => [
      formatDate(tx.txn_date),
      tx.party_ledger_parties?.name || '-',
      tx.note || '-',
      tx.txn_type === 'gave' ? `₹${Number(tx.amount).toLocaleString('en-IN')}` : '₹0',
      tx.txn_type === 'got' ? `₹${Number(tx.amount).toLocaleString('en-IN')}` : '₹0',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finthesia-report-${activeTab}-${startDate}-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold font-headline text-text-dark tracking-tight">Transactions Reports</h2>
            <p className="text-sm text-text-muted font-medium mt-0.5">Detailed overview of all party transactions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-bold text-text-muted hover:text-text-dark hover:bg-background transition-colors shadow-sm"
          >
            <Download size={16} /> Download Excel
          </button>
        </div>
      </div>

      {/* Tabs: Customers | Suppliers */}
      <div className="flex items-center gap-0 border-b border-border">
        <button
          onClick={() => setActiveTab('customers')}
          className={cn(
            "px-6 py-3 text-sm font-bold transition-all border-b-2 relative",
            activeTab === 'customers'
              ? "border-primary text-primary"
              : "border-transparent text-text-muted hover:text-text-dark"
          )}
        >
          Customers
          <span className={cn(
            "ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded text-[10px] font-bold",
            activeTab === 'customers' ? "bg-primary text-white" : "bg-background text-text-muted border border-border"
          )}>
            {customerCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={cn(
            "px-6 py-3 text-sm font-bold transition-all border-b-2 relative",
            activeTab === 'suppliers'
              ? "border-primary text-primary"
              : "border-transparent text-text-muted hover:text-text-dark"
          )}
        >
          Suppliers
          <span className={cn(
            "ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded text-[10px] font-bold",
            activeTab === 'suppliers' ? "bg-primary text-white" : "bg-background text-text-muted border border-border"
          )}>
            {supplierCount}
          </span>
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Customer Name Search */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            {activeTab === 'customers' ? 'Customer Name' : 'Supplier Name'}
          </label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-text-dark w-40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Period */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Period</label>
          <div className="relative">
            <select
              value={period}
              onChange={e => setPeriod(e.target.value as PeriodOption)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-card border border-border rounded-xl text-sm font-bold text-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="custom">Custom</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Start</label>
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
            <Calendar size={14} className="text-text-muted" />
            <input
              type="date"
              value={startDate}
              onChange={e => { setPeriod('custom'); setStartDate(e.target.value); }}
              className="bg-transparent text-sm font-bold text-text-dark border-none focus:outline-none focus:ring-0 w-32"
            />
          </div>
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">End</label>
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
            <Calendar size={14} className="text-text-muted" />
            <input
              type="date"
              value={endDate}
              onChange={e => { setPeriod('custom'); setEndDate(e.target.value); }}
              className="bg-transparent text-sm font-bold text-text-dark border-none focus:outline-none focus:ring-0 w-32"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-sm text-text-muted font-bold">
          Total {filteredTxns.length} entries
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* You Gave */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <p className="text-3xl font-extrabold font-headline text-danger tracking-tight">
            {formatCurrency(totalGave, isPrivacyMode)}
          </p>
          <p className="text-sm font-bold text-danger mt-1">You Gave</p>
        </div>
        {/* You Got */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <p className="text-3xl font-extrabold font-headline text-primary tracking-tight">
            {formatCurrency(totalGot, isPrivacyMode)}
          </p>
          <p className="text-sm font-bold text-primary mt-1">You Got</p>
        </div>
        {/* Net Balance */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <p className={cn(
            "text-3xl font-extrabold font-headline tracking-tight",
            netBalance >= 0 ? "text-primary" : "text-danger"
          )}>
            {netBalance < 0 ? '-' : ''}{formatCurrency(Math.abs(netBalance), isPrivacyMode)}
          </p>
          <p className="text-sm font-bold text-text-muted mt-1">Net Balance</p>
        </div>
      </div>

      {/* Transactions Table */}
      <section className="bg-card rounded-[2rem] shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredTxns.length === 0 ? (
          <div className="py-16 text-center text-text-muted font-medium text-sm">
            No transactions found for the selected period.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-background/30 border-b border-border">
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">
                    {activeTab === 'customers' ? 'Customer Name' : 'Supplier Name'}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Details</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">You Gave</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">You Got</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTxns.map(tx => (
                  <tr key={tx.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-text-dark text-sm">{formatDate(tx.txn_date)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-text-dark text-sm">{tx.party_ledger_parties?.name || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-muted font-medium">{tx.note || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "font-bold text-sm",
                        tx.txn_type === 'gave' ? "text-danger" : "text-text-muted/30"
                      )}>
                        {tx.txn_type === 'gave' ? formatCurrency(tx.amount, isPrivacyMode) : '₹0'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "font-bold text-sm",
                        tx.txn_type === 'got' ? "text-primary" : "text-text-muted/30"
                      )}>
                        {tx.txn_type === 'got' ? formatCurrency(tx.amount, isPrivacyMode) : '₹0'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
