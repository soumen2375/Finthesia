import React, { useEffect, useState, useMemo } from 'react';
import { useUI } from '../context/UIContext';
import { useNavigate } from 'react-router-dom';
import { api, Liability, DebtSummary } from '../services/api';
import { formatCurrency } from '../lib/formatters';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../context/ToastContext';
import {
  CreditCard, Home, Car, GraduationCap, ShoppingBag,
  Wallet, HelpCircle, Plus, Pencil, Trash2,
  TrendingDown, Percent, CalendarClock, AlertTriangle, ArrowLeft,
  PieChart as PieChartIcon, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip as RechartsTooltip
} from 'recharts';
import { AddLiabilityModal } from '../components/AddLiabilityModal';

export const LIABILITY_CATEGORIES = [
  { id: 'credit_card', label: 'Credit Card Debt', icon: CreditCard, color: '#EF4444', bg: 'bg-red-500', bgLight: 'bg-red-500/10', textColor: 'text-red-500' },
  { id: 'personal_loan', label: 'Personal Loan', icon: Wallet, color: '#F59E0B', bg: 'bg-amber-500', bgLight: 'bg-amber-500/10', textColor: 'text-amber-500' },
  { id: 'home_loan', label: 'Home Loan', icon: Home, color: '#3B82F6', bg: 'bg-blue-500', bgLight: 'bg-blue-500/10', textColor: 'text-blue-500' },
  { id: 'vehicle_loan', label: 'Vehicle Loan', icon: Car, color: '#8B5CF6', bg: 'bg-violet-500', bgLight: 'bg-violet-500/10', textColor: 'text-violet-500' },
  { id: 'bnpl', label: 'Buy Now Pay Later', icon: ShoppingBag, color: '#EC4899', bg: 'bg-pink-500', bgLight: 'bg-pink-500/10', textColor: 'text-pink-500' },
  { id: 'education_loan', label: 'Education Loan', icon: GraduationCap, color: '#06B6D4', bg: 'bg-cyan-500', bgLight: 'bg-cyan-500/10', textColor: 'text-cyan-500' },
  { id: 'other', label: 'Other Debt', icon: HelpCircle, color: '#6B7280', bg: 'bg-gray-500', bgLight: 'bg-gray-500/10', textColor: 'text-gray-500' },
];

export function getCategoryConfig(type: string) {
  return LIABILITY_CATEGORIES.find(c => c.id === type) || LIABILITY_CATEGORIES[LIABILITY_CATEGORIES.length - 1];
}

