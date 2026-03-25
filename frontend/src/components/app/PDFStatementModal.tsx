import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Loader2, Pencil, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabaseClient';
import {
  parseStatement,
  checkProviderStatus,
  type ParsedTransaction,
  type ProviderStatus,
} from '@/services/pdfParser';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bankId?: string;
  onImported: () => void;
}

const STATEMENT_TYPES = ['bank', 'credit_card'] as const;

const CATEGORY_COLORS: Record<string, string> = {
  'Food & drinks': 'bg-orange-500/10 text-orange-600',
  'Transport': 'bg-blue-500/10 text-blue-600',
  'Shopping': 'bg-pink-500/10 text-pink-600',
  'Bills & utilities': 'bg-yellow-500/10 text-yellow-600',
  'Entertainment': 'bg-purple-500/10 text-purple-600',
  'Investment': 'bg-green-500/10 text-green-600',
  'Salary': 'bg-emerald-500/10 text-emerald-600',
  'Transfer': 'bg-cyan-500/10 text-cyan-600',
  'Health': 'bg-red-500/10 text-red-600',
  'Education': 'bg-indigo-500/10 text-indigo-600',
  'Other': 'bg-gray-500/10 text-gray-600',
};

const ALL_CATEGORIES = Object.keys(CATEGORY_COLORS);

