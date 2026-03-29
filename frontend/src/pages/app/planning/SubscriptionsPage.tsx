import React, { useEffect, useState } from 'react';
import { useUI } from '@/context/UIContext';
import { api, SubscriptionsResponse, Subscription } from '@/services/api';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Calendar, CreditCard, Zap, Plus, Trash2, X } from 'lucide-react';

interface AddSubForm {
  name: string;
  amount: string;
  billing_cycle: string;
  next_payment_date: string;
}

const CYCLES = ['monthly', 'quarterly', 'yearly', 'weekly'];

export default function SubscriptionsPage() {
  const { isPrivacyMode } = useUI();
  const [data, setData] = useState<SubscriptionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<AddSubForm>({ name: '', amount: '', billing_cycle: 'monthly', next_payment_date: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const load = async () => {
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

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    setFormError('');
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) { setFormError('Enter a valid amount'); return; }
    setIsSaving(true);
    try {
      await api.addSubscription({
        name: form.name.trim(),
        amount: amt,
        billing_cycle: form.billing_cycle,
        next_payment_date: form.next_payment_date || undefined,
      });
      setShowAddModal(false);
      setForm({ name: '', amount: '', billing_cycle: 'monthly', next_payment_date: '' });
      await load();
    } catch (e: any) {
      setFormError(e.message || 'Failed to add subscription');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (sub: Subscription) => {
    if (sub.source !== 'manual') return;
    setDeletingId(sub.id);
    try {
      await api.deleteSubscription(sub.id);
      await load();
    } catch (e) {
      console.error('Failed to delete subscription', e);
    } finally {
      setDeletingId(null);
    }
  };

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
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 text-white shadow-2xl animate-slam">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-1.5 bg-white/20 text-white text-[10px] font-bold uppercase rounded-full tracking-widest">
              <RefreshCw size={14} className="mr-2 stroke-[3]" />
              Recurring Payments
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold tracking-tighter">
                {formatCurrency(data?.total_monthly || 0, isPrivacyMode)}
              </h1>
              <p className="text-white/70 text-sm font-medium">Per month on subscriptions</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-4">
            <button
              id="add-subscription-btn"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-bold rounded-2xl transition-all backdrop-blur-sm border border-white/30 hover:scale-105 active:scale-95"
            >
              <Plus size={16} />
              Add Subscription
            </button>
            <div className="h-20 w-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
              <RefreshCw size={40} className="text-white/80" strokeWidth={1.5} />
            </div>
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
              <p className="font-bold text-text-dark text-lg">No subscriptions yet</p>
              <p className="text-text-muted text-sm max-w-md">
                Add subscriptions manually, or import your bank statements — we'll auto-detect recurring payments from matching merchant and amount across months.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-colors"
              >
                <Plus size={16} /> Add First Subscription
              </button>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0",
                    sub.source === 'manual'
                      ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20'
                      : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
                  )}>
                    <CreditCard size={24} className={sub.source === 'manual' ? 'text-purple-500' : 'text-blue-500'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-text-dark text-lg group-hover:text-primary transition-colors">{sub.name}</p>
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                        sub.source === 'manual' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                      )}>
                        {sub.source === 'manual' ? 'Manual' : 'Auto-detected'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="inline-flex items-center text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        <Calendar size={12} className="mr-1" />
                        {sub.billing_cycle}
                      </span>
                      {sub.source !== 'manual' && (
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                          {sub.month_count} months detected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-text-dark tracking-tight">
                      {formatCurrency(sub.amount, isPrivacyMode)}
                    </p>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
                      Next: {sub.next_payment_date || '—'}
                    </p>
                  </div>
                  {sub.source === 'manual' && (
                    <button
                      id={`delete-sub-${sub.id}`}
                      disabled={deletingId === sub.id}
                      onClick={() => handleDelete(sub)}
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </section>

      {/* Add Subscription Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-dark">Add Subscription</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="h-9 w-9 rounded-xl flex items-center justify-center text-text-muted hover:bg-border transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Service Name</label>
                  <input
                    id="sub-name-input"
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Netflix, Spotify, Gym..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-dark placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Amount</label>
                  <input
                    id="sub-amount-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="199"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-dark placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Billing Cycle</label>
                  <select
                    id="sub-cycle-select"
                    value={form.billing_cycle}
                    onChange={e => setForm(f => ({ ...f, billing_cycle: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-dark focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-sm font-medium"
                  >
                    {CYCLES.map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Next Payment Date <span className="text-text-muted/50 normal-case font-normal">(optional)</span></label>
                  <input
                    id="sub-date-input"
                    type="date"
                    value={form.next_payment_date}
                    onChange={e => setForm(f => ({ ...f, next_payment_date: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-dark focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-sm font-medium"
                  />
                </div>
                {formError && (
                  <p className="text-danger text-sm font-medium">{formError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-border text-text-muted font-bold text-sm hover:bg-border/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="confirm-add-sub-btn"
                  onClick={handleAdd}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-2xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition-colors disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Add Subscription'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
