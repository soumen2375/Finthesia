import React from 'react';
import { ShoppingBag, Coffee, Car, Film, CreditCard, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useUI } from '@/context/UIContext';
import { cn } from '@/lib/utils';
import { Transaction } from '@/services/api';

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const { isPrivacyMode } = useUI();

  // Show only recent 5 transactions
  const displayTransactions = transactions.slice(0, 5);

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Food': return <Coffee size={18} />;
      case 'Transport': return <Car size={18} />;
      case 'Shopping': return <ShoppingBag size={18} />;
      case 'Entertainment': return <Film size={18} />;
      case 'Salary': return <DollarSign size={18} />;
      default: return <CreditCard size={18} />;
    }
  };

  if (displayTransactions.length === 0) {
    return (
      <div className="card bg-card p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-sm animate-fade-in delay-500">
        <h3 className="font-bold text-lg text-text-dark tracking-tight">Recent Transactions</h3>
        <p className="text-text-muted">No recent transactions for this month.</p>
      </div>
    );
  }

  return (
    <div className="card bg-card p-5 md:p-6 shadow-sm animate-fade-in delay-500">
      <div className="flex justify-between items-center mb-6">
         <h3 className="font-bold text-lg text-text-dark tracking-tight">Recent Transactions</h3>
      </div>
      <div className="space-y-4">
        {displayTransactions.map((tx) => {
          const isIncome = tx.type === 'income';
          const iconColor = isIncome ? 'text-success bg-success/10' : 'text-primary bg-primary/10';
          
          return (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-background hover:bg-border/30 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={cn("p-3 rounded-xl", iconColor)}>
                  {getIconForCategory(tx.category)}
                </div>
                <div>
                  <h4 className="font-semibold text-text-dark text-sm leading-tight mb-1">{tx.description || tx.category}</h4>
                  <p className="text-xs text-text-muted font-medium">{tx.category}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={cn(
                  "font-bold text-sm tracking-tight",
                  isIncome ? "text-success" : "text-text-dark"
                )}>
                  {isIncome ? '+' : '-'}{formatCurrency(tx.amount, isPrivacyMode)}
                </span>
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mt-1">
                  {new Date(tx.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
