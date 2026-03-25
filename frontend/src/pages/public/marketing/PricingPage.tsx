import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, HelpCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  const faqs = [
    {
      q: "Can I switch between monthly and annual billing?",
      a: "Yes, you can upgrade to an annual plan at any time to take advantage of the discounted rate."
    },
    {
      q: "Is it easy to cancel my premium subscription?",
      a: "Absolutely. You can cancel your Pro or Wealth plan anytime from your account settings. Your premium features will remain active until the end of your current billing cycle."
    },
    {
      q: "Is my financial data secure?",
      a: "Yes, Finthesia uses bank-level encryption to ensure your data is completely secure. We will never sell your personal data."
    },
    {
      q: "Which plan is right for me?",
      a: "If you are just starting to track your expenses and only have one or two bank accounts, the Basic Plan (Free) is a great place to start. If you want to automate your tracking across multiple accounts, get detailed charts, and remove ads, the Pro Plan is our most popular choice. If you are actively investing, managing debt, and want AI-powered forecasting, the Wealth Plan is built for you."
    },
    {
       q: "What is the difference between the Pro and Wealth plans?",
       a: "The Pro plan is designed for comprehensive daily financial management (unlimited accounts, category auto-detection, budget planning, and data exports). The Wealth plan includes everything in Pro, but adds forward-looking and wealth-building tools, such as investment portfolio tracking, AI-driven financial insights, and dedicated planners for debt payoff and long-term financial goals."
    },
    {
       q: "Do you offer a free trial for the Pro or Wealth plans?",
       a: "Instead of a limited-time free trial, we offer a generous Forever Free Basic plan so you can test out Finthesia’s core features for as long as you like. If you decide to upgrade, we back your first purchase with a 14-day money-back guarantee. If you aren't satisfied, just let us know within 14 days for a full refund."
    },
    {
       q: "What happens if I exceed the 2-account limit on the Free plan?",
       a: "The Basic Free plan allows you to sync or manually track up to 2 bank accounts or credit cards. If you wish to add a 3rd account or card, you will be prompted to upgrade to the Pro plan, which offers unlimited account connections."
    },
    {
       q: "Can I upgrade, downgrade, or cancel my plan at any time?",
       a: "Yes, absolutely! You can manage your subscription directly from your Account Settings. If you upgrade, you will be charged a prorated amount for the remainder of your billing cycle. If you downgrade or cancel, your premium features will remain active until the end of your current paid billing cycle, after which your account will revert to the Free plan."
    },
    {
       q: "How does the annual billing discount work?",
       a: "When you choose Annual billing, you pay for a full 12 months upfront. Because you are committing to a full year, we apply a discount that essentially gives you 2 months for free compared to paying month-to-month."
    },
    {
       q: "Are there any hidden fees or setup charges?",
       a: "No. Finthesia believes in 100% transparent pricing. You will only be billed the flat monthly or annual fee shown for your chosen plan. There are no setup fees, transaction fees, or hidden charges."
    },
    {
       q: "What payment methods do you accept?",
       a: "We accept all major Credit and Debit cards, Net Banking, and popular UPI payment methods to make upgrading as seamless as possible."
    },
    {
       q: "Will I lose my data if I downgrade from Pro/Wealth to Free?",
       a: "No, you will never lose your historical transaction data. However, if you downgrade to the Free plan, any connected accounts beyond the 2-account limit will be paused (they won't update with new data), and access to premium features like AI insights, custom exports, and advanced charts will be locked until you resubscribe."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#27C4E1] selection:text-white flex flex-col">
      <PublicHeader />

      <main className="flex-grow pt-32 pb-24">
        
        {/* Header Section */}
        <section className="text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
             Simple, transparent pricing for every financial journey.
          </h1>
          <p className="text-xl text-slate-600 mb-10">
             Choose whether you want to pay Monthly or save up to 20% with Annual billing.
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center space-x-4">
             <span className={`text-lg font-medium transition-colors ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
             <button 
               onClick={() => setIsAnnual(!isAnnual)}
               className="w-16 h-8 bg-[#27C4E1] rounded-full p-1 relative transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#27C4E1]"
             >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`}></div>
             </button>
             <span className={`text-lg font-medium transition-colors flex items-center ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                Annually
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold leading-5 bg-green-100 text-green-800">
                   Save 20%
                </span>
             </span>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
           <div className="grid md:grid-cols-3 gap-8 items-start">
              
              {/* Basic Plan */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
                 <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">🌱 Basic Plan</h3>
                    <p className="text-slate-500 mt-2 text-sm">Best for: Beginners starting their personal finance journey.</p>
                 </div>
                 <div className="mb-6">
                    <span className="text-5xl font-black text-slate-900">₹0</span>
                    <span className="text-slate-500 font-medium"> / forever</span>
                 </div>
                 <Link to="/register">
                    <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-6 rounded-xl border-none">
                       Get Started for Free
                    </Button>
                 </Link>
                 
                 <div className="mt-8 space-y-4">
                    <p className="font-bold text-slate-900 text-sm">Features:</p>
                    <ul className="space-y-3">
                       <li className="flex gap-3 text-slate-600 text-sm"><Check className="text-green-500 w-5 h-5 flex-shrink-0" /> Personal finance dashboard</li>
                       <li className="flex gap-3 text-slate-600 text-sm"><Check className="text-green-500 w-5 h-5 flex-shrink-0" /> Expense & Net worth tracking</li>
                       <li className="flex gap-3 text-slate-600 text-sm"><Check className="text-green-500 w-5 h-5 flex-shrink-0" /> Basic financial calculators</li>
                       <li className="flex gap-3 text-slate-600 text-sm"><Check className="text-green-500 w-5 h-5 flex-shrink-0" /> Credit card comparison</li>
                       <li className="flex gap-3 text-slate-600 text-sm"><Check className="text-green-500 w-5 h-5 flex-shrink-0" /> Manual transaction entry</li>
                    </ul>
                    
                    <div className="pt-4 border-t border-slate-100"></div>
                    <p className="font-bold text-slate-900 text-sm">Limitations:</p>
                    <ul className="space-y-3 text-slate-500 text-sm">
                       <li className="flex gap-3 opacity-75"><X className="text-red-400 w-5 h-5 flex-shrink-0" /> Limit of 2 bank accounts / cards</li>
                       <li className="flex gap-3 opacity-75"><X className="text-red-400 w-5 h-5 flex-shrink-0" /> Basic analytics only</li>
                       <li className="flex gap-3 opacity-75"><X className="text-red-400 w-5 h-5 flex-shrink-0" /> Includes Ads & Partner offers</li>
                    </ul>
                 </div>
              </div>

              {/* Pro Plan */}
              <div className="bg-white rounded-3xl p-8 border-2 border-[#27C4E1] shadow-xl relative transform md:-translate-y-4">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#27C4E1] text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                    Most Popular / Recommended
                 </div>
                 <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">⭐ Pro Plan</h3>
                    <p className="text-slate-500 mt-2 text-sm">Best for: Individuals wanting deep insights and automated tracking.</p>
                 </div>
                 <div className="mb-6">
                    <span className="text-5xl font-black text-slate-900">₹{isAnnual ? '999' : '99'}</span>
                    <span className="text-slate-500 font-medium whitespace-nowrap"> / {isAnnual ? 'year' : 'month'}</span>
                 </div>
                 <Link to="/register">
                    <Button className="w-full bg-[#27C4E1] hover:bg-[#1EB0CC] text-white font-bold py-6 rounded-xl border-none shadow-md shadow-[#27C4E1]/25 transition-transform hover:scale-105">
                       Upgrade to Pro
                    </Button>
                 </Link>
                 
                 <div className="mt-8 space-y-4">
                    <p className="font-bold text-slate-900 text-sm">Everything in Basic, plus:</p>
                    <ul className="space-y-3">
                       <li className="flex gap-3 text-slate-700 font-medium text-sm"><Check className="text-[#27C4E1] w-5 h-5 flex-shrink-0" /> Unlimited accounts & cards</li>
                       <li className="flex gap-3 text-slate-700 font-medium text-sm"><Check className="text-[#27C4E1] w-5 h-5 flex-shrink-0" /> Smart spending insights</li>
                       <li className="flex gap-3 text-slate-700 font-medium text-sm"><Check className="text-[#27C4E1] w-5 h-5 flex-shrink-0" /> Category auto-detection</li>
                       <li className="flex gap-3 text-slate-700 font-medium text-sm"><Check className="text-[#27C4E1] w-5 h-5 flex-shrink-0" /> Advanced analytics & charts</li>
                       <li className="flex gap-3 text-slate-700 font-medium text-sm"><Check className="text-[#27C4E1] w-5 h-5 flex-shrink-0" /> Budget planning tools</li>
                       <li className="flex gap-3 text-slate-700 font-medium text-sm"><Check className="text-[#27C4E1] w-5 h-5 flex-shrink-0" /> Credit score tracking</li>
                       <li className="flex gap-3 text-slate-700 font-medium text-sm"><Check className="text-[#27C4E1] w-5 h-5 flex-shrink-0" /> Export data to Excel / CSV</li>
                       <li className="flex gap-3 text-slate-900 font-bold text-sm"><Check className="text-[#27C4E1] w-5 h-5 flex-shrink-0" /> 🚫 No Ads</li>
                    </ul>
                 </div>
              </div>

              {/* Wealth Plan */}
              <div className="bg-slate-900 rounded-3xl p-8 border border-slate-700 shadow-lg relative text-white">
                 <div className="mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">💎 Wealth (Pro+)</h3>
                    <p className="text-slate-400 mt-2 text-sm">Best for: Investors and wealth builders looking for advanced forecasting.</p>
                 </div>
                 <div className="mb-6">
                    <span className="text-5xl font-black">₹{isAnnual ? '1,499' : '149'}</span>
                    <span className="text-slate-400 font-medium whitespace-nowrap"> / {isAnnual ? 'year' : 'month'}</span>
                 </div>
                 <Link to="/register">
                    <Button className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-6 rounded-xl border-none transition-transform hover:scale-105">
                       Unlock Wealth Plan
                    </Button>
                 </Link>
                 
                 <div className="mt-8 space-y-4">
                    <p className="font-bold text-slate-300 text-sm">Everything in Pro, plus:</p>
                    <ul className="space-y-3">
                       <li className="flex gap-3 text-slate-200 text-sm"><Check className="text-blue-400 w-5 h-5 flex-shrink-0" /> Investment & Portfolio tracking</li>
                       <li className="flex gap-3 text-slate-200 text-sm"><Check className="text-blue-400 w-5 h-5 flex-shrink-0" /> Net worth forecasting</li>
                       <li className="flex gap-3 text-blue-200 font-bold text-sm"><Check className="text-blue-400 w-5 h-5 flex-shrink-0" /> AI-powered financial insights</li>
                       <li className="flex gap-3 text-slate-200 text-sm"><Check className="text-blue-400 w-5 h-5 flex-shrink-0" /> Advanced financial goal planner</li>
                       <li className="flex gap-3 text-slate-200 text-sm"><Check className="text-blue-400 w-5 h-5 flex-shrink-0" /> Debt payoff planner</li>
                       <li className="flex gap-3 text-slate-200 text-sm"><Check className="text-blue-400 w-5 h-5 flex-shrink-0" /> Priority customer support</li>
                    </ul>
                 </div>
              </div>

           </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4">
                 <HelpCircle className="w-8 h-8 text-[#27C4E1]" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
           </div>

           <div className="space-y-6">
              {faqs.map((faq, index) => (
                 <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-slate-900 flex items-start gap-3 mb-3">
                       <ChevronRight className="w-6 h-6 text-[#27C4E1] flex-shrink-0 mt-0.5" />
                       {faq.q}
                    </h3>
                    <p className="text-slate-600 pl-9 leading-relaxed">
                       {faq.a}
                    </p>
                 </div>
              ))}
           </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
