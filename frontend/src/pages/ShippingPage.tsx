import React from 'react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

export default function ShippingPage() {
  const sections = [
    { id: "digital", title: "1. Digital Product Delivery" },
    { id: "instant", title: "2. Instant Access" },
    { id: "activation", title: "3. Account Activation" },
    { id: "fees", title: "4. No Shipping Fees" },
    { id: "accessibility", title: "5. Accessibility" },
    { id: "interruptions", title: "6. Service Interruptions" },
    { id: "contact", title: "7. Contact Us" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#27C4E1] selection:text-white flex flex-col">
      <PublicHeader />

      <main className="flex-grow pt-32 pb-24">
        
        {/* Header Section */}
        <section className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e1b4b] mb-6 tracking-tight font-sans">
             Shipping Policy
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
                
                <div id="digital" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">1. Digital Product Delivery</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     Finthesia is a software-as-a-service (SaaS) platform providing digital financial management tools. We do not sell or ship any physical goods or products.
                  </p>
                </div>

                <div id="instant" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">2. Instant Access</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     Upon successful registration and (if applicable) payment for a premium subscription plan, your access to the Finthesia platform will be granted instantly.
                  </p>
                </div>

                <div id="activation" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">3. Account Activation</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     You will receive a welcome email and/or a subscription confirmation email immediately upon account creation or upgrade, verifying your active status.
                  </p>
                </div>

                <div id="fees" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">4. No Shipping Fees</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     Because all our services are delivered digitally over the internet, there are absolutely no shipping, handling, or delivery fees associated with your Finthesia account.
                  </p>
                </div>

                <div id="accessibility" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">5. Accessibility</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     Our web and mobile applications can be accessed from any compatible device with an internet connection. Riknova Technology is not responsible for your internet service provider (ISP) fees or mobile data charges required to access the service.
                  </p>
                </div>

                <div id="interruptions" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">6. Service Interruptions</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     While we strive for 99.9% uptime, access to your digital dashboard may occasionally be briefly interrupted for scheduled maintenance. These digital "deliveries" of updates do not constitute a failure to deliver the service.
                  </p>
                </div>

                <div id="contact" className="scroll-mt-28 mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1e1b4b] mb-8">7. Contact Us regarding Delivery Wait Times</h2>
                  <p className="text-lg text-slate-600 leading-[1.8]">
                     If you have paid for a premium subscription (Pro or Wealth) and the features are not immediately unlocked on your dashboard, please log out and log back in. If the issue persists, contact us immediately at <a href="mailto:support@finthesia.com" className="text-[#27C4E1] font-bold hover:underline">support@finthesia.com</a>.
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
