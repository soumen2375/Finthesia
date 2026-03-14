import React from 'react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

export default function PrivacyPage() {
  const sections = [
    { id: "intro", title: "1. Introduction" },
    { id: "collect", title: "2. Information We Collect" },
    { id: "use", title: "3. How We Use Information" },
    { id: "share", title: "4. Sharing of Information" },
    { id: "security", title: "5. Security of Data" },
    { id: "retention", title: "6. Data Retention" },
    { id: "rights", title: "7. Your Data Rights" },
    { id: "children", title: "8. Children's Privacy" },
    { id: "ai", title: "9. AI & Automated Processing" },
    { id: "links", title: "10. Third-Party Links" },
    { id: "changes", title: "11. Changes to Policy" },
    { id: "contact", title: "12. Contact Us" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#27C4E1] selection:text-white flex flex-col">
      <PublicHeader />

      <main className="flex-grow pt-32 pb-24">
        
        {/* Header Section */}
        <section className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e1b4b] mb-6 tracking-tight font-sans">
             Privacy Policy
          </h1>
          <p className="text-lg text-slate-500 font-medium">
             Last Updated: March 14, 2026
          </p>
        </section>

        {/* Legal Content Layout */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
             
             {/* Sidebar Navigation */}
             <aside className="w-full lg:w-80 flex-shrink-0">
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
                  <p className="text-lg text-slate-600 leading-[1.8] mb-8">
                     Riknova Technology ("Company," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit the Finthesia platform (the "Service"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                  </p>
                </div>

                <div id="collect" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">2. Information We Collect</h2>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-6">We collect information in the following ways:</p>
                  <ul className="list-disc list-inside text-lg text-slate-600 space-y-4 mb-8">
                     <li><strong className="text-slate-800">Personal Data:</strong> Information you voluntarily give us during registration, such as your name, email address, password, and contact details.</li>
                     <li><strong className="text-slate-800">Financial Data:</strong> With your explicit consent, we access read-only transaction history, account balances, and holdings via third-party secure aggregators. You may also input this data manually.</li>
                     <li><strong className="text-slate-800">Usage Data:</strong> Information collected automatically when you use our Service, such as your IP address, browser type, operating system, and data about how you interact with our application.</li>
                  </ul>
                </div>

                <div id="use" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">3. How We Use Your Information</h2>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-6">We use the information we collect to:</p>
                  <ul className="list-disc list-inside text-lg text-slate-600 space-y-4 mb-8">
                     <li>Provide, operate, and maintain the Finthesia platform.</li>
                     <li>Process your transactions and send you related information, including invoices and confirmations.</li>
                     <li>Provide AI-powered financial insights, budgeting alerts, and net worth forecasting.</li>
                     <li>Improve, personalize, and expand our Service.</li>
                     <li>Detect, prevent, and address technical issues or fraudulent activity.</li>
                     <li>Send you technical notices, updates, security alerts, and support messages.</li>
                  </ul>
                </div>

                <div id="share" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">4. Sharing of Your Information</h2>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-6">We may share your information in specific situations:</p>
                  <ul className="list-disc list-inside text-lg text-slate-600 space-y-4 mb-8">
                     <li><strong className="text-slate-800">Third-Party Service Providers:</strong> We may share your data with vendors who perform services for us (e.g., payment processing, email delivery, hosting). These parties are bound by strict confidentiality agreements.</li>
                     <li><strong className="text-slate-800">By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, or to investigate or remedy potential violations of our policies.</li>
                     <li><strong className="text-slate-800">Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business.</li>
                  </ul>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-8 italic">We will NEVER sell your personal or financial data to advertisers or third-party marketers.</p>
                </div>

                <div id="security" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">5. Security of Your Data</h2>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-8">
                     We use administrative, technical, and physical security measures to help protect your personal information, including 256-bit encryption for data in transit and at rest. However, no data transmission over the Internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee its absolute security.
                  </p>
                </div>

                <div id="retention" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">6. Data Retention</h2>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-8">
                     We will only retain your personal information for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements. When you delete your account, your financial and personal data is permanently deleted from our primary servers.
                  </p>
                </div>

                <div id="rights" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">7. Your Data Rights</h2>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-6">Depending on your location, you may have the following rights regarding your personal data:</p>
                  <ul className="list-disc list-inside text-lg text-slate-600 space-y-4 mb-8">
                     <li>The right to access, update, or delete the information we have on you.</li>
                     <li>The right of rectification (to fix incorrect data).</li>
                     <li>The right to object to our processing of your data.</li>
                     <li>The right to request that we restrict the processing of your personal information.</li>
                     <li>The right to data portability (receive a copy of your data in a structured, machine-readable format).</li>
                  </ul>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-8">To exercise these rights, please contact us at <a href="mailto:support@finthesia.com" className="text-[#27C4E1] font-bold">support@finthesia.com</a>.</p>
                </div>

                <div id="children" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">8. Policy Regarding Children</h2>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-8">
                     We do not knowingly solicit information from or market to children under the age of 18. If we learn that we have collected personal information from a child under age 18, we will delete that information as quickly as possible.
                  </p>
                </div>

                <div id="ai" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">9. AI and Automated Processing</h2>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-8">
                     Finthesia utilizes AI to categorize transactions and provide forecasting. This automated processing is based solely on the financial data you connect or input. You can opt out of certain AI features within your Account Settings, though this may limit the functionality of the Wealth plan.
                  </p>
                </div>

                <div id="links" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">10. Third-Party Links</h2>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-8">
                     The Service may contain links to third-party websites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us. We strongly advise you to review the Privacy Policy of these websites. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites.
                  </p>
                </div>

                <div id="changes" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">11. Changes to This Privacy Policy</h2>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-8">
                     We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                  </p>
                </div>

                <div id="contact" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">12. Contact Us</h2>
                  <p className="text-lg text-slate-600 leading-[1.8] mb-8">
                     If you have any questions or concerns about this Privacy Policy, please contact us:<br/><br/>
                     <strong className="text-slate-800">Email:</strong> <a href="mailto:support@finthesia.com" className="text-[#27C4E1] font-bold">support@finthesia.com</a><br/>
                     <strong className="text-slate-800">By Mail:</strong><br/>
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
