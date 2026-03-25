import React from 'react';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';

export default function RefundsPage() {
  const sections = [
    { id: "cancellation", title: "1. Cancellation Policy" },
    { id: "access", title: "2. Access After Cancellation" },
    { id: "guarantee", title: "3. 14-Day Guarantee" },
    { id: "process", title: "4. Refund Process" },
    { id: "time", title: "5. Processing Time" },
    { id: "nonrefundable", title: "6. Non-Refundable Scenarios" },
    { id: "downgrading", title: "7. Downgrading Plans" },
    { id: "contact", title: "8. Contact Information" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#27C4E1] selection:text-white flex flex-col">
      <PublicHeader />

      <main className="flex-grow pt-32 pb-24">
        
        {/* Header Section */}
        <section className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e1b4b] mb-6 tracking-tight font-sans">
             Cancellation and Refunds
          </h1>
          <p className="text-lg text-slate-500 font-medium">
             Last Updated: March 14, 2026
          </p>
        </section>

        {/* Legal Content Layout */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
             
             {/* Sidebar Navigation */}
             <aside className="hidden lg:block w-full lg:w-80 flex-shrink-0">
                <div className="sticky top-24 flex flex-col pt-2 pb-8">
                   {sections.map((sec, idx) => (
                      <a 
                        key={idx} 
                        href={`#${sec.id}`}
                        className={`block py-3 px-4 text-base transition-colors border-l-[3px] 
                          ${idx === 0 ? 'border-[#1e1b4b] text-[#1e1b4b] font-bold bg-slate-50' : 'border-transparent text-slate-600 hover:text-[#1e1b4b] hover:border-slate-300 font-medium'}`}
                      >
                         {sec.title}
                      </a>
                   ))}
                </div>
             </aside>

             {/* Main Content Areas */}
             <div className="flex-1 max-w-3xl">
                
                <div id="cancellation" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">1. General Cancellation Policy</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     You may cancel your Finthesia subscription at any time. You can cancel your subscription by logging into your account, navigating to the "Settings" menu, and clicking on "Manage Subscription."
                  </p>
                </div>

                <div id="access" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">2. Access After Cancellation</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     If you cancel a paid subscription (Pro or Wealth plan), your cancellation will take effect at the end of your current paid billing cycle. You will retain access to all premium features until that billing cycle concludes. After that date, your account will be downgraded to the Forever Free Basic plan.
                  </p>
                </div>

                <div id="guarantee" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">3. 14-Day Money-Back Guarantee</h2>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-6">
                     Finthesia offers a 14-day money-back guarantee for first-time purchasers of our Pro and Wealth plans.
                  </p>
                  <ul className="list-disc list-inside text-lg text-slate-600 space-y-4 mb-8">
                     <li><strong className="text-slate-800">Eligibility:</strong> If you are not completely satisfied with the premium features, you may request a full refund within exactly 14 calendar days of your initial purchase date.</li>
                     <li><strong className="text-slate-800">Exclusions:</strong> This guarantee applies to your first purchase only and does not apply to subsequent renewals or upgrades.</li>
                  </ul>
                </div>

                <div id="process" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">4. Refund Process</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     To request a refund under the 14-day guarantee, you must email <a href="mailto:support@finthesia.com" className="text-[#27C4E1] font-bold hover:underline">support@finthesia.com</a> from the email address associated with your Finthesia account. Include your full name and a brief reason for your dissatisfaction so we can improve our service.
                  </p>
                </div>

                <div id="time" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">5. Processing Time</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     Approved refunds will be processed and credited back to your original method of payment within 5 to 10 business days, depending on your bank or credit card issuer's policies.
                  </p>
                </div>

                <div id="nonrefundable" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">6. Non-Refundable Scenarios</h2>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-6">Refunds will not be issued in the following scenarios:</p>
                  <ul className="list-disc list-inside text-lg text-slate-600 space-y-4 mb-8">
                     <li>Refund requests made after the 14-day guarantee period has expired.</li>
                     <li>Subscription renewal charges (unless cancelled prior to the renewal date).</li>
                     <li>Accounts terminated by Riknova Technology due to a violation of our Terms and Conditions or fraudulent activity.</li>
                  </ul>
                </div>

                <div id="downgrading" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">7. Downgrading Plans</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     If you choose to downgrade from the Wealth plan to the Pro plan, the change will take effect at the start of your next billing cycle. We do not offer prorated refunds for mid-cycle downgrades.
                  </p>
                </div>

                <div id="contact" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">8. Contact Information</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     If you have any questions about this Cancellation and Refund Policy, please contact our billing team at <a href="mailto:support@finthesia.com" className="text-[#27C4E1] font-bold hover:underline">support@finthesia.com</a>.
                  </p>
                </div>

             </div>
           </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
