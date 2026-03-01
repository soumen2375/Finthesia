import React, { useEffect, useState } from 'react';
import { useUI } from '../context/UIContext';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  CreditCard, 
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api, NetWorthSummary, Transaction } from '../services/api';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/formatters';

export default function DashboardPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const [summary, setSummary] = useState<NetWorthSummary>({
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [summaryData, assets, cards, txs] = await Promise.all([
          api.getNetWorth(),
          api.getAssets(),
          api.getCards(),
          api.getTransactions()
        ]);
        setSummary(summaryData);
        setTransactions(txs.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  return (
    <div className="space-y-6 pb-8">
      {/* Net Worth Summary */}
      <section className="animate-slam">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="relative z-10 space-y-1">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Total Net Worth</p>
            <div className="flex items-baseline space-x-3">
              <h2 className="text-5xl font-bold tracking-tight">
                {formatCurrency(summary.netWorth, isPrivacyMode)}
              </h2>
              <span className="flex items-center text-emerald-400 text-sm font-bold">
                <ArrowUpRight size={16} className="mr-1" />
                +0.0%
              </span>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Liquidity</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(summary.totalAssets, isPrivacyMode)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Credit Used</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(summary.totalLiabilities, isPrivacyMode)}</p>
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
          <button className="text-blue-600 text-xs font-bold uppercase tracking-wider">History</button>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[100px]">
          {isLoading ? (
            <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No recent transactions.</div>
          ) : (
            transactions.map((tx, i) => (
              <div key={tx.id} className={cn(
                "p-4 flex items-center justify-between",
                i !== transactions.length - 1 && "border-b border-slate-50"
              )}>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{tx.description}</p>
                    <p className="text-xs text-slate-500">{tx.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-bold",
                    tx.type === 'income' ? "text-emerald-500" : "text-slate-900"
                  )}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, isPrivacyMode)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    {new Date(tx.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
