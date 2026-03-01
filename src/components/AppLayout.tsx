import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Eye, 
  EyeOff,
  Plus
} from 'lucide-react';
import { useUI } from '../context/UIContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { TransactionModal } from './TransactionModal';

const navItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: TrendingUp, label: 'Net Worth', path: '/net-worth' },
  { icon: CreditCard, label: 'Cards', path: '/cards' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function AppLayout() {
  const { isPrivacyMode, togglePrivacyMode } = useUI();
  const location = useLocation();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold italic text-slate-900 tracking-tight">Finthesia</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={togglePrivacyMode}
            className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-600"
            title={isPrivacyMode ? "Disable Privacy Mode" : "Enable Privacy Mode"}
          >
            {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            SM
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsTransactionModalOpen(true)}
        className="fixed right-6 bottom-28 z-40 h-14 w-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center active:scale-90 transition-transform"
      >
        <Plus size={28} />
      </button>

      {/* Transaction Modal */}
      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-2 pb-safe-area-inset-bottom">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all",
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
