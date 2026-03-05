import React, { useEffect, useState, useMemo } from 'react';
import { useUI } from '../context/UIContext';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  CreditCard, 
  ChevronRight,
  ShieldCheck,
  Calendar,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  PieChart,
  BarChart3
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api, NetWorthSummary, Transaction, Card } from '../services/api';
import { Link } from 'react-router-dom';
import { formatCurrency, formatCurrencyCompact } from '../lib/formatters';
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

export default function DashboardPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const [summary, setSummary] = useState<NetWorthSummary>({
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0
  });
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [summaryData, cardsData, txs] = await Promise.all([
          api.getNetWorth(),
          api.getCards(),
          api.getTransactions()
        ]);
        setSummary(summaryData);
        setCards(cardsData);
        setTransactions(txs);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  // KPI Calculations
  const totalCreditLimit = useMemo(() => cards.reduce((sum, c) => sum + (c.credit_limit || 0), 0), [cards]);
  const totalOutstanding = useMemo(() => cards.reduce((sum, c) => sum + ((c.credit_limit || 0) - (c.available_credit || 0)), 0), [cards]);
  const avgUtilization = totalCreditLimit > 0 ? (totalOutstanding / totalCreditLimit) * 100 : 0;
  const upcomingDue = useMemo(() => cards.reduce((sum, c) => sum + (c.total_amount_due || 0), 0), [cards]);

  // Chart Data
  const chartData = useMemo(() => {
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    return months.map(month => {
      const monthTxs = transactions.filter(tx => {
        const date = new Date(tx.transaction_date);
        return date.toLocaleString('default', { month: 'short' }) === month && 
               (tx.type === 'spend' || tx.type === 'expense');
      });
      const total = monthTxs.reduce((sum, tx) => sum + tx.amount, 0);
      
      const mockValues: Record<string, number> = {
        'Oct': 12500, 'Nov': 14200, 'Dec': 11800, 'Jan': 16100, 'Feb': 15400, 'Mar': 17250
      };
      
      return {
        name: month,
        amount: total || mockValues[month] || 0,
      };
    });
  }, [transactions]);

  const totalSpendingThisMonth = chartData[chartData.length - 1].amount;
  const prevSpendingMonth = chartData[chartData.length - 2].amount;
  const spendingChange = ((totalSpendingThisMonth - prevSpendingMonth) / prevSpendingMonth) * 100;

  // Top Categories
  const topCategories = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.slice(0, 50).forEach(tx => {
      if (tx.type === 'spend' || tx.type === 'expense') {
        categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
      }
    });
    return Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  }, [transactions]);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Top Summary KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Credit Limit', value: totalCreditLimit, icon: CreditCard, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Total Outstanding', value: totalOutstanding, icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Avg. Utilization', value: `${avgUtilization.toFixed(0)}%`, icon: TrendingUp, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Upcoming Due', value: upcomingDue, icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' },
        ].map((kpi, i) => (
          <motion.div 
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", kpi.bg, kpi.color)}>
                <kpi.icon size={24} />
              </div>
              <ChevronRight size={16} className="text-text-muted group-hover:text-text-dark transition-colors" />
            </div>
            <p className="text-text-muted text-sm font-medium mb-1">{kpi.label}</p>
            <h3 className="text-3xl font-bold text-text-dark">
              {typeof kpi.value === 'number' ? formatCurrency(kpi.value, isPrivacyMode) : kpi.value}
            </h3>
          </motion.div>
        ))}
      </section>

      {/* 2. Core Financial Insights Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Credit Health Score */}
        <section className="lg:col-span-2 card overflow-hidden flex flex-col sm:flex-row p-0">
          <div className="p-8 flex-1 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-xl font-bold text-text-dark">Credit Health Score</h3>
            </div>
            
            <div className="flex items-end space-x-6">
              <div className="relative h-32 w-32 flex items-center justify-center">
                <svg className="h-full w-full transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-border" />
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * 78) / 100} className="text-primary" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-text-dark">78</span>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">/ 100</span>
                </div>
              </div>
              <div className="flex-1 space-y-4 pb-2">
                <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Healthy
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Utilization</p>
                    <p className="text-sm font-bold text-text-dark">{avgUtilization.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Payments</p>
                    <p className="text-sm font-bold text-text-dark">100%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-background p-8 sm:w-64 border-l border-border flex flex-col justify-center space-y-4">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Net Worth</p>
            <h4 className="text-2xl font-bold text-text-dark">{formatCurrency(summary.netWorth, isPrivacyMode)}</h4>
            <div className="flex items-center text-primary text-xs font-bold">
              <TrendingUp size={14} className="mr-1" />
              <span>+4.2% this month</span>
            </div>
            <Link to="/net-worth" className="text-secondary text-xs font-bold uppercase tracking-widest flex items-center hover:underline">
              Details <ChevronRight size={14} className="ml-1" />
            </Link>
          </div>
        </section>

        {/* Smart Insights */}
        <section className="bg-secondary rounded-xl p-8 text-white shadow-xl shadow-secondary/20 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2">
              <Zap size={20} className="text-blue-100" />
              <h3 className="text-lg font-bold">Smart Insights</h3>
            </div>
            <p className="text-blue-50 text-sm leading-relaxed">
              Your credit utilization is {avgUtilization.toFixed(0)}%. 
              Paying {formatCurrency(totalOutstanding * 0.2, false)} now will reduce it to 30% and boost your score.
            </p>
          </div>
          <button className="relative z-10 w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-sm font-bold transition-all mt-6">
            View All Insights
          </button>
          
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
        </section>
      </div>

      {/* 3. Actionable Sections Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Spending Analytics */}
        <section className="lg:col-span-2 card p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-dark">Monthly Spending</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-text-dark">{formatCurrency(totalSpendingThisMonth, isPrivacyMode)}</span>
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full flex items-center",
                    spendingChange >= 0 ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"
                  )}>
                    {spendingChange >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                    {Math.abs(spendingChange).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex bg-background p-1 rounded-xl border border-border">
              {['6M', '1Y', 'All'].map((f) => (
                <button key={f} className={cn(
                  "px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                  f === '6M' ? "bg-card text-secondary shadow-sm" : "text-text-muted hover:text-text-dark"
                )}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D7FF9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2D7FF9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} tickFormatter={(v) => formatCurrencyCompact(v, isPrivacyMode)} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-text-dark text-white p-3 rounded-xl shadow-xl border border-slate-800">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                          <p className="text-sm font-bold">{formatCurrency(payload[0].value as number, isPrivacyMode)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="amount" stroke="#2D7FF9" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-border">
            {topCategories.map(([cat, amount]) => (
              <div key={cat} className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{cat}</p>
                <p className="text-lg font-bold text-text-dark">{formatCurrency(amount, isPrivacyMode)}</p>
                <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border">
                  <div className="h-full bg-secondary rounded-full" style={{ width: `${(amount / totalSpendingThisMonth) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Payments & Budget */}
        <div className="space-y-8">
          {/* Upcoming Payments */}
          <section className="card p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-warning/10 text-warning rounded-xl flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <h3 className="text-lg font-bold text-text-dark">Upcoming</h3>
              </div>
              <Link to="/bills" className="text-secondary text-[10px] font-bold uppercase tracking-widest hover:underline">View All</Link>
            </div>

            <div className="space-y-4">
              {cards.filter(c => (c.total_amount_due || 0) > 0).slice(0, 3).map(card => (
                <div key={card.id} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border group hover:border-secondary transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-text-dark">{card.bank_name} {card.card_variant}</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Due: {card.payment_due_date || 'N/A'}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-bold text-text-dark">{formatCurrency(card.total_amount_due || 0, isPrivacyMode)}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-warning/10 text-warning rounded-full uppercase tracking-widest">Due Soon</span>
                  </div>
                </div>
              ))}
              {cards.filter(c => (c.total_amount_due || 0) > 0).length === 0 && (
                <div className="py-8 text-center text-text-muted text-sm italic">No upcoming payments.</div>
              )}
            </div>
          </section>

          {/* Budget Tracking */}
          <section className="card p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                  <PieChart size={20} />
                </div>
                <h3 className="text-lg font-bold text-text-dark">Budget</h3>
              </div>
              <Link to="/budgets" className="text-secondary text-[10px] font-bold uppercase tracking-widest hover:underline">Manage</Link>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Monthly Budget</p>
                  <p className="text-2xl font-bold text-text-dark">{formatCurrency(25000, isPrivacyMode)}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Spent</p>
                  <p className="text-lg font-bold text-text-dark">{formatCurrency(totalSpendingThisMonth, isPrivacyMode)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-background rounded-full overflow-hidden border border-border">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      (totalSpendingThisMonth / 25000) > 0.9 ? "bg-danger" : (totalSpendingThisMonth / 25000) > 0.7 ? "bg-warning" : "bg-primary"
                    )} 
                    style={{ width: `${Math.min(100, (totalSpendingThisMonth / 25000) * 100)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  <span>{((totalSpendingThisMonth / 25000) * 100).toFixed(0)}% Used</span>
                  <span>{formatCurrency(Math.max(0, 25000 - totalSpendingThisMonth), isPrivacyMode)} Left</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
