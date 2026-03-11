import React, { useEffect, useState } from 'react';
import { useUI } from '../context/UIContext';
import { api, SubscriptionsResponse } from '../services/api';
import { formatCurrency } from '../lib/formatters';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { RefreshCw, Calendar, CreditCard, TrendingUp, Zap } from 'lucide-react';

export default function SubscriptionsPage() {
  const { isPrivacyMode } = useUI();
  const [data, setData] = useState<SubscriptionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await api.getSubscriptions();
        setData(res);
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-48 bg-slate-200/20 rounded-[2rem]" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200/20 rounded-[2rem]" />)}
        </div>
      </div>
    );
  }

  const subscriptions = data?.subscriptions || [];

  return (
    <div className="space-y-8 pb-12 font-sans tracking-tight">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl animate-slam">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-1.5 bg-white/20 text-white text-[10px] font-bold uppercase rounded-full tracking-widest">
              <RefreshCw size={14} className="mr-2 stroke-[3]" />
              Recurring Payments
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                {formatCurrency(data?.total_monthly || 0, isPrivacyMode)}
              </h1>
              <p className="text-white/70 text-sm font-medium">Per month on subscriptions</p>
            </div>
          </div>
          <div className="h-24 w-24 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
            <RefreshCw size={48} className="text-white/80" strokeWidth={1.5} />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48" />
      </section>

      {/* Insight Banner */}
      {data?.insight && (
        <section className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center space-x-4 animate-slam" style={{ animationDelay: '0.05s' }}>
          <div className="h-10 w-10 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
            <Zap size={20} className="text-purple-500" />
          </div>
          <p className="text-text-dark font-medium text-sm">{data.insight}</p>
        </section>
      )}

      {/* Subscriptions List */}
      <section className="space-y-4 animate-slam" style={{ animationDelay: '0.1s' }}>
        {subscriptions.length === 0 ? (
          <div className="bg-card p-12 rounded-[2.5rem] shadow-xl border border-border text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center border border-border">
                <RefreshCw size={32} className="text-border" strokeWidth={2} />
              </div>
              <p className="font-bold text-text-dark text-lg">No subscriptions detected</p>
              <p className="text-text-muted text-sm max-w-md">
                Import your bank statements to automatically detect recurring payments. We look for same merchant + same amount appearing across multiple months.
              </p>
            </div>
          </div>
        ) : (
          subscriptions.map((sub, i) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0">
                    <CreditCard size={24} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="font-bold text-text-dark text-lg group-hover:text-primary transition-colors">{sub.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="inline-flex items-center text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        <Calendar size={12} className="mr-1" />
                        {sub.billing_cycle}
                      </span>
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                        {sub.month_count} months detected
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-text-dark tracking-tight">
                    {formatCurrency(sub.amount, isPrivacyMode)}
                  </p>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
                    Next: {sub.next_payment_date}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </section>
    </div>
  );
}
