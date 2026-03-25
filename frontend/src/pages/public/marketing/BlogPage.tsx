import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Clock, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All Posts");

  const categories = [
    "All Posts", 
    "Personal Finance 101", 
    "Wealth & Investing", 
    "Platform Updates", 
    "User Success Stories"
  ];

  const latestArticles = [
    {
       title: "Demystifying Net Worth: Why It Matters More Than Income",
       readTime: "3 min read",
       category: "Wealth & Investing",
       snippet: "Your salary is only half the story. Learn why tracking your net worth is the truest measure of your financial health, and how to calculate it accurately using Finthesia’s asset and liability trackers.",
       image: "bg-slate-800"
    },
    {
       title: "Product Update: Introducing AI-Powered Spending Predictions",
       readTime: "2 min read",
       category: "Platform Updates",
       snippet: "We are thrilled to announce the rollout of our newest Wealth Plan feature! Finthesia's new AI engine now analyzes your historical data to warn you before you overspend. Here is how to set it up.",
       image: "bg-[#27C4E1]"
    },
    {
       title: "The 50/30/20 Budgeting Rule Explained",
       readTime: "4 min read",
       category: "Personal Finance 101",
       snippet: "Needs, wants, and savings. The 50/30/20 rule is a classic for a reason. Here is a step-by-step guide to applying this framework to your Finthesia dashboard for stress-free monthly budgeting.",
       image: "bg-amber-400"
    },
    {
       title: "Tackling Debt: The Snowball vs. Avalanche Method",
       readTime: "5 min read",
       category: "Personal Finance 101",
       snippet: "If you are working on paying down loans or credit cards, choosing the right strategy is crucial. We compare the mathematical advantages of the Avalanche method against the psychological wins of the Snowball method.",
       image: "bg-red-400"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#27C4E1] selection:text-white flex flex-col">
      <PublicHeader />

      <main className="flex-grow pt-32 pb-24">
        
        {/* Header Section */}
        <section className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
             The Finthesia Blog
          </h1>
          <p className="text-2xl text-slate-800 font-medium mb-4">
             Master your money. Build your wealth. Stay updated.
          </p>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
             Insights, tips, and strategies from the financial experts at <span className="font-semibold text-slate-800">Riknova Technology</span> to help you take control of your financial destiny.
          </p>
        </section>

        {/* Categories Navbar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
           <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {categories.map((cat) => (
                 <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                       activeCategory === cat 
                       ? 'bg-slate-900 text-white shadow-md' 
                       : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                 >
                    {cat}
                 </button>
              ))}
           </div>
        </section>

        {/* Featured Article */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
           <div className="flex items-center gap-2 mb-6">
              <Bookmark className="w-5 h-5 text-[#27C4E1]" fill="currentColor" />
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide">Featured Article</h2>
           </div>
           
           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row group cursor-pointer hover:shadow-md transition-shadow duration-300">
              {/* Image Placeholder */}
              <div className="md:w-1/2 min-h-[300px] md:min-h-full bg-gradient-to-tr from-blue-100 to-[#27C4E1]/20 relative overflow-hidden flex items-center justify-center">
                 <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors duration-500"></div>
                 <BarChart3 className="w-32 h-32 text-blue-500/20 absolute bottom-0 left-0 transform translate-y-10" />
                 <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white/50 relative z-10 transform transition-transform duration-500 group-hover:scale-105">
                     <TrendingUp className="w-16 h-16 text-[#27C4E1]" />
                 </div>
              </div>
              
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                 <div className="flex items-center gap-3 text-sm text-slate-500 font-medium mb-4">
                    <span className="text-[#27C4E1] font-bold">Personal Finance 101</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 5 min read</span>
                 </div>
                 
                 <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 group-hover:text-[#27C4E1] transition-colors">
                    How to Automate Your Finances and Save 20% More This Year
                 </h3>
                 
                 <p className="text-lg text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                    Managing money doesn't have to be a daily chore. In fact, the best financial plans are the ones you barely have to think about. In this comprehensive guide, we break down how to use Finthesia’s smart tools to put your savings, bill payments, and investments on autopilot...
                 </p>
                 
                 <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">FT</div>
                       <span className="font-semibold text-slate-900">The Finthesia Team</span>
                    </div>
                    <span className="text-[#27C4E1] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                       Read Full Article <ArrowRight className="w-4 h-4" />
                    </span>
                 </div>
              </div>
           </div>
        </section>

        {/* Latest Articles Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
           <h2 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4">Latest Articles</h2>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {latestArticles.map((article, i) => (
                 <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    {/* Thumbnail */}
                    <div className={`h-48 w-full ${article.image} relative overflow-hidden`}>
                       <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                       <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mb-3">
                          <span className="text-[#27C4E1] font-bold truncate max-w-[150px]">{article.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                       </div>
                       
                       <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#27C4E1] transition-colors line-clamp-2">
                          {article.title}
                       </h3>
                       
                       <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-grow">
                          {article.snippet}
                       </p>
                       
                       <div className="mt-auto">
                          <span className="text-slate-900 font-bold text-sm flex items-center gap-1 group-hover:text-[#27C4E1] transition-colors">
                             Read More <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                          </span>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
           
           <div className="text-center">
              <Button variant="outline" className="rounded-full px-8 py-6 font-bold text-slate-700 bg-white hover:bg-slate-50 border-slate-300">
                 Load More Articles
              </Button>
           </div>
        </section>

        {/* Newsletter Signup */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="bg-slate-900 rounded-3xl p-8 md:p-16 text-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
                  <div className="w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[#27C4E1]/20 to-blue-500/20 blur-3xl" />
              </div>
              
              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                 <div className="w-16 h-16 bg-[#27C4E1]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-[#27C4E1]" />
                 </div>
                 
                 <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Join the Finthesia Newsletter</h2>
                 <p className="text-lg text-slate-300">
                    Get smarter about your money every week. Join thousands of users who receive our weekly roundup of top financial tips, market insights, and exclusive Finthesia updates—delivered straight to your inbox. No spam, just value.
                 </p>
                 
                 <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
                    <input 
                       type="email" 
                       placeholder="Email Address Input" 
                       required
                       className="flex-grow px-5 py-4 rounded-xl bg-white/10 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#27C4E1] focus:border-transparent transition-all"
                    />
                    <Button type="submit" className="py-4 px-8 text-lg font-bold bg-[#27C4E1] hover:bg-[#1EB0CC] text-white rounded-xl border-none shadow-lg shadow-[#27C4E1]/20">
                       Subscribe
                    </Button>
                 </form>
                 
                 <p className="text-xs text-slate-500 pt-4">
                    By subscribing, you agree to Riknova Technology's <Link to="/privacy-policy" className="underline hover:text-white transition-colors">Privacy Policy</Link>.
                 </p>
              </div>
           </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
// Add these missing imports to the top of the file since they were used in the placeholder images above
import { BarChart3, TrendingUp } from 'lucide-react';
