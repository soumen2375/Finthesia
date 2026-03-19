import React, { useState, useEffect } from 'react';
import { api, Asset } from '../services/api';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ASSET_CATEGORIES } from '../pages/AssetsPage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingAsset: Asset | null;
}

export function AddAssetModal({ isOpen, onClose, onSaved, editingAsset }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('bank_accounts');
  const [subcategory, setSubcategory] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingAsset) {
      setName(editingAsset.name);
      setCategory(editingAsset.category || 'other');
      setSubcategory(editingAsset.subcategory || '');
      setCurrentValue(editingAsset.current_value.toString());
      setNotes(editingAsset.notes || '');
    } else {
      setName('');
      setCategory('bank_accounts');
      setSubcategory('');
      setCurrentValue('');
      setNotes('');
    }
    setError('');
  }, [editingAsset, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const data: Asset = {
        id: editingAsset?.id || crypto.randomUUID(),
        name: name.trim(),
        category,
        subcategory: subcategory || undefined,
        current_value: parseFloat(currentValue),
        notes: notes.trim() || undefined,
      };

      if (editingAsset) {
        await api.updateAsset(data);
      } else {
        await api.addAsset(data);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  const catConfig = ASSET_CATEGORIES.find(c => c.id === category);
  const subcategories = catConfig?.subcategories || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card rounded-[2rem] shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  {catConfig && (
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg", catConfig.bg)}>
                      <catConfig.icon size={20} />
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-text-dark">
                    {editingAsset ? 'Edit Asset' : 'Add Asset'}
                  </h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-background text-text-muted transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">{error}</div>
                )}

                {/* Category Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Asset Category *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ASSET_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => { setCategory(cat.id); setSubcategory(''); }}
                        className={cn(
                          "p-2.5 rounded-xl border-2 text-xs font-bold transition-all flex items-center space-x-2",
                          category === cat.id
                            ? `border-current ${cat.textColor} ${cat.bgLight}`
                            : 'border-border text-text-muted hover:border-border/80'
                        )}
                      >
                        <cat.icon size={16} />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subcategory */}
                {subcategories.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Sub-Category</label>
                    <select
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select sub-category (optional)</option>
                      {subcategories.map(sc => (
                        <option key={sc} value={sc}>{sc}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., SBI Savings Account"
                    className="input-field"
                    required
                  />
                </div>

                {/* Value */}
                <div>
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Current Value (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    placeholder="0.00"
                    className="input-field"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional details..."
                    className="input-field resize-none h-20"
                  />
                </div>

                {/* Submit */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim() || !currentValue}
                    className="btn-primary flex-1 py-3 font-bold"
                  >
                    {isSubmitting ? 'Saving...' : editingAsset ? 'Update Asset' : 'Add Asset'}
                  </button>
                  <button type="button" onClick={onClose} className="btn-secondary px-6 py-3">Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
