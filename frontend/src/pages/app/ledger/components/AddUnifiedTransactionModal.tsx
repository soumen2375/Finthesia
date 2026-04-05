import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/context/ToastContext';
import { X, BookOpen, Handshake, Calendar, FileText, UserSquare2, RefreshCcw, Tag, Paperclip, Delete } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

interface Party {
  id: string;
  name: string;
  ledger_id?: string;
}

interface AddUnifiedTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  parties: Party[];
  defaultMode?: 'cash' | 'party';
  defaultType?: 'cash_in' | 'cash_out' | 'gave' | 'got';
  defaultPartyId?: string;
  ledgerId?: string;
}

const CASH_IN_CATEGORIES = [
  'Sales', 'Collection', 'Salary', 'Investment Return',
  'Loan Received', 'Gift', 'Refund', 'Other Income'
];

const CASH_OUT_CATEGORIES = [
  'Purchase', 'Expense', 'Salary Paid', 'Rent', 'Utility',
  'Loan Payment', 'Travel', 'Food', 'Maintenance', 'Other Expense'
];

export default function AddUnifiedTransactionModal({
  open, onClose, onSaved, parties, ledgerId,
  defaultMode = 'cash', defaultType = 'cash_in', defaultPartyId = ''
}: AddUnifiedTransactionModalProps) {
  const { showToast } = useToast();

  const [mode, setMode] = useState<'cash'|'party'>(defaultMode);
  const [cashType, setCashType] = useState<'cash_in'|'cash_out'>(defaultType === 'cash_in' || defaultType === 'cash_out' ? defaultType : 'cash_in');
  const [partyType, setPartyType] = useState<'gave'|'got'>(defaultType === 'gave' || defaultType === 'got' ? defaultType : 'gave');
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CASH_IN_CATEGORIES[0]);
  const [partyId, setPartyId] = useState(defaultPartyId);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
      if (defaultType === 'cash_in' || defaultType === 'cash_out') setCashType(defaultType);
      else if (defaultType === 'gave' || defaultType === 'got') setPartyType(defaultType);
      
      setPartyId(defaultPartyId);
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setAmount('');
    }
  }, [open, defaultMode, defaultType, defaultPartyId]);

  useEffect(() => {
    setCategory(cashType === 'cash_in' ? CASH_IN_CATEGORIES[0] : CASH_OUT_CATEGORIES[0]);
  }, [cashType]);

  const handleKeyPress = (val: string) => {
    if (amount.includes('.') && val === '.') return;
    if (amount.split('.')[1]?.length >= 2) return;
    setAmount(prev => prev === '0' && val !== '.' ? val : prev + val);
  };

  const handleBackspace = () => {
    setAmount(prev => prev.slice(0, -1));
  };

  // Issue 4j: Handle direct amount input on mobile
  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only valid number input
    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
      setAmount(val);
    }
  };

  const handleSave = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { showToast('Enter a valid amount', 'error'); return; }
    if (mode === 'party' && !partyId) { showToast('Please select a party', 'error'); return; }
    
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    try {
      if (!ledgerId) {
         showToast("No active ledger selected. Please select a ledger.", 'error');
         setSaving(false);
         return;
      }

      if (mode === 'cash') {
        const { error } = await supabase.from('cashbook_entries').insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          ledger_id: ledgerId,
          amount: amt,
          entry_type: cashType,
          category,
          note: note.trim() || null,
          entry_date: date
        });
        if (error) throw error;
        showToast(cashType === 'cash_in' ? 'Cash In recorded' : 'Cash Out recorded', 'success');
      } else {
        const { error } = await supabase.from('party_ledger_txns').insert({
           id: crypto.randomUUID().replace(/-/g,'').slice(0,16),
           user_id: user.id,
           ledger_id: ledgerId,
           party_id: partyId,
           txn_type: partyType,
           amount: amt,
           note: note.trim() || null,
           txn_date: date
        });
        if (error) throw error;
        showToast('Transaction recorded', 'success');
      }
      onSaved();
      onClose();
    } catch (e: any) {
      showToast(e.message || 'Failed to save transaction', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const activeColor = mode === 'cash' 
    ? (cashType === 'cash_in' ? 'text-emerald-500' : 'text-danger') 
    : (partyType === 'got' ? 'text-emerald-500' : 'text-danger');

  const activePlaceholder = mode === 'cash' 
    ? (cashType === 'cash_in' ? 'placeholder:text-emerald-500/30' : 'placeholder:text-danger/30') 
    : (partyType === 'got' ? 'placeholder:text-emerald-500/30' : 'placeholder:text-danger/30');

  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"/>
      <motion.div initial={{y:'100%', opacity: 0}} animate={{y:0, opacity: 1}} exit={{y:'100%', opacity: 0}}
        transition={{type:'spring',damping:25,stiffness:200}}
        className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[101] bg-card md:rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col md:max-h-[90vh]"
        style={{ margin: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-8 py-4 md:py-5 border-b border-border bg-card">
           <h2 className="text-lg md:text-xl font-bold font-headline text-text-dark tracking-tight">New Transaction</h2>
           <button onClick={onClose} className="p-2 rounded-xl bg-background border border-border hover:bg-border/30 text-text-muted transition-colors shadow-sm"><X size={20}/></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto w-full max-w-full m-0 p-0 overflow-x-hidden bg-background">
           
           {/* Left Panel: Form (full width on mobile, 8 cols on desktop) */}
           <div className="col-span-1 md:col-span-8 p-5 md:p-8 space-y-6 md:space-y-8 overflow-y-auto">
              
              {/* Top Module Selector */}
              <div className="flex bg-card p-1.5 rounded-2xl border border-border shadow-sm max-w-md">
                 <button onClick={() => setMode('cash')} className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all", mode === 'cash' ? "bg-primary text-white shadow-md" : "text-text-muted hover:bg-background")}>
                    <BookOpen size={18}/> Cash Book
                 </button>
                 <button onClick={() => setMode('party')} className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all", mode === 'party' ? "bg-primary text-white shadow-md" : "text-text-muted hover:bg-background")}>
                    <Handshake size={18}/> Party Ledger
                 </button>
              </div>

              {/* Amount Section */}
              <div className="text-center py-4 md:py-6">
                 {/* Type Toggle */}
                 <div className="inline-flex bg-card p-1 rounded-full border border-border mb-4 md:mb-6 shadow-sm">
                    {mode === 'cash' ? (
                       <>
                        <button onClick={() => setCashType('cash_in')} className={cn("px-6 md:px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all", cashType === 'cash_in' ? "bg-emerald-500 text-white shadow-sm" : "hover:bg-background text-text-muted")}>Cash In</button>
                        <button onClick={() => setCashType('cash_out')} className={cn("px-6 md:px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all", cashType === 'cash_out' ? "bg-danger text-white shadow-sm" : "hover:bg-background text-text-muted")}>Cash Out</button>
                       </>
                    ) : (
                       <>
                        <button onClick={() => setPartyType('got')} className={cn("px-6 md:px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all", partyType === 'got' ? "bg-emerald-500 text-white shadow-sm" : "hover:bg-background text-text-muted")}>You Got</button>
                        <button onClick={() => setPartyType('gave')} className={cn("px-6 md:px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all", partyType === 'gave' ? "bg-danger text-white shadow-sm" : "hover:bg-background text-text-muted")}>You Gave</button>
                       </>
                    )}
                 </div>

                 {/* Big Amount — Desktop: readonly with keypad, Mobile: direct input (Issue 4j) */}
                 <div className="flex items-center justify-center gap-2">
                    <span className={cn("text-3xl md:text-4xl font-headline font-bold mb-2", activeColor)}>₹</span>
                    
                    {/* Mobile: editable input (Issue 4j) */}
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={amount} 
                      onChange={handleAmountInput}
                      placeholder="0"
                      className={cn(
                        "md:hidden bg-transparent border-none text-5xl font-headline font-extrabold tracking-tighter text-center max-w-[250px] focus:outline-none focus:ring-0",
                        activeColor, activePlaceholder
                      )}
                    />
                    
                    {/* Desktop: readonly, uses keypad */}
                    <input 
                      type="text" 
                      value={amount} 
                      readOnly
                      placeholder="0"
                      className={cn(
                        "hidden md:block bg-transparent border-none text-7xl font-headline font-extrabold tracking-tighter text-center max-w-[300px] focus:outline-none focus:ring-0",
                        activeColor, activePlaceholder
                      )}
                    />
                 </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                 {mode === 'cash' ? (
                     <div className="space-y-1.5 md:col-span-1 border border-border bg-card rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-10">Category</label>
                        <div className="flex items-center">
                          <BookOpen size={18} className="text-text-muted ml-3 opacity-50" />
                          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-transparent border-none text-sm font-bold text-text-dark px-3 py-1 focus:ring-0 cursor-pointer">
                             {(cashType === 'cash_in' ? CASH_IN_CATEGORIES : CASH_OUT_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                     </div>
                 ) : (
                     <div className="space-y-1.5 md:col-span-1 border border-border bg-card rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-10">Party / Contact</label>
                        <div className="flex items-center">
                          <UserSquare2 size={18} className="text-text-muted ml-3 opacity-50" />
                          <select value={partyId} onChange={e => setPartyId(e.target.value)} className="w-full bg-transparent border-none text-sm font-bold text-text-dark px-3 py-1 focus:ring-0 cursor-pointer">
                             <option value="" disabled>Select a Party</option>
                             {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                     </div>
                 )}

                 <div className="space-y-1.5 md:col-span-1 border border-border bg-card rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-10">Date</label>
                    <div className="flex items-center">
                      <Calendar size={18} className="text-text-muted ml-3 opacity-50" />
                      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-transparent border-none text-sm font-bold text-text-dark px-3 py-1 focus:ring-0" />
                    </div>
                 </div>

                 <div className="space-y-1.5 md:col-span-2 border border-border bg-card rounded-2xl p-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all h-24 md:h-28 flex flex-col">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2">
                      <FileText size={14} className="opacity-50" /> Notes / Description
                    </label>
                    <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="E.g. Payment for the design project..." className="w-full bg-transparent border-none text-sm font-medium text-text-dark resize-none flex-1 focus:ring-0 px-0" />
                 </div>
              </div>

              {/* Additional Details (Dashed Section) */}
              <div className="border border-dashed border-border rounded-2xl p-4 md:p-6 bg-card/50">
                <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Additional Details</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-bold text-text-muted hover:bg-border/30 transition-colors shadow-sm">
                    <RefreshCcw size={16} /> Recurring
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-bold text-text-muted hover:bg-border/30 transition-colors shadow-sm">
                    <Tag size={16} /> Add Tags
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-bold text-text-muted hover:bg-border/30 transition-colors shadow-sm">
                    <Paperclip size={16} /> Attach Bill
                  </button>
                </div>
              </div>

              {/* Mobile: Confirm button at bottom of form (Issue 4j) */}
              <div className="md:hidden sticky bottom-0 pb-4">
                <button onClick={handleSave} disabled={saving || !amount || (mode==='party'&&!partyId)} className="w-full py-4 bg-text-dark text-white rounded-xl font-extrabold text-lg flex items-center justify-center shadow-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                   {saving ? 'Saving...' : 'Confirm Details'}
                </button>
              </div>

           </div>

           {/* Right Panel: Keypad & CTA — hidden on mobile (Issue 4j) */}
           <div className="hidden md:flex col-span-4 bg-card border-l border-border p-6 flex-col justify-between">
              
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
                 <div className="absolute right-0 top-0 opacity-10 blur-xl w-32 h-32 bg-white rounded-full translate-x-10 -translate-y-10"></div>
                 <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Summary</p>
                 <p className="text-2xl font-extrabold font-headline mb-0.5">₹ {amount || '0'}</p>
                 <p className="text-xs font-medium opacity-90 leading-tight">
                    {mode === 'cash' ? (cashType === 'cash_in' ? `Inflow for ${category}` : `Outflow for ${category}`) : (partyType === 'got' ? `Received from ${parties.find(p => p.id === partyId)?.name || 'Party'}` : `Given to ${parties.find(p => p.id === partyId)?.name || 'Party'}`)}
                 </p>
                 <span className="inline-block mt-3 px-2.5 py-1 bg-white/20 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                   {date}
                 </span>
              </div>

              {/* Number Keypad */}
              <div className="grid grid-cols-3 gap-2 flex-grow mb-6 max-h-[300px]">
                 {[1,2,3,4,5,6,7,8,9,'.',0].map(n => (
                    <button key={n} onClick={()=>handleKeyPress(n.toString())} className="font-headline font-extrabold text-2xl py-4 rounded-xl bg-background border border-border hover:bg-primary/10 hover:text-primary transition-colors active:scale-95 shadow-sm text-text-dark flex items-center justify-center">
                       {n}
                    </button>
                 ))}
                 <button onClick={handleBackspace} className="font-headline font-extrabold text-xl py-4 rounded-xl bg-background border border-border hover:bg-danger/10 hover:text-danger transition-colors active:scale-95 shadow-sm text-text-dark flex items-center justify-center">
                    <Delete size={28} />
                 </button>
              </div>

              {/* Action Button */}
              <button onClick={handleSave} disabled={saving || !amount || (mode==='party'&&!partyId)} className="w-full py-4 bg-text-dark text-white rounded-xl font-extrabold text-lg flex items-center justify-center shadow-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                 {saving ? 'Saving...' : 'Confirm Details'}
              </button>
           </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
