import React, { useEffect, useState } from 'react';
import { useUI } from '../context/UIContext';
import { 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ChevronRight,
  Plus,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { api, NetWorthSummary, Transaction, SafeToSpend } from '../services/api';
import { formatCurrency } from '../lib/formatters';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const [summary, setSummary] = useState<NetWorthSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [safeToSpend, setSafeToSpend] = useState<SafeToSpend | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [summaryData, transactionsData, safeData] = await Promise.all([
          api.getNetWorth(),
          api.getTransactions(),
          api.getSafeToSpend().catch(() => null),
        ]);
        setSummary(summaryData);
        setRecentTransactions(transactionsData.slice(0, 5));
        setSafeToSpend(safeData);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 bg-slate-200/20 rounded-[2rem]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-slate-200/20 rounded-[2rem]" />
          <div className="h-32 bg-slate-200/20 rounded-[2rem]" />
        </div>
        <div className="h-96 bg-slate-200/20 rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-sans tracking-tight">
      {/* 1. Net Worth Hero Section - Match dark aesthetic from reference expense card */}
      <section className="relative overflow-hidden bg-[#1C1C1E] border border-white/5 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl animate-slam">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-1.5 bg-[#27C4E1] text-white text-[10px] font-bold uppercase rounded-full tracking-widest mb-1">
              <TrendingUp size={14} className="mr-2 stroke-[3]" />
              Total Net Worth
            </div>
            <div className="space-y-1">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
                {formatCurrency(summary?.netWorth || 0, isPrivacyMode)}
              </h1>
              <div className="flex items-center space-x-3">
                <span className="flex items-center text-[#27C4E1] font-bold">
                  <TrendingUp size={18} className="mr-1 stroke-[3]" />
                  +12.5%
                </span>
                <span className="text-white/50 text-sm font-medium">vs last month</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Link to="/net-worth" className="h-[4.5rem] w-[4.5rem] bg-white text-black hover:bg-gray-200 rounded-3xl flex items-center justify-center transition-all shadow-xl group">
              <Plus size={32} className="group-hover:rotate-90 transition-transform stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* Subtle Decorative Elements */}
        {/* <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48" /> */}
        {/* <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8b5cf6]/10 rounded-full blur-3xl -ml-32 -mb-32" /> */}
      </section>

      {/* 2. Quick Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slam" style={{ animationDelay: '0.1s' }}>
        {/* Liquidity (Total Assets) */}
        <div className="bg-white p-6 lg:p-8 rounded-[2rem] shadow-xl text-black hover:-translate-y-1 transition-transform group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-16 w-16 bg-[#27C4E1] text-white rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-[#27C4E1]/30">
              <Wallet size={28} strokeWidth={2.5} />
            </div>
            <Link to="/net-worth" className="text-gray-400 hover:text-black transition-colors bg-gray-100 p-2 rounded-xl">
              <ChevronRight size={20} strokeWidth={3} />
            </Link>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">Liquidity</p>
            <h3 className="text-[2rem] font-bold tracking-tight text-black">
              {formatCurrency(summary?.totalAssets || 0, isPrivacyMode)}
            </h3>
          </div>
        </div>

        {/* Credit Used (Total Liabilities) */}
        <div className="bg-[#00BFFF] p-6 lg:p-8 rounded-[2rem] shadow-xl text-white hover:-translate-y-1 transition-transform group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-16 w-16 bg-white text-[#00BFFF] rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
              <CreditCard size={28} strokeWidth={2.5} />
            </div>
            <Link to="/cards" className="text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-xl">
              <ChevronRight size={20} strokeWidth={3} />
            </Link>
          </div>
          <div className="space-y-1">
            <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Credit Used</p>
            <h3 className="text-[2rem] font-bold tracking-tight text-white">
              {formatCurrency(summary?.totalLiabilities || 0, isPrivacyMode)}
            </h3>
          </div>
        </div>

        {/* Safe-to-Spend Widget */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 lg:p-8 rounded-[2rem] shadow-xl text-white hover:-translate-y-1 transition-transform group relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="h-16 w-16 bg-white/20 text-white rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg backdrop-blur-sm">
                <Zap size={28} strokeWidth={2.5} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Safe to Spend Daily</p>
              <h3 className="text-[2rem] font-bold tracking-tight text-white">
                {safeToSpend ? formatCurrency(safeToSpend.safe_to_spend_daily, isPrivacyMode) : '—'}
              </h3>
              {safeToSpend && (
                <div className="mt-3 space-y-1">
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                    EMIs + Subs: {formatCurrency((safeToSpend.monthly_emis || 0) + (safeToSpend.monthly_subscriptions || 0), false)}/mo
                  </p>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                    Disposable: {formatCurrency(safeToSpend.disposable_monthly, false)}/mo
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8" />
        </div>
      </section>

      {/* 3. Recent Activity List */}
      <section className="bg-card p-6 lg:p-8 rounded-[2.5rem] shadow-xl border border-border animate-slam" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-[#27C4E1] text-white rounded-[1rem] flex items-center justify-center shadow-lg">
              <Clock size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-text-dark">Recent Activity</h3>
          </div>
          <Link to="/analytics" className="text-[11px] font-bold uppercase tracking-widest bg-background border border-border px-4 py-2 rounded-full text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">See All</Link>
        </div>

        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx, i) => (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-5 hover:bg-background rounded-[1.5rem] transition-all group border border-transparent hover:border-border"
              >
                <div className="flex items-center space-x-5">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                    tx.type === 'income' ? "bg-[#27C4E1]/10 text-[#27C4E1]" : "bg-[#00BFFF]/10 text-[#00BFFF]"
                  )}>
                    {tx.type === 'income' ? <ArrowDownLeft size={24} strokeWidth={2.5} /> : <ArrowUpRight size={24} strokeWidth={2.5} />}
                  </div>
                  <div>
                    <p className="font-bold text-[17px] text-text-dark group-hover:text-primary transition-colors">{tx.description}</p>
                    <div className="flex items-center text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">
                      <span>{tx.category}</span>
                      <span className="mx-2 opacity-30">•</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-bold text-xl tracking-tight",
                    tx.type === 'income' ? "text-[#27C4E1]" : "text-text-dark"
                  )}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, isPrivacyMode)}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-text-muted space-y-4">
              <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center border border-border">
                <Clock size={32} className="text-border" strokeWidth={2} />
              </div>
              <p className="font-bold tracking-tight">No recent activity found</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
