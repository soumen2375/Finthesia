import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, HandCoins, ArrowRight, Play, Quote, Target, Activity, DollarSign, Zap, Cloud, ArrowUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#27C4E1] selection:text-white flex flex-col">
      <PublicHeader />

      <main className="flex-grow pt-24">
        
        {/* --- HERO SECTION --- */}
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
            <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-[#27C4E1]/10 to-transparent blur-3xl" />
          </div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
            <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-slate-200/50 to-transparent blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto space-y-8">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-tight">
                Master Your Money. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#27C4E1] to-blue-500">
                  Build Your Future.
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                <span className="font-semibold text-slate-800">Your Personal Financial Companion.</span><br/>
                Finthesia is the smart, simple way to track your expenses, manage budgets, and grow your net worth. See all your finances in one place, backed by powerful AI insights.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/register">
                  <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-[#27C4E1] hover:bg-[#1EB0CC] text-white rounded-full shadow-lg shadow-[#27C4E1]/25 border-0 w-full sm:w-auto transition-all hover:scale-105">
                    Getting Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold rounded-full border-slate-300 text-slate-700 hover:bg-slate-50 w-full sm:w-auto transition-all">
                    <Play className="mr-2 h-5 w-5 text-[#27C4E1]" /> See How It Works
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Abstract Dashboard Mockup Graphic */}
            <div className="mt-20 mx-auto max-w-6xl relative">
               <div className="aspect-[16/9] md:aspect-[21/9] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50 flex flex-col">
                  {/* Fake UI Header */}
                  <div className="h-12 border-b border-slate-100 flex items-center px-6 gap-2 bg-slate-50/50">
                     <div className="h-3 w-3 rounded-full bg-red-400"></div>
                     <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                     <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  </div>
                  {/* Fake UI Body */}
                  <div className="flex-1 bg-slate-50/30 p-8 flex gap-8">
                     <div className="w-64 hidden lg:flex flex-col gap-4">
                        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                        <div className="h-10 w-full bg-[#27C4E1]/10 rounded-lg"></div>
                        <div className="h-10 w-full bg-slate-100 rounded-lg"></div>
                        <div className="h-10 w-full bg-slate-100 rounded-lg"></div>
                     </div>
                     <div className="flex-1 flex flex-col gap-6">
                        <div className="flex gap-6">
                           <div className="flex-1 h-32 bg-white rounded-xl shadow-sm border border-slate-100"></div>
                           <div className="flex-1 h-32 bg-white rounded-xl shadow-sm border border-slate-100"></div>
                           <div className="flex-1 h-32 bg-white rounded-xl shadow-sm border border-slate-100"></div>
                        </div>
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 flex items-end px-12 py-8 gap-4">
                           {/* Fake Chart Bars */}
                           {[40, 70, 45, 90, 65, 80, 50, 100].map((h, i) => (
                              <div key={i} className={`flex-1 rounded-t-sm ${i === 7 ? 'bg-[#27C4E1]' : 'bg-slate-200'}`} style={{height: `${h}%`}}></div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* --- SOCIAL PROOF / TRUST BANNER --- */}
        <section className="bg-slate-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <ShieldCheck className="h-10 w-10 text-[#27C4E1]" />
              <p className="text-xl md:text-2xl font-medium text-slate-300">
                "Join thousands taking control of their financial destiny. <br className="hidden md:block"/> Secure, Private, and built by <span className="text-white font-semibold">Riknova Technology</span>."
              </p>
            </div>
          </div>
        </section>

        {/* --- WHAT IS FINTHESIA? --- */}
        <section className="py-24 bg-white border-b border-slate-100 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-sm font-bold tracking-widest text-[#27C4E1] uppercase mb-3">About The App</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">What is Finthesia?</h3>
              <p className="text-xl text-slate-600 leading-relaxed">
                Finthesia helps users <span className="font-semibold text-slate-800">track expenses, manage budgets, analyze spending patterns, and make smarter financial decisions</span> — all in one dashboard.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Activity className="h-6 w-6 text-[#27C4E1]" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Expense Tracking</h4>
                <p className="text-slate-600 text-sm">Automatically categorizes and tracks your daily spending.</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Target className="h-6 w-6 text-[#27C4E1]" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Budget Management</h4>
                <p className="text-slate-600 text-sm">Set strict spending limits and get warned before overspending.</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Cloud className="h-6 w-6 text-[#27C4E1]" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Financial Analytics</h4>
                <p className="text-slate-600 text-sm">Rich charts to analyze cash flow, income, and expenses over time.</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <DollarSign className="h-6 w-6 text-[#27C4E1]" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Dashboard Insights</h4>
                <p className="text-slate-600 text-sm">Holistic view of assets, liabilities, and true net worth.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- DATA USAGE / OAUTH DISCLOSURE --- */}
        <section className="py-24 bg-slate-50 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-sm font-bold tracking-widest text-[#27C4E1] uppercase mb-3">Privacy & Trust</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8">Why we request your data</h3>
            
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm text-left">
               <ul className="space-y-6">
                 <li className="flex flex-col md:flex-row md:items-start gap-4 pb-6 border-b border-slate-100">
                   <div className="w-12 h-12 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold">1</div>
                   <div>
                     <h4 className="text-xl font-bold text-slate-900 mb-2">Google Email Address</h4>
                     <p className="text-slate-600">We request your Google email address to securely create and manage your account, allow seamless login via Google OAuth, and send important service notifications.</p>
                   </div>
                 </li>
                 <li className="flex flex-col md:flex-row md:items-start gap-4 pb-6 border-b border-slate-100">
                   <div className="w-12 h-12 rounded-full bg-emerald-50 flex-shrink-0 flex items-center justify-center text-emerald-600 font-bold">2</div>
                   <div>
                     <h4 className="text-xl font-bold text-slate-900 mb-2">Google Profile Information</h4>
                     <p className="text-slate-600">Your basic Google profile info (like name and profile picture) is used solely for personalization within the dashboard to improve your experience.</p>
                   </div>
                 </li>
                 <li className="flex flex-col md:flex-row md:items-start gap-4">
                   <div className="w-12 h-12 rounded-full bg-amber-50 flex-shrink-0 flex items-center justify-center text-amber-600 font-bold">3</div>
                   <div>
                     <h4 className="text-xl font-bold text-slate-900 mb-2">Financial Transparency</h4>
                     <p className="text-slate-600">If you connect financial institutions, we only use read-only access to automatically track expenses. <span className="font-semibold text-slate-800">We do not store or share your financial credentials.</span></p>
                   </div>
                 </li>
               </ul>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS (3 EASY STEPS) --- */}
        <section className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-sm font-bold tracking-widest text-[#27C4E1] uppercase mb-3">Simple Process</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900">How It Works</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
               {/* Connecting Line (Desktop) */}
               <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 z-0"></div>

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-6 group">
                <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center group-hover:bg-[#27C4E1]/5 group-hover:border-[#27C4E1]/30 transition-colors">
                   <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-xl font-bold text-slate-900 group-hover:text-[#27C4E1]">1</div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">Connect or Enter Data</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Securely sync your bank accounts or manually track your daily spending in seconds.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-6 group">
                <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center group-hover:bg-[#27C4E1]/5 group-hover:border-[#27C4E1]/30 transition-colors">
                   <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-xl font-bold text-slate-900 group-hover:text-[#27C4E1]">2</div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">Set Your Budgets</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Create smart budgets for groceries, rent, and entertainment. We'll warn you before you overspend.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-6 group">
                <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center group-hover:bg-[#27C4E1]/5 group-hover:border-[#27C4E1]/30 transition-colors">
                   <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-xl font-bold text-slate-900 group-hover:text-[#27C4E1]">3</div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">Watch Your Wealth Grow</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Track your assets and liabilities to see your true net worth climb over time.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- WHY CHOOSE FINTHESIA --- */}
        <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900">Why Choose Finthesia?</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {/* 6 cards */}
               {/* card 1 */}
               <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center transform transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-full bg-[#E5FAFD] flex items-center justify-center mb-6">
                     <Target className="text-[#27C4E1] w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Smart Budgeting</h4>
                  <p className="text-slate-500 leading-relaxed">All powerful tools to help you track spending and stay on track.</p>
               </div>
               {/* card 2 */}
               <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center transform transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-full bg-[#E5FAFD] flex items-center justify-center mb-6">
                     <Activity className="text-[#27C4E1] w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Personal Advisory</h4>
                  <p className="text-slate-500 leading-relaxed">Get recommendations based on your goals and spending patterns.</p>
               </div>
               {/* card 3 */}
               <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center transform transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-full bg-[#E5FAFD] flex items-center justify-center mb-6">
                     <DollarSign className="text-[#27C4E1] w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Asset Management</h4>
                  <p className="text-slate-500 leading-relaxed">Optimization for your investments with our intelligent portfolio management.</p>
               </div>
               {/* card 4 */}
               <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center transform transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-full bg-[#E5FAFD] flex items-center justify-center mb-6">
                     <ShieldCheck className="text-[#27C4E1] w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Value for Money</h4>
                  <p className="text-slate-500 leading-relaxed">Low fees and transparent costs to help you build wealth efficiently.</p>
               </div>
               {/* card 5 */}
               <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center transform transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-full bg-[#E5FAFD] flex items-center justify-center mb-6">
                     <Zap className="text-[#27C4E1] w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Faster Response</h4>
                  <p className="text-slate-500 leading-relaxed">Instant notifications and updates on market shifts and anomalies.</p>
               </div>
               {/* card 6 */}
               <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center transform transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-full bg-[#E5FAFD] flex items-center justify-center mb-6">
                     <Cloud className="text-[#27C4E1] w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Cloud Support</h4>
                  <p className="text-slate-500 leading-relaxed">Access your financial data securely from anywhere, anytime on any device.</p>
               </div>
            </div>
          </div>
        </section>

        {/* --- TESTIMONIALS SECTION --- */}
        <section className="py-24 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Loved by Wealth Builders</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              
              {/* Testimonial 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
                <Quote className="absolute top-8 right-8 h-12 w-12 text-[#27C4E1]/10 transform scale-150" />
                <div className="flex items-center space-x-4 mb-6 relative z-10">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    S
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Sarah J.</h4>
                    <div className="flex text-amber-400 text-sm">★★★★★</div>
                  </div>
                </div>
                <p className="text-slate-600 text-lg italic leading-relaxed relative z-10">
                  "Finthesia changed the way I look at money. I finally understand where my paycheck goes every month!"
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
                 <Quote className="absolute top-8 right-8 h-12 w-12 text-[#27C4E1]/10 transform scale-150" />
                <div className="flex items-center space-x-4 mb-6 relative z-10">
                  <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-lg">
                    R
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Rahul M.</h4>
                    <div className="flex text-amber-400 text-sm">★★★★★</div>
                  </div>
                </div>
                <p className="text-slate-600 text-lg italic leading-relaxed relative z-10">
                  "The AI forecasting on the Wealth Plan helped me figure out exactly when I can afford to buy my first home."
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* --- FINAL CALL TO ACTION --- */}
        <section className="py-24 bg-white relative overflow-hidden">
           {/* Abstract gradients */}
          <div className="absolute inset-0 ">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-[#27C4E1]/5 to-blue-500/5 blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Ready to achieve financial freedom?
            </h2>
            <p className="text-xl text-slate-600">
              Stop wondering where your money went. Start telling it where to go.
            </p>
            <div className="pt-8">
               <Link to="/register">
                 <Button size="lg" className="h-16 px-10 text-xl font-bold bg-[#27C4E1] hover:bg-[#1EB0CC] text-white rounded-full shadow-xl shadow-[#27C4E1]/30 transition-all hover:scale-105">
                   Create Your Free Account
                 </Button>
               </Link>
            </div>
            <p className="text-sm text-slate-500 pt-6">
              No credit card required. Free forever testing available.
            </p>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
