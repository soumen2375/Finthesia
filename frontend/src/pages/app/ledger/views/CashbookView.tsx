import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Search, Calendar, Download, Edit2, Trash2,
  TrendingUp, TrendingDown, Landmark, Plus, Minus,
  ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { CashEntry } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CashbookViewProps {
  cashEntries: CashEntry[];
  isLoading: boolean;
  isPrivacyMode: boolean;
  onDeleteEntry: (id: string) => void;
  onAddEntry?: (type: 'cash_in' | 'cash_out') => void;
  onRefresh?: () => void;
}

type DatePreset = 'today' | '7d' | '30d' | '90d' | 'all' | 'custom';

const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Custom Range' },
];

const ITEMS_PER_PAGE = 15;

const CATEGORY_EMOJI: Record<string, string> = {
  'Sales': '🛒', 'Collection': '💰', 'Salary': '💼', 'Investment Return': '📈',
  'Loan Received': '🏦', 'Gift': '🎁', 'Refund': '↩️', 'Other Income': '💵',
  'Purchase': '🛍️', 'Expense': '💸', 'Salary Paid': '👷', 'Rent': '🏠',
  'Utility': '💡', 'Loan Payment': '📋', 'Travel': '✈️', 'Food': '🍽️',
  'Maintenance': '🔧', 'Other Expense': '📌',
};

