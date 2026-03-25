import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Clock, Send, Lightbulb, FileText, CreditCard, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#27C4E1] selection:text-white flex flex-col">
      <PublicHeader />

      <main className="flex-grow pt-32 pb-24">
        
        {/* Header Section */}
        <section className="text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
             We’d love to hear from you!
          </h1>
          <p className="text-xl text-slate-600">
             Whether you have a question about Finthesia's features, need assistance with your premium subscription, or just want to share some feedback, the <span className="font-semibold text-slate-800">Riknova Technology</span> team is here to help.
          </p>
        </section>

        {/* Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
              
              {/* Left Column: Contact Info & Quick Help */}
              <div className="lg:col-span-2 space-y-12">
                 
                 <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-4">
                       📍 Reach Out Directly
                    </h2>
                    
                    {/* Email */}
                    <div className="flex gap-4">
                       <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Mail className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="font-bold text-slate-900 mb-1">Email Support</h3>
                          <p className="text-sm text-slate-600 mb-2">For general inquiries, technical support, or billing questions. We aim to respond within 24 hours.</p>
                          <a href="mailto:support@finthesia.com" className="text-[#27C4E1] font-semibold hover:underline">
                             support@finthesia.com
                          </a>
                       </div>
                    </div>

                    {/* Address */}
                    <div className="flex gap-4">
                       <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="font-bold text-slate-900 mb-1">Our Headquarters</h3>
                          <p className="text-sm text-slate-600 leading-relaxed">
                             Finthesia is proudly built and operated by <strong className="text-slate-800">Riknova Technology</strong>.<br/>
                             Kismat Narajole, West Medinipur<br/>
                             West Bengal, India, 721211
                          </p>
                       </div>
                    </div>

                    {/* Hours */}
                    <div className="flex gap-4">
                       <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Clock className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="font-bold text-slate-900 mb-1">Business Hours</h3>
                          <p className="text-sm text-slate-600">
                             Monday – Friday: 9:00 AM – 6:00 PM (IST)<br/>
                             Saturday & Sunday: Closed
                          </p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-lg">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                       <Lightbulb className="text-amber-400 w-6 h-6" /> Quick Help
                    </h2>
                    <p className="text-slate-400 text-sm mb-6">Before you send a message, you might find the answer you are looking for in our other resources:</p>
                    <ul className="space-y-4 text-sm font-medium">
                       <li>
                          <Link to="/faq" className="flex items-center gap-3 text-white hover:text-[#27C4E1] transition-colors">
                             <ShieldAlert className="w-5 h-5 text-slate-500" /> Frequently Asked Questions
                          </Link>
                       </li>
                       <li>
                          <Link to="/pricing" className="flex items-center gap-3 text-white hover:text-[#27C4E1] transition-colors">
                             <CreditCard className="w-5 h-5 text-slate-500" /> Pricing Plans
                          </Link>
                       </li>
                       <li>
                          <Link to="/refunds" className="flex items-center gap-3 text-white hover:text-[#27C4E1] transition-colors">
                             <FileText className="w-5 h-5 text-slate-500" /> Cancellation & Refunds
                          </Link>
                       </li>
                    </ul>
                 </div>
              </div>

              {/* Right Column: Contact Form */}
              <div className="lg:col-span-3">
                 <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                       ✉️ Send Us a Message
                    </h2>
                    <p className="text-slate-500 mb-8">Fill out the form below and our team will get back to you shortly.</p>
                    
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                       
                       <div className="grid sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</label>
                             <input 
                                type="text" 
                                id="name"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#27C4E1]/50 focus:border-[#27C4E1] transition-colors"
                                placeholder="John Doe"
                                required
                             />
                          </div>
                          <div className="space-y-2">
                             <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
                             <input 
                                type="email" 
                                id="email"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#27C4E1]/50 focus:border-[#27C4E1] transition-colors"
                                placeholder="john@example.com"
                                required
                             />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label htmlFor="subject" className="text-sm font-semibold text-slate-700">Subject</label>
                          <select 
                             id="subject"
                             className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#27C4E1]/50 focus:border-[#27C4E1] transition-colors bg-white appearance-none"
                             required
                          >
                             <option value="" disabled selected>Select an option</option>
                             <option value="general">General Inquiry</option>
                             <option value="technical">Technical Support</option>
                             <option value="billing">Billing</option>
                             <option value="feedback">Feedback</option>
                          </select>
                       </div>

                       <div className="space-y-2">
                          <label htmlFor="message" className="text-sm font-semibold text-slate-700">Message</label>
                          <textarea 
                             id="message"
                             rows={6}
                             className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#27C4E1]/50 focus:border-[#27C4E1] transition-colors resize-none"
                             placeholder="How can we help you?"
                             required
                          ></textarea>
                       </div>

                       <Button type="submit" className="w-full h-14 text-lg font-bold bg-[#27C4E1] hover:bg-[#1EB0CC] text-white rounded-xl shadow-lg shadow-[#27C4E1]/20 border-0 flex items-center justify-center gap-2">
                          Send Message <Send className="w-5 h-5" />
                       </Button>
                    </form>
                 </div>
              </div>

           </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