export function PDFStatementModal({ isOpen, onClose, bankId, onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'parsing' | 'preview' | 'importing' | 'done'>('upload');
  const [statementType, setStatementType] = useState<'bank' | 'credit_card'>('bank');
  const [file, setFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({
    provider: 'ollama', online: false, modelName: '', label: 'Checking...'
  });

  // Check provider status when modal opens
  useEffect(() => {
    if (isOpen) {
      checkProviderStatus().then(setProviderStatus);
    }
  }, [isOpen]);

  const reset = () => {
    setStep('upload');
    setFile(null);
    setTransactions([]);
    setEditingIdx(null);
    setError('');
    setImportResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => { reset(); onClose(); };

  const handleParse = async (f: File) => {
    setStep('parsing');
    setError('');

    try {
      // Re-check provider status
      const status = await checkProviderStatus();
      setProviderStatus(status);

      if (!status.online) {
        if (status.provider === 'ollama') {
          throw new Error('Ollama is not running. Start it with "ollama serve" and pull the model with "ollama pull qwen2.5:7b"');
        } else {
          throw new Error('API key not configured. Set VITE_LLM_API_KEY in your .env file.');
        }
      }

      const validated = await parseStatement(f, statementType);
      setTransactions(validated);
      setStep('preview');
    } catch (e: any) {
      setError(e.message || 'Failed to parse statement');
      setStep('upload');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    handleParse(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type === 'application/pdf') {
      setFile(f);
      handleParse(f);
    }
  }, [statementType]);

  const updateTransaction = (idx: number, field: keyof ParsedTransaction, value: any) => {
    setTransactions(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const removeTransaction = (idx: number) => {
    setTransactions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleImport = async () => {
    setStep('importing');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated'); setStep('preview'); return; }

    let imported = 0;
    let skipped = 0;

    try {
      if (bankId) {
        const rows = transactions.map(t => ({
          id: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
          user_id: user.id,
          bank_id: bankId,
          amount: t.amount,
          merchant: t.merchant || t.description,
          category: t.category,
          transaction_date: t.date,
          transaction_type: t.type,
          description: t.description,
          source: 'pdf',
          is_active: true,
        }));

        for (let i = 0; i < rows.length; i += 50) {
          const batch = rows.slice(i, i + 50);
          const { error: err } = await supabase.from('bank_transactions').insert(batch);
          if (err) { skipped += batch.length; }
          else { imported += batch.length; }
        }

        // Update bank balance
        const netChange = transactions.reduce((sum, t) =>
          sum + (t.type === 'credit' ? t.amount : -t.amount), 0);
        const { data: bank } = await supabase.from('banks').select('balance').eq('id', bankId).single();
        if (bank) {
          await supabase.from('banks').update({
            balance: Number(bank.balance) + netChange,
            updated_at: new Date().toISOString()
          }).eq('id', bankId);
        }
      } else {
        const rows = transactions.map(t => ({
          id: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
          user_id: user.id,
          amount: t.amount,
          category: t.category,
          description: t.merchant || t.description,
          transaction_date: t.date,
          type: t.type === 'credit' ? 'income' : 'expense',
          is_active: true,
        }));

        for (let i = 0; i < rows.length; i += 50) {
          const batch = rows.slice(i, i + 50);
          const { error: err } = await supabase.from('transactions').insert(batch);
          if (err) skipped += batch.length;
          else imported += batch.length;
        }
      }

      setImportResult({ imported: imported || transactions.length - skipped, skipped });
      setStep('done');
      onImported();
    } catch (e: any) {
      setError(e.message || 'Import failed');
      setStep('preview');
    }
  };

  const totals = {
    credits: transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0),
    debits: transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card rounded-[2rem] shadow-2xl border border-border w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-dark">Import PDF Statement</h2>
                    <p className="text-xs text-text-muted">AI-powered extraction & auto-categorization</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Provider Status Badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    providerStatus.online
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-red-500/10 text-red-600'
                  }`}>
                    {providerStatus.online ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {providerStatus.label}
                  </div>
                  <button onClick={handleClose} className="p-2 rounded-xl hover:bg-background text-text-muted transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">

                {/* STEP: Upload */}
                {(step === 'upload' || step === 'parsing') && (
                  <div className="space-y-5">
                    {/* Statement type selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Statement Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        {STATEMENT_TYPES.map(t => (
                          <button
                            key={t}
                            type="button"
                            disabled={step === 'parsing'}
                            onClick={() => setStatementType(t)}
                            className={`p-3 rounded-xl border-2 text-sm font-bold transition-all capitalize ${
                              statementType === t
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border text-text-muted hover:border-primary/50'
                            }`}
                          >
                            {t === 'credit_card' ? 'Credit Card' : 'Bank Account'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Provider offline warning */}
                    {!providerStatus.online && (
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start space-x-3">
                        <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-yellow-600 text-sm font-bold">
                            {providerStatus.provider === 'ollama' ? 'Ollama is not running' : 'API not configured'}
                          </p>
                          <p className="text-yellow-600/80 text-xs mt-1">
                            {providerStatus.provider === 'ollama' ? (
                              <>Start Ollama: <code className="bg-yellow-500/10 px-1.5 py-0.5 rounded text-[11px]">ollama serve</code> → then <code className="bg-yellow-500/10 px-1.5 py-0.5 rounded text-[11px]">ollama pull qwen2.5:7b</code></>
                            ) : (
                              <>Set <code className="bg-yellow-500/10 px-1.5 py-0.5 rounded text-[11px]">VITE_LLM_API_KEY</code> in your .env file</>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Drop zone */}
                    <div
                      onDragOver={e => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => step !== 'parsing' && fileRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors ${
                        step === 'parsing'
                          ? 'border-primary/40 bg-primary/5 cursor-wait'
                          : 'border-border hover:border-primary cursor-pointer group'
                      }`}
                    >
                      {step === 'parsing' ? (
                        <>
                          <Loader2 size={40} className="text-primary animate-spin mb-4" />
                          <p className="font-bold text-text-dark text-lg">AI is reading your statement…</p>
                          <p className="text-text-muted text-sm mt-1">
                            Extracting text & auto-categorizing via {providerStatus.label}
                          </p>
                          {file && <p className="text-text-muted text-xs mt-3">{file.name}</p>}
                        </>
                      ) : (
                        <>
                          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Upload size={28} className="text-primary" />
                          </div>
                          <p className="font-bold text-text-dark text-lg">Drop your PDF here</p>
                          <p className="text-text-muted text-sm mt-1">or click to browse — text-based PDF statements</p>
                          <p className="text-text-muted text-xs mt-3 max-w-sm text-center">
                            Works with HDFC, ICICI, SBI, Axis, Kotak, IndusInd and most Indian banks
                          </p>
                        </>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
                        <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-red-500 text-sm font-medium">{error}</p>
                      </div>
                    )}

                    <div className="bg-background rounded-xl p-4 border border-border">
                      <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">How it works</p>
                      <ul className="space-y-1.5 text-xs text-text-muted">
                        <li>1. PDF text is extracted in your browser (pdfjs — no upload needed)</li>
                        <li>2. AI parses & auto-categorizes every transaction with India-specific rules</li>
                        <li>3. You review, edit merchants/categories, and remove duplicates</li>
                        <li>4. Import to Finthesia — {providerStatus.provider === 'ollama' ? 'all data stays on your machine' : 'text only sent to AI, no PDF uploaded'}</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* STEP: Preview */}
                {step === 'preview' && (
                  <div className="space-y-5">
                    {/* Summary bar */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-card p-4 rounded-xl border border-border text-center">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Transactions</p>
                        <p className="text-2xl font-bold text-text-dark mt-1">{transactions.length}</p>
                      </div>
                      <div className="bg-card p-4 rounded-xl border border-border text-center">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Credits</p>
                        <p className="text-2xl font-bold text-emerald-500 mt-1">₹{totals.credits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className="bg-card p-4 rounded-xl border border-border text-center">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Debits</p>
                        <p className="text-2xl font-bold text-red-500 mt-1">₹{totals.debits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-2">
                        <AlertTriangle size={16} className="text-red-500" />
                        <p className="text-red-500 text-sm font-medium">{error}</p>
                      </div>
                    )}

                    {/* Transaction table */}
                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="grid grid-cols-[90px_1fr_110px_90px_32px] text-[10px] font-bold text-text-muted uppercase tracking-widest bg-background px-4 py-2.5 gap-2">
                        <span>Date</span>
                        <span>Merchant / Party</span>
                        <span>Category</span>
                        <span className="text-right">Amount</span>
                        <span></span>
                      </div>
                      <div className="divide-y divide-border max-h-[380px] overflow-y-auto">
                        {transactions.map((tx, i) => (
                          <div key={i} className="grid grid-cols-[90px_1fr_110px_90px_32px] items-center px-4 py-3 gap-2 hover:bg-background/50 transition-colors group">
                            <span className="text-xs text-text-muted font-medium">{tx.date}</span>
                            <div className="min-w-0">
                              {editingIdx === i ? (
                                <input
                                  autoFocus
                                  className="w-full text-sm bg-background border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                  value={tx.merchant || tx.description}
                                  onChange={e => updateTransaction(i, 'merchant', e.target.value)}
                                  onBlur={() => setEditingIdx(null)}
                                  onKeyDown={e => e.key === 'Enter' && setEditingIdx(null)}
                                />
                              ) : (
                                <div>
                                  <p className="text-sm font-medium text-text-dark truncate">{tx.merchant || tx.description}</p>
                                  {tx.party && (
                                    <p className="text-[10px] text-text-muted truncate">
                                      {tx.party}{tx.upiId ? ` · ${tx.upiId}` : ''}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            <select
                              value={tx.category}
                              onChange={e => updateTransaction(i, 'category', e.target.value)}
                              className={`text-[10px] font-bold rounded-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer ${CATEGORY_COLORS[tx.category] || 'bg-gray-500/10 text-gray-600'}`}
                            >
                              {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <p className={`text-sm font-bold text-right ${tx.type === 'credit' ? 'text-emerald-500' : 'text-text-dark'}`}>
                              {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </p>
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingIdx(i)} className="p-1 text-text-muted hover:text-text-dark rounded">
                                <Pencil size={12} />
                              </button>
                              <button onClick={() => removeTransaction(i)} className="p-1 text-text-muted hover:text-red-500 rounded">
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-text-muted">
                      Edit merchant names, change categories, or remove rows before importing.
                    </p>
                  </div>
                )}

                {/* STEP: Importing */}
                {step === 'importing' && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <Loader2 size={48} className="text-primary animate-spin" />
                    <p className="font-bold text-text-dark">Importing {transactions.length} transactions…</p>
                    <p className="text-text-muted text-sm">Almost done</p>
                  </div>
                )}

                {/* STEP: Done */}
                {step === 'done' && importResult && (
                  <div className="py-10 flex flex-col items-center justify-center space-y-6">
                    <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={40} className="text-emerald-500" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-text-dark">Import complete!</h3>
                      <p className="text-text-muted mt-2">
                        <span className="font-bold text-text-dark">{importResult.imported}</span> transactions imported successfully
                        {importResult.skipped > 0 && `, ${importResult.skipped} skipped`}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleClose} className="btn-primary px-8 py-3 font-bold">Done</button>
                      <button onClick={reset} className="btn-secondary px-8 py-3 font-bold">Import Another</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              {step === 'preview' && (
                <div className="shrink-0 px-6 py-4 border-t border-border flex items-center justify-between">
                  <button onClick={reset} className="btn-secondary py-2.5 px-5 text-sm font-bold">
                    Upload Different File
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={transactions.length === 0}
                    className="btn-primary py-2.5 px-6 font-bold flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Upload size={16} />
                    <span>Import {transactions.length} Transactions</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
