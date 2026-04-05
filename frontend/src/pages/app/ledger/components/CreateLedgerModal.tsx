import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabaseClient';

interface CreateLedgerModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (newId?: string) => void;
}

export default function CreateLedgerModal({ open, onClose, onSaved }: CreateLedgerModalProps) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Retail & Commerce');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const newId = crypto.randomUUID();
    const { error } = await supabase.from('ledgers').insert({
      id: newId,
      user_id: user.id,
      name: name.trim(),
      description: description.trim() || null,
      is_default: false,
      is_active: true
    });

    setLoading(false);
    if (error) { showToast(error.message, 'error'); return; }

    showToast('New ledger created successfully', 'success');
    setName('');
    setDescription('');
    onSaved(newId);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-[#f5f8fa] rounded-[32px] overflow-hidden shadow-2xl p-8 md:p-12 border border-white"
        >
           <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-slate-800 text-center mb-8">
             Create New Ledger
           </h2>
           
           <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100">
             <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#0f6466]">LEDGER NAME</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Q4 Global Operations" 
                    className="w-full bg-[#f4f7f8] rounded-lg px-4 py-3.5 text-[15px] text-text-dark border-transparent focus:border-[#0fbcd4] focus:ring-1 focus:ring-[#0fbcd4] focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#0f6466]">BUSINESS CATEGORY</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#f4f7f8] rounded-lg px-4 py-3.5 text-[15px] text-text-dark border-transparent focus:border-[#0fbcd4] focus:ring-1 focus:ring-[#0fbcd4] focus:bg-white outline-none transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="Retail & Commerce">Retail & Commerce</option>
                    <option value="Software & IT">Software & IT</option>
                    <option value="Services & Consulting">Services & Consulting</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#0f6466]">INTERNAL DESCRIPTION</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Briefly describe the purpose and scope of this ledger..." 
                    className="w-full bg-[#f4f7f8] rounded-lg px-4 py-4 text-[15px] text-text-dark border-transparent focus:border-[#0fbcd4] focus:ring-1 focus:ring-[#0fbcd4] focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium min-h-[120px] resize-y"
                  />
                </div>

                <div className="pt-6 flex items-center justify-end gap-6 border-t border-slate-100 mt-2">
                   <button type="button" onClick={onClose} disabled={loading} className="text-[15px] font-bold text-slate-500 hover:text-slate-800 transition-colors">
                     Cancel
                   </button>
                   <button type="submit" disabled={loading} className="px-8 py-3.5 bg-[#0fbcd4] text-white rounded-lg text-[15px] font-bold shadow-md shadow-[#0fbcd4]/30 hover:bg-[#0daabf] transition-all disabled:opacity-50">
                     {loading ? 'Creating...' : 'Create Ledger'}
                   </button>
                </div>
             </form>
           </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
