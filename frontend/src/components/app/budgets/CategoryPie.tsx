import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/formatters';
import { useUI } from '@/context/UIContext';
import { Budget } from '@/services/api';

interface CategoryPieProps {
  budgets: Budget[];
}

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

export default function CategoryPie({ budgets }: CategoryPieProps) {
  const { isPrivacyMode } = useUI();

  // Create data but do NOT filter out 0 spent, so they remain in the legend.
  // We can assign a minimum value for the visual slice if it's 0 so it literally just shows a tiny sliver? 
  // Normally 0 means it won't render a slice, but remains in legend map. Let's just give it its real value.
  const data = budgets
    .map(b => ({
      name: b.category,
      value: b.spent_amount,
      color: getHexColor(b.color)
    }));

  const totalSpent = data.reduce((sum, item) => sum + item.value, 0);

  if (budgets.length === 0) {
    return (
      <div className="card bg-card p-6 h-[300px] flex items-center justify-center text-text-muted">
        No spending data yet for this month.
      </div>
    );
  }

  // To let 0 value items show in the tooltip only if hovered via legend? Wait, Recharts tooltip ignores 0 if there's no slice. 
  // It's perfectly fine if 0 value has no slice, they just want the color in the legend list below the pie.

  return (
    <div className="card bg-card p-5 md:p-6 animate-fade-in delay-200">
      <h3 className="font-bold text-lg text-text-dark tracking-tight mb-6">Spending by Category</h3>
      
      <div className="h-[250px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.filter(d => d.value > 0)} // Only render slices for > 0 so that it doesn't give weird calculation errors
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={5}
            >
              {data.filter(d => d.value > 0).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatCurrency(value, isPrivacyMode)}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', background: '#1E293B', color: '#F8FAFC' }}
              itemStyle={{ color: '#F8FAFC' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-text-muted uppercase tracking-widest font-bold">Total Spent</span>
          <span className="text-xl font-bold text-text-dark">
            {formatCurrency(totalSpent, isPrivacyMode)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {data.map((entry, index) => (
           <div key={index} className="flex items-center space-x-2">
             <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
             <span className="text-sm font-medium text-text-dark truncate flex-1" title={entry.name}>{entry.name}</span>
             <span className="text-xs font-bold text-text-muted">
               {totalSpent > 0 ? Math.round((entry.value / totalSpent) * 100) : 0}%
             </span>
           </div>
        ))}
      </div>
    </div>
  );
}
