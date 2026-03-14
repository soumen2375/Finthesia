import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, BrainCircuit, Globe, Shield, Target, 
  ArrowRight, Sparkles, DownloadCloud, Database, PieChart
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#27C4E1] selection:text-white flex flex-col overflow-x-hidden">
      <PublicHeader />

      <main className="flex-grow pt-24">
        
        {/* --- HERO SECTION --- */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center max-w-5xl mx-auto">
          <div className="space-y-8 relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-tight">
               Go beyond basic budgeting. <br className="hidden md:block"/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#27C4E1] to-blue-500">
                  Experience total financial clarity.
               </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
               Finthesia brings your cash flow, investments, and debts into one beautiful, intelligent dashboard. Stop guessing where your money goes and start engineering your wealth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/register">
                <Button size="lg" className="h-14 px-8 text-lg font-bold bg-[#27C4E1] hover:bg-[#1EB0CC] text-white rounded-full shadow-lg border-0 w-full sm:w-auto transition-transform hover:-translate-y-0.5">
                  Start for Free
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-full border-slate-300 text-slate-700 hover:bg-white border-2 w-full sm:w-auto transition-transform hover:-translate-y-0.5">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Faint background grid */}
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </section>

        {/* --- BENTO BOX OVERVIEW GRID --- */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[240px]">
              
              {/* Card 1 (Large) */}
              <div className="md:col-span-2 md:row-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#27C4E1]/30 transition-colors">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <BarChart3 className="w-64 h-64 text-slate-900" />
                 </div>
                 <div className="h-full flex flex-col justify-end relative z-10">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                       <BarChart3 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Unified Dashboard</h3>
                    <p className="text-slate-600 text-lg">See your banks, credit cards, and cash in real-time without leaving the app.</p>
                 </div>
              </div>

              {/* Card 2 (Square) */}
              <div className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100 shadow-sm relative overflow-hidden group hover:border-[#27C4E1]/30 transition-colors flex flex-col justify-between">
                 <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">AI Insights</h3>
                    <p className="text-slate-600 text-sm">Smart algorithms that predict your spending.</p>
                 </div>
              </div>

              {/* Card 3 (Square) */}
              <div className="md:col-span-1 md:row-span-1 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#27C4E1]/30 transition-colors flex flex-col justify-between">
                 <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Global Sync</h3>
                    <p className="text-slate-600 text-sm">Connect securely to 10,000+ banks worldwide.</p>
                 </div>
              </div>

              {/* Card 4 (Rectangle) */}
              <div className="md:col-span-1 md:row-span-1 bg-slate-900 rounded-3xl p-8 shadow-sm relative overflow-hidden group flex flex-col justify-between">
                 <div className="w-12 h-12 bg-slate-800 text-white rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-white mb-1">Ironclad Security</h3>
                    <p className="text-slate-400 text-sm">256-bit encryption backed by Riknova Technology.</p>
                 </div>
              </div>

              {/* Card 5 (Rectangle) */}
              <div className="md:col-span-1 md:row-span-1 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#27C4E1]/30 transition-colors flex flex-col justify-between">
                 <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Smart Budgets</h3>
                    <p className="text-slate-600 text-sm">Rollover budgets that adapt to your lifestyle.</p>
                 </div>
              </div>

           </div>
        </section>

        {/* --- FEATURE DEEP DIVES (Z-PATTERN) --- */}
        <section className="py-24 bg-white overflow-hidden border-y border-slate-200">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
              
              {/* Block A */}
              <div className="flex flex-col lg:flex-row items-center gap-16">
                 <div className="lg:w-1/2 order-2 lg:order-1 relative">
                    {/* Mockup Graphic */}
                    <div className="w-full h-80 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center p-8 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/50 to-transparent"></div>
                       <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 w-full max-w-sm transform -rotate-2 hover:rotate-0 transition-all duration-500 flex items-center gap-4 relative z-10">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">☕</div>
                          <div className="flex-1">
                             <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                             <div className="h-3 w-32 bg-slate-100 rounded"></div>
                          </div>
                          <div className="h-6 w-16 bg-green-100 rounded px-2 flex items-center justify-center text-xs font-bold text-green-700">Groceries</div>
                       </div>
                    </div>
                 </div>
                 <div className="lg:w-1/2 order-1 lg:order-2 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold">
                       <Sparkles className="w-4 h-4" /> AI Powered
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Your spending, categorized automatically.</h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                       Say goodbye to manual math and messy spreadsheets. Finthesia’s intelligent engine automatically learns your spending habits. Buy a coffee? It’s instantly tagged. Pay your electric bill? It’s filed under Utilities.
                    </p>
                    <ul className="space-y-4 pt-4">
                       <li className="flex gap-3 text-slate-700">
                          <Target className="w-6 h-6 text-[#27C4E1] flex-shrink-0" />
                          <span><strong>Custom Rules:</strong> Create your own custom tags and categories.</span>
                       </li>
                       <li className="flex gap-3 text-slate-700">
                          <BarChart3 className="w-6 h-6 text-[#27C4E1] flex-shrink-0" />
                          <span><strong>Split Transactions:</strong> Easily split a single ATM withdrawal or large receipt into multiple budget categories.</span>
                       </li>
                       <li className="flex gap-3 text-slate-700">
                          <Database className="w-6 h-6 text-[#27C4E1] flex-shrink-0" />
                          <span><strong>Receipt Attachments:</strong> Snap a photo and attach it to any expense for perfect record-keeping.</span>
                       </li>
                    </ul>
                 </div>
              </div>

              {/* Block B */}
              <div className="flex flex-col lg:flex-row items-center gap-16">
                 <div className="lg:w-1/2 space-y-6">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Budgets that warn you before you overspend.</h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                       Create flexible monthly, weekly, or custom budgets for the things that matter. Finthesia doesn't just track your pacing; it proactively alerts you when you are nearing your limits, so you can adjust your spending before the month ends.
                    </p>
                    <ul className="space-y-4 pt-4">
                       <li className="flex gap-3 text-slate-700">
                          <Target className="w-6 h-6 text-amber-500 flex-shrink-0" />
                          <span><strong>Rollover Balances:</strong> Let unspent budget from last month roll over to the next.</span>
                       </li>
                       <li className="flex gap-3 text-slate-700">
                          <BarChart3 className="w-6 h-6 text-amber-500 flex-shrink-0" />
                          <span><strong>Visual Pacing:</strong> Instantly see if your spending matches the current day of the month.</span>
                       </li>
                       <li className="flex gap-3 text-slate-700">
                          <Database className="w-6 h-6 text-amber-500 flex-shrink-0" />
                          <span><strong>Goal Linking:</strong> Tie specific budgets to your long-term savings goals.</span>
                       </li>
                    </ul>
                 </div>
                 <div className="lg:w-1/2 relative">
                     {/* Mockup Graphic */}
                     <div className="w-full h-80 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center p-8 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-bl from-amber-100/30 to-transparent"></div>
                       <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 w-full max-w-md relative z-10 flex flex-col gap-4">
                          <div className="flex justify-between items-center mb-2">
                             <div className="font-bold text-slate-700">Dining Out</div>
                             <div className="text-sm text-amber-600 font-bold">85% Used</div>
                          </div>
                          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-gradient-to-r from-green-400 via-amber-400 to-red-400 w-[85%]"></div>
                          </div>
                          <div className="text-xs text-slate-500 mt-2 flex justify-between">
                             <span>₹8,500 spent</span>
                             <span>₹10,000 limit</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Block C */}
              <div className="flex flex-col lg:flex-row items-center gap-16">
                 <div className="lg:w-1/2 order-2 lg:order-1 relative">
                    {/* Mockup Graphic */}
                    <div className="w-full h-80 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner flex flex-col justify-end p-8 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-t from-emerald-100/50 to-transparent"></div>
                       <div className="flex items-end gap-2 h-40 relative z-10 w-full border-b-2 border-slate-300 pb-2">
                          {[30, 40, 35, 50, 60, 55, 75, 90].map((h, i) => (
                             <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-500 to-emerald-300 opacity-90 hover:opacity-100 transition-opacity" style={{height: `${h}%`}}></div>
                          ))}
                          {/* Forecast dotted line */}
                          <div className="absolute top-0 right-0 h-full w-1/4 border-l-2 border-dashed border-slate-400 opacity-50 flex items-center justify-center">
                             <span className="text-xs font-bold text-slate-500 bg-white/50 px-2 rounded-full backdrop-blur-sm -mt-20">Forecast</span>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="lg:w-1/2 order-1 lg:order-2 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-sm font-bold border border-emerald-100 shadow-sm">
                       Wealth Plan Exclusive
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Zoom out. Watch your true wealth grow.</h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                       Your checking account balance isn't your whole story. Connect your real estate, vehicle values, investment portfolios, and crypto. Then, add your mortgages and student loans. Finthesia calculates your real-time net worth and uses AI to forecast your financial future.
                    </p>
                    <ul className="space-y-4 pt-4">
                       <li className="flex gap-3 text-slate-700">
                          <Target className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                          <span><strong>Asset & Liability Tracking:</strong> A complete balance sheet for your personal life.</span>
                       </li>
                       <li className="flex gap-3 text-slate-700">
                          <BarChart3 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                          <span><strong>Debt Payoff Planner:</strong> Test different strategies (Snowball vs. Avalanche) to become debt-free faster.</span>
                       </li>
                       <li className="flex gap-3 text-slate-700">
                          <Database className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                          <span><strong>AI Financial Forecasting:</strong> Predict what your net worth will be in 5, 10, or 20 years based on your current trajectory.</span>
                       </li>
                    </ul>
                 </div>
              </div>

           </div>
        </section>

        {/* --- DEVELOPER & POWER USER TOOLS --- */}
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 opacity-10">
               <Database className="w-[600px] h-[600px]" />
           </div>
           
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="max-w-3xl mb-16">
                 <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for those who demand more from their data.</h2>
                 <p className="text-xl text-slate-400">
                    We know power users love their data. Finthesia gives you the tools to analyze, export, and manipulate your financial history without restrictions.
                 </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                 <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl backdrop-blur-sm">
                    <DownloadCloud className="w-10 h-10 text-[#27C4E1] mb-6" />
                    <h3 className="text-xl font-bold mb-3">One-Click CSV/Excel Exports</h3>
                    <p className="text-slate-400">Download your data perfectly formatted for tax season or for your own custom spreadsheet models.</p>
                 </div>
                 <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl backdrop-blur-sm">
                    <Database className="w-10 h-10 text-[#27C4E1] mb-6" />
                    <h3 className="text-xl font-bold mb-3">Smart Importer</h3>
                    <p className="text-slate-400">Switching from another app? Upload your historical CSV files, and our AI will automatically map the columns and categorize years of data in seconds.</p>
                 </div>
                 <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl backdrop-blur-sm">
                    <PieChart className="w-10 h-10 text-[#27C4E1] mb-6" />
                    <h3 className="text-xl font-bold mb-3">Advanced Analytics</h3>
                    <p className="text-slate-400">Generate custom pie charts, bar graphs, and heat maps to visualize your cash flow your way.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* --- TRUST & SECURITY BANNER --- */}
        <section className="py-16 bg-slate-50 border-b border-slate-200">
           <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="inline-block p-4 bg-white rounded-full shadow-sm border border-slate-100 mb-8">
                 <Shield className="w-12 h-12 text-[#27C4E1]" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Bank-grade security you can trust.</h2>
              <p className="text-lg text-slate-600 mb-12 max-w-3xl mx-auto">
                 Finthesia is engineered by <span className="font-bold text-slate-900">Riknova Technology</span> with privacy as our foundational principle.
              </p>
              
              <div className="grid sm:grid-cols-3 gap-8 text-left">
                 <div>
                    <h4 className="font-bold text-slate-900 mb-2">🔒 Read-Only Access</h4>
                    <p className="text-sm text-slate-600">We can never move your money. We only read the data you permit us to.</p>
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-900 mb-2">🛡️ 256-Bit Encryption</h4>
                    <p className="text-sm text-slate-600">Your data is encrypted in transit and at rest using the same standards as major global banks.</p>
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-900 mb-2">👤 You Own Your Data</h4>
                    <p className="text-sm text-slate-600">We never sell your personal or financial information to advertisers. Ever.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* --- FINAL CTA --- */}
        <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-center px-4">
           <div className="max-w-3xl mx-auto space-y-8 relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Ready to master your money?</h2>
              <p className="text-xl text-slate-300">
                 Join the thousands of users who have traded financial stress for financial clarity. It takes less than 60 seconds to set up your dashboard.
              </p>
              <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4">
                 <Link to="/register">
                    <Button size="lg" className="h-14 px-8 text-lg font-bold bg-[#27C4E1] hover:bg-[#1EB0CC] text-white rounded-full border-0 w-full sm:w-auto shadow-xl shadow-[#27C4E1]/20">
                       Create Free Account
                    </Button>
                 </Link>
                 <Link to="/pricing">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-full border-slate-600 text-white hover:bg-slate-700 w-full sm:w-auto">
                       Compare Plans
                    </Button>
                 </Link>
              </div>
           </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
