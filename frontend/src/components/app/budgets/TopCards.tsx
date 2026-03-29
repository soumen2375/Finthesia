import React from 'react';
import { Wallet, IndianRupee, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useUI } from '@/context/UIContext';
import { cn } from '@/lib/utils';

interface TopCardsProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
  incomeChange?: number; // percentage
  expenseChange?: number; // percentage 
}

export default function TopCards({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  monthlySavings,
  incomeChange = 0,
  expenseChange = 0,
}: TopCardsProps) {
  const { isPrivacyMode } = useUI();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
      {/* Total Balance Card */}
      <div className="card bg-card p-4 md:p-5 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 border-l-4 border-l-primary/50">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Wallet size={20} />
          </div>
        </div>
        <div>
          <p className="text-xs md:text-sm text-text-muted font-medium mb-1">Total Balance</p>
          <h3 className="text-xl md:text-2xl font-bold text-text-dark tracking-tight">
            {formatCurrency(totalBalance, isPrivacyMode)}
          </h3>
        </div>
      </div>

      {/* Income Card */}
      <div className="card bg-card p-4 md:p-5 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 border-l-4 border-l-success/50">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 rounded-xl bg-success/10 text-success">
            <TrendingUp size={20} />
          </div>
          {incomeChange !== 0 && (
            <span className={cn(
              "text-xs font-bold px-2 py-1 rounded-full",
              incomeChange > 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            )}>
              {incomeChange > 0 ? '+' : ''}{incomeChange}%
            </span>
          )}
        </div>
        <div>
          <p className="text-xs md:text-sm text-text-muted font-medium mb-1">Income (This Month)</p>
          <h3 className="text-xl md:text-2xl font-bold text-text-dark tracking-tight">
            {formatCurrency(monthlyIncome, isPrivacyMode)}
          </h3>
        </div>
      </div>

      {/* Expenses Card */}
      <div className="card bg-card p-4 md:p-5 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 border-l-4 border-l-danger/50">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 rounded-xl bg-danger/10 text-danger">
            <TrendingDown size={20} />
          </div>
          {expenseChange !== 0 && (
            <span className={cn(
              "text-xs font-bold px-2 py-1 rounded-full",
              expenseChange > 0 ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
            )}>
              {expenseChange > 0 ? '+' : ''}{expenseChange}%
            </span>
          )}
        </div>
        <div>
          <p className="text-xs md:text-sm text-text-muted font-medium mb-1">Expenses</p>
          <h3 className="text-xl md:text-2xl font-bold text-text-dark tracking-tight">
            {formatCurrency(monthlyExpense, isPrivacyMode)}
          </h3>
        </div>
      </div>

      {/* Savings Card */}
      <div className="card bg-card p-4 md:p-5 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 border-l-4 border-l-warning/50">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 rounded-xl bg-warning/10 text-warning">
            <PiggyBank size={20} />
          </div>
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-warning/10 text-warning">
            Save
          </span>
        </div>
        <div>
          <p className="text-xs md:text-sm text-text-muted font-medium mb-1">Savings</p>
          <h3 className="text-xl md:text-2xl font-bold text-text-dark tracking-tight">
            {formatCurrency(monthlySavings, isPrivacyMode)}
          </h3>
        </div>
      </div>
    </div>
  );
}
