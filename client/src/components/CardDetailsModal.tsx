import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { api, Card, EMI, Transaction } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatCurrencyCompact } from '../lib/formatters';
import { useUI } from '../context/UIContext';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar,
  Receipt,
  BarChart3,
  Settings,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart,
  ReferenceLine
} from 'recharts';
import { cn } from '../lib/utils';

interface CardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card;
  onUpdate: () => void;
}

export function CardDetailsModal({ isOpen, onClose, card, onUpdate }: CardDetailsModalProps) {
  const { showToast } = useToast();
  const { isPrivacyMode } = useUI();
  const [emis, setEmis] = useState<EMI[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddingEMI, setIsAddingEMI] = useState(false);
  const [editingEMI, setEditingEMI] = useState<EMI | null>(null);
  const [isEditingFees, setIsEditingFees] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'6M' | '1Y' | 'All'>('6M');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [isRemovingCard, setIsRemovingCard] = useState(false);
  const [removeConfirmText, setRemoveConfirmText] = useState('');
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && card.id) {
      fetchData();
    }
  }, [isOpen, card.id]);

  const fetchData = async () => {
    try {
      const [emiData, txData] = await Promise.all([
        api.getEMIs(card.id),
        api.getTransactions()
      ]);
      setEmis(emiData);
      setTransactions(txData.filter(tx => tx.card_id === card.id));
    } catch (error) {
      console.error('Failed to fetch card details:', error);
    }
  };

  const usedAmount = card.credit_limit - card.available_credit;
  const utilization = (usedAmount / card.credit_limit) * 100;

  const getUtilizationColor = (percent: number) => {
    if (percent < 30) return 'bg-primary';
    if (percent < 70) return 'bg-warning';
    if (percent < 90) return 'bg-orange-500';
    return 'bg-danger';
  };

  const paymentInfo = useMemo(() => {
    if (!card.payment_due_date) {
      return { 
        status: 'N/A', 
        color: 'text-text-muted', 
        dotColor: 'bg-border',
        alert: null,
        isOverdue: false
      };
    }
    
    const dueDate = new Date(card.payment_due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const remindBefore = card.remind_before_days ?? 3;
    
    // If remindBefore is 0, show "Already paid"
    if (remindBefore === 0) {
      return { 
        status: 'Already paid', 
        color: 'text-primary', 
        dotColor: 'bg-primary',
        alert: null,
        isOverdue: false
      };
    }

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { 
        status: 'Overdue', 
        color: 'text-danger', 
        dotColor: 'bg-danger animate-pulse',
        alert: "⚠ Payment overdue. Pay your bill immediately to avoid late fees and a negative impact on your credit score.",
        isOverdue: true
      };
    }
    
    if (diffDays <= remindBefore) {
      return { 
        status: `Due in ${diffDays} days`, 
        color: 'text-warning', 
        dotColor: 'bg-warning',
        alert: "Your payment is due soon. Ensure you have sufficient funds in your linked account.",
        isOverdue: false
      };
    }
    
    return { 
      status: 'Payment on Track', 
      color: 'text-primary', 
      dotColor: 'bg-primary',
      alert: null,
      isOverdue: false
    };
  }, [card.payment_due_date, card.remind_before_days]);

  const chartData = useMemo(() => {
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    return months.map(month => {
      const monthTxs = transactions.filter(tx => {
        const date = new Date(tx.transaction_date);
        return date.toLocaleString('default', { month: 'short' }) === month && 
               (tx.type === 'spend' || tx.type === 'expense');
      });
      const total = monthTxs.reduce((sum, tx) => sum + tx.amount, 0);
      
      // Category breakdown for this month
      const categories: Record<string, number> = {};
      monthTxs.forEach(tx => {
        categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
      });

      const mockValues: Record<string, number> = {
        'Oct': 4500, 'Nov': 5200, 'Dec': 3800, 'Jan': 6100, 'Feb': 5400, 'Mar': 7250
      };
      
      const finalAmount = total || mockValues[month] || 0;
      
      // If no real transactions, provide mock categories based on finalAmount
      const finalCategories = Object.keys(categories).length > 0 ? categories : {
        Food: finalAmount * 0.3,
        Travel: finalAmount * 0.2,
        Shopping: finalAmount * 0.3,
        Bills: finalAmount * 0.2
      };

      return {
        name: month,
        amount: finalAmount,
        categories: finalCategories
      };
    });
  }, [transactions]);

  const totalSpending = chartData[chartData.length - 1].amount;
  const prevSpending = chartData[chartData.length - 2].amount;
  const percentChange = ((totalSpending - prevSpending) / prevSpending) * 100;

  const handleSaveEMI = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emiData: EMI = {
      id: editingEMI ? editingEMI.id : crypto.randomUUID(),
      card_id: card.id,
      description: formData.get('description') as string,
      original_amount: Number(formData.get('original_amount')),
      remaining_amount: Number(formData.get('remaining_amount')),
      monthly_payment: Number(formData.get('monthly_payment')),
      remaining_months: Number(formData.get('remaining_months')),
      next_due_date: formData.get('next_due_date') as string,
    };
    try {
      if (editingEMI) await api.deleteEMI(editingEMI.id);
      await api.addEMI(emiData);
      showToast(editingEMI ? 'EMI updated' : 'EMI added', 'success');
      setIsAddingEMI(false);
      setEditingEMI(null);
      fetchData();
    } catch (error) {
      showToast('Failed to save EMI', 'error');
    }
  };

  const handleDeleteEMI = async (id: string) => {
    if (!confirm('Are you sure you want to delete this EMI?')) return;
    try {
      await api.deleteEMI(id);
      showToast('EMI deleted', 'success');
      fetchData();
    } catch (error) {
      showToast('Failed to delete EMI', 'error');
    }
  };

  const handleUpdateFees = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedCard = {
      ...card,
      annual_fee: Number(formData.get('annual_fee')),
      joining_fee: Number(formData.get('joining_fee')),
      reward_points: Number(formData.get('reward_points')),
      cashback_percent: Number(formData.get('cashback_percent')),
      apr: Number(formData.get('apr')),
    };
    try {
      await api.updateCard(updatedCard);
      showToast('Card details updated', 'success');
      setIsEditingFees(false);
      onUpdate();
    } catch (error) {
      showToast('Failed to update card details', 'error');
    }
  };

  const [editFormData, setEditFormData] = useState({
    name: card.name,
    credit_limit: card.credit_limit,
    available_credit: card.available_credit,
    billing_cycle: card.billing_cycle || '',
    payment_due_date: card.payment_due_date || '',
    monthly_budget: card.monthly_budget || 0,
    statement_generation_day: card.statement_generation_day || 1,
    payment_due_day: card.payment_due_day || 15,
    minimum_amount_due: card.minimum_amount_due || 0,
    utilization_alert_threshold: card.utilization_alert_threshold || 70,
    remind_before_days: card.remind_before_days || 3,
    remind_on_due_date: card.remind_on_due_date ?? true,
    allow_manual_override: card.allow_manual_override ?? false,
    total_amount_due: card.total_amount_due || 0
  });

  useEffect(() => {
    setEditFormData({
      name: card.name,
      credit_limit: card.credit_limit,
      available_credit: card.available_credit,
      billing_cycle: card.billing_cycle || '',
      payment_due_date: card.payment_due_date || '',
      monthly_budget: card.monthly_budget || 0,
      statement_generation_day: card.statement_generation_day || 1,
      payment_due_day: card.payment_due_day || 15,
      minimum_amount_due: card.minimum_amount_due || 0,
      utilization_alert_threshold: card.utilization_alert_threshold || 70,
      remind_before_days: card.remind_before_days || 3,
      remind_on_due_date: card.remind_on_due_date ?? true,
      allow_manual_override: card.allow_manual_override ?? false,
      total_amount_due: card.total_amount_due || 0
    });
  }, [card]);

  const isEditChanged = useMemo(() => {
    return editFormData.name !== card.name ||
           Number(editFormData.credit_limit) !== card.credit_limit ||
           Number(editFormData.available_credit) !== card.available_credit ||
           editFormData.billing_cycle !== (card.billing_cycle || '') ||
           editFormData.payment_due_date !== (card.payment_due_date || '') ||
           Number(editFormData.monthly_budget) !== (card.monthly_budget || 0) ||
           Number(editFormData.statement_generation_day) !== (card.statement_generation_day || 1) ||
           Number(editFormData.payment_due_day) !== (card.payment_due_day || 15) ||
           Number(editFormData.minimum_amount_due) !== (card.minimum_amount_due || 0) ||
           Number(editFormData.utilization_alert_threshold) !== (card.utilization_alert_threshold || 70) ||
           Number(editFormData.remind_before_days) !== (card.remind_before_days || 3) ||
           editFormData.remind_on_due_date !== (card.remind_on_due_date ?? true) ||
           editFormData.allow_manual_override !== (card.allow_manual_override ?? false) ||
           Number(editFormData.total_amount_due) !== (card.total_amount_due || 0);
  }, [editFormData, card]);

  const handleUpdateCard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    const outstanding = editFormData.credit_limit - editFormData.available_credit;
    if (editFormData.credit_limit < outstanding) {
      showToast('Credit limit cannot be less than outstanding balance', 'error');
      return;
    }
    if (editFormData.monthly_budget > editFormData.credit_limit) {
      showToast('Monthly budget cannot exceed credit limit', 'error');
      return;
    }
    if (editFormData.minimum_amount_due >= editFormData.total_amount_due && editFormData.total_amount_due > 0) {
      showToast('Minimum due must be less than total amount due', 'error');
      return;
    }

    setIsSaving(true);
    const updatedCard: Card = {
      ...card,
      name: editFormData.name,
      credit_limit: Number(editFormData.credit_limit),
      available_credit: Number(editFormData.available_credit),
      billing_cycle: editFormData.billing_cycle,
      payment_due_date: editFormData.payment_due_date,
      monthly_budget: Number(editFormData.monthly_budget),
      statement_generation_day: Number(editFormData.statement_generation_day),
      payment_due_day: Number(editFormData.payment_due_day),
      minimum_amount_due: Number(editFormData.minimum_amount_due),
      utilization_alert_threshold: Number(editFormData.utilization_alert_threshold),
      remind_before_days: Number(editFormData.remind_before_days),
      remind_on_due_date: editFormData.remind_on_due_date,
      allow_manual_override: editFormData.allow_manual_override,
      total_amount_due: Number(editFormData.total_amount_due)
    };
    try {
      await api.updateCard(updatedCard);
      showToast('Card updated successfully', 'success');
      setIsEditingCard(false);
      onUpdate();
    } catch (error) {
      showToast('Failed to update card', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseEdit = () => {
    if (isEditChanged) {
      if (confirm('Discard unsaved changes?')) {
        setIsEditingCard(false);
      }
    } else {
      setIsEditingCard(false);
    }
  };

  const handleRemoveCard = async () => {
    const hasPending = (card.total_amount_due || 0) > 0 || emis.length > 0;
    if (hasPending && removeConfirmText !== 'REMOVE') {
      showToast('Please type REMOVE to confirm', 'error');
      return;
    }

    try {
      await api.deleteCard(card.id);
      showToast('Card removed successfully', 'success');
      setIsRemovingCard(false);
      onClose();
      onUpdate();
    } catch (error) {
      showToast('Failed to remove card', 'error');
    }
  };

  const cardTitle = `${card.bank_name || 'Unknown Bank'} - ${card.card_variant || 'Unknown Variant'}`;

  const headerActions = (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-full hover:bg-background transition-colors text-text-muted"
      >
        <MoreVertical size={20} />
      </button>
      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-card rounded-2xl shadow-xl border border-border py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => { setShowMenu(false); setIsEditingCard(true); }}
              className="w-full px-4 py-2.5 text-left text-sm font-bold text-text-dark hover:bg-background flex items-center space-x-3"
            >
              <Edit2 size={16} className="text-text-muted" />
              <span>Edit Card</span>
            </button>
            <button
              onClick={() => { setShowMenu(false); setIsRemovingCard(true); }}
              className="w-full px-4 py-2.5 text-left text-sm font-bold text-danger hover:bg-danger/5 flex items-center space-x-3"
            >
              <Trash2 size={16} className="text-danger/60" />
              <span>Remove Card</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={cardTitle} 
        maxWidth="max-w-4xl"
        headerActions={headerActions}
      >
      <div className="flex flex-col space-y-10 pb-10">
        
        {/* 1. Billing & Payment Section */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center space-x-3 px-1">
            <div className="h-8 w-8 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center shadow-sm">
              <Receipt size={18} />
            </div>
            <h3 className="text-xl font-bold text-text-dark">Billing & Payment</h3>
          </div>
          
          <div className="card p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Payment Status</p>
                  <div className="flex items-center space-x-2">
                    <div className={cn("h-2 w-2 rounded-full shadow-sm", paymentInfo.dotColor)} />
                    <span className={cn("text-lg font-bold", paymentInfo.color)}>
                      {paymentInfo.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Amount Due</p>
                  <p className="text-3xl font-bold text-text-dark">{formatCurrency(card.total_amount_due || 0, isPrivacyMode)}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Due Date</p>
                  <p className={cn("text-lg font-bold", paymentInfo.isOverdue ? "text-danger" : "text-text-dark")}>
                    {card.payment_due_date || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Billing Cycle</p>
                  <p className="text-lg font-bold text-text-dark">{card.billing_cycle || '15th to 14th'}</p>
                </div>
              </div>
            </div>

            {paymentInfo.alert && (
              <div className={cn(
                "p-6 rounded-2xl flex items-start space-x-4 border shadow-sm",
                paymentInfo.isOverdue ? "bg-danger/5 border-danger/10 text-danger" : "bg-secondary/5 border-secondary/10 text-secondary"
              )}>
                <AlertCircle size={24} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest">Financial Alert</p>
                  <p className="text-sm leading-relaxed opacity-90">
                    {paymentInfo.alert}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 2. Monthly Spending Trend Section */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center space-x-3 px-1">
            <div className="h-8 w-8 bg-[#00BFFF]/10 text-[#00BFFF] rounded-lg flex items-center justify-center shadow-sm">
              <BarChart3 size={18} />
            </div>
            <h3 className="text-xl font-bold text-text-dark">Monthly Spending Trend</h3>
          </div>

          <div className="card p-6 sm:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Monthly Spending – This Card Only</p>
                <div className="flex items-baseline space-x-3">
                  <h4 className="text-3xl font-bold text-text-dark">{formatCurrency(totalSpending, isPrivacyMode)}</h4>
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full flex items-center shadow-sm",
                    percentChange >= 0 ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"
                  )}>
                    {percentChange >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                    {Math.abs(percentChange).toFixed(0)}%
                  </span>
                </div>
                <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-wider">
                  {formatCurrency(totalSpending, isPrivacyMode)} of {formatCurrency(card.monthly_budget || 0, isPrivacyMode)} budget ({((totalSpending / (card.monthly_budget || 1)) * 100).toFixed(0)}%)
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-3">
                <div className="flex bg-background p-1 rounded-xl border border-border">
                  {(['6M', '1Y', 'All'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTimeFilter(f)}
                      className={cn(
                        "px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                        timeFilter === f ? "bg-card text-secondary shadow-sm" : "text-text-muted hover:text-text-dark"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="flex bg-background p-1 rounded-xl border border-border">
                  <button
                    onClick={() => setShowCategoryBreakdown(false)}
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold rounded-lg transition-all",
                      !showCategoryBreakdown ? "bg-card text-secondary shadow-sm" : "text-text-muted hover:text-text-dark"
                    )}
                  >
                    Total
                  </button>
                  <button
                    onClick={() => setShowCategoryBreakdown(true)}
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold rounded-lg transition-all",
                      showCategoryBreakdown ? "bg-card text-secondary shadow-sm" : "text-text-muted hover:text-text-dark"
                    )}
                  >
                    By Category
                  </button>
                </div>
              </div>
            </div>

            <div className="h-[320px] w-full mt-4 min-h-0 min-w-0 flex-1">
              <ResponsiveContainer width="99%" height="99%">
                <AreaChart data={chartData} margin={{ top: 20, right: 60, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#27C4E1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#27C4E1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }}
                    tickFormatter={(value: number) => formatCurrencyCompact(value, isPrivacyMode)}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-card p-4 rounded-2xl shadow-2xl border border-border min-w-[200px] space-y-3">
                            <div className="flex justify-between items-center border-b border-border pb-2">
                              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label} 2026</p>
                              <p className="text-sm font-bold text-secondary">{formatCurrency(d.amount, isPrivacyMode)}</p>
                            </div>
                            <div className="space-y-2">
                              {Object.entries(d.categories).map(([c, v]) => (
                                <div key={c} className="flex justify-between text-[10px] font-bold">
                                  <span className="text-text-muted">{c}</span>
                                  <span className="text-text-dark">{formatCurrency(v as number, isPrivacyMode)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#27C4E1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSpend)"
                    dot={{ r: 4, fill: '#27C4E1', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#27C4E1', strokeWidth: 0 }}
                  />
                  {card.monthly_budget && (
                    <ReferenceLine 
                      y={card.monthly_budget} 
                      stroke="#EF4444" 
                      strokeDasharray="5 5" 
                      label={{ 
                        position: 'right', 
                        value: `Budget ${formatCurrencyCompact(card.monthly_budget, isPrivacyMode)}`, 
                        fill: '#EF4444', 
                        fontSize: 10, 
                        fontWeight: 'bold',
                        dx: 10
                      }} 
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-background rounded-2xl border border-border shadow-sm">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Spending Insight</p>
                <p className="text-sm text-text-dark/80 leading-relaxed">
                  {percentChange > 0 
                    ? `You spent ${percentChange.toFixed(0)}% more than last month. Most increase from Shopping.`
                    : `Great! You spent ${Math.abs(percentChange).toFixed(0)}% less than last month.`}
                  {totalSpending > (card.monthly_budget || 0) && (
                    <span className="text-danger font-bold block mt-1">⚠ Budget exceeded by {formatCurrency(totalSpending - (card.monthly_budget || 0), isPrivacyMode)}</span>
                  )}
                </p>
              </div>
              <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10 shadow-sm">
                <p className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest mb-1">Predictive Insight</p>
                <p className="text-sm text-secondary leading-relaxed">
                  At this pace, you may reach {formatCurrency(totalSpending * 1.2, isPrivacyMode)} by month end. 
                  Consider limiting non-essential spends.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. EMI Tracking Section */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center space-x-3 px-1">
            <div className="h-8 w-8 bg-warning/10 text-warning rounded-lg flex items-center justify-center shadow-sm">
              <Calendar size={18} />
            </div>
            <h3 className="text-xl font-bold text-text-dark">EMI Tracking</h3>
          </div>

          <div className="card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Active EMIs</p>
              <Button size="sm" variant="outline" className="h-9" onClick={() => setIsAddingEMI(true)}>
                <Plus size={16} className="mr-2" /> Add EMI
              </Button>
            </div>

            {(isAddingEMI || editingEMI) && (
              <form onSubmit={handleSaveEMI} className="bg-background p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 border border-border shadow-inner">
                <div className="sm:col-span-2">
                  <Input name="description" label="Description" defaultValue={editingEMI?.description} placeholder="e.g. iPhone 15 Pro" required />
                </div>
                <Input name="original_amount" label="Original Amount (₹)" type="number" defaultValue={editingEMI?.original_amount} placeholder="0" required />
                <Input name="remaining_amount" label="Remaining Amount (₹)" type="number" defaultValue={editingEMI?.remaining_amount} placeholder="0" required />
                <Input name="monthly_payment" label="Monthly Payment (₹)" type="number" defaultValue={editingEMI?.monthly_payment} placeholder="0" required />
                <Input name="remaining_months" label="Remaining Months" type="number" defaultValue={editingEMI?.remaining_months} required />
                <div className="sm:col-span-2">
                  <Input name="next_due_date" label="Next Due Date" type="date" defaultValue={editingEMI?.next_due_date} required />
                </div>
                <div className="sm:col-span-2 flex space-x-3 pt-2">
                  <Button type="submit" className="flex-1">{editingEMI ? 'Update EMI' : 'Save EMI'}</Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsAddingEMI(false); setEditingEMI(null); }}>Cancel</Button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Item</th>
                    <th className="pb-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Remaining</th>
                    <th className="pb-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Monthly</th>
                    <th className="pb-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Months</th>
                    <th className="pb-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {emis.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-text-muted text-sm italic">No EMIs currently tracked.</td></tr>
                  ) : (
                    emis.map(emi => (
                      <tr key={emi.id} className="group">
                        <td className="py-4">
                          <p className="text-sm font-bold text-text-dark">{emi.description}</p>
                          <p className="text-[10px] text-text-muted font-medium">Next: {emi.next_due_date}</p>
                        </td>
                        <td className="py-4 text-right text-sm font-bold text-text-dark/80">{formatCurrency(emi.remaining_amount, isPrivacyMode)}</td>
                        <td className="py-4 text-right text-sm font-bold text-secondary">{formatCurrency(emi.monthly_payment, isPrivacyMode)}</td>
                        <td className="py-4 text-center text-sm font-bold text-text-muted">{emi.remaining_months}</td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end space-x-1">
                            <button onClick={() => setEditingEMI(emi)} className="p-2 text-text-muted/40 hover:text-secondary transition-colors"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteEMI(emi.id)} className="p-2 text-text-muted/40 hover:text-danger transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. Card Details & Fees Section */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center space-x-3 px-1">
            <div className="h-8 w-8 bg-background text-text-muted rounded-lg flex items-center justify-center shadow-sm border border-border">
              <Settings size={18} />
            </div>
            <h3 className="text-xl font-bold text-text-dark">Card Details & Fees</h3>
          </div>

          <div className="card p-8 space-y-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Fee Structure</p>
              <Button size="sm" variant="outline" className="h-9" onClick={() => setIsEditingFees(!isEditingFees)}>
                {isEditingFees ? 'Cancel' : <><Edit2 size={16} className="mr-2" /> Edit Details</>}
              </Button>
            </div>

            {isEditingFees ? (
              <form onSubmit={handleUpdateFees} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input name="annual_fee" label="Annual Fee (₹)" type="number" defaultValue={card.annual_fee} placeholder="0" />
                <Input name="joining_fee" label="Joining Fee (₹)" type="number" defaultValue={card.joining_fee} placeholder="0" />
                <Input name="apr" label="Interest Rate (APR %)" type="number" step="0.01" defaultValue={card.apr} />
                <Input name="reward_points" label="Reward Points" type="number" defaultValue={card.reward_points} />
                <Input name="cashback_percent" label="Cashback %" type="number" step="0.1" defaultValue={card.cashback_percent} />
                <div className="sm:col-span-2 pt-4">
                  <Button type="submit" className="w-full py-4">Save Changes</Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-10 gap-x-8">
                <div className="space-y-1">
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Annual Fee</p>
                  <p className="text-lg font-bold text-text-dark">{formatCurrency(card.annual_fee || 0, isPrivacyMode)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Joining Fee</p>
                  <p className="text-lg font-bold text-text-dark">{formatCurrency(card.joining_fee || 0, isPrivacyMode)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Interest Rate (APR)</p>
                  <p className="text-lg font-bold text-text-dark">{(card.apr || 0).toFixed(1)}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Reward Points</p>
                  <p className="text-lg font-bold text-text-dark">{(card.reward_points || 0).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Cashback</p>
                  <p className="text-lg font-bold text-text-dark">{(card.cashback_percent || 0).toFixed(1)}%</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </Modal>

      <Modal
        isOpen={isEditingCard}
        onClose={handleCloseEdit}
        title="Edit Card Configuration"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdateCard} className="space-y-8 pb-6">
          {/* Section 1: Card Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-text-dark">
              <Settings size={16} />
              <h4 className="text-sm font-bold uppercase tracking-widest">Card Configuration</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Card Nickname" 
                value={editFormData.name} 
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="e.g. Primary HDFC"
                required 
              />
              <Input 
                label="Credit Limit (₹)" 
                type="number" 
                value={editFormData.credit_limit} 
                onChange={(e) => setEditFormData({ ...editFormData, credit_limit: Number(e.target.value) })}
                required 
              />
            </div>
          </div>

          {/* Section 2: Billing & Payment Settings */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center space-x-2 text-text-dark">
              <Calendar size={16} />
              <h4 className="text-sm font-bold uppercase tracking-widest">Billing & Payment Settings</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Billing Cycle" 
                value={editFormData.billing_cycle} 
                onChange={(e) => setEditFormData({ ...editFormData, billing_cycle: e.target.value })}
                placeholder="e.g. 15th to 14th"
                required 
              />
              <Input 
                label="Payment Due Date" 
                type="date"
                value={editFormData.payment_due_date} 
                onChange={(e) => setEditFormData({ ...editFormData, payment_due_date: e.target.value })}
                required 
              />
            </div>
          </div>

          {/* Section 3: Financial Tracking Controls */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center space-x-2 text-text-dark">
              <TrendingUp size={16} />
              <h4 className="text-sm font-bold uppercase tracking-widest">Financial Tracking Controls</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Current Outstanding (₹)" 
                type="number" 
                value={editFormData.credit_limit - editFormData.available_credit} 
                onChange={(e) => setEditFormData({ ...editFormData, available_credit: editFormData.credit_limit - Number(e.target.value) })}
                required 
              />
              <Input 
                label="Minimum Due (₹)" 
                type="number" 
                value={editFormData.minimum_amount_due} 
                onChange={(e) => setEditFormData({ ...editFormData, minimum_amount_due: Number(e.target.value) })}
              />
              <Input 
                label="Monthly Budget (₹)" 
                type="number" 
                value={editFormData.monthly_budget} 
                onChange={(e) => setEditFormData({ ...editFormData, monthly_budget: Number(e.target.value) })}
              />
              <Input 
                label="Amount Due (₹)" 
                type="number" 
                value={editFormData.total_amount_due} 
                onChange={(e) => setEditFormData({ ...editFormData, total_amount_due: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center space-x-3 p-4 bg-background rounded-2xl">
              <input 
                type="checkbox" 
                id="manual_override"
                checked={editFormData.allow_manual_override}
                onChange={(e) => setEditFormData({ ...editFormData, allow_manual_override: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="manual_override" className="text-xs font-bold text-slate-700">Allow manual statement override</label>
            </div>
          </div>

          {/* Section 4: Smart Controls */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center space-x-2 text-text-dark">
              <AlertCircle size={16} />
              <h4 className="text-sm font-bold uppercase tracking-widest">Smart Controls</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Utilization Alert Threshold (%)" 
                type="number" 
                min={1} max={100}
                value={editFormData.utilization_alert_threshold} 
                onChange={(e) => setEditFormData({ ...editFormData, utilization_alert_threshold: Number(e.target.value) })}
              />
              <Input 
                label="Remind Before (Days)" 
                type="number" 
                min={1} max={30}
                value={editFormData.remind_before_days} 
                onChange={(e) => setEditFormData({ ...editFormData, remind_before_days: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center space-x-3 p-4 bg-background rounded-2xl">
              <input 
                type="checkbox" 
                id="remind_due"
                checked={editFormData.remind_on_due_date}
                onChange={(e) => setEditFormData({ ...editFormData, remind_on_due_date: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="remind_due" className="text-xs font-bold text-slate-700">Remind on due date</label>
            </div>
          </div>

          <div className="flex space-x-3 pt-6">
            <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={handleCloseEdit}>Cancel</Button>
            <Button 
              type="submit" 
              className={cn(
                "flex-1 rounded-2xl transition-all",
                isEditChanged ? "bg-primary hover:bg-primary-hover text-white" : "bg-background text-text-muted cursor-not-allowed"
              )}
              disabled={!isEditChanged || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove Card Modal */}
      <Modal
        isOpen={isRemovingCard}
        onClose={() => setIsRemovingCard(false)}
        title="Remove Card"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <div className="bg-danger/10 p-6 rounded-3xl border border-danger/20 flex items-start space-x-4">
            <AlertTriangle className="text-red-600 shrink-0 mt-1" size={24} />
            <div className="space-y-2">
              <p className="text-danger font-bold">Are you sure you want to remove this card?</p>
              <p className="text-danger/80 text-sm leading-relaxed">
                This will soft-delete the card. You can restore it later from settings, but it will no longer appear in your active dashboard.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">This will:</p>
            <ul className="space-y-2">
              {[
                'Hide all transaction history for this card',
                'Stop tracking active EMIs',
                'Disable billing alerts'
              ].map((item, i) => (
                <li key={i} className="flex items-center space-x-3 text-sm text-slate-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {((card.total_amount_due || 0) > 0 || emis.length > 0) && (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <p className="text-xs font-bold text-amber-800 flex items-center">
                  <AlertCircle size={14} className="mr-2" />
                  PENDING OBLIGATIONS DETECTED
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  You have pending dues or active EMIs on this card.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Type REMOVE to confirm</label>
                <Input 
                  value={removeConfirmText}
                  onChange={(e) => setRemoveConfirmText(e.target.value)}
                  placeholder="REMOVE"
                  className="border-danger/20 focus:border-red-300"
                />
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setIsRemovingCard(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              className="flex-1 rounded-2xl bg-red-600 hover:bg-red-700 border-none"
              onClick={handleRemoveCard}
              disabled={((card.total_amount_due || 0) > 0 || emis.length > 0) && removeConfirmText !== 'REMOVE'}
            >
              Remove Card
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
