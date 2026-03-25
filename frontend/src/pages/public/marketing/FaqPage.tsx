import React, { useState } from 'react';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';

const faqsByCategory = {
  "Setup & Accounts": [
    {
      q: "How many bank accounts can I connect?",
      a: "On the Basic (Free) plan, you can connect up to 2 accounts or credit cards. If you upgrade to Pro or Wealth, you can connect an unlimited number of accounts."
    },
    {
      q: "Do you support international banks?",
      a: "Yes. Pro and Wealth plan users can sync with over 10,000 financial institutions globally, making it perfect for expats or digital nomads."
    }
  ],
  "Security & Privacy": [
    {
      q: "Can Finthesia move my money?",
      a: "No. Finthesia is strictly a \"read-only\" platform. We utilize secure APIs to fetch transaction data to populate your dashboard, but we do not have the ability, permissions, or credentials to initiate transfers, make payments, or move your money in any way."
    },
    {
      q: "What happens if I delete my account?",
      a: "If you choose to delete your account, all your financial data, custom categories, and personal information are permanently and irreversibly erased from our servers in compliance with GDPR and global privacy laws."
    }
  ],
  "Pricing & Billing": [
    {
      q: "How does the free trial work?",
      a: "Instead of a limited-time free trial, we offer a generous Forever Free Basic plan so you can test out Finthesia’s core features for as long as you like. We also offer a 14-day money-back guarantee for initial premium plan purchases."
    },
    {
      q: "Can I share my Pro/Wealth account with my spouse?",
      a: "Yes! You can invite one co-manager to your Wealth plan at no additional cost, so you and your partner can manage the household budget together from your respective devices."
    }
  ],
  "Features & Management": [
    {
      q: "How does the AI predictive forecasting work?",
      a: "Available on the Wealth plan, our AI engine looks at your past 6 months to 2 years of cash flow, identifies recurring bills, variable spending trends, and income, and projects your future account balances and net worth. It helps you see where you will be financially in 1, 5, or 10 years if you maintain your current habits."
    },
    {
      q: "Can I export my data?",
      a: "Yes. All users can export their transaction history to CSV at any time. Pro and Wealth users get advanced export options perfectly formatted for specific accounting software or tax filing preparation."
    }
  ]
};

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleFaq = (category: string, index: number) => {
     const id = `${category}-${index}`;
     setOpenIndex(openIndex === id ? null : id);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#27C4E1] selection:text-white flex flex-col">
      <PublicHeader />

      <main className="flex-grow pt-32 pb-24">
        
        {/* Header Section */}
        <section className="text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-6 text-[#27C4E1]">
             <MessageCircleQuestion className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
             How can we help you?
          </h1>
          <p className="text-xl text-slate-600">
             Everything you need to know about getting started, security, features, and managing your Finthesia account.
          </p>
        </section>

        {/* FAQ Content Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
              
              {Object.entries(faqsByCategory).map(([category, faqs], catIndex) => (
                 <div key={category} className={`${catIndex > 0 ? 'mt-12' : ''}`}>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3 border-b border-slate-100 pb-2">
                       {category}
                    </h2>
                    
                    <div className="space-y-4">
                       {faqs.map((faq, index) => {
                          const id = `${category}-${index}`;
                          const isOpen = openIndex === id;
                          
                          return (
                             <div 
                                key={index} 
                                className={`border rounded-2xl transition-all duration-200 ${isOpen ? 'border-[#27C4E1] bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'}`}
                             >
                                <button 
                                   className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                                   onClick={() => toggleFaq(category, index)}
                                >
                                   <span className="font-bold text-slate-900 text-lg">{faq.q}</span>
                                   <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-[#27C4E1]' : ''}`} />
                                </button>
                                
                                <div className={`px-6 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                                   <p className="text-slate-600 leading-relaxed pt-2 border-t border-slate-100/50">
                                      {faq.a}
                                   </p>
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 </div>
              ))}

           </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
