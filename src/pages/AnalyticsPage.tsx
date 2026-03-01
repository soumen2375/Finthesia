import React, { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line
} from 'recharts';
import { useUI } from '../context/UIContext';
import { cn } from '../lib/utils';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api, Transaction } from '../services/api';

export default function AnalyticsPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const txs = await api.getTransactions();
        setTransactions(txs);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  const formatCurrency = (value: number) => {
    if (isPrivacyMode) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate spending breakdown
  const spendingByCategory = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount);
      return acc;
    }, {} as Record<string, number>);

  const colors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#475569', '#EC4899', '#8B5CF6'];
  const spendingData = Object.entries(spendingByCategory).map(([name, value], index) => ({
    name,
    value: value as number,
    color: colors[index % colors.length]
  })).sort((a, b) => (b.value as number) - (a.value as number));

  // Calculate monthly trends (last 6 months)
  const monthlyTrends = transactions.reduce((acc, tx) => {
    const date = new Date(tx.transaction_date);
    const month = date.toLocaleString('default', { month: 'short' });
    if (!acc[month]) acc[month] = { month, spending: 0, income: 0 };
    if (tx.type === 'expense') acc[month].spending += Number(tx.amount);
    else acc[month].income += Number(tx.amount);
    return acc;
  }, {} as Record<string, { month: string; spending: number; income: number }>);

  const monthlyTrendData = Object.values(monthlyTrends).slice(-6);

  // Calculate health score (mocked algorithm based on savings rate)
  const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalSpending = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpending) / totalIncome) * 100 : 0;
  const healthScore = Math.min(Math.max(Math.round(50 + savingsRate), 0), 100);

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-1 animate-slam">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics</h2>
          <p className="text-slate-500 text-sm font-medium">Your financial health at a glance</p>
        </div>
        <Button variant="secondary" size="sm">
          <Download size={18} className="mr-2" /> Export
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 font-medium">Analyzing your finances...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-sm">
          <TrendingUp size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Data Yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Add some assets, cards, or transactions to see your financial analytics.</p>
        </div>
      ) : (
        <>
          {/* Financial Health Score */}
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="relative h-48 w-48 flex items-center justify-center">
              <svg className="h-full w-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="transparent"
                  className="text-slate-100"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="transparent"
                  strokeDasharray={502.6}
                  strokeDashoffset={502.6 * (1 - healthScore / 100)}
                  className={cn(
                    "transition-all duration-1000 ease-out",
                    healthScore > 70 ? "text-emerald-500" : healthScore > 40 ? "text-blue-600" : "text-amber-500"
                  )}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
                <span className="text-4xl font-bold text-slate-900">{healthScore}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Health Score</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-slate-900">
                {healthScore > 80 ? 'Excellent' : healthScore > 60 ? 'Good' : healthScore > 40 ? 'Fair' : 'Needs Attention'} Financial Health
              </p>
              <p className="text-sm text-slate-500 max-w-[240px]">
                {healthScore > 60 
                  ? "You're managing your finances effectively. Keep up the good work!" 
                  : "Consider reviewing your spending habits to improve your financial health."}
              </p>
            </div>
          </section>

          {/* Spending Breakdown */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xl font-bold text-slate-900">Spending Breakdown</h3>
              <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                <button className="px-3 py-1 text-xs font-bold bg-white rounded-lg shadow-sm">Month</button>
                <button className="px-3 py-1 text-xs font-bold text-slate-500">Year</button>
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {spendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {spendingData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium text-slate-600 truncate">{item.name}</span>
                    <span className="text-xs font-bold text-slate-900 ml-auto">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Monthly Trends */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 px-1">Income vs Spending</h3>
            <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="income" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="spending" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-blue-600" />
                  <span className="text-xs font-bold text-slate-900">Income</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-slate-400" />
                  <span className="text-xs font-bold text-slate-900">Spending</span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
