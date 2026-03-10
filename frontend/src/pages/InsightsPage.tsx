import React from 'react';
import { Zap, TrendingUp, AlertCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { formatCurrency } from '../lib/formatters';

export default function InsightsPage() {
  const { isPrivacyMode } = useUI();

  const insights = [
    {
      title: 'Credit Utilization Alert',
      description: 'Your total credit utilization is at 46%. Paying ₹12,000 across your cards will bring it below the recommended 30% threshold.',
      type: 'warning',
      icon: AlertCircle,
      color: 'text-warning',
      bg: 'bg-warning/10',
      action: 'View Optimization Plan'
    },
    {
      title: 'Spending Pattern Shift',
      description: 'You spent 34% more on "Dining Out" this month compared to your 6-month average. Consider reviewing your food budget.',
      type: 'info',
      icon: TrendingUp,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
      action: 'Analyze Spending'
    },
    {
      title: 'Subscription Detected',
      description: 'We detected a recurring payment of ₹999 to "Netflix". You can save ₹2,400 annually by switching to an annual plan.',
      type: 'success',
      icon: Lightbulb,
      color: 'text-primary',
      bg: 'bg-primary/10',
      action: 'Manage Subscriptions'
    }
  ];

  return (
    <div className="space-y-10 pb-12">
      <div className="animate-slam">
        <h2 className="text-3xl font-bold text-text-dark tracking-tight">Smart Insights</h2>
        <p className="text-text-muted text-sm font-medium">AI-driven recommendations to optimize your financial health</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {insights.map((insight, i) => (
          <div key={i} className="card flex flex-col md:flex-row gap-8 items-start group hover:shadow-xl transition-all">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${insight.bg} ${insight.color}`}>
              <insight.icon size={32} />
            </div>
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-text-dark tracking-tight">{insight.title}</h3>
                <p className="text-text-muted leading-relaxed text-lg font-medium">{insight.description}</p>
              </div>
              <button className="flex items-center space-x-2 text-secondary font-bold text-sm hover:underline group/btn">
                <span>{insight.action}</span>
                <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-text-dark rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-lg space-y-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-secondary/20 text-secondary rounded-xl flex items-center justify-center shadow-inner">
              <Zap size={24} />
            </div>
            <h3 className="text-3xl font-bold tracking-tight">What-If Simulator</h3>
          </div>
          <p className="text-slate-400 leading-relaxed text-lg font-medium">
            See how your credit score and utilization change if you make a payment today or take a new loan.
          </p>
          <button className="px-10 py-5 bg-secondary text-white rounded-[2.5rem] font-bold text-lg hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 active:scale-95">
            Launch Simulator
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] -ml-20 -mb-20"></div>
      </section>
    </div>
  );
}
