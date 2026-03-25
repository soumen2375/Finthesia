import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useToast } from '@/context/ToastContext';
import {
  ArrowLeft, Phone, BarChart3, CreditCard, Bell, MessageSquare,
  ArrowUpCircle, ArrowDownCircle, X, TrendingUp, TrendingDown, Building2, MapPin
} from 'lucide-react';
import type { PartyInfo } from '../types';

interface PartyTx {
  id: string;
  party_id: string;
  txn_type: 'gave' | 'got';
  amount: number;
  note?: string;
  txn_date: string;
}

interface PartyDetailViewProps {
  party: PartyInfo;
  isPrivacyMode: boolean;
  onBack: () => void;
  onAddTransaction: (type: 'gave' | 'got') => void;
  onRefresh: () => void;
}

export default function PartyDetailView({ party, isPrivacyMode, onBack, onAddTransaction, onRefresh }: PartyDetailViewProps) {
  const { showToast } = useToast();
  const [txns, setTxns] = useState<PartyTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'gave' | 'got'>('all');

  const fetchTxns = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('party_ledger_txns').select('*')
      .eq('party_id', party.party_id)
      .order('txn_date', { ascending: false });
    setTxns(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTxns(); }, [party.party_id]);

  const filtered = useMemo(() => {
    if (filter === 'all') return txns;
    return txns.filter(t => t.txn_type === filter);
  }, [txns, filter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    const { error } = await supabase.from('party_ledger_txns').delete().eq('id', id);
    if (error) { showToast('Delete failed', 'error'); return; }
    showToast('Deleted', 'success');
    fetchTxns();
    onRefresh();
  };

  const balance = party.balance;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <header className="flex items-center gap-4 bg-card rounded-2xl p-4 shadow-sm border border-border">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-background border border-border hover:bg-slate-50 text-text-muted transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold font-headline text-text-dark tracking-tight">Party Details</h2>
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted mt-0.5">
            <span>Ledger</span>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <span className="text-primary">{party.name}</span>
          </div>
        </div>
      </header>

      {/* 3-Col Section: Customer Info + Action Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Customer Header Card (2 cols) */}
        <div className="lg:col-span-2 bg-card rounded-[2rem] p-8 shadow-sm border border-border relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full -mr-20 -mt-20 blur-[80px]" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/20 font-extrabold text-3xl shrink-0 shadow-sm">
                {party.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-3xl font-extrabold font-headline text-text-dark leading-tight">{party.name}</h3>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-medium text-text-muted">
                  {party.phone && <span className="flex items-center gap-1.5"><Phone size={14} className="text-primary"/> {party.phone}</span>}
                  <span className="flex items-center gap-1.5"><Building2 size={14} className="text-primary"/> Unknown Company</span>
                  <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary"/> Finthesia Direct</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={cn(
                "px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider",
                balance > 0 ? "bg-primary/10 text-primary border border-primary/20" : balance < 0 ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-slate-100 text-text-muted border border-border"
              )}>
                {balance > 0 ? 'YOU WILL GET' : balance < 0 ? 'YOU WILL GIVE' : 'SETTLED'}
              </span>
              <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mt-1">Last updated today</p>
            </div>
          </div>
          <div className="relative z-10 mt-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-text-muted font-headline text-2xl font-medium">₹</span>
              <span className="text-text-dark font-headline text-5xl font-black tracking-tighter">{formatCurrency(Math.abs(balance), isPrivacyMode).replace('₹','').trim()}</span>
              {balance !== 0 && (
                <span className={cn("ml-4 flex items-center font-bold text-sm px-2.5 py-1 rounded-lg", balance > 0 ? "text-primary bg-primary/10" : "text-red-500 bg-red-500/10")}>
                  {balance > 0 ? <TrendingUp size={16} className="mr-1.5" /> : <TrendingDown size={16} className="mr-1.5" />}
                  {balance > 0 ? 'Receivable' : 'Payable'}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={() => onAddTransaction('gave')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border hover:bg-red-50 rounded-xl font-bold text-sm text-red-600 transition-colors shadow-sm">
                <ArrowUpCircle size={18}/> You Gave
              </motion.button>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={() => onAddTransaction('got')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary-hover transition-colors">
                <ArrowDownCircle size={18}/> You Got
              </motion.button>
            </div>
          </div>
        </div>

        {/* Action Grid (1 col 2x2) */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: BarChart3, label: 'Reports', desc: 'Analytics', action: () => showToast('Reports coming soon', 'info') },
            { icon: CreditCard, label: 'Payment', desc: 'Settle Due', action: () => onAddTransaction('got') },
            { icon: Bell, label: 'Reminder', desc: 'Send Alert', action: () => showToast('Reminders coming soon', 'info') },
            { icon: MessageSquare, label: 'SMS', desc: 'Message', action: () => showToast('SMS coming soon', 'info') },
          ].map(item => (
            <button key={item.label} onClick={item.action} className="group flex flex-col justify-center p-5 bg-card rounded-[2rem] transition-all border border-border hover:border-primary/30 shadow-sm hover:shadow-md text-left">
              <div className="w-12 h-12 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center text-text-muted group-hover:text-primary group-hover:bg-primary/10 transition-colors mb-4">
                <item.icon size={20} />
              </div>
              <span className="font-extrabold text-sm text-text-dark">{item.label}</span>
              <span className="text-xs text-text-muted font-medium mt-0.5">{item.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Cashflow Intensity Chart Placeholder */}
      <section className="bg-card rounded-[2rem] p-8 shadow-sm border border-border">
         <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="text-xl font-bold font-headline text-text-dark">Cashflow Intensity</h3>
               <p className="text-sm text-text-muted font-medium mt-1">Activity over the last 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-text-muted">
               <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-500"></span>Outflow (You Gave)</div>
               <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-primary"></span>Inflow (You Got)</div>
            </div>
         </div>
         <div className="w-full h-32 flex items-end justify-between px-2 gap-4 relative">
            <div className="absolute inset-x-0 bottom-0 border-b border-border w-full"></div>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
               // Pseudo-random data for visual placeholder
               const gotH = [20, 45, 10, 60, 30, 0, 80][i];
               const gaveH = [10, 20, 50, 0, 40, 60, 10][i];
               return (
                  <div key={day} className="flex-1 flex flex-col justify-end items-center gap-1 group relative z-10">
                     <div className="w-full max-w-[40px] flex flex-col justify-end gap-1 h-full min-h-[100px]">
                        {gaveH > 0 && <div className="w-full bg-red-500 rounded-sm transition-all hover:opacity-80 cursor-pointer" style={{height: `${gaveH}%`}}></div>}
                        {gotH > 0 && <div className="w-full bg-primary rounded-sm transition-all hover:opacity-80 cursor-pointer" style={{height: `${gotH}%`}}></div>}
                     </div>
                     <span className="text-[10px] font-bold text-text-muted mt-2">{day}</span>
                  </div>
               );
            })}
         </div>
      </section>

      {/* Transaction History Table */}
      <section className="bg-card rounded-[2rem] shadow-sm border border-border overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-extrabold font-headline text-text-dark">Transaction Ledger</h3>
            <p className="text-sm text-text-muted font-medium mt-1">Detailed history of all giving and getting</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-border bg-card rounded-xl text-sm font-bold text-text-muted hover:bg-background shadow-sm transition-colors">
              Last 30 Days
            </button>
            <div className="flex bg-background p-1.5 rounded-xl border border-border shadow-sm">
              {(['all', 'gave', 'got'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn("px-4 py-2 text-xs font-bold transition-all rounded-lg",
                    filter === f ? "bg-card text-text-dark shadow-sm" : "text-text-muted hover:text-text-dark"
                  )}>
                  {f === 'all' ? 'All' : f === 'gave' ? 'You Gave' : 'You Got'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-text-muted font-medium text-sm">No transactions found for the selected filter.</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-background/30 border-b border-border">
                  <th className="px-8 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Date & Time</th>
                  <th className="px-8 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Reference / Note</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">You Gave (Outflow)</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">You Got (Inflow)</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-text-muted uppercase tracking-widest w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-text-dark text-sm">{new Date(tx.txn_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="text-[10px] text-text-muted font-medium mt-0.5">12:00 PM</span> {/* Mock time */}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border border-border", tx.txn_type === 'gave' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary') }>
                          {tx.txn_type === 'gave' ? <ArrowUpCircle size={18}/> : <ArrowDownCircle size={18}/>}
                        </div>
                        <span className="text-sm font-semibold text-text-dark">{tx.note || '—'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right bg-red-500/5">
                      {tx.txn_type === 'gave' ? (
                        <span className="font-bold font-headline text-red-500 text-base">{formatCurrency(tx.amount, isPrivacyMode)}</span>
                      ) : <span className="text-text-muted/30 font-bold">—</span>}
                    </td>
                    <td className="px-8 py-5 text-right bg-primary/5">
                      {tx.txn_type === 'got' ? (
                        <span className="font-bold font-headline text-primary text-base">{formatCurrency(tx.amount, isPrivacyMode)}</span>
                      ) : <span className="text-text-muted/30 font-bold">—</span>}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => handleDelete(tx.id)} className="opacity-0 group-hover:opacity-100 p-2 text-text-muted hover:text-red-500 transition-all rounded-lg hover:bg-red-50 shadow-sm">
                        <X size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
