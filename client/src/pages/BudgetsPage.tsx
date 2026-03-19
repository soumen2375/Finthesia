import React from 'react';
import { Plus } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';
import { useUI } from '../context/UIContext';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';

export default function BudgetsPage() {
  const { isPrivacyMode } = useUI();

  const budgets = [
    { category: 'Food & Dining', spent: 8500, limit: 10000, color: 'bg-warning' },
    { category: 'Shopping', spent: 12000, limit: 15000, color: 'bg-secondary' },
    { category: 'Transport', spent: 2100, limit: 5000, color: 'bg-primary' },
    { category: 'Entertainment', spent: 4500, limit: 4000, color: 'bg-danger' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center px-1 animate-slam">
        <div>
          <h2 className="text-3xl font-bold text-text-dark tracking-tight">Budgets</h2>
          <p className="text-text-muted text-sm font-medium">Track and manage your monthly spending limits</p>
        </div>
        <Button variant="primary" size="sm">
          <Plus size={18} className="mr-2" /> Create Budget
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => (
          <div key={budget.category} className="card group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-bold text-text-dark">{budget.category}</h3>
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest">
                  {formatCurrency(budget.limit - budget.spent, isPrivacyMode)} remaining
                </p>
              </div>
              <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm", 
                budget.spent > budget.limit ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"
              )}>
                {budget.spent > budget.limit ? 'Over Budget' : 'On Track'}
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-text-dark">{formatCurrency(budget.spent, isPrivacyMode)}</span>
                <span className="text-text-muted">of {formatCurrency(budget.limit, isPrivacyMode)}</span>
              </div>
              <div className="h-4 w-full bg-background rounded-full overflow-hidden border border-border p-0.5">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000 shadow-sm", budget.color)} 
                  style={{ width: `${Math.min(100, (budget.spent / budget.limit) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
