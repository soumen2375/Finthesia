import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/context/ToastContext';
import {
  Settings, Edit2, Trash2, Save, X, Building2, Plus,
  BadgeCheck, MapPin, Receipt, Landmark, Users2,
  Hash, Briefcase, CheckCircle2
} from 'lucide-react';
import type { Ledger } from '../types';

interface SettingsViewProps {
  activeLedger: Ledger | null;
  ledgers: Ledger[];
  onLedgersChanged: () => void;
}

const BUSINESS_CATEGORIES = [
  'Retail & Commerce', 'Software & IT', 'Services & Consulting',
  'Manufacturing', 'Wholesale & Distribution', 'Healthcare',
  'Education', 'Real Estate', 'Agriculture', 'Personal', 'Other'
];

const BUSINESS_TYPES = [
  'Sole Proprietorship', 'Partnership', 'LLP', 'Private Limited',
  'Public Limited', 'OPC', 'Hindu Undivided Family', 'Trust', 'NGO', 'Other'
];

export default function SettingsView({ activeLedger, ledgers, onLedgersChanged }: SettingsViewProps) {
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Ledger>>({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // When editing, populate form
  const startEdit = (ledger: Ledger) => {
    setEditingId(ledger.id);
    setForm({
      name: ledger.name,
      description: ledger.description || '',
      registered_number: ledger.registered_number || '',
      business_address: ledger.business_address || '',
      business_category: ledger.business_category || '',
      business_type: ledger.business_type || '',
      gstin: ledger.gstin || '',
      bank_account: ledger.bank_account || '',
      staff_count: ledger.staff_count || 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
  };

  const handleSave = async () => {
    if (!editingId || !form.name?.trim()) {
      showToast('Ledger name is required', 'error');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('ledgers')
      .update({
        name: form.name!.trim(),
        description: form.description?.trim() || null,
        registered_number: form.registered_number?.trim() || null,
        business_address: form.business_address?.trim() || null,
        business_category: form.business_category || null,
        business_type: form.business_type || null,
        gstin: form.gstin?.trim() || null,
        bank_account: form.bank_account?.trim() || null,
        staff_count: form.staff_count || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingId);

    setSaving(false);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Ledger details saved!', 'success');
    cancelEdit();
    onLedgersChanged();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('ledgers').delete().eq('id', id);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Ledger deleted', 'success');
    setDeleteConfirmId(null);
    onLedgersChanged();
  };

  const Field = ({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">
        <Icon size={12} className="text-primary" /> {label}
      </label>
      {children}
    </div>
  );

  const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-medium text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold font-headline text-text-dark tracking-tight flex items-center gap-3">
            <Settings size={24} className="text-primary" /> Ledger Settings
          </h2>
          <p className="text-sm text-text-muted font-medium mt-1">
            Manage your ledger books and business details
          </p>
        </div>
      </div>

      {/* Ledger Cards */}
      <div className="space-y-6">
        {ledgers.map(ledger => {
          const isEditing = editingId === ledger.id;
          const isActive = activeLedger?.id === ledger.id;

          return (
            <motion.div
              key={ledger.id}
              layout
              className="bg-card rounded-[2rem] shadow-sm border border-border overflow-hidden"
            >
              {/* Card header */}
              <div className="p-6 flex items-center justify-between border-b border-border bg-background/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {ledger.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-text-dark">{ledger.name}</h3>
                      {isActive && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase">Active</span>
                      )}
                      {ledger.is_default && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 uppercase flex items-center gap-1">
                          <CheckCircle2 size={10} /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted font-medium mt-0.5">
                      {ledger.description || 'No description'} · Created {new Date(ledger.created_at || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <>
                      <button onClick={() => startEdit(ledger)} className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-bold text-text-muted hover:text-primary hover:bg-primary/5 transition-colors">
                        <Edit2 size={14} /> Edit
                      </button>
                      {!ledger.is_default && (
                        <button onClick={() => setDeleteConfirmId(ledger.id)} className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-bold text-text-muted hover:text-danger hover:bg-danger/5 transition-colors">
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button onClick={cancelEdit} className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-bold text-text-muted hover:bg-background transition-colors">
                        <X size={14} /> Cancel
                      </button>
                      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-md">
                        <Save size={14} /> {saving ? 'Saving…' : 'Save'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Details view (read) or Edit form */}
              {isEditing ? (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Ledger Name" icon={Briefcase}>
                      <input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} required />
                    </Field>
                    <Field label="Description" icon={Briefcase}>
                      <input value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} placeholder="Brief description" />
                    </Field>
                    <Field label="Registered Number" icon={Hash}>
                      <input value={form.registered_number || ''} onChange={e => setForm(f => ({ ...f, registered_number: e.target.value }))} className={inputCls} placeholder="CIN / Reg. No." />
                    </Field>
                    <Field label="Business Address" icon={MapPin}>
                      <input value={form.business_address || ''} onChange={e => setForm(f => ({ ...f, business_address: e.target.value }))} className={inputCls} placeholder="Full address" />
                    </Field>
                    <Field label="Business Category" icon={Building2}>
                      <select value={form.business_category || ''} onChange={e => setForm(f => ({ ...f, business_category: e.target.value }))} className={inputCls}>
                        <option value="">Select category</option>
                        {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Business Type" icon={Building2}>
                      <select value={form.business_type || ''} onChange={e => setForm(f => ({ ...f, business_type: e.target.value }))} className={inputCls}>
                        <option value="">Select type</option>
                        {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="GSTIN" icon={Receipt}>
                      <input value={form.gstin || ''} onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))} className={inputCls} placeholder="22AAAAA0000A1Z5" />
                    </Field>
                    <Field label="Bank Account" icon={Landmark}>
                      <input value={form.bank_account || ''} onChange={e => setForm(f => ({ ...f, bank_account: e.target.value }))} className={inputCls} placeholder="Bank name & account" />
                    </Field>
                    <Field label="Staff Count" icon={Users2}>
                      <input type="number" value={form.staff_count || 0} onChange={e => setForm(f => ({ ...f, staff_count: parseInt(e.target.value) || 0 }))} className={inputCls} min={0} />
                    </Field>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Reg. Number', value: ledger.registered_number, icon: Hash },
                      { label: 'Address', value: ledger.business_address, icon: MapPin },
                      { label: 'Category', value: ledger.business_category, icon: Building2 },
                      { label: 'Type', value: ledger.business_type, icon: Building2 },
                      { label: 'GSTIN', value: ledger.gstin, icon: Receipt },
                      { label: 'Bank Account', value: ledger.bank_account, icon: Landmark },
                      { label: 'Staff', value: ledger.staff_count ? `${ledger.staff_count} employees` : null, icon: Users2 },
                    ].map(item => (
                      <div key={item.label} className="p-3 bg-background/50 rounded-xl border border-border/50">
                        <div className="flex items-center gap-1.5 mb-1">
                          <item.icon size={11} className="text-text-muted" />
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{item.label}</span>
                        </div>
                        <p className="text-sm font-bold text-text-dark truncate">{item.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-card rounded-2xl p-8 shadow-2xl border border-border max-w-md w-full text-center"
            >
              <div className="w-14 h-14 bg-danger/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-danger/20">
                <Trash2 size={24} className="text-danger" />
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-2">Delete Ledger?</h3>
              <p className="text-sm text-text-muted mb-6">
                This will permanently delete this ledger and all associated parties, transactions, and cashbook entries. This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setDeleteConfirmId(null)} className="px-6 py-2.5 border border-border rounded-xl text-sm font-bold text-text-muted hover:bg-background transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirmId)} className="px-6 py-2.5 bg-danger text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors shadow-md">
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
