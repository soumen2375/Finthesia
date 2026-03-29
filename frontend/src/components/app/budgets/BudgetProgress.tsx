import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useUI } from '@/context/UIContext';
import { cn } from '@/lib/utils';
import { Budget } from '@/services/api';

interface BudgetProgressProps {
  budgets: Budget[];
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

// Fallback for older database entries that used tailwind classes
const getHexColor = (color: string) => {
  if (color.startsWith('#')) return color;
  switch (color) {
    case 'bg-primary': return '#3B82F6';
    case 'bg-success': return '#22C55E';
    case 'bg-danger': return '#EF4444';
    case 'bg-warning': return '#F59E0B';
    case 'bg-secondary': return '#A855F7';
    case 'bg-info': return '#0EA5E9';
    default: return '#3B82F6';
  }
};

export default function BudgetProgress({ budgets, onEdit, onDelete }: BudgetProgressProps) {
  const { isPrivacyMode } = useUI();

  if (budgets.length === 0) {
    return (
      <div className="card bg-card p-6 flex items-center justify-center min-h-[200px] text-text-muted">
        No active budgets found for this period. Create one above!
      </div>
    );
  }

  return (
    <div className="card bg-card p-5 md:p-6 space-y-6 animate-fade-in delay-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-text-dark tracking-tight">Budget Breakdown</h3>
      </div>

      <div className="space-y-6">
        {budgets.map((budget) => {
          const percentage = Math.min(100, Math.max(0, (budget.spent_amount / budget.limit_amount) * 100));
          const isOverBudget = budget.spent_amount > budget.limit_amount;
          const remaining = budget.limit_amount - budget.spent_amount;
          
          const hexColor = getHexColor(budget.color);
          const barColor = isOverBudget ? '#EF4444' : hexColor;
          const trackColor = `${hexColor}25`; // 15% opacity for track so you always see the chosen color
          const displayWidth = Math.max(2, percentage); // Ensure the color shows slightly even if 0 spent!

          return (
            <div key={budget.id} className="group transition-all">
              <div className="flex justify-between items-start mb-2 group-hover:opacity-100 relative">
                <div className="space-y-1">
                  <h4 className="font-semibold text-text-dark flex items-center gap-2">
                    {budget.category}
                  </h4>
                  <p className={cn(
                    "text-xs font-bold uppercase tracking-widest",
                    isOverBudget ? "text-danger" : "text-text-muted"
                  )}>
                    {isOverBudget ? (
                      `Over budget by ${formatCurrency(Math.abs(remaining), isPrivacyMode)}`
                    ) : (
                      `${formatCurrency(remaining, isPrivacyMode)} remaining`
                    )}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Actions normally hidden until hover, but visible on mobile slightly */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button 
                      onClick={() => onEdit(budget)}
                      className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Edit Budget"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => budget.id && onDelete(budget.id)}
                      className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      title="Delete Budget"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border", 
                    isOverBudget ? "bg-danger/10 text-danger border-danger/20" : "bg-card border-border/50 text-text-dark"
                  )}>
                    {formatCurrency(budget.spent_amount, isPrivacyMode)} / {formatCurrency(budget.limit_amount, isPrivacyMode)}
                  </div>
                </div>
              </div>

              <div 
                className="h-3 w-full rounded-full overflow-hidden p-[1.5px]"
                style={{ backgroundColor: trackColor }}
              >
                <div 
                  className="h-full rounded-full transition-all duration-1000 shadow-sm"
                  style={{ width: `${displayWidth}%`, backgroundColor: barColor }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
