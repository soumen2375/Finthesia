import React, { useEffect, useState } from 'react';
import { useUI } from '@/context/UIContext';
import { 
  CreditCard, 
  Settings,
  Bell,
  Search,
  ShoppingCart,
  Coffee,
  Heart,
  Plane,
  Gamepad2,
  Book,
  Smartphone,
  Minus,
  Plus,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { api, NetWorthSummary, Transaction, SafeToSpend, BankAccount, FinancialHealth } from '@/services/api';
import { formatCurrency } from '@/lib/formatters';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PDFImportButton } from '@/components/app/PDFImportButton';

// Category Icons Map
const getCategoryIcon = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('food') || cat.includes('dining')) return <Coffee size={18} />;
  if (cat.includes('shop') || cat.includes('cloth')) return <ShoppingCart size={18} />;
  if (cat.includes('health') || cat.includes('medical')) return <Heart size={18} />;
  if (cat.includes('trans') || cat.includes('travel') || cat.includes('car')) return <Plane size={18} />;
  if (cat.includes('entert') || cat.includes('game') || cat.includes('movie')) return <Gamepad2 size={18} />;
  if (cat.includes('bill') || cat.includes('util')) return <Smartphone size={18} />;
  if (cat.includes('edu')) return <Book size={18} />;
  return <CreditCard size={18} />;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl">
        <p className="font-semibold text-slate-800 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-medium flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: {formatCurrency(entry.value, false)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { isPrivacyMode, refreshKey, triggerRefresh } = useUI();
  const [summary, setSummary] = useState<NetWorthSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [safeToSpend, setSafeToSpend] = useState<SafeToSpend | null>(null);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [health, setHealth] = useState<FinancialHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<'Annual' | 'Monthly'>('Annual');
  const [chartData, setChartData] = useState<any[]>([]);

  // Calculate Budget
  const totalBudget = health ? health.monthly_income : 0;
  const spent = health ? health.monthly_expenses : 0;
  const remaining = Math.max(0, totalBudget - spent);
  const spentPercent = totalBudget > 0 ? Math.min(100, Math.round((spent / totalBudget) * 100)) : 0;
  const remainingPercent = totalBudget > 0 ? Math.min(100, Math.round((remaining / totalBudget) * 100)) : 0;

  // Process Category stats for Top Categories
  const categoryStats = React.useMemo((): { name: string; amount: number }[] => {
    const expenses = recentTransactions.filter(t => t.type === 'expense' || t.type === 'spend');
    const grouped = expenses.reduce<Record<string, number>>((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});
    
    return Object.entries(grouped)
      .map(([name, amount]): { name: string; amount: number } => ({ name, amount: amount as number }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [recentTransactions]);

  const totalExpenseAmount = categoryStats.reduce((sum, cat) => sum + cat.amount, 0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [summaryData, transactionsData, safeData, banksData, healthData] = await Promise.all([
          api.getNetWorth(),
          api.getTransactions(),
          api.getSafeToSpend().catch(() => null),
          api.getBanks().catch(() => []),
          api.getFinancialHealth().catch(() => null),
        ]);
        setSummary(summaryData);
        setRecentTransactions(transactionsData.slice(0, 10)); // Fetch more to get good category spread
        setSafeToSpend(safeData);
        setBanks(banksData);
        setHealth(healthData);

        // Generate Chart Data from real transactions
        const monthlyData: Record<string, { income: number, expense: number }> = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
          monthlyData[key] = { income: 0, expense: 0 };
        }

        transactionsData.forEach(tx => {
          const d = new Date(tx.transaction_date);
          const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
          if (monthlyData[key]) {
            if (tx.type === 'income') monthlyData[key].income += tx.amount;
            else if (tx.type === 'expense' || tx.type === 'spend') monthlyData[key].expense += tx.amount;
          }
        });

        const formattedChartData = Object.entries(monthlyData).map(([month, data]) => ({
          name: month.split(' ')[0], 
          Income: data.income,
          Expenses: data.expense
        }));
        
        // Add dummy data for visuals if the user has no transactions yet to match the premium template showcase
        const hasData = formattedChartData.some(d => d.Income > 0 || d.Expenses > 0);
        if (!hasData) {
           formattedChartData.forEach((d) => {
             d.Income = 20000 + Math.random() * 30000;
             d.Expenses = 10000 + Math.random() * 20000;
           });
        }

        setChartData(formattedChartData);

      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  // Derived Account Balances
  const mainAccount = banks.find(b => b.account_type === 'current') || banks[0];
  const savingsAccount = banks.find(b => b.account_type === 'savings') || banks[1];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-2">
        <div className="h-16 bg-slate-200/50 rounded-2xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-32 bg-slate-200/50 rounded-[2rem]" />
          <div className="h-32 bg-slate-200/50 rounded-[2rem]" />
          <div className="h-32 bg-slate-200/50 rounded-[2rem]" />
          <div className="h-32 bg-slate-200/50 rounded-[2rem]" />
        </div>
        <div className="h-96 bg-slate-200/50 rounded-[2rem]" />
      </div>
    );
  }

  // Colors for progress bars
  const colors = ['#2a45ff', '#fde047', '#10b981', '#3b82f6', '#f43f5e'];

  return (
    <div className="max-w-[1400px] mx-auto pb-12 font-sans tracking-tight">
      
      {/* Header Area */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Dashboard
          </h1>
          <p className="text-slate-500 text-lg font-medium tracking-tight mt-1">
            Overview of your active finances
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white px-4 py-2.5 rounded-[1rem] text-sm font-semibold text-slate-700 shadow-sm border border-slate-100 flex items-center gap-2">
            <span className="text-slate-400">₹</span> {isPrivacyMode ? '***' : 'INR'}
          </div>
          <PDFImportButton onImported={triggerRefresh} className="!rounded-[1rem] bg-white border border-slate-100 shadow-sm hover:bg-slate-50 text-slate-600" />
          <button className="hidden sm:flex bg-white px-4 py-2.5 rounded-[1rem] text-sm font-medium text-slate-600 shadow-sm border border-slate-100 items-center gap-2 hover:bg-slate-50 transition-colors">
            <Settings size={16} />
            Customise
          </button>
        </div>
      </motion.div>

      {/* 4 Cards Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6"
      >
        
        {/* Total Balance */}
        <div className="bg-[#0f0f0f] text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="inline-flex px-3 py-1 bg-white/10 rounded-full text-[11px] font-medium text-white/80 border border-white/10 mb-2">
                Total Balance
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mt-2">
                {formatCurrency(summary?.totalAssets || 0, isPrivacyMode)}
              </h2>
            </div>
            <div className="flex gap-3 mt-8">
              <Link to="/banks" className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2.5 rounded-2xl border border-white/10 flex items-center justify-center gap-2 transition-colors">
                <Plus size={16} /> Deposit
              </Link>
              <Link to="/cards" className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2.5 rounded-2xl border border-white/10 flex items-center justify-center gap-2 transition-colors">
                <Minus size={16} /> Withdraw
              </Link>
            </div>
          </div>
        </div>

        {/* Main Account */}
        <div className="bg-[#2a45ff] text-white p-6 rounded-[2rem] shadow-lg shadow-[#2a45ff]/20 flex flex-col justify-between group">
          <div>
            <div className="inline-flex px-3 py-1 bg-white/20 rounded-full text-[11px] font-medium text-white border border-white/10 mb-2">
              Main Account
            </div>
            <p className="text-white/80 text-[13px] font-medium mt-1 truncate">
              {mainAccount?.bank_name || 'Primary Checking'}
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mt-8">
            {formatCurrency(mainAccount?.balance || summary?.totalAssets || 0, isPrivacyMode)}
          </h2>
        </div>

        {/* Savings */}
        <div className="bg-[#e2e8f0] text-slate-800 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex px-3 py-1 bg-white/50 rounded-full text-[11px] font-medium text-slate-600 border border-white pb-1 mb-2">
              Savings
            </div>
            <p className="text-slate-500 text-[13px] font-medium mt-1 truncate">
              {savingsAccount?.bank_name || 'Emergency Fund'}
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mt-8 text-slate-900">
            {formatCurrency(savingsAccount?.balance || (summary?.totalAssets ? summary.totalAssets * 0.3 : 0), isPrivacyMode)}
          </h2>
        </div>

        {/* Safe To Spend */}
        <div className="bg-white text-slate-800 p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex px-3 py-1 bg-slate-100 rounded-full text-[11px] font-medium text-slate-600 border border-slate-200 mb-2">
              Safe To Spend
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-800 leading-tight mt-1 max-w-[80%]">
              Your daily safe limit
            </h3>
          </div>
          <div className="mt-8 relative z-10">
             <Link to="/insights" className="w-full bg-[#0f0f0f] hover:bg-black text-white text-[15px] font-medium py-3 rounded-2xl flex items-center justify-center transition-transform hover:scale-[1.02] shadow-md">
               {safeToSpend?.safe_to_spend_daily ? formatCurrency(safeToSpend.safe_to_spend_daily, isPrivacyMode) : 'Analyze Now'}
             </Link>
          </div>
        </div>

      </motion.div>

      {/* Charts & Budget Section */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6"
      >
        
        {/* Income & Expenses Chart */}
        <div className="lg:col-span-2 bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="inline-flex px-4 py-1.5 bg-[#0f0f0f] rounded-full text-[12px] font-medium text-white">
              Income & Expenses
            </div>
            <select 
              value={chartPeriod}
              onChange={(e) => setChartPeriod(e.target.value as any)}
              className="text-sm font-medium text-slate-500 bg-transparent border-none focus:ring-0 cursor-pointer outline-none"
            >
              <option>Monthly</option>
              <option>Annual</option>
            </select>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                <Bar dataKey="Expenses" stackId="a" fill="#fde047" radius={[0, 0, 4, 4]} barSize={40} />
                <Bar dataKey="Income" stackId="a" fill="#2a45ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Module */}
        <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div className="inline-flex px-4 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-[12px] font-medium text-slate-700">
              Budget
            </div>
            <select className="text-sm font-medium text-slate-500 bg-transparent border-none focus:ring-0 cursor-pointer outline-none">
              <option>Monthly</option>
            </select>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="space-y-4 mb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2a45ff]"></span>
                  <span className="text-slate-600 font-medium text-[15px]">Total Budget</span>
                </div>
                <span className="font-bold text-slate-900 text-[15px]">{formatCurrency(totalBudget, isPrivacyMode)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#fde047]"></span>
                  <span className="text-slate-600 font-medium text-[15px]">Spent</span>
                </div>
                <span className="font-bold text-slate-900 text-[15px]">{formatCurrency(spent, isPrivacyMode)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                  <span className="text-slate-600 font-medium text-[15px]">Remaining</span>
                </div>
                <span className="font-bold text-slate-900 text-[15px]">{formatCurrency(remaining, isPrivacyMode)}</span>
              </div>
            </div>

            {/* Vertical Progress Bars */}
            <div className="flex items-end h-[100px] gap-3 mt-auto pt-4">
              <div className="relative flex-1 bg-slate-100 rounded-[0.8rem] flex flex-col justify-end overflow-hidden group h-full">
                <div className="bg-slate-300 w-full transition-all duration-1000 origin-bottom" style={{ height: `${remainingPercent}%` }}></div>
                <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-slate-700">{remainingPercent}%</span>
              </div>
              <div className="relative flex-1 bg-slate-100 rounded-[0.8rem] flex flex-col justify-end overflow-hidden group h-full">
                <div className="bg-[#fde047] w-full transition-all duration-1000 origin-bottom" style={{ height: `${spentPercent}%` }}></div>
                <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-slate-800">{spentPercent}%</span>
              </div>
              <div className="relative flex-1 bg-slate-100 rounded-[0.8rem] flex flex-col justify-end overflow-hidden group h-full">
                <div className="bg-[#2a45ff] w-full transition-all duration-1000 origin-bottom" style={{ height: '100%' }}></div>
                <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-white">Full</span>
              </div>
            </div>
          </div>
        </div>

      </motion.div>

      {/* Bottom Section */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
      >
        
        {/* Recent Transactions */}
        <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm relative">
          <div className="flex justify-between items-center mb-6">
            <div className="inline-flex px-4 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-[12px] font-medium text-slate-700">
              Recent Transactions
            </div>
            <div className="flex gap-2">
              <button className="h-9 w-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors border border-slate-100">
                <Search size={16} />
              </button>
              <button className="h-9 w-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors border border-slate-100">
                <Settings size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                  <th className="pb-4 font-medium pl-2">Transactions</th>
                  <th className="pb-4 font-medium hidden sm:table-cell">Category</th>
                  <th className="pb-4 text-right font-medium pr-2">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTransactions.slice(0, 4).map((tx, i) => (
                  <tr key={tx.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 flex items-center gap-3 sm:gap-4 pl-2">
                      <div className={cn(
                        "w-10 h-10 sm:w-11 sm:h-11 rounded-[0.9rem] flex items-center justify-center text-white shadow-sm font-bold text-base sm:text-lg shrink-0",
                        tx.type === 'income' ? "bg-[#10b981]" : "bg-[#0f0f0f]"
                      )}>
                        {tx.merchant?.[0]?.toUpperCase() || tx.description[0]?.toUpperCase() || <CreditCard size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm sm:text-[15px] truncate">{tx.merchant || tx.description}</p>
                        <p className="text-[11px] sm:text-[12px] text-slate-400 font-medium mt-0.5">{new Date(tx.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <span className="sm:hidden inline-flex items-center gap-1 mt-0.5 text-[11px] text-slate-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.type === 'income' ? '#10b981' : '#fde047' }}></span>
                          {tx.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.type === 'income' ? '#10b981' : '#fde047' }}></span>
                        <span className="text-[14px] text-slate-600 font-medium">{tx.category}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right pr-2">
                      <span className={cn(
                        "font-bold text-[15px]",
                        tx.type === 'income' ? "text-[#10b981]" : "text-slate-900"
                      )}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, isPrivacyMode)}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-slate-400 text-sm font-medium">No recent transactions</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="inline-flex px-4 py-1.5 w-max bg-slate-100 border border-slate-200 rounded-full text-[12px] font-medium text-slate-700 mb-8 mt-[-2px]">
            Top Categories
          </div>

          <div className="space-y-6 flex-1">
            {categoryStats.map((stat, idx) => {
              const percent = totalExpenseAmount > 0 ? (stat.amount / totalExpenseAmount) * 100 : 0;
              const colorHex = colors[idx] || '#2a45ff';
              
              return (
                <div key={idx} className="group">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[0.8rem] flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-700">
                        {getCategoryIcon(stat.name)}
                      </div>
                      <span className="font-bold text-slate-800 text-[15px]">{stat.name}</span>
                    </div>
                    <div className="text-[15px] font-bold text-slate-900 text-right">
                      {formatCurrency(stat.amount, isPrivacyMode)} 
                      <div className="text-[12px] text-slate-400 font-medium mt-0.5">
                        / {formatCurrency(totalBudget, isPrivacyMode)}
                      </div>
                    </div>
                  </div>
                  {/* Progress bar line */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.max(2, percent)}%`, backgroundColor: colorHex }}
                    ></div>
                  </div>
                </div>
              );
            })}
            
            {categoryStats.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 h-full">
                <AlertCircle size={32} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">No category data available yet</p>
              </div>
            )}
            
          </div>
        </div>

      </motion.div>

    </div>
  );
}
