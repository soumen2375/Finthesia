import React from 'react';
import { Calendar, Filter, TrendingUp, TrendingDown, MoreHorizontal, Cloud, Megaphone, Briefcase, Sparkles, Download, Printer, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface ReportsViewProps {
  isPrivacyMode: boolean;
}

export default function ReportsView({ isPrivacyMode }: ReportsViewProps) {
  // Mock data for reports since we don't have real aggregated analytics yet
  const mockCategories = [
    { name: 'Cloud Infrastructure', amount: 12450, variance: -12, icon: Cloud, iColor: 'text-primary', iBg: 'bg-primary/10' },
    { name: 'Marketing & Ads', amount: 8200, variance: 4, icon: Megaphone, iColor: 'text-indigo-500', iBg: 'bg-indigo-500/10' },
    { name: 'Office Supplies', amount: 2140, variance: 0, icon: Briefcase, iColor: 'text-emerald-500', iBg: 'bg-emerald-500/10' },
  ];

  const mockLedgers = [
    { name: 'Sales Vault - EMEA', in: 124500, out: -82400, net: 42100, status: 'Reconciled', sColor: 'bg-primary/10 text-primary', initial: 'SV' },
    { name: 'Operating Ledger', in: 45200, out: -48150, net: -2950, status: 'Pending', sColor: 'bg-amber-500/10 text-amber-600', initial: 'OP' },
    { name: 'Capital Projects', in: 312000, out: -14200, net: 297800, status: 'Reconciled', sColor: 'bg-primary/10 text-primary', initial: 'CP' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header & Global Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold font-headline tracking-tight text-text-dark">Financial Analytics</h2>
          <p className="text-text-muted mt-1 font-medium">Real-time performance metrics for <span className="font-bold text-primary">Q3 Fiscal 2024</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-card border border-border p-1 rounded-xl flex items-center shadow-sm">
            <button className="px-4 py-2 bg-primary/10 rounded-lg text-sm font-bold text-primary transition-all">Yearly</button>
            <button className="px-4 py-2 text-sm font-bold text-text-muted hover:text-text-dark">Monthly</button>
            <button className="px-4 py-2 text-sm font-bold text-text-muted hover:text-text-dark">Daily</button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-bold hover:bg-background transition-colors shadow-sm text-text-dark">
            <Calendar size={18} /> Oct 1, 2023 - Dec 31, 2023
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold text-text-muted hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      {/* Bento Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Trend Chart - 8 col */}
        <div className="col-span-12 lg:col-span-8 bg-card rounded-[2rem] p-8 shadow-sm border border-border group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold font-headline text-text-dark">Income vs Expenses</h3>
              <p className="text-sm text-text-muted font-medium mt-1">Cashflow trend over the last 6 months</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-xs font-bold text-text-muted">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-xs font-bold text-text-muted">Expenses</span>
              </div>
            </div>
          </div>
          
          {/* Simulated Chart Canvas */}
          <div className="relative h-64 w-full flex items-end justify-between px-2 gap-4">
            {[60, 75, 90, 65, 80, 70].map((h1, i) => {
              const h2 = [45, 50, 40, 55, 35, 60][i];
              return (
                <div key={i} className="flex-1 h-full flex items-end gap-1.5 relative group/bar">
                  <div className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-80 ${i === 2 ? 'bg-primary' : 'bg-primary/20'}`} style={{ height: `${h1}%` }}>
                    {i === 2 && <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-text-dark text-white text-[10px] font-bold py-1.5 px-2.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">{formatCurrency(12400, isPrivacyMode)}</div>}
                  </div>
                  <div className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-80 ${i === 2 ? 'bg-red-500' : 'bg-red-500/20'}`} style={{ height: `${h2}%` }}></div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>

        {/* Budget Utilization Gauge - 4 col */}
        <div className="col-span-12 lg:col-span-4 bg-card p-8 rounded-[2rem] shadow-sm border border-border flex flex-col">
          <h3 className="text-xl font-bold font-headline text-text-dark mb-1">Budget Utilization</h3>
          <p className="text-sm text-text-muted font-medium mb-8">Overall burn rate this month</p>
          <div className="flex-1 flex flex-col justify-center items-center relative">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-background" cx="50%" cy="50%" fill="transparent" r="80" stroke="currentColor" strokeWidth="12"></circle>
                <circle className="text-primary transition-all duration-1000" cx="50%" cy="50%" fill="transparent" r="80" stroke="currentColor" strokeDasharray="502" strokeDashoffset="120" strokeWidth="12" strokeLinecap="round"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black font-headline text-text-dark">76%</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Utilized</span>
              </div>
            </div>
            <div className="mt-8 w-full space-y-3">
              <div className="flex justify-between text-xs font-bold text-text-muted">
                <span>Allocated: {formatCurrency(45000, isPrivacyMode)}</span>
                <span className="text-text-dark">Actual: {formatCurrency(34200, isPrivacyMode)}</span>
              </div>
              <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: '76%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Categories - 4 col */}
        <div className="col-span-12 lg:col-span-4 bg-background border border-border p-6 rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold font-headline text-text-dark text-lg">Top Categories</h3>
            <button className="text-text-muted hover:text-primary transition-colors"><MoreHorizontal size={20} /></button>
          </div>
          <div className="space-y-4">
            {mockCategories.map((c, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer bg-card p-3 rounded-2xl hover:shadow-md transition-all border border-transparent hover:border-border">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${c.iBg} ${c.iColor}`}>
                  <c.icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-dark">{c.name}</p>
                  <p className="text-xs font-bold text-text-muted mt-0.5">{formatCurrency(c.amount, isPrivacyMode)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold ${c.variance < 0 ? 'text-red-500' : c.variance > 0 ? 'text-primary' : 'text-text-muted'}`}>
                    {c.variance > 0 ? '+' : ''}{c.variance}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Insights - 8 col */}
        <div className="col-span-12 lg:col-span-8 bg-card border border-border p-8 rounded-[2rem] shadow-sm flex items-center gap-8 relative overflow-hidden">
          <div className="relative z-10 max-w-md">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-amber-500/20">
              <Sparkles size={14} /> Smart Insight
            </div>
            <h3 className="text-2xl font-extrabold font-headline mb-3 leading-tight text-text-dark">Your operational efficiency increased by 14.2% this quarter.</h3>
            <p className="text-text-muted text-sm mb-6 leading-relaxed font-medium">Optimization of cloud resources and reduction in administrative overhead contributed to a net saving of <span className="font-bold text-text-dark">{formatCurrency(4500, isPrivacyMode)}</span> compared to Q2.</p>
            <button className="text-primary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
              View Detailed Efficiency Report <ChevronRight size={16} />
            </button>
          </div>
          <div className="hidden md:block flex-1 h-full min-h-[200px] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-card via-transparent to-transparent z-10"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[80px] rounded-full"></div>
            <div className="absolute right-12 top-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/20 blur-[60px] rounded-full"></div>
            {/* Minimal SVG abstraction instead of an external image */}
            <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-full opacity-30 text-primary" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,97.7,-2.1C98.6,13.8,94.4,30.1,85.1,43.8C75.8,57.5,61.4,68.6,45.8,76.5C30.2,84.4,13.5,89.1,-2.4,93.2C-18.3,97.3,-33.4,100.8,-47.5,95.5C-61.6,90.2,-74.7,76.1,-83.4,60.2C-92.1,44.3,-96.4,26.6,-96.1,10.2C-95.8,-6.2,-90.9,-21.3,-82.4,-34.5C-73.9,-47.7,-61.8,-59,-48.1,-66.5C-34.4,-74,-19.1,-77.7,-2.6,-73.2C13.9,-68.7,27.8,-56,44.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Detailed Ledger View Table */}
      <section className="bg-card rounded-[2rem] p-8 shadow-sm border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h3 className="text-xl font-bold font-headline text-text-dark">Recent Ledger Activity</h3>
          <div className="flex gap-2">
            <button className="p-2 border border-border text-text-muted rounded-xl hover:bg-background transition-colors hover:text-text-dark shadow-sm">
              <Download size={18} />
            </button>
            <button className="p-2 border border-border text-text-muted rounded-xl hover:bg-background transition-colors hover:text-text-dark shadow-sm">
              <Printer size={18} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-border">
                <th className="pb-4 px-4">Ledger Name</th>
                <th className="pb-4 px-4">Total Inflow</th>
                <th className="pb-4 px-4">Total Outflow</th>
                <th className="pb-4 px-4">Net Variance</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {mockLedgers.map((l, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group border-b border-border last:border-0">
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-text-dark font-bold text-xs shrink-0">
                        {l.initial}
                      </div>
                      <span className="font-bold text-text-dark">{l.name}</span>
                    </div>
                  </td>
                  <td className="py-5 px-4 font-bold text-text-dark">{formatCurrency(l.in, isPrivacyMode)}</td>
                  <td className="py-5 px-4 font-bold text-red-500">({formatCurrency(Math.abs(l.out), isPrivacyMode)})</td>
                  <td className={`py-5 px-4 font-bold ${l.net >= 0 ? 'text-primary' : 'text-red-500'}`}>
                    {l.net >= 0 ? '+' : '-'}{formatCurrency(Math.abs(l.net), isPrivacyMode)}
                  </td>
                  <td className="py-5 px-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${l.sColor}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <button className="text-text-muted font-bold text-xs hover:text-primary transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-end gap-1 w-full">
                      Details <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
