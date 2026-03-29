import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/formatters';
import { useUI } from '@/context/UIContext';
import { Transaction } from '@/services/api';

interface ExpenseChartProps {
  transactions: Transaction[];
  month: string;
  year: number;
}

export default function ExpenseChart({ transactions, month, year }: ExpenseChartProps) {
  const { isPrivacyMode } = useUI();

  const data = useMemo(() => {
    // Generate an array of days for the given month/year
    const daysInMonth = new Date(year, parseInt(month), 0).getDate();
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      expense: 0,
      income: 0,
      dateStr: `${year}-${month.padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
      displayDate: `Day ${i + 1}`
    }));

    // Populate data
    transactions.forEach(tx => {
      // Expecting transaction_date format "YYYY-MM-DD"
      const dateParts = tx.transaction_date.split('-');
      if (dateParts.length === 3) {
        const txYear = parseInt(dateParts[0]);
        const txMonth = dateParts[1];
        const txDay = parseInt(dateParts[2]);

        if (txYear === year && txMonth === month) {
          const index = txDay - 1;
          if (index >= 0 && index < daysInMonth) {
             if (tx.type === 'spend' || tx.type === 'expense') {
               dailyData[index].expense += tx.amount;
             } else if (tx.type === 'income') {
               dailyData[index].income += tx.amount;
             }
          }
        }
      }
    });

    // Optional: Calculate cumulative data for a smoother "Groww" feel, instead of spiky daily charts
    const cumulativeData = [...dailyData];
    let cumExpense = 0;
    let cumIncome = 0;
    
    for (let i = 0; i < cumulativeData.length; i++) {
        cumExpense += cumulativeData[i].expense;
        cumIncome += cumulativeData[i].income;
        
        cumulativeData[i].expense = cumExpense;
        cumulativeData[i].income = cumIncome;
    }

    return cumulativeData;
  }, [transactions, month, year]);

  return (
    <div className="card bg-card p-5 md:p-6 animate-fade-in delay-300">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="font-bold text-lg text-text-dark tracking-tight">Cumulative Income vs Expense</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-xs font-bold text-text-muted">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger"></div>
            <span className="text-xs font-bold text-text-muted">Expense</span>
          </div>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 12 }} 
              tickCount={5}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [formatCurrency(value, isPrivacyMode), name === 'income' ? 'Income' : 'Expense']}
              labelFormatter={(label, payload) => `Day ${label}`}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', background: '#1E293B', color: '#F8FAFC' }}
            />
            <Area 
              type="monotone" 
              dataKey="income" 
              stroke="#22C55E" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorIncome)" 
            />
            <Area 
              type="monotone" 
              dataKey="expense" 
              stroke="#EF4444" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorExpense)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
