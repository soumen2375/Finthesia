import { motion } from 'motion/react';
import { ArrowUpRight, BarChart3, Wallet } from 'lucide-react';

export default function Workflow() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-[#545E63]"
          >
            Experience the best <br className="hidden md:block" /> workflow with us
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto rounded-[2.5rem] bg-gradient-to-tr from-[#F6F7F9] to-white p-2 border border-gray-100 shadow-2xl shadow-[#27C4E1]/10"
        >
          {/* Main Mockup Container */}
          <div className="bg-white rounded-[2.25rem] overflow-hidden border border-gray-100 w-full relative aspect-[4/3] md:aspect-[16/9] flex">
            {/* Sidebar Mockup */}
            <div className="w-64 bg-[#F6F7F9] hidden lg:flex flex-col p-6 border-r border-gray-100">
              <div className="flex items-center gap-2 mb-10">
                <div className="w-8 h-8 rounded bg-[#27C4E1]" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-10 w-full rounded-xl flex items-center px-4 ${i === 2 ? 'bg-[#27C4E1] text-white shadow-md' : 'text-[#8A8F93] hover:bg-white'}`}>
                    <div className={`h-4 w-4 rounded mr-3 ${i === 2 ? 'bg-white' : 'bg-gray-200'}`} />
                    <div className={`h-3 w-20 rounded ${i === 2 ? 'bg-white/90' : 'bg-gray-200'}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Mockup Content */}
            <div className="flex-1 p-6 md:p-10 flex flex-col bg-slate-50 relative">
              
              <div className="flex justify-between items-center mb-8">
                <div className="h-6 w-32 bg-gray-200 rounded-lg" />
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-white rounded-full border border-gray-100" />
                  <div className="h-10 w-32 bg-[#27C4E1] rounded-full" />
                </div>
              </div>

              {/* Cards row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                {[
                  { title: 'Total Balance', value: '$24,562.00', icon: Wallet, color: '#27C4E1' },
                  { title: 'Monthly Spend', value: '$3,240.50', icon: BarChart3, color: '#00BFFF' },
                  { title: 'Investments', value: '$15,310.20', icon: ArrowUpRight, color: '#00C853', hidden: true }
                ].map((card, i) => (
                  <div key={i} className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 ${card.hidden ? 'hidden md:block' : ''}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-[${card.color}]/10 text-[${card.color}]`}>
                        <card.icon size={18} />
                      </div>
                      <span className="text-sm font-medium text-[#8A8F93]">{card.title}</span>
                    </div>
                    <div className="text-2xl font-bold text-[#545E63]">{card.value}</div>
                  </div>
                ))}
              </div>

              {/* Chart Mockup */}
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6">
                  <div className="h-5 w-40 bg-gray-200 rounded" />
                  <div className="h-6 w-24 bg-gray-100 rounded-full" />
                </div>
                
                <div className="w-full h-full relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-full h-px bg-gray-100" />
                    ))}
                  </div>
                  {/* Mock Chart Area */}
                   <svg className="w-full h-full preserve-3d absolute inset-0 mt-4" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M0 30 L0 25 Q 10 15, 20 20 T 40 10 T 60 15 T 80 5 T 100 12 L 100 30 Z" fill="url(#workflowGrad)" opacity="0.3" />
                    <path d="M0 25 Q 10 15, 20 20 T 40 10 T 60 15 T 80 5 T 100 12" fill="none" stroke="#27C4E1" strokeWidth="0.8" />
                    <defs>
                      <linearGradient id="workflowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#27C4E1" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#27C4E1" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Absolute floating element */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -right-6 top-1/2 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 hidden md:block"
            >
              <div className="flex gap-3 items-center">
                <div className="h-10 w-10 bg-[#00C853]/10 rounded-full flex items-center justify-center text-[#00C853]">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <div className="text-sm text-[#8A8F93]">Income</div>
                  <div className="font-bold text-[#545E63]">+$1,250</div>
                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
