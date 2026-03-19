import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bankId: string;
  onUploaded: () => void;
}

interface ParsedRow {
  date: string;
  description: string;
  amount: string;
  type: string;
}

export function CSVUploadModal({ isOpen, onClose, bankId, onUploaded }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ imported: number; duplicates: number; errors: string[] } | null>(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setError('');
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvContent(text);

      // Parse preview
      const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) {
        setError('CSV must have a header row and at least one data row');
        return;
      }

      const header = lines[0].toLowerCase().split(',').map(h => h.trim());
      const dateIdx = header.findIndex(h => h === 'date');
      const descIdx = header.findIndex(h => h === 'description');
      const amountIdx = header.findIndex(h => h === 'amount');
      const typeIdx = header.findIndex(h => h === 'type');

      if (dateIdx === -1 || amountIdx === -1) {
        setError('CSV must have at least Date and Amount columns');
        return;
      }

      const rows: ParsedRow[] = [];
      for (let i = 1; i < Math.min(lines.length, 11); i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        rows.push({
          date: cols[dateIdx] || '',
          description: descIdx !== -1 ? cols[descIdx] : '',
          amount: cols[amountIdx] || '0',
          type: typeIdx !== -1 ? cols[typeIdx] : (parseFloat(cols[amountIdx]) < 0 ? 'Debit' : 'Credit'),
        });
      }
      setPreview(rows);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!csvContent || !bankId) return;
    setIsUploading(true);
    setError('');
    try {
      const res = await api.uploadCSV(bankId, csvContent);
      setResult({ imported: res.imported, duplicates: res.duplicates, errors: res.errors });
      onUploaded();
    } catch (err: any) {
      setError(err.message || 'Failed to upload CSV');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setCsvContent('');
    setFileName('');
    setPreview([]);
    setResult(null);
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card rounded-[2rem] shadow-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                    <FileSpreadsheet size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-text-dark">Import CSV Statement</h2>
                </div>
                <button onClick={handleClose} className="p-2 rounded-xl hover:bg-background text-text-muted transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Result Banner */}
                {result && (
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 size={20} className="text-emerald-500" />
                      <p className="font-bold text-emerald-500">Import Complete!</p>
                    </div>
                    <div className="text-sm text-text-dark space-y-1">
                      <p>✅ <span className="font-bold">{result.imported}</span> transactions imported</p>
                      {result.duplicates > 0 && <p>⚠️ <span className="font-bold">{result.duplicates}</span> duplicates skipped</p>}
                      {result.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-red-500 font-bold text-xs">Errors:</p>
                          {result.errors.map((e, i) => <p key={i} className="text-red-500 text-xs">{e}</p>)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-2">
                    <AlertTriangle size={18} className="text-red-500" />
                    <p className="text-red-500 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* File Picker */}
                {!result && (
                  <>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-border hover:border-primary rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group"
                    >
                      <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload size={28} className="text-primary" />
                      </div>
                      <p className="font-bold text-text-dark">{fileName || 'Click to select CSV file'}</p>
                      <p className="text-text-muted text-xs mt-1">Accepts .csv files with Date, Description, Amount, Type columns</p>
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {/* Preview Table */}
                    {preview.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
                          Preview ({preview.length} of {csvContent.trim().split('\n').length - 1} rows)
                        </p>
                        <div className="overflow-x-auto rounded-xl border border-border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-background">
                                <th className="px-4 py-3 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest">Date</th>
                                <th className="px-4 py-3 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest">Description</th>
                                <th className="px-4 py-3 text-right text-[10px] font-bold text-text-muted uppercase tracking-widest">Amount</th>
                                <th className="px-4 py-3 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">Type</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {preview.map((row, i) => (
                                <tr key={i} className="hover:bg-background/50">
                                  <td className="px-4 py-3 text-text-dark font-medium">{row.date}</td>
                                  <td className="px-4 py-3 text-text-dark">{row.description}</td>
                                  <td className={`px-4 py-3 text-right font-bold ${parseFloat(row.amount) < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {row.amount}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      row.type.toLowerCase() === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                    }`}>
                                      {row.type}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {preview.length > 0 && (
                      <div className="flex space-x-3">
                        <button
                          onClick={handleUpload}
                          disabled={isUploading}
                          className="btn-primary flex-1 py-3 font-bold flex items-center justify-center space-x-2"
                        >
                          <Upload size={18} />
                          <span>{isUploading ? 'Importing...' : 'Import Transactions'}</span>
                        </button>
                        <button onClick={handleClose} className="btn-secondary px-6 py-3">Cancel</button>
                      </div>
                    )}
                  </>
                )}

                {result && (
                  <button onClick={handleClose} className="btn-primary w-full py-3 font-bold">
                    Done
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
