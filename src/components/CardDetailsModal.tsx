import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { api, Card, EMI, Transaction } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useUI } from '../context/UIContext';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronRight,
  Calendar,
  CreditCard,
  Receipt,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
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
      // Filter transactions for this card
      setTransactions(txData.filter(tx => tx.card_id === card.id));
    } catch (error) {
      console.error('Failed to fetch card details:', error);
    }
  };

  const formatCurrency = (value: number) => {
    if (isPrivacyMode) return '••••••';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatYAxis = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  const usedAmount = card.credit_limit - card.available_credit;
  const utilization = (usedAmount / card.credit_limit) * 100;

  // Overdue Logic
  const isOverdue = useMemo(() => {
    if (!card.payment_due_date) return false;
    const dueDate = new Date(card.payment_due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }, [card.payment_due_date]);

  // Chart Data
  const chartData = useMemo(() => {
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const data = months.map(month => {
      // Mocking some data for the trend if real data is sparse
      // In a real app, we'd group transactions by month
      const monthTxs = transactions.filter(tx => {
        const date = new Date(tx.transaction_date);
        return date.toLocaleString('default', { month: 'short' }) === month;
      });
      const total = monthTxs.reduce((sum, tx) => sum + tx.amount, 0);
      
      // For demo purposes, if no transactions, provide some realistic mock values
      const mockValues: Record<string, number> = {
        'Oct': 4500, 'Nov': 5200, 'Dec': 3800, 'Jan': 6100, 'Feb': 5400, 'Mar': 7250
      };
      
      return {
        name: month,
        amount: total || mockValues[month] || 0,
        categories: {
          Food: (total || mockValues[month] || 0) * 0.3,
          Travel: (total || mockValues[month] || 0) * 0.2,
          Shopping: (total || mockValues[month] || 0) * 0.3,
          Bills: (total || mockValues[month] || 0) * 0.2,
        }
      };
    });
    return data;
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
      if (editingEMI) {
        await api.deleteEMI(editingEMI.id); // Simple update by delete and re-add
      }
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${card.bank_name} - ${card.card_variant}`} maxWidth="max-w-4xl">
      <div className="space-y-8 pb-6 max-h-[80vh] overflow-y-auto px-1 custom-scrollbar">
        
        {/* Section 1: Credit Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Available Credit</p>
                <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(card.available_credit)}</h3>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Credit Limit</p>
                <p className="text-xl font-semibold text-slate-700">{formatCurrency(card.credit_limit)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-blue-600">Used: {formatCurrency(usedAmount)}</span>
                <span className="text-slate-400">Left: {formatCurrency(card.available_credit)}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    utilization > 80 ? "bg-red-500" : utilization > 50 ? "bg-amber-500" : "bg-blue-600"
                  )}
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col justify-center items-center space-y-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Utilization</p>
            <h4 className="text-4xl font-bold">{utilization.toFixed(1)}%</h4>
            <p className="text-[10px] text-slate-500 text-center px-4">
              {utilization > 30 ? "High utilization may impact credit score." : "Healthy credit utilization."}
            </p>
          </div>
        </section>

        {/* Section 2: Billing & Payment */}
        <section className={cn(
          "bg-white p-6 rounded-3xl border shadow-sm space-y-6",
          isOverdue ? "border-red-200 ring-1 ring-red-100" : "border-slate-100"
        )}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Receipt size={20} className="mr-2 text-blue-600" />
              Billing & Payment
            </h3>
            {isOverdue && (
              <span className="bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-md border border-red-100 animate-pulse">
                Alert! Payment Overdue
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Billing Cycle</span>
                <span className="font-bold text-slate-900">{card.billing_cycle || '15th to 14th'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Payment Due Date</span>
                <div className="flex items-center">
                  <span className={cn("font-bold mr-2", isOverdue ? "text-red-600" : "text-slate-900")}>
                    {card.payment_due_date || 'N/A'}
                  </span>
                  {isOverdue && <AlertCircle size={14} className="text-red-600" />}
                </div>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-500">Total Amount Due</span>
                <span className="text-xl font-bold text-slate-900">{formatCurrency(card.total_amount_due || 0)}</span>
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-2xl flex items-start space-x-3",
              isOverdue ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
            )}>
              <Info size={20} className="mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider">Action Required</p>
                <p className="text-sm leading-relaxed">
                  {isOverdue 
                    ? "Your payment is overdue. Pay immediately to avoid late fees and impact on your credit score."
                    : "Your payment is due soon. Pay your bill to avoid late fees."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Monthly Spending Trend */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Monthly Spending Trend</h3>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold text-slate-900 mr-3">{formatCurrency(totalSpending)}</span>
                <span className={cn(
                  "flex items-center text-xs font-bold px-2 py-0.5 rounded-full",
                  percentChange >= 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  {percentChange >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                  {Math.abs(percentChange).toFixed(0)}% from last month
                </span>
              </div>
            </div>
            
            <div className="flex bg-slate-50 p-1 rounded-xl">
              {(['6M', '1Y', 'All'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                    timeFilter === filter ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                  tickFormatter={formatYAxis}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 min-w-[180px] space-y-3">
                          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label} 2026</p>
                            <p className="text-sm font-bold text-blue-600">{formatCurrency(data.amount)}</p>
                          </div>
                          <div className="space-y-1.5">
                            {Object.entries(data.categories).map(([cat, val]) => (
                              <div key={cat} className="flex justify-between text-[10px] font-medium">
                                <span className="text-slate-500">{cat}</span>
                                <span className="text-slate-900">{formatCurrency(val as number)}</span>
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
                  stroke="#2563EB" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAmount)"
                  dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#2563EB', strokeWidth: 0 }}
                />
                {/* Optional Budget Line */}
                <ReferenceLine y={5000} stroke="#EF4444" strokeDasharray="5 5" label={{ position: 'right', value: 'Budget', fill: '#EF4444', fontSize: 10, fontWeight: 'bold' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Section 4: EMI Tracking */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Calendar size={20} className="mr-2 text-blue-600" />
              EMI Tracking
            </h3>
            <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" onClick={() => setIsAddingEMI(true)}>
              <Plus size={14} className="mr-1" /> Add EMI
            </Button>
          </div>

          {isAddingEMI || editingEMI ? (
            <form onSubmit={handleSaveEMI} className="bg-slate-50 p-4 rounded-2xl grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
              <Input name="description" label="Description" placeholder="iPhone 15 EMI" defaultValue={editingEMI?.description} required className="col-span-2" />
              <Input name="original_amount" label="Original Amount" type="number" defaultValue={editingEMI?.original_amount} required />
              <Input name="remaining_amount" label="Remaining Amount" type="number" defaultValue={editingEMI?.remaining_amount} required />
              <Input name="monthly_payment" label="Monthly Payment" type="number" defaultValue={editingEMI?.monthly_payment} required />
              <Input name="remaining_months" label="Remaining Months" type="number" defaultValue={editingEMI?.remaining_months} required />
              <Input name="next_due_date" label="Next Due Date" type="date" defaultValue={editingEMI?.next_due_date} required className="col-span-2" />
              <div className="col-span-2 flex space-x-2 pt-2">
                <Button type="submit" size="sm" className="flex-1">{editingEMI ? 'Update EMI' : 'Save EMI'}</Button>
                <Button type="button" size="sm" variant="outline" className="flex-1" onClick={() => { setIsAddingEMI(false); setEditingEMI(null); }}>Cancel</Button>
              </div>
            </form>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Original</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Remaining</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Monthly</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Months</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Next Due</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {emis.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">No EMIs tracked for this card.</td>
                  </tr>
                ) : (
                  emis.map(emi => (
                    <tr key={emi.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 font-bold text-slate-900 text-sm">{emi.description}</td>
                      <td className="py-4 text-right text-slate-600 text-sm">{formatCurrency(emi.original_amount)}</td>
                      <td className="py-4 text-right font-bold text-slate-900 text-sm">{formatCurrency(emi.remaining_amount)}</td>
                      <td className="py-4 text-right text-blue-600 font-bold text-sm">{formatCurrency(emi.monthly_payment)}</td>
                      <td className="py-4 text-center text-slate-600 text-sm">{emi.remaining_months}</td>
                      <td className="py-4 text-right text-slate-600 text-sm">{emi.next_due_date}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end space-x-1">
                          <button 
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                            onClick={() => setEditingEMI(emi)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                            onClick={() => handleDeleteEMI(emi.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Card Details & Fees */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Info size={20} className="mr-2 text-blue-600" />
              Card Details & Fees
            </h3>
            <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" onClick={() => setIsEditingFees(!isEditingFees)}>
              {isEditingFees ? 'Cancel' : <><Edit2 size={14} className="mr-1" /> Edit Details</>}
            </Button>
          </div>

          {isEditingFees ? (
            <form onSubmit={handleUpdateFees} className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4">
              <Input name="annual_fee" label="Annual Fee" type="number" defaultValue={card.annual_fee} />
              <Input name="joining_fee" label="Joining Fee" type="number" defaultValue={card.joining_fee} />
              <Input name="apr" label="Interest Rate (APR %)" type="number" step="0.01" defaultValue={card.apr} />
              <Input name="reward_points" label="Reward Points" type="number" defaultValue={card.reward_points} />
              <Input name="cashback_percent" label="Cashback %" type="number" step="0.1" defaultValue={card.cashback_percent} />
              <div className="col-span-full pt-2">
                <Button type="submit" className="w-full">Update Details</Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
              <div className="space-y-1">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Annual Fee</p>
                <p className="text-sm font-bold text-slate-900">{formatCurrency(card.annual_fee || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Joining Fee</p>
                <p className="text-sm font-bold text-slate-900">{formatCurrency(card.joining_fee || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Interest Rate (APR)</p>
                <p className="text-sm font-bold text-slate-900">{(card.apr || 0).toFixed(1)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Reward Points</p>
                <p className="text-sm font-bold text-slate-900">{(card.reward_points || 0).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Cashback</p>
                <p className="text-sm font-bold text-slate-900">{(card.cashback_percent || 0).toFixed(1)}%</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
