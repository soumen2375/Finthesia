import React, { useEffect, useState } from 'react';
import { useUI } from '@/context/UIContext';
import { api, FinancialHealth } from '@/services/api';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { Heart, TrendingUp, Shield, Wallet, Target } from 'lucide-react';

function ScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#22C55E' : score >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative w-52 h-52">
      <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
        <circle cx="90" cy="90" r="80" fill="none" stroke="currentColor" strokeWidth="10" className="text-border" />
        <motion.circle
          cx="90" cy="90" r="80" fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-5xl font-bold text-text-dark"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">out of 100</span>
      </div>
    </div>
  );
}

const STATUS_COLORS = {
  'Good': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  'Moderate': { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
  'Needs Improvement': { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
};

export default function FinancialHealthPage() {
  const { isPrivacyMode } = useUI();
  const [data, setData] = useState<FinancialHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await api.getFinancialHealth();
        setData(res);
      } catch (error) {
        console.error('Failed to fetch financial health:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-72 bg-slate-200/20 rounded-[2rem]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-200/20 rounded-[2rem]" />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const metrics = [
    {
      icon: TrendingUp,
      label: 'Savings Rate',
      value: `${data.savings_rate}%`,
      status: data.savings_rate_status,
      detail: 'Percentage of income saved',
      color: 'from-emerald-500 to-green-600',
    },
    {
      icon: Shield,
      label: 'Debt Ratio',
      value: `${data.debt_ratio}%`,
      status: data.debt_ratio_status,
      detail: 'Monthly debt vs income',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: Wallet,
      label: 'Emergency Fund',
      value: `${data.emergency_fund_ratio} months`,
      status: data.emergency_fund_status,
      detail: 'Months of expenses covered',
      color: 'from-purple-500 to-violet-600',
    },
    {
      icon: Target,
      label: 'Spending Discipline',
      value: `${data.spending_discipline}%`,
      status: data.spending_discipline_status,
      detail: 'Spending consistency',
      color: 'from-orange-500 to-amber-600',
    },
  ];

  return (
    <div className="space-y-8 pb-12 font-sans tracking-tight">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1C1C1E] border border-white/5 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl animate-slam">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-1.5 bg-[#27C4E1] text-white text-[10px] font-bold uppercase rounded-full tracking-widest">
              <Heart size={14} className="mr-2 stroke-[3]" />
              Financial Health
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
              Your Financial <br />Wellness Score
            </h1>
            <p className="text-white/50 text-sm font-medium max-w-md">
              Based on your savings rate, debt ratio, emergency fund coverage, and spending discipline.
            </p>
          </div>
          <ScoreGauge score={data.score} />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48" />
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slam" style={{ animationDelay: '0.1s' }}>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Monthly Income</p>
          <p className="text-2xl font-bold text-text-dark mt-1">{formatCurrency(data.monthly_income, isPrivacyMode)}</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Monthly Expenses</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(data.monthly_expenses, isPrivacyMode)}</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Balance</p>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{formatCurrency(data.total_balance, isPrivacyMode)}</p>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric, i) => {
          const statusStyle = STATUS_COLORS[metric.status as keyof typeof STATUS_COLORS] || STATUS_COLORS['Moderate'];
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-card p-6 lg:p-8 rounded-[2rem] border border-border shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-center justify-between mb-5">
                <div className={cn("h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", metric.color)}>
                  <metric.icon size={24} strokeWidth={2.5} />
                </div>
                <span className={cn("px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border", statusStyle.bg, statusStyle.text, statusStyle.border)}>
                  {metric.status}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-text-muted text-[11px] font-bold uppercase tracking-widest">{metric.label}</p>
                <p className="text-3xl font-bold tracking-tight text-text-dark">{metric.value}</p>
                <p className="text-text-muted text-xs">{metric.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}