export default function LiabilitiesPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [debtSummary, setDebtSummary] = useState<DebtSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLiab, setEditingLiab] = useState<Liability | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [liabs, summary] = await Promise.all([
        api.getLiabilities(),
        api.getDebtSummary(),
      ]);
      setLiabilities(liabs);
      setDebtSummary(summary);
    } catch (error) {
      console.error('Failed to fetch liabilities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [refreshKey]);

  // Card-debt rows (id starts with 'card-debt-') are virtual — they are
  // derived from the cards table. Direct delete is not supported.
  const isCardDebt = (id: string) => id.startsWith('card-debt-');

  const handleDelete = async (id: string) => {
    if (isCardDebt(id)) {
      setDeleteConfirm(null);
      showToast('Card debt is tracked via your credit card. Manage it from Cards.', 'error');
      return;
    }
    try {
      await api.deleteLiability(id);
      setDeleteConfirm(null);
      showToast('Liability deleted', 'success');
      fetchData();
    } catch (error) {
      console.error('Failed to delete:', error);
      showToast('Failed to delete liability', 'error');
    }
  };

  const totalLiabilities = liabilities.reduce((s, l) => s + Number(l.balance), 0);

  // Group by category
  const grouped = useMemo(() => {
    const map: Record<string, Liability[]> = {};
    liabilities.forEach(l => {
      const cat = l.liability_type || l.type || 'other';
      if (!map[cat]) map[cat] = [];
      map[cat].push(l);
    });
    return map;
  }, [liabilities]);

  const pieData = useMemo(() => {
    return LIABILITY_CATEGORIES
      .map(cat => ({
        name: cat.label,
        value: (grouped[cat.id] || []).reduce((s, l) => s + Number(l.balance), 0),
        color: cat.color,
      }))
      .filter(d => d.value > 0);
  }, [grouped]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-56 bg-slate-200/20 rounded-[2rem]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-200/20 rounded-[2rem]" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-slate-200/20 rounded-[2rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-sans tracking-tight">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-pink-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl animate-slam">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4 flex-1">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/net-worth')}
                className="h-10 w-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="inline-flex items-center px-4 py-1.5 bg-white/20 text-white text-[10px] font-bold uppercase rounded-full tracking-widest">
                <TrendingDown size={14} className="mr-2 stroke-[3]" />
                Liability Dashboard
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
                {formatCurrency(totalLiabilities, isPrivacyMode)}
              </h1>
              <p className="text-white/60 text-sm font-medium">
                Total across {liabilities.length} liabilit{liabilities.length !== 1 ? 'ies' : 'y'}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setEditingLiab(null); setIsModalOpen(true); }}
            className="h-[4.5rem] w-[4.5rem] bg-white text-red-600 hover:bg-gray-100 rounded-3xl flex items-center justify-center transition-all shadow-xl group shrink-0"
          >
            <Plus size={32} className="group-hover:rotate-90 transition-transform stroke-[2.5]" />
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
      </section>

      {/* Key Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slam" style={{ animationDelay: '0.05s' }}>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Monthly Payments</p>
          <p className="text-2xl font-bold text-text-dark mt-1">
            {formatCurrency(debtSummary?.total_monthly_payments || 0, isPrivacyMode)}
          </p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Credit Utilization</p>
          <div className="flex items-center space-x-3 mt-1">
            <p className={cn("text-2xl font-bold", (debtSummary?.credit_utilization || 0) > 30 ? "text-red-500" : "text-emerald-500")}>
              {debtSummary?.credit_utilization || 0}%
            </p>
            {(debtSummary?.credit_utilization || 0) > 30 && (
              <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-full uppercase">High</span>
            )}
          </div>
          <div className="w-full bg-border rounded-full h-2 mt-2 overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", (debtSummary?.credit_utilization || 0) > 30 ? "bg-red-500" : "bg-emerald-500")}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(debtSummary?.credit_utilization || 0, 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Debt Ratio</p>
          <p className={cn("text-2xl font-bold mt-1", (debtSummary?.debt_ratio || 0) > 40 ? "text-red-500" : (debtSummary?.debt_ratio || 0) > 20 ? "text-yellow-500" : "text-emerald-500")}>
            {debtSummary?.debt_ratio || 0}%
          </p>
          <p className="text-text-muted text-[10px]">of income goes to debt</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Liability Categories</p>
          <p className="text-2xl font-bold text-text-dark mt-1">{Object.keys(grouped).length}</p>
          <p className="text-text-muted text-[10px]">{liabilities.length} total items</p>
        </div>
      </section>

      {/* Chart + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Pie Chart */}
        <section className="lg:col-span-2 bg-card p-6 lg:p-8 rounded-[2rem] shadow-xl border border-border animate-slam" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
              <PieChartIcon size={20} />
            </div>
            <h3 className="text-lg font-bold text-text-dark">Debt Distribution</h3>
          </div>
          <div className="h-[260px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="99%" height="99%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => formatCurrency(value, isPrivacyMode)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-card)', color: 'var(--color-text-dark)' }}
                    itemStyle={{ color: 'var(--color-text-dark)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted italic text-sm">
                Add liabilities to see distribution
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {pieData.map(entry => (
              <div key={entry.name} className="flex items-center space-x-2">
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-bold text-text-muted truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Category Cards */}
        <section className="lg:col-span-3 space-y-4 animate-slam" style={{ animationDelay: '0.15s' }}>
          {LIABILITY_CATEGORIES.map((cat) => {
            const items = grouped[cat.id] || [];
            const catTotal = items.reduce((s, l) => s + Number(l.balance), 0);
            const catMonthly = items.reduce((s, l) => s + (Number(l.minimum_payment) || 0), 0);
            const isExpanded = expandedCategory === cat.id;

            if (items.length === 0) return null;

            return (
              <div key={cat.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Category Header - Clickable */}
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg", cat.bg)}>
                      <cat.icon size={22} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-text-dark">{cat.label}</p>
                      <p className="text-text-muted text-xs">{items.length} item{items.length !== 1 ? 's' : ''} • {formatCurrency(catMonthly, isPrivacyMode)}/mo</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="font-bold text-text-dark text-lg">{formatCurrency(catTotal, isPrivacyMode)}</p>
                    {isExpanded ? <ChevronUp size={20} className="text-text-muted" /> : <ChevronDown size={20} className="text-text-muted" />}
                  </div>
                </button>

                {/* Expanded Items */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border divide-y divide-border">
                        {items.map((lib) => (
                          <div key={lib.id} className="p-5 hover:bg-background/30 transition-all relative">
                            {/* Delete Confirmation */}
                            {deleteConfirm === lib.id && (
                              <div className="absolute inset-0 bg-card/95 backdrop-blur-sm z-10 flex items-center justify-center space-x-3 p-4">
                                <p className="font-bold text-text-dark text-sm">Delete?</p>
                                <button onClick={() => handleDelete(lib.id)} className="px-4 py-1.5 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-600 transition-colors">Yes</button>
                                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-1.5 bg-background border border-border text-text-dark rounded-lg font-bold text-sm transition-colors">No</button>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-bold text-text-dark truncate">{lib.name}</p>
                                  {lib.provider && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-background border border-border text-text-muted shrink-0">
                                      {lib.provider}
                                    </span>
                                  )}
                                </div>

                                {/* Detail Chips */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {lib.interest_rate != null && lib.interest_rate > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                                      <Percent size={10} className="mr-1" />{lib.interest_rate}% APR
                                    </span>
                                  )}
                                  {lib.minimum_payment != null && lib.minimum_payment > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600">
                                      EMI: {formatCurrency(lib.minimum_payment, isPrivacyMode)}
                                    </span>
                                  )}
                                  {lib.due_date && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600">
                                      <CalendarClock size={10} className="mr-1" />Due: {lib.due_date}
                                    </span>
                                  )}
                                  {lib.remaining_months != null && lib.remaining_months > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600">
                                      {lib.remaining_months}mo left
                                    </span>
                                  )}
                                  {lib.moratorium_status && (
                                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold", lib.moratorium_status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600')}>
                                      Moratorium: {lib.moratorium_status}
                                    </span>
                                  )}
                                </div>

                                {/* Credit utilization bar for credit cards */}
                                {cat.id === 'credit_card' && lib.credit_limit && lib.credit_limit > 0 && (
                                  <div className="mt-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Credit Utilization</span>
                                      <span className={cn("text-[10px] font-bold", (lib.balance / lib.credit_limit * 100) > 30 ? 'text-red-500' : 'text-emerald-500')}>
                                        {Math.round(lib.balance / lib.credit_limit * 100)}% of {formatCurrency(lib.credit_limit, isPrivacyMode)}
                                      </span>
                                    </div>
                                    <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                                      <motion.div
                                        className={cn("h-full rounded-full", (lib.balance / lib.credit_limit * 100) > 30 ? 'bg-red-500' : 'bg-emerald-500')}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(lib.balance / lib.credit_limit * 100, 100)}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Right side — Balance + Actions */}
                              <div className="flex items-center space-x-4 shrink-0">
                                <p className="text-xl font-bold text-text-dark">{formatCurrency(lib.balance, isPrivacyMode)}</p>
                                <div className="flex items-center space-x-1">
                                   {isCardDebt(lib.id) ? (
                                     <span
                                       className="px-2 py-1.5 rounded-lg bg-background border border-border text-[9px] font-bold text-text-muted uppercase tracking-widest cursor-default select-none"
                                       title="Managed via Cards"
                                     >
                                       Auto
                                     </span>
                                   ) : (
                                     <>
                                       <button
                                         onClick={() => { setEditingLiab(lib); setIsModalOpen(true); }}
                                         className="p-1.5 rounded-lg bg-background border border-border text-text-muted hover:text-text-dark transition-colors"
                                         title="Edit"
                                       >
                                         <Pencil size={14} />
                                       </button>
                                       <button
                                         onClick={() => setDeleteConfirm(lib.id)}
                                         className="p-1.5 rounded-lg bg-background border border-border text-text-muted hover:text-red-500 transition-colors"
                                         title="Delete"
                                       >
                                         <Trash2 size={14} />
                                       </button>
                                     </>
                                   )}
                                 </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {liabilities.length === 0 && (
            <div className="bg-card p-12 rounded-[2.5rem] shadow-xl border border-border text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center border border-border">
                  <TrendingDown size={32} className="text-border" strokeWidth={2} />
                </div>
                <p className="font-bold text-text-dark text-lg">No liabilities tracked</p>
                <p className="text-text-muted text-sm max-w-md">
                  Add your loans, credit cards, and other debts to track your financial obligations and improve your health score.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-primary mt-2 flex items-center space-x-2"
                >
                  <Plus size={18} />
                  <span>Add Liability</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Credit Utilization Warning */}
      {debtSummary && debtSummary.credit_utilization > 30 && (
        <section className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-center space-x-4 animate-slam" style={{ animationDelay: '0.2s' }}>
          <div className="h-10 w-10 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <p className="font-bold text-red-600 text-sm">High Credit Utilization</p>
            <p className="text-red-600/80 text-xs">
              Your credit utilization is {debtSummary.credit_utilization}%. Try keeping it under 30% for a better credit score.
              Currently using {formatCurrency(debtSummary.total_credit_used, isPrivacyMode)} of {formatCurrency(debtSummary.total_credit_limit, isPrivacyMode)} limit.
            </p>
          </div>
        </section>
      )}

      <AddLiabilityModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingLiab(null); }}
        onSaved={fetchData}
        editingLiab={editingLiab}
      />
    </div>
  );
}
