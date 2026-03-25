import React, { useEffect, useState, useMemo } from 'react';
import { useUI } from '@/context/UIContext';
import { supabase } from '@/lib/supabaseClient';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, X, ChevronRight, ArrowLeft, Users,
  Phone, Search, UserPlus, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';

function generateId() {
  return crypto.randomUUID().replace(/-/g,'').slice(0,16);
}

// ─── Types ───────────────────────────────────
interface Party {
  party_id: string;
  user_id: string;
  name: string;
  phone?: string;
  balance: number;   // from party_balances view
  total_gave: number;
  total_got: number;
}

interface PartyTx {
  id: string;
  party_id: string;
  txn_type: 'gave' | 'got';
  amount: number;
  note?: string;
  txn_date: string;
}

const PAYMENT_MODES = ['Cash','UPI','Bank Transfer','Cheque','Card'];

// ─── Add Party Modal ─────────────────────────
function AddPartyModal({ open, onClose, onSaved }: { open: boolean; onClose: ()=>void; onSaved: ()=>void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    await supabase.from('party_ledger_parties').insert({
      id: generateId(), user_id: user.id,
      name: name.trim(), phone: phone.trim() || null
    });
    setSaving(false);
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
            <div className="bg-card rounded-[2rem] shadow-2xl border border-border w-full max-w-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-dark">Add Party</h3>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-background text-text-muted"><X size={18}/></button>
              </div>
              <div>
                <label htmlFor="party-name" className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Name *</label>
                <input id="party-name" name="party-name" autoComplete="name" value={name} onChange={e=>setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                />
              </div>
              <div>
                <label htmlFor="party-phone" className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Phone (optional)</label>
                <input id="party-phone" name="party-phone" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)}
                  placeholder="+91 98765 43210" type="tel"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-border text-text-muted font-bold text-sm hover:bg-background transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={!name.trim() || saving}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-50 hover:bg-primary-hover transition-colors">
                  {saving ? 'Saving…' : 'Add Party'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Add Transaction Drawer ──────────────────
interface AddTxDrawerProps {
  open: boolean;
  partyId: string;
  partyName: string;
  defaultType: 'gave' | 'got';
  onClose: () => void;
  onSaved: () => void;
}

function AddTxDrawer({ open, partyId, partyName, defaultType, onClose, onSaved }: AddTxDrawerProps) {
  const [type, setType]     = useState<'gave'|'got'>(defaultType);
  const [amount, setAmount] = useState('');
  const [note, setNote]     = useState('');
  const [date, setDate]     = useState(new Date().toISOString().split('T')[0]);
  const [mode, setMode]     = useState('Cash');
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  useEffect(() => { setType(defaultType); }, [defaultType, open]);

  const handleSave = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setErr('Enter a valid amount'); return; }
    setSaving(true); setErr('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const finalNote = note.trim() + (mode !== 'Cash' ? ` (via ${mode})` : '');
    const { error } = await supabase.from('party_ledger_txns').insert({
      id: generateId(), user_id: user.id,
      party_id: partyId, txn_type: type,
      amount: amt, note: finalNote.trim() || null, txn_date: date
    });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setAmount(''); setNote('');
    onSaved(); onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={onClose} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"/>
          <motion.div initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
            transition={{type:'spring',damping:28,stiffness:220}}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[2rem] shadow-2xl border border-border max-w-lg mx-auto"
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-text-dark">Add Entry</h3>
                <p className="text-xs text-text-muted">with {partyName}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-background text-text-muted"><X size={20}/></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Type toggle */}
              <div className="flex p-1 bg-background rounded-2xl border border-border">
                <button onClick={()=>setType('gave')}
                  className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all',
                    type==='gave' ? 'bg-emerald-500 text-white shadow-sm' : 'text-text-muted'
                  )}>
                  <ArrowUpCircle size={16}/>
                  <div className="text-left">
                    <div>You Gave</div>
                    <div className="text-[10px] opacity-80">They owe you ↑</div>
                  </div>
                </button>
                <button onClick={()=>setType('got')}
                  className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all',
                    type==='got' ? 'bg-red-500 text-white shadow-sm' : 'text-text-muted'
                  )}>
                  <ArrowDownCircle size={16}/>
                  <div className="text-left">
                    <div>You Got</div>
                    <div className="text-[10px] opacity-80">You owe them ↓</div>
                  </div>
                </button>
              </div>

              {/* Amount */}
              <div className="relative">
                <label htmlFor="tx-amount" className="sr-only">Amount</label>
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-text-muted">₹</span>
                <input id="tx-amount" name="tx-amount" type="number" placeholder="0.00" value={amount}
                  onChange={e=>setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 text-2xl font-bold bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Note */}
              <div>
                <label htmlFor="tx-note" className="sr-only">Note</label>
                <input id="tx-note" name="tx-note" value={note} onChange={e=>setNote(e.target.value)}
                  placeholder="Note (e.g. For groceries, Loan EMI)"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>

              {/* Date + Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tx-date" className="sr-only">Date</label>
                  <input id="tx-date" name="tx-date" type="date" value={date} onChange={e=>setDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="tx-mode" className="sr-only">Payment Mode</label>
                  <select id="tx-mode" name="tx-mode" value={mode} onChange={e=>setMode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none"
                  >
                    {PAYMENT_MODES.map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {err && <p className="text-red-500 text-sm">{err}</p>}

              <button onClick={handleSave} disabled={saving}
                className={cn('w-full py-4 rounded-2xl font-bold text-white text-base transition-all',
                  type==='gave' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600',
                  saving && 'opacity-60'
                )}
              >
                {saving ? 'Saving…' : type==='gave' ? 'Save — You Gave ₹'+amount : 'Save — You Got ₹'+amount}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Party Detail View ───────────────────────
function PartyDetail({ party, onBack, onRefresh }: { party: Party; onBack: ()=>void; onRefresh: ()=>void }) {
  const { isPrivacyMode } = useUI();
  const [txns, setTxns]         = useState<PartyTx[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'gave'|'got'>('gave');
  const [loading, setLoading]   = useState(true);

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

  const balance = txns.reduce((s,t) => s + (t.txn_type==='gave' ? Number(t.amount) : -Number(t.amount)), 0);

  const deleteTx = async (id: string) => {
    await supabase.from('party_ledger_txns').delete().eq('id', id);
    fetchTxns(); onRefresh();
  };

  return (
    <div className="space-y-5 pb-24 font-sans tracking-tight">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="h-10 w-10 bg-card border border-border rounded-xl flex items-center justify-center text-text-muted hover:text-text-dark transition-colors shadow-sm">
          <ArrowLeft size={20}/>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-text-dark">{party.name}</h2>
          {party.phone && <p className="text-text-muted text-sm flex items-center gap-1"><Phone size={12}/>{party.phone}</p>}
        </div>
      </div>

      {/* Balance card */}
      <div className={cn('p-6 rounded-[2rem] border text-center shadow-xl',
        balance > 0 ? 'bg-emerald-500/5 border-emerald-500/20' :
        balance < 0 ? 'bg-red-500/5 border-red-500/20' :
        'bg-card border-border'
      )}>
        <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
          {balance > 0 ? 'They owe you' : balance < 0 ? 'You owe them' : 'Settled up'}
        </p>
        <p className={cn('text-4xl font-bold mt-2',
          balance > 0 ? 'text-emerald-500' : balance < 0 ? 'text-red-500' : 'text-text-muted'
        )}>
          {formatCurrency(Math.abs(balance), isPrivacyMode)}
        </p>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <span className="text-emerald-500 font-bold">
            +{formatCurrency(txns.filter(t=>t.txn_type==='gave').reduce((s,t)=>s+Number(t.amount),0), isPrivacyMode)} gave
          </span>
          <span className="text-red-500 font-bold">
            -{formatCurrency(txns.filter(t=>t.txn_type==='got').reduce((s,t)=>s+Number(t.amount),0), isPrivacyMode)} got
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button onClick={()=>{setDrawerType('gave');setDrawerOpen(true)}}
          className="flex-1 py-3.5 bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors">
          <Plus size={18}/> You Gave
        </button>
        <button onClick={()=>{setDrawerType('got');setDrawerOpen(true)}}
          className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors">
          <Plus size={18}/> You Got
        </button>
      </div>

      {/* Statement */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-slate-200/20 rounded-2xl animate-pulse"/>)}</div>
      ) : txns.length === 0 ? (
        <div className="bg-card p-10 rounded-[2rem] border border-dashed border-border text-center">
          <p className="font-bold text-text-dark">No entries yet</p>
          <p className="text-text-muted text-sm mt-1">Start by recording the first transaction with {party.name}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-background border-b border-border">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Statement</p>
          </div>
          {txns.map((tx, idx) => (
            <div key={tx.id}
              className={cn('flex items-center justify-between px-4 py-4 group hover:bg-background/50 transition-colors',
                idx>0 && 'border-t border-border'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                  tx.txn_type==='gave' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                )}>
                  {tx.txn_type==='gave' ? <ArrowUpCircle size={18}/> : <ArrowDownCircle size={18}/>}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-text-dark truncate">
                    {tx.note || (tx.txn_type==='gave' ? 'You gave' : 'You got')}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                      {new Date(tx.txn_date+'T00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className={cn('font-bold text-lg', tx.txn_type==='gave'?'text-emerald-500':'text-red-500')}>
                    {tx.txn_type==='gave'?'+':'-'}{formatCurrency(Number(tx.amount), isPrivacyMode)}
                  </p>
                  <p className="text-[10px] text-text-muted">{tx.txn_type==='gave'?'You gave':'You got'}</p>
                </div>
                <button onClick={()=>deleteTx(tx.id)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all">
                  <X size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTxDrawer
        open={drawerOpen} partyId={party.party_id} partyName={party.name}
        defaultType={drawerType}
        onClose={()=>setDrawerOpen(false)}
        onSaved={()=>{ fetchTxns(); onRefresh(); }}
      />
    </div>
  );
}

// ─── Main Page ───────────────────────────────
export default function PartyLedgerPage() {
  const { isPrivacyMode } = useUI();
  const [parties, setParties]     = useState<Party[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [addOpen, setAddOpen]     = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);

  const fetchParties = async () => {
    setLoading(true);
    // Use party_balances view
    const { data } = await supabase
      .from('party_balances').select('*')
      .order('name', { ascending: true });
    setParties(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchParties(); }, []);

  const filtered = useMemo(() =>
    parties.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [parties, search]
  );

  const totalTheyOwe = parties.filter(p=>p.balance>0).reduce((s,p)=>s+p.balance,0);
  const totalYouOwe  = parties.filter(p=>p.balance<0).reduce((s,p)=>s+Math.abs(p.balance),0);

  if (selectedParty) {
    return (
      <PartyDetail
        party={selectedParty}
        onBack={() => { setSelectedParty(null); fetchParties(); }}
        onRefresh={fetchParties}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans tracking-tight">
      {/* Header */}
      <div className="flex items-center justify-between animate-slam">
        <div>
          <h2 className="text-3xl font-bold text-text-dark">Party Ledger</h2>
          <p className="text-text-muted text-sm font-medium">Track money with each person</p>
        </div>
        <button onClick={()=>setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
          <UserPlus size={16}/> Add Party
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 animate-slam" style={{animationDelay:'0.05s'}}>
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Total they owe you</p>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{formatCurrency(totalTheyOwe, isPrivacyMode)}</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Total you owe</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(totalYouOwe, isPrivacyMode)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative animate-slam" style={{animationDelay:'0.1s'}}>
        <label htmlFor="search-parties" className="sr-only">Search parties</label>
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"/>
        <input id="search-parties" name="search-parties" value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search parties…"
          className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
        />
      </div>

      {/* Parties list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i=><div key={i} className="h-20 bg-slate-200/20 rounded-2xl animate-pulse"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card p-12 rounded-[2rem] border border-dashed border-border text-center">
          <Users size={40} className="mx-auto text-border mb-3"/>
          <p className="font-bold text-text-dark">{search ? 'No parties found' : 'No parties yet'}</p>
          <p className="text-text-muted text-sm mt-1">
            {search ? 'Try a different search' : 'Add a customer, supplier, or friend to get started'}
          </p>
          {!search && (
            <button onClick={()=>setAddOpen(true)}
              className="mt-4 btn-primary flex items-center gap-2 mx-auto">
              <UserPlus size={16}/> Add First Party
            </button>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-[2rem] border border-border shadow-xl overflow-hidden animate-slam" style={{animationDelay:'0.15s'}}>
          {filtered.map((party, idx) => (
            <button key={party.party_id} onClick={()=>setSelectedParty(party)}
              className={cn('w-full flex items-center justify-between px-5 py-4 hover:bg-background/50 transition-colors group text-left',
                idx > 0 && 'border-t border-border'
              )}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0',
                  party.balance > 0 ? 'bg-emerald-500/10 text-emerald-600' :
                  party.balance < 0 ? 'bg-red-500/10 text-red-600' :
                  'bg-background text-text-muted'
                )}>
                  {party.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-text-dark group-hover:text-primary transition-colors">{party.name}</p>
                  {party.phone && (
                    <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                      <Phone size={10}/>{party.phone}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  {party.balance === 0 ? (
                    <p className="text-xs font-bold text-text-muted">Settled</p>
                  ) : (
                    <>
                      <p className={cn('font-bold text-lg', party.balance>0?'text-emerald-500':'text-red-500')}>
                        {formatCurrency(Math.abs(party.balance), isPrivacyMode)}
                      </p>
                      <p className={cn('text-[10px] font-bold uppercase tracking-widest',
                        party.balance>0?'text-emerald-500':'text-red-500'
                      )}>
                        {party.balance>0?'Will receive':'Will pay'}
                      </p>
                    </>
                  )}
                </div>
                <ChevronRight size={18} className="text-text-muted group-hover:text-text-dark transition-colors"/>
              </div>
            </button>
          ))}
        </div>
      )}

      <AddPartyModal open={addOpen} onClose={()=>setAddOpen(false)} onSaved={fetchParties}/>
    </div>
  );
}

