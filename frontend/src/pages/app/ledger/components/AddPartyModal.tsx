import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/context/ToastContext';
import { X, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddPartyModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  defaultType?: 'customer' | 'vendor';
  ledgerId?: string;
}

export default function AddPartyModal({ open, onClose, onSaved, defaultType = 'customer', ledgerId }: AddPartyModalProps) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [partyType, setPartyType] = useState<'customer' | 'vendor'>(defaultType);
  const [saving, setSaving] = useState(false);

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setName('');
      setPhone('');
      setPartyType(defaultType);
    }
  }, [open, defaultType]);

  const handleSave = async () => {
    if (!name.trim()) { showToast('Name is required', 'error'); return; }
    if (!ledgerId) { showToast('No active ledger selected', 'error'); return; }
    
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { error } = await supabase.from('party_ledger_parties').insert({
      id: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      user_id: user.id,
      ledger_id: ledgerId,
      name: name.trim(),
      phone: phone.trim() || null,
      party_type: partyType
    });

    setSaving(false);
    if (error) { showToast(error.message, 'error'); return; }
    showToast(`${partyType === 'customer' ? 'Customer' : 'Vendor'} added!`, 'success');
    setName(''); setPhone('');
    onSaved(); onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={onClose} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"/>
          <motion.div initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:20}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-[2rem] shadow-2xl border border-border w-full max-w-sm p-6 space-y-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <UserPlus size={20}/>
                  </div>
                  <h3 className="text-lg font-bold text-text-dark">Add {partyType === 'customer' ? 'Customer' : 'Vendor'}</h3>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-background text-text-muted"><X size={18}/></button>
              </div>

              {/* Party Type Toggle (Issue 4e/4f) */}
              <div className="flex bg-background p-1 rounded-xl border border-border">
                <button onClick={() => setPartyType('customer')} className={cn("flex-1 py-2.5 rounded-lg text-sm font-bold transition-all", partyType === 'customer' ? "bg-primary text-white shadow" : "text-text-muted hover:text-text-dark")}>
                  Customer
                </button>
                <button onClick={() => setPartyType('vendor')} className={cn("flex-1 py-2.5 rounded-lg text-sm font-bold transition-all", partyType === 'vendor' ? "bg-primary text-white shadow" : "text-text-muted hover:text-text-dark")}>
                  Vendor
                </button>
              </div>

              <div>
                <label htmlFor="new-party-name" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Name *</label>
                <input id="new-party-name" name="new-party-name" autoComplete="name" value={name} onChange={e => setName(e.target.value)}
                  placeholder={partyType === 'customer' ? "e.g. Ramesh Kumar" : "e.g. ABC Supplies"}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium text-text-dark"
                />
              </div>
              <div>
                <label htmlFor="new-party-phone" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Phone (optional)</label>
                <input id="new-party-phone" name="new-party-phone" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210" type="tel"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium text-text-dark"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-border text-text-muted font-bold text-sm hover:bg-background transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={!name.trim() || saving}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-50 hover:bg-primary-hover transition-colors shadow-md">
                  {saving ? 'Saving…' : `Add ${partyType === 'customer' ? 'Customer' : 'Vendor'}`}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
