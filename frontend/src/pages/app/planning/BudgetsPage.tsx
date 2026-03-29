import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api, Budget, Transaction } from '@/services/api';

// Components
import TopCards from '@/components/app/budgets/TopCards';
import ExpenseChart from '@/components/app/budgets/ExpenseChart';
import CategoryPie from '@/components/app/budgets/CategoryPie';
import BudgetProgress from '@/components/app/budgets/BudgetProgress';
import TransactionList from '@/components/app/budgets/TransactionList';
import CreateBudgetModal from '@/components/app/budgets/CreateBudgetModal';

export default function BudgetsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Derived state
  const monthString = String(currentDate.getMonth() + 1).padStart(2, '0');
  const yearNumber = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const fetchedBudgets = await api.getBudgets(monthString, yearNumber);
      
      // We also need transactions for the chart and list
      const allTx = await api.getTransactions();
      const prefix = `${yearNumber}-${monthString}`;
      
      const currentMonthTx = allTx.filter(tx => tx.transaction_date.startsWith(prefix));
      
      // Current Net Worth for Total Balance
      const netWorth = await api.getNetWorth();

      setBudgets(fetchedBudgets);
      setTransactions(currentMonthTx);
      setTotalBalance(netWorth.totalAssets);
    } catch (error) {
      console.error('Failed to fetch budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const handleSaveBudget = async (newBudget: Omit<Budget, 'id' | 'month' | 'year' | 'spent_amount'>) => {
    if (editingBudget && editingBudget.id) {
      await api.updateBudget(editingBudget.id, {
        category: newBudget.category,
        limit_amount: newBudget.limit_amount,
        color: newBudget.color
      });
    } else {
      await api.addBudget({
        ...newBudget,
        month: monthString,
        year: yearNumber,
        spent_amount: 0
      });
    }
    setEditingBudget(null);
    await fetchData();
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDeleteBudget = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await api.deleteBudget(id);
        await fetchData();
      } catch (error) {
        console.error('Failed to delete budget', error);
      }
    }
  };

  // Calculate monthly stats
  const monthlyIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlyExpense = transactions
    .filter(tx => tx.type === 'spend' || tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlySavings = monthlyIncome - monthlyExpense;

  // We could calculate percentage changes by fetching previous month's data, but keeping it simple for now (0%)

  return (
    <div className="space-y-6 md:space-y-8 pb-12 w-full max-w-[1400px] mx-auto">
      {/* Header section with smart month switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1 animate-slam">
        <div>
          <h2 className="text-3xl font-bold text-text-dark tracking-tight">Budgets</h2>
          <p className="text-text-muted text-sm font-medium">Grow your wealth with smart tracking</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-sm shrink-0">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-background rounded-lg transition-colors text-text-muted hover:text-text-dark">
              <ChevronLeft size={18} />
            </button>
            <span className="px-4 font-bold text-sm text-text-dark min-w-[110px] text-center whitespace-nowrap">
              {monthName} {yearNumber}
            </span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-background rounded-lg transition-colors text-text-muted hover:text-text-dark">
              <ChevronRight size={18} />
            </button>
          </div>
          <Button variant="primary" size="sm" onClick={() => { setEditingBudget(null); setIsModalOpen(true); }} className="shrink-0">
            <Plus size={18} className="mr-2" /> New Budget
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Top Summary Cards */}
          <TopCards 
            totalBalance={totalBalance}
            monthlyIncome={monthlyIncome}
            monthlyExpense={monthlyExpense}
            monthlySavings={monthlySavings}
          />

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ExpenseChart transactions={transactions} month={monthString} year={yearNumber} />
            </div>
            <div className="lg:col-span-1">
              <CategoryPie budgets={budgets} />
            </div>
          </div>

          {/* Bottom Section: Progress Bars & Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="order-2 lg:order-1">
              <BudgetProgress budgets={budgets} onEdit={handleEditBudget} onDelete={handleDeleteBudget} />
            </div>
            <div className="order-1 lg:order-2">
              <TransactionList transactions={transactions} />
            </div>
          </div>
        </>
      )}

      <CreateBudgetModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingBudget(null); }}
        onSave={handleSaveBudget}
        existingCategories={budgets.map(b => b.category)}
        editingBudget={editingBudget}
      />
    </div>
  );
}
