import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { LineChart, BarChart2, PieChart, Activity } from 'lucide-react';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#F6F7F9]">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#27C4E1]/10 rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-20 left-10 w-[600px] h-[600px] bg-[#00BFFF]/10 rounded-full blur-3xl opacity-50 transform -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-[#545E63] mb-8 leading-tight">
            Take Control of Your <br className="hidden md:block" />
            <span className="text-[#27C4E1]">Financial Future</span>
          </h1>
          <p className="text-xl text-[#8A8F93] mb-12 max-w-2xl mx-auto">
            Smart budgeting, personalized advice, and intelligent asset management all in one place.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="bg-[#27C4E1] hover:bg-[#00BFFF] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl shadow-[#27C4E1]/25 transition-all w-full sm:w-auto"
            >
              Get Started
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Hero Illustration Placeholder (Abstract UI Dashboard) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 relative mx-auto max-w-5xl"
        >
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex aspect-[16/9] md:aspect-[21/9] relative">
            {/* Sidebar Mock */}
            <div className="w-1/6 bg-[#F6F7F9] hidden md:flex flex-col p-6 space-y-4 border-r border-gray-100">
              <div className="h-4 w-24 bg-gray-200 rounded mb-8" />
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-5/6 bg-gray-200 rounded" />
              <div className="h-3 w-4/6 bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-200 rounded mt-8" />
              <div className="h-3 w-5/6 bg-gray-200 rounded" />
            </div>
            
            {/* Main Content Mock */}
            <div className="flex-1 p-8 flex flex-col gap-6">
              {/* Top Cards */}
              <div className="flex gap-4">
                <div className="flex-1 bg-gradient-to-br from-[#27C4E1]/10 to-transparent p-6 rounded-2xl border border-[#27C4E1]/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#27C4E1]/20 flex items-center justify-center text-[#27C4E1]">
                      <LineChart size={20} />
                    </div>
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                  </div>
                  <div className="h-8 w-32 bg-gray-300 rounded mb-2" />
                  <div className="h-2 w-16 bg-[#27C4E1] rounded" />
                </div>
                <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hidden sm:block">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#545E63]/10 flex items-center justify-center text-[#545E63]">
                      <BarChart2 size={20} />
                    </div>
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                  </div>
                  <div className="h-8 w-28 bg-gray-300 rounded mb-2" />
                  <div className="h-2 w-20 bg-[#00BFFF] rounded" />
                </div>
                <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hidden lg:block">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#00C853]/10 flex items-center justify-center text-[#00C853]">
                      <Activity size={20} />
                    </div>
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                  </div>
                  <div className="h-8 w-32 bg-gray-300 rounded mb-2" />
                  <div className="h-2 w-16 bg-gradient-to-r from-[#27C4E1] to-[#00C853] rounded" />
                </div>
              </div>

              {/* Bottom Large Chart Zone */}
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex items-end px-8 pb-8 pt-12 relative overflow-hidden">
                <div className="absolute top-6 left-6 flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-[#27C4E1]" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
                {/* SVG Mock Chart */}
                <svg className="w-full h-full preserve-3d" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M0 30 L0 15 Q 10 20, 20 10 T 40 18 T 60 5 T 80 12 T 100 2 L 100 30 Z" fill="url(#grad)" opacity="0.2" />
                  <path d="M0 15 Q 10 20, 20 10 T 40 18 T 60 5 T 80 12 T 100 2" fill="none" stroke="#27C4E1" strokeWidth="0.5" />
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#27C4E1" stopOpacity="1" />
                      <stop offset="100%" stopColor="#27C4E1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Floating UI Elements */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-12 top-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 hidden lg:flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-[#00C853]/10 text-[#00C853] rounded-full flex items-center justify-center">
              <PieChart size={24} />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-[#545E63]">+12.5%</div>
              <div className="text-xs text-[#8A8F93]">Growth Asset</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
