import React, { useEffect, useState } from 'react';
import { useUI } from '../context/UIContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { api, NetWorthSummary, Transaction } from '../services/api';
import { formatCurrency } from '../lib/formatters';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const [summary, setSummary] = useState<NetWorthSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [summaryData, transactionsData] = await Promise.all([
          api.getNetWorth(),
          api.getTransactions()
        ]);
        setSummary(summaryData);
        // Get only 5 most recent
        setRecentTransactions(transactionsData.slice(0, 5));
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
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-slate-200 rounded-3xl" />
          <div className="h-32 bg-slate-200 rounded-3xl" />
        </div>
        <div className="h-96 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Net Worth Hero Section */}
      <section className="relative overflow-hidden bg-secondary rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-secondary/20 animate-slam">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
              <TrendingUp size={14} className="mr-2 text-blue-300" />
              Total Net Worth
            </div>
            <div className="space-y-1">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                {formatCurrency(summary?.netWorth || 0, isPrivacyMode)}
              </h1>
              <div className="flex items-center space-x-3">
                <span className="flex items-center text-emerald-400 font-bold">
                  <TrendingUp size={18} className="mr-1" />
                  +12.5%
                </span>
                <span className="text-white/40 text-sm font-medium">vs last month</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Link to="/net-worth" className="h-14 w-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center transition-all border border-white/10 group">
              <Plus size={24} className="group-hover:rotate-90 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -ml-32 -mb-32" />
      </section>

      {/* 2. Quick Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slam" style={{ animationDelay: '0.1s' }}>
        {/* Liquidity (Total Assets) */}
        <div className="card group hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="h-14 w-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
              <Wallet size={28} />
            </div>
            <Link to="/net-worth" className="text-text-muted hover:text-primary transition-colors">
              <ChevronRight size={20} />
            </Link>
          </div>
          <div className="space-y-1">
            <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Liquidity</p>
            <h3 className="text-3xl font-bold text-text-dark">
              {formatCurrency(summary?.totalAssets || 0, isPrivacyMode)}
            </h3>
          </div>
        </div>

        {/* Credit Used (Total Liabilities) */}
        <div className="card group hover:border-danger/50 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="h-14 w-14 bg-danger/10 text-danger rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
              <CreditCard size={28} />
            </div>
            <Link to="/cards" className="text-text-muted hover:text-danger transition-colors">
              <ChevronRight size={20} />
            </Link>
          </div>
          <div className="space-y-1">
            <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Credit Used</p>
            <h3 className="text-3xl font-bold text-text-dark">
              {formatCurrency(summary?.totalLiabilities || 0, isPrivacyMode)}
            </h3>
          </div>
        </div>
      </section>

      {/* 3. Recent Activity List */}
      <section className="card animate-slam" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-background rounded-xl flex items-center justify-center border border-border">
              <Clock size={20} className="text-text-dark" />
            </div>
            <h3 className="text-xl font-bold text-text-dark">Recent Activity</h3>
          </div>
          <Link to="/analytics" className="text-sm font-bold text-primary hover:underline">View All</Link>
        </div>

        <div className="space-y-2">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx, i) => (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 hover:bg-background rounded-2xl transition-all group border border-transparent hover:border-border"
              >
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                    tx.type === 'income' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"
                  )}>
                    {tx.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-text-dark group-hover:text-primary transition-colors">{tx.description}</p>
                    <div className="flex items-center text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
                      <span>{tx.category}</span>
                      <span className="mx-2 opacity-30">•</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-bold text-lg",
                    tx.type === 'income' ? "text-emerald-600" : "text-text-dark"
                  )}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, isPrivacyMode)}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-text-muted space-y-4">
              <div className="h-16 w-16 bg-background rounded-full flex items-center justify-center border border-border">
                <Clock size={24} className="text-border" />
              </div>
              <p className="font-medium">No recent activity found</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
