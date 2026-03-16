import React from 'react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

export default function TermsPage() {
  const sections = [
    { id: "intro", title: "1. Introduction" },
    { id: "acceptance", title: "2. Acceptance of Terms" },
    { id: "description", title: "3. Description of Service" },
    { id: "eligibility", title: "4. Eligibility" },
    { id: "account", title: "5. Account Security" },
    { id: "fees", title: "6. Subscription Fees" },
    { id: "conduct", title: "7. User Conduct" },
    { id: "ip", title: "8. Intellectual Property" },
    { id: "data", title: "9. Financial Data" },
    { id: "disclaimer", title: "10. Financial Advice" },
    { id: "liability", title: "11. Limitation of Liability" },
    { id: "termination", title: "12. Termination" },
    { id: "law", title: "13. Governing Law" },
    { id: "changes", title: "14. Changes to Terms" },
    { id: "grievance", title: "15. Grievance Officer" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#27C4E1] selection:text-white flex flex-col">
      <PublicHeader />

      <main className="flex-grow pt-32 pb-24">
        
        {/* Header Section */}
        <section className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e1b4b] mb-6 tracking-tight font-sans">
             Terms and Conditions
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
                
                <div id="intro" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">1. Introduction</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     Welcome to Finthesia, a personal finance management software-as-a-service (SaaS) platform built, owned, and operated by <strong className="text-[#1e1b4b]">Riknova Technology</strong> ("Company," "we," "us," or "our"). These Terms and Conditions govern your access to and use of Finthesia.com (the "Website"), the Finthesia mobile application (if applicable), and all related services, features, and content (collectively, the "Service").
                  </p>
                </div>
                
                <div id="acceptance" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">2. Acceptance of Terms</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     By registering for an account, accessing, or using the Service in any way, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service. 
                  </p>
                </div>
                
                <div id="description" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">3. Description of Service</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     Finthesia is a financial dashboard that allows users to manually track or automatically sync bank accounts to monitor net worth, visualize cash flow, set budgets, and utilize AI-powered forecasting tools. Finthesia is a <strong className="text-[#1e1b4b]">read-only</strong> service. We do not have the ability or authority to initiate payments, move funds, or alter your financial accounts.
                  </p>
                </div>

                <div id="eligibility" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">4. Eligibility</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     To use Finthesia, you must be at least 18 years of old and capable of forming a binding contract under applicable law. By using the Service, you represent and warrant that you meet this requirement.
                  </p>
                </div>

                <div id="account" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">5. Account Registration and Security</h2>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-6">
                     You are required to create an account to use the Service. You agree to provide accurate, current, and complete information and to keep this information updated.
                  </p>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account or any other breach of security at <a href="mailto:support@finthesia.com" className="text-[#27C4E1] font-bold hover:underline">support@finthesia.com</a>.
                  </p>
                </div>

                <div id="fees" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">6. Subscription Plans and Fees</h2>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-6">
                     Finthesia offers both free ("Basic") and paid subscription plans ("Pro" and "Wealth").
                  </p>
                  <ul className="list-disc list-inside text-lg text-slate-600 space-y-4 mb-8">
                     <li><strong className="text-slate-800">Fees:</strong> By selecting a paid plan, you agree to pay the monthly or annual subscription fees indicated at checkout. All fees are non-refundable except as expressly stated in our Cancellation and Refund Policy.</li>
                     <li><strong className="text-slate-800">Auto-Renewal:</strong> Subscription plans automatically renew unless cancelled prior to the end of the current billing cycle. You may cancel auto-renewal at any time via your Account Settings.</li>
                  </ul>
                </div>

                <div id="conduct" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">7. User Conduct</h2>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-6">
                     You agree not to use the Service to:
                  </p>
                  <ul className="list-disc list-inside text-lg text-slate-600 space-y-4 mb-8">
                     <li>Violate any local, state, national, or international law or regulation.</li>
                     <li>Attempt to reverse engineer, decompile, or hack the Service or its underlying architecture.</li>
                     <li>Use automated scripts, bots, or scrapers to access or extract data from the Service.</li>
                     <li>Upload malicious code, viruses, or any payload designed to interrupt or destroy the Service.</li>
                  </ul>
                </div>
                
                <div id="ip" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">8. Intellectual Property Rights</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     The Service, including its code, design, look and feel, algorithms, and content, is the exclusive property of Riknova Technology and is protected by copyright, trademark, and other intellectual property laws. You are granted a limited, personal, non-exclusive, and non-transferable license to use the Service strictly for your personal, non-commercial financial management.
                  </p>
                </div>

                <div id="data" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">9. Financial Data and Integrations</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     Finthesia may integrate with third-party data aggregators (e.g., Plaid, Finicity) to fetch your read-only account data. By linking your accounts, you grant us and our third-party partners the right, power, and authority to act on your behalf to access and transmit your financial data for the sole purpose of providing the Service.
                  </p>
                </div>

                <div id="disclaimer" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">10. Disclaimer of Financial Advice</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     <strong className="text-slate-800">Finthesia is not a financial planner, investment advisor, or tax professional.</strong> The Service, including any AI-generated insights, charts, or projections, is provided for informational and educational purposes only. You should consult a qualified financial professional before making critical financial, investment, or tax decisions based on data or insights provided by Finthesia.
                  </p>
                </div>

                <div id="liability" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">11. Limitation of Liability</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     To the maximum extent permitted by law, Riknova Technology and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues (whether incurred directly or indirectly), or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your use or inability to use the Service; (b) unauthorized access to your account; or (c) any bugs, viruses, or inaccuracies in the Service.
                  </p>
                </div>

                <div id="termination" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">12. Termination</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     We reserve the right to suspend or terminate your account and your access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms, is harmful to other users, or is harmful to our business interests.
                  </p>
                </div>

                <div id="law" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">13. Governing Law and Jurisdiction</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts located in West Medinipur, West Bengal, India.
                  </p>
                </div>

                <div id="changes" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">14. Changes to Terms</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the updated Terms on this page and updating the "Last Updated" date. Continued use of the Service following such changes constitutes your acceptance of the revised Terms.
                  </p>
                </div>

                <div id="grievance" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">15. Grievance Officer</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     In accordance with the Information Technology Act, 2000 (India) and applicable rules, the contact information for our Grievance Officer is:<br/><br/>
                     <strong className="text-slate-800">Email:</strong> <a href="mailto:support@finthesia.com" className="text-[#27C4E1] font-bold">support@finthesia.com</a><br/>
                     <strong className="text-slate-800">Address:</strong><br/>
                     Riknova Technology<br/>
                     Kismat Narajole, West Medinipur<br/>
                     West Bengal, India, 721211
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
