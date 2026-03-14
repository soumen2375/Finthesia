import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Zap, Target, Layers, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#27C4E1] selection:text-white flex flex-col">
      <PublicHeader />

      <main className="flex-grow pt-32 pb-24">
        
        {/* Header Section */}
        <section className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 relative">
           <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/2">
               <div className="w-96 h-96 rounded-full bg-gradient-to-tr from-[#27C4E1]/10 to-transparent blur-3xl -z-10" />
           </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight">
             Empowering your financial journey, <br className="hidden md:block"/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#27C4E1] to-blue-500">
                one insight at a time.
             </span>
          </h1>
        </section>

        {/* Story Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 space-y-16">
           
           <div className="prose prose-lg prose-slate max-w-none">
              <h2 className="text-3xl font-bold text-slate-900 mb-6 font-sans">Who We Are</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                 Welcome to Finthesia, your ultimate personal finance companion. We believe that understanding where your money goes shouldn't require a degree in accounting or hours spent wrestling with complex spreadsheets.
              </p>
              <p className="text-slate-600 leading-relaxed text-lg mt-4">
                 Finthesia is a smart, intuitive, and comprehensive financial management platform designed to help you track expenses, plan budgets, monitor investments, and forecast your net worth—all from one beautifully designed dashboard.
              </p>
           </div>

           <div className="prose prose-lg prose-slate max-w-none">
              <h2 className="text-3xl font-bold text-slate-900 mb-6 font-sans">Our Story</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                 The idea for Finthesia was born out of a simple frustration: managing money is often too complicated. Between multiple bank accounts, credit cards, loans, and daily expenses, it is easy to lose track of your financial health.
              </p>
              <p className="text-slate-600 leading-relaxed text-lg mt-4">
                 We set out to build a platform that cuts through the noise. We wanted to create a tool that not only tells you what you spent yesterday but helps you intelligently plan for tomorrow. Whether you are a student budgeting for the month, a professional tracking daily expenses, or an investor building long-term wealth, Finthesia adapts to your unique financial journey.
              </p>
           </div>

           <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 font-sans flex items-center gap-3">
                 <Layers className="text-[#27C4E1] w-6 h-6" /> Backed by Riknova Technology
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                 Finthesia is proudly developed, owned, and operated by <span className="font-semibold text-slate-900">Riknova Technology</span>.
              </p>
              <p className="text-slate-600 leading-relaxed text-lg mt-4">
                 Based in West Medinipur, West Bengal, India, Riknova Technology is an innovative software development company dedicated to building powerful, user-centric digital solutions. With a strong foundation in modern technology and data science, the Riknova team ensures that Finthesia remains secure, lightning-fast, and continuously evolving to meet the needs of our users.
              </p>
           </div>
        </section>

        {/* Core Values Section */}
        <section className="bg-slate-900 py-24 mb-24 relative overflow-hidden">
           <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
               <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#27C4E1]/10 to-blue-500/10 blur-3xl" />
           </div>
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Our Core Values</h2>
                 <p className="text-xl text-slate-400">At the heart of Finthesia and Riknova Technology are three guiding principles:</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                 <div className="bg-white/5 border border-slate-700/50 p-8 rounded-3xl backdrop-blur-sm text-center">
                    <div className="w-16 h-16 bg-[#27C4E1]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                       <ShieldCheck className="w-8 h-8 text-[#27C4E1]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Privacy & Security First</h3>
                    <p className="text-slate-400 leading-relaxed">
                       Your financial data is deeply personal. We utilize bank-level encryption and strict privacy protocols to ensure your data is safe, secure, and never sold to third parties.
                    </p>
                 </div>
                 
                 <div className="bg-white/5 border border-slate-700/50 p-8 rounded-3xl backdrop-blur-sm text-center">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                       <Heart className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Radical Simplicity</h3>
                    <p className="text-slate-400 leading-relaxed">
                       We take complex financial data and turn it into clear, actionable insights. If a feature isn't easy to use, it doesn't belong in Finthesia.
                    </p>
                 </div>

                 <div className="bg-white/5 border border-slate-700/50 p-8 rounded-3xl backdrop-blur-sm text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                       <Zap className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Continuous Innovation</h3>
                    <p className="text-slate-400 leading-relaxed">
                       From AI-powered financial insights to smart spending predictions, we are constantly pushing the boundaries of what a personal finance app can do.
                    </p>
                 </div>
              </div>
           </div>
        </section>

        {/* Mission & CTA Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-16">
           <div className="bg-gradient-to-br from-[#27C4E1]/10 to-blue-500/10 p-12 rounded-3xl border border-[#27C4E1]/20">
              <Target className="w-12 h-12 text-[#27C4E1] mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-slate-900 mb-6 font-sans">Our Mission</h2>
              <p className="text-slate-700 leading-relaxed text-2xl font-light italic">
                 "To empower individuals to take total control of their financial destiny. We want to remove the stress of money management and replace it with confidence, clarity, and peace of mind."
              </p>
           </div>
           
           <div className="pt-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Join Us on the Journey</h2>
              <p className="text-lg text-slate-600 mb-8">Ready to take the guesswork out of your finances?</p>
              <Link to="/register">
                 <Button size="lg" className="h-14 px-8 text-lg font-bold bg-[#27C4E1] hover:bg-[#1EB0CC] text-white rounded-full shadow-lg shadow-[#27C4E1]/20 border-0 transition-transform hover:-translate-y-0.5">
                    Create Your Free Finthesia Account Today <ArrowRight className="ml-2 w-5 h-5" />
                 </Button>
              </Link>
           </div>

           <div className="border-t border-slate-200 pt-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Get in Touch</h2>
              <p className="text-lg text-slate-600 mb-8">Have questions, suggestions, or just want to say hello? We’d love to hear from you.</p>
              <div className="inline-block text-left bg-slate-50 p-6 rounded-2xl border border-slate-200 w-full max-w-lg mx-auto">
                 <p className="text-slate-700 mb-2 font-medium"><strong>Email:</strong> <a href="mailto:support@finthesia.com" className="text-[#27C4E1] hover:underline">support@finthesia.com</a></p>
                 <p className="text-slate-700 font-medium leading-relaxed">
                    <strong>Headquarters:</strong><br/>
                    Riknova Technology<br/>
                    Kismat Narajole, West Medinipur<br/>
                    West Bengal, India, 721211
                 </p>
              </div>
           </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
