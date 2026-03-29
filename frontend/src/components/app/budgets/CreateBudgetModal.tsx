import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Budget {
  id?: string;
  category: string;
  limit_amount: number;
  color: string;
}

interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id' | 'month' | 'year' | 'spent_amount'>) => Promise<void>;
  existingCategories: string[];
  editingBudget?: Budget | null;
}

const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transport',
  'Entertainment',
  'Bills & Utilities',
  'Health & Fitness',
  'Education',
  'Travel',
  'Other'
];

const COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Fuchsia', value: '#D946EF' },
  { name: 'Slate', value: '#64748B' },
];

export default function CreateBudgetModal({ isOpen, onClose, onSave, existingCategories, editingBudget }: CreateBudgetModalProps) {
  const [formData, setFormData] = useState({
    category: '',
    limit_amount: '',
    color: '#3B82F6'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset or populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingBudget) {
        setFormData({
          category: editingBudget.category,
          limit_amount: editingBudget.limit_amount.toString(),
          color: editingBudget.color.startsWith('#') ? editingBudget.color : '#3B82F6'
        });
      } else {
        setFormData({ category: '', limit_amount: '', color: '#3B82F6' });
      }
      setError('');
    }
  }, [isOpen, editingBudget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    
    // If it's a new budget, or they changed category, check for duplication
    const isChangingCategory = editingBudget ? editingBudget.category !== formData.category : true;
    if (isChangingCategory && existingCategories.includes(formData.category)) {
      setError('A budget for this category already exists this month');
      return;
    }
    
    const limit = parseFloat(formData.limit_amount);
    if (!limit || limit <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        category: formData.category,
        limit_amount: limit,
        color: formData.color,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden animate-slide-up">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-dark">{editingBudget ? 'Edit Budget' : 'Create Budget'}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-background rounded-full transition-colors text-text-muted hover:text-text-dark"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 text-danger text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                disabled={!!editingBudget} // Generally don't allow changing category of existing budget easily, but let's allow it if we want. Let's not disable for flexibility, but they shouldn't conflict. We actually check conflict above. Let's keep it enabled.
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none disabled:opacity-50"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(cat => (
                  <option 
                    key={cat} 
                    value={cat} 
                    disabled={existingCategories.includes(cat) && (!editingBudget || editingBudget.category !== cat)}
                  >
                    {cat} {existingCategories.includes(cat) && (!editingBudget || editingBudget.category !== cat) ? '(Exists)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5">
                Monthly Limit (₹)
              </label>
              <input
                type="number"
                value={formData.limit_amount}
                onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
                placeholder="e.g. 5000"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder-text-muted/50"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">
                Color Theme
              </label>
              <div className="grid grid-cols-5 gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-8 h-8 rounded-full border-2 transition-all mx-auto ${
                      formData.color === color.value 
                        ? 'border-white scale-110 shadow-lg' 
                        : 'border-transparent hover:scale-105 opacity-80'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                {loading ? 'Saving...' : <><Save size={18} className="mr-2"/> Save</>}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
