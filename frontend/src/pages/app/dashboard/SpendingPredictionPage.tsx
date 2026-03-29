import React, { useEffect, useState } from 'react';
import { useUI } from '@/context/UIContext';
import { api, SpendingPrediction } from '@/services/api';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { Brain, TrendingDown, TrendingUp, Sparkles, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#F97316',
  Transport: '#3B82F6',
  Shopping: '#EC4899',
  Bills: '#EAB308',
  Entertainment: '#A855F7',
  Investment: '#22C55E',
  Health: '#EF4444',
  Education: '#6366F1',
  Transfer: '#06B6D4',
  Other: '#6B7280',
};

export default function SpendingPredictionPage() {
  const { isPrivacyMode } = useUI();
  const [data, setData] = useState<SpendingPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await api.getSpendingPredictions();
        setData(res);
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-56 bg-slate-200/20 rounded-[2rem]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-56 bg-slate-200/20 rounded-[2rem]" />
          <div className="h-56 bg-slate-200/20 rounded-[2rem]" />
        </div>
        <div className="h-80 bg-slate-200/20 rounded-[2rem]" />
      </div>
    );
  }

  if (!data) return null;

  const chartData = data.category_predictions.map(cp => ({
    name: cp.category,
    amount: cp.predicted_amount,
    fill: CATEGORY_COLORS[cp.category] || CATEGORY_COLORS.Other,
  }));

  const savingsPositive = data.expected_savings >= 0;

  return (
    <div className="space-y-8 pb-12 font-sans tracking-tight">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C1C1E] to-[#2D2D30] border border-white/5 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl animate-slam">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-[#27C4E1] to-[#00BFFF] text-white text-[10px] font-bold uppercase rounded-full tracking-widest">
              <Brain size={14} className="mr-2 stroke-[3]" />
              AI Spending Prediction
            </div>
            <div className="space-y-2">
              <p className="text-white/50 text-sm font-medium">Predicted spending for {data.predicted_month}</p>
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter">
                {formatCurrency(data.predicted_total, isPrivacyMode)}
              </h1>
            </div>
            {data.data_months > 0 && (
              <p className="text-white/40 text-xs font-medium">
                Based on {data.data_months} month{data.data_months !== 1 ? 's' : ''} of historical data
              </p>
            )}
          </div>
          <div className="h-24 w-24 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles size={48} className="text-[#27C4E1]" strokeWidth={1.5} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#27C4E1]/10 rounded-full blur-3xl -ml-32 -mb-32" />
      </section>

      {/* Key Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slam" style={{ animationDelay: '0.1s' }}>
        <div className="bg-card p-6 lg:p-8 rounded-[2rem] shadow-xl border border-border hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 transition-transform group-hover:scale-110">
              <TrendingDown size={24} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-text-muted text-[11px] font-bold uppercase tracking-widest">Predicted Spending</p>
          <p className="text-3xl font-bold tracking-tight text-text-dark mt-1">{formatCurrency(data.predicted_total, isPrivacyMode)}</p>
          <p className="text-text-muted text-xs mt-1">For {data.predicted_month}</p>
        </div>

        <div className="bg-card p-6 lg:p-8 rounded-[2rem] shadow-xl border border-border hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              "h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
              savingsPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
            )}>
              <TrendingUp size={24} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-text-muted text-[11px] font-bold uppercase tracking-widest">Expected Savings</p>
          <p className={cn("text-3xl font-bold tracking-tight mt-1", savingsPositive ? "text-emerald-500" : "text-red-500")}>
            {savingsPositive ? '+' : ''}{formatCurrency(data.expected_savings, isPrivacyMode)}
          </p>
          <p className="text-text-muted text-xs mt-1">
            Based on avg monthly income of {formatCurrency(data.monthly_income, isPrivacyMode)}
          </p>
        </div>
      </section>

      {/* Category Chart */}
      {chartData.length > 0 && (
        <section className="bg-card p-6 lg:p-8 rounded-[2.5rem] shadow-xl border border-border animate-slam" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-12 w-12 bg-[#27C4E1] text-white rounded-[1rem] flex items-center justify-center shadow-lg">
              <BarChart3 size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-text-dark">Category Breakdown</h3>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                <XAxis type="number" tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} stroke="var(--color-text-muted)" fontSize={12} />
                <YAxis type="category" dataKey="name" width={100} stroke="var(--color-text-muted)" fontSize={12} />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Predicted']}
                  contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '14px' }}
                />
                <Bar dataKey="amount" radius={[0, 8, 8, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Category Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slam" style={{ animationDelay: '0.3s' }}>
        {data.category_predictions.map((cat, i) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other }}
              />
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{cat.transaction_count} txns</span>
            </div>
            <p className="font-bold text-text-dark">{cat.category}</p>
            <p className="text-2xl font-bold tracking-tight text-text-dark mt-1">
              {formatCurrency(cat.predicted_amount, isPrivacyMode)}
            </p>
            <p className="text-text-muted text-xs mt-1">
              Avg per transaction: {formatCurrency(cat.avg_per_transaction, isPrivacyMode)}
            </p>
          </motion.div>
        ))}
      </section>

      {/* Empty state for no data */}
      {data.data_months === 0 && (
        <section className="bg-card p-12 rounded-[2.5rem] shadow-xl border border-border text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center border border-border">
              <Brain size={32} className="text-border" strokeWidth={2} />
            </div>
            <p className="font-bold text-text-dark text-lg">Not enough data for predictions</p>
            <p className="text-text-muted text-sm max-w-md">
              Import your bank statements to generate spending predictions. We need at least 1 month of transaction data.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