export default function CashbookView({
  cashEntries, isLoading, isPrivacyMode, onDeleteEntry, onAddEntry
}: CashbookViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'cash_in' | 'cash_out'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [datePreset, setDatePreset] = useState<DatePreset>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) setShowDatePicker(false);
    };
    if (showDatePicker) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDatePicker]);

  const allCategories = useMemo(() => {
    const cats = new Set(cashEntries.map(e => e.category));
    return ['All Categories', ...Array.from(cats).sort()];
  }, [cashEntries]);

  const filteredEntries = useMemo(() => {
    const now = new Date();
    return cashEntries.filter(e => {
      if (typeFilter !== 'all' && e.entry_type !== typeFilter) return false;
      if (categoryFilter !== 'All Categories' && e.category !== categoryFilter) return false;
      const entryDate = e.entry_date;
      if (datePreset === 'custom') {
        if (customStartDate && entryDate < customStartDate) return false;
        if (customEndDate && entryDate > customEndDate) return false;
      } else if (datePreset !== 'all') {
        const entryDateObj = new Date(entryDate + 'T00:00:00');
        const daysAgo = Math.floor((now.getTime() - entryDateObj.getTime()) / (1000 * 60 * 60 * 24));
        if (datePreset === 'today' && daysAgo > 0) return false;
        if (datePreset === '7d' && daysAgo > 7) return false;
        if (datePreset === '30d' && daysAgo > 30) return false;
        if (datePreset === '90d' && daysAgo > 90) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return e.category.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [cashEntries, typeFilter, categoryFilter, searchQuery, datePreset, customStartDate, customEndDate]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, typeFilter, categoryFilter, datePreset, customStartDate, customEndDate]);

  const totals = useMemo(() => {
    const cashIn = filteredEntries.filter(e => e.entry_type === 'cash_in').reduce((s, e) => s + Number(e.amount), 0);
    const cashOut = filteredEntries.filter(e => e.entry_type === 'cash_out').reduce((s, e) => s + Number(e.amount), 0);
    return { cashIn, cashOut, net: cashIn - cashOut };
  }, [filteredEntries]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / ITEMS_PER_PAGE));
  const paginatedEntries = filteredEntries.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const dateLabel = datePreset === 'custom'
    ? (customStartDate && customEndDate
        ? `${new Date(customStartDate+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – ${new Date(customEndDate+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'})}`
        : 'Custom Range')
    : DATE_PRESETS.find(p => p.id === datePreset)?.label || 'Last 30 Days';

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    doc.setFontSize(20); doc.setFont('helvetica', 'bold');
    doc.text('Cashbook Report', pw / 2, 20, { align: 'center' });
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, pw / 2, 28, { align: 'center' });
    doc.text(`Date Range: ${dateLabel}`, pw / 2, 34, { align: 'center' });
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text(`Total Cash In: ${formatCurrency(totals.cashIn, false)}`, 14, 46);
    doc.text(`Total Cash Out: ${formatCurrency(totals.cashOut, false)}`, 14, 53);
    doc.text(`Net Balance: ${formatCurrency(totals.net, false)}`, 14, 60);
    let runningBalance = 0;
    const tableData = filteredEntries
      .sort((a, b) => a.entry_date.localeCompare(b.entry_date))
      .map(entry => {
        const isIn = entry.entry_type === 'cash_in';
        runningBalance += isIn ? Number(entry.amount) : -Number(entry.amount);
        return [
          formatDate(entry.entry_date),
          entry.note || entry.category,
          entry.category,
          isIn ? formatCurrency(Number(entry.amount), false) : '',
          !isIn ? formatCurrency(Number(entry.amount), false) : '',
          formatCurrency(runningBalance, false),
        ];
      });
    autoTable(doc, {
      startY: 68,
      head: [['Date', 'Description', 'Category', 'Cash In', 'Cash Out', 'Balance']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [39, 196, 225], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 248, 250] },
      columnStyles: {
        3: { halign: 'right', textColor: [34, 197, 94] },
        4: { halign: 'right', textColor: [239, 68, 68] },
        5: { halign: 'right', fontStyle: 'bold' },
      },
    });
    const finalY = (doc as any).lastAutoTable?.finalY || 80;
    doc.setFontSize(8); doc.setTextColor(150);
    doc.text('Powered by Finthesia', pw / 2, finalY + 12, { align: 'center' });
    doc.save(`cashbook-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-24 font-sans tracking-tight relative min-h-[80vh]">

      {/* ─── 3 Summary Cards (matching screenshot) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Cash In */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-text-muted mb-2">Cash In</p>
            <p className="text-3xl font-extrabold font-headline text-text-dark">
              {formatCurrency(totals.cashIn, isPrivacyMode)}
            </p>
          </div>
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <ArrowUpCircle size={22} strokeWidth={2} />
          </div>
        </div>

        {/* Cash Out */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-text-muted mb-2">Cash Out</p>
            <p className="text-3xl font-extrabold font-headline text-text-dark">
              {formatCurrency(totals.cashOut, isPrivacyMode)}
            </p>
          </div>
          <div className="h-10 w-10 bg-danger/10 text-danger rounded-xl flex items-center justify-center">
            <ArrowDownCircle size={22} strokeWidth={2} />
          </div>
        </div>

        {/* Net Balance – accent cyan card */}
        <div className="bg-primary rounded-2xl shadow-xl shadow-primary/20 p-6 flex items-start justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-bold text-white/80 mb-2">Net Cash Balance</p>
            <p className="text-3xl font-extrabold font-headline text-white">
              {formatCurrency(totals.net, isPrivacyMode)}
            </p>
          </div>
          <div className="relative z-10 h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Landmark size={20} className="text-white" />
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10"><Landmark size={100} /></div>
        </div>
      </div>

      {/* ─── Filter Bar (matching screenshot) ─── */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Search + Type Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-text-dark focus:outline-none focus:ring-1 focus:ring-primary shadow-sm" />
          </div>
          {/* All / Income / Expense pill toggle */}
          <div className="flex items-center bg-background border border-border rounded-lg p-0.5">
            {(['all', 'cash_in', 'cash_out'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition-all",
                  typeFilter === t ? "bg-card text-text-dark shadow-sm border border-border/60" : "text-text-muted hover:text-text-dark"
                )}>
                {t === 'all' ? 'All' : t === 'cash_in' ? 'Income' : 'Expense'}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Export + Category + Date */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm font-bold text-text-dark hover:bg-border/30 transition-colors shadow-sm shrink-0">
            <Download size={15} /> Export PDF
          </button>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="bg-background border border-border rounded-lg text-sm font-bold py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm appearance-none cursor-pointer text-text-dark shrink-0">
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="relative" ref={datePickerRef}>
            <button onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm font-bold text-text-dark hover:bg-border/30 transition-colors shadow-sm shrink-0">
              <Calendar size={15} />
              <span className="flex flex-col text-left leading-none">
                <span className="text-[10px] text-text-muted font-normal">Date Range</span>
                {dateLabel}
              </span>
            </button>
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-card rounded-xl shadow-xl border border-border py-2 z-50">
                {DATE_PRESETS.map(opt => (
                  <button key={opt.id} onClick={() => { setDatePreset(opt.id); if (opt.id !== 'custom') setShowDatePicker(false); }}
                    className={cn("w-full text-left px-4 py-2.5 text-sm font-medium transition-colors",
                      datePreset === opt.id ? "bg-primary/10 text-primary font-bold" : "text-text-dark hover:bg-background")}>
                    {opt.label}
                  </button>
                ))}
                {datePreset === 'custom' && (
                  <div className="px-4 py-3 border-t border-border space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Start</label>
                    <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">End</label>
                    <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
                    <button onClick={() => setShowDatePicker(false)} className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 mt-1">Apply</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Entry count */}
      <p className="text-xs font-bold text-text-muted">{filteredEntries.length} entries found</p>

      {/* ─── Transactions Table ─── */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-background/50 border-b border-border">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted">DATE</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted">DESCRIPTION</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-center">CATEGORY</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-right">AMOUNT</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-text-muted text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" /></td></tr>
              ) : paginatedEntries.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-text-muted font-medium">No transactions found.</td></tr>
              ) : paginatedEntries.map((entry, idx) => {
                const isIncome = entry.entry_type === 'cash_in';
                return (
                  <tr key={entry.id || `cb-${idx}`} className="hover:bg-background/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-text-dark">{formatDate(entry.entry_date)}</span>
                    </td>
                    <td className="px-6 py-4 w-1/3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0",
                          isIncome ? "bg-primary/10" : "bg-danger/10")}>
                          {CATEGORY_EMOJI[entry.category] || (isIncome ? '📈' : '📌')}
                        </div>
                        <span className="text-sm font-bold text-text-dark">{entry.note || entry.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-background border border-border text-text-muted">
                        {entry.category}
                      </span>
                    </td>
                    <td className={cn("px-6 py-4 text-right font-headline font-bold text-lg", isIncome ? 'text-primary' : 'text-danger')}>
                      {isIncome ? '+' : '-'}{formatCurrency(Math.abs(Number(entry.amount)), isPrivacyMode)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-text-dark hover:bg-primary/10 hover:text-primary transition-all rounded-lg bg-background" title="Edit">
                          <Edit2 size={14} strokeWidth={2.5} />
                        </button>
                        <button onClick={() => onDeleteEntry(entry.id)} className="p-2 text-text-dark hover:bg-danger/10 hover:text-danger transition-all rounded-lg bg-background" title="Delete">
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredEntries.length > ITEMS_PER_PAGE && (
          <div className="px-6 py-4 flex flex-wrap items-center justify-between border-t border-border bg-card">
            <span className="text-sm font-medium text-text-muted">
              {Math.min(filteredEntries.length, (currentPage-1)*ITEMS_PER_PAGE+1)}–{Math.min(filteredEntries.length, currentPage*ITEMS_PER_PAGE)} of {filteredEntries.length}
            </span>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button onClick={() => setCurrentPage(p => Math.max(1,p-1))} disabled={currentPage===1} className="p-2 rounded-lg border border-border hover:bg-card text-text-muted disabled:opacity-30 transition-colors"><ChevronLeft size={16}/></button>
              {Array.from({length: Math.min(totalPages,5)},(_,i)=>(
                <button key={i+1} onClick={() => setCurrentPage(i+1)} className={cn("w-8 h-8 rounded-lg text-xs font-bold transition-colors", currentPage===i+1?"bg-primary text-white shadow-sm":"border border-border text-text-muted hover:bg-card")}>{i+1}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="p-2 rounded-lg border border-border hover:bg-card text-text-muted disabled:opacity-30 transition-colors"><ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 lg:bottom-8 right-4 md:right-12 flex items-center gap-4 z-40">
        <button onClick={() => onAddEntry?.('cash_out')}
          className="w-14 h-14 bg-danger text-white rounded-2xl shadow-xl shadow-danger/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
          <Minus size={28} strokeWidth={2.5} />
        </button>
        <button onClick={() => onAddEntry?.('cash_in')}
          className="w-14 h-14 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
