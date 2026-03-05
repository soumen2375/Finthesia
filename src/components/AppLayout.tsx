import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Eye, 
  EyeOff,
  Plus,
  Calendar,
  PieChart,
  Menu,
  X,
  User
} from 'lucide-react';
import { useUI } from '../context/UIContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { TransactionModal } from './TransactionModal';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: TrendingUp, label: 'Net Worth', path: '/net-worth' },
  { icon: CreditCard, label: 'Cards', path: '/cards' },
  { icon: PieChart, label: 'Budgets', path: '/budgets' },
  { icon: Calendar, label: 'Bills & EMIs', path: '/bills' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function AppLayout() {
  const { isPrivacyMode, togglePrivacyMode } = useUI();
  const location = useLocation();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col sticky top-0 h-screen z-40">
        <div className="p-8">
          <h1 className="text-2xl font-bold italic text-text-dark tracking-tight flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center text-white not-italic text-lg shadow-lg shadow-primary/20">F</div>
            <span>Finthesia</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-text-muted hover:bg-background hover:text-text-dark"
              )}
            >
              <item.icon size={20} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-border">
          <div className="flex items-center space-x-3 p-3 bg-background rounded-2xl">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
              SM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-dark truncate">Soumen Maity</p>
              <p className="text-[10px] font-medium text-text-muted truncate uppercase tracking-wider">Premium Member</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl hover:bg-background text-text-muted"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold italic text-text-dark tracking-tight">Finthesia</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={togglePrivacyMode}
              className="p-2 rounded-full hover:bg-background transition-colors text-text-muted"
            >
              {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary/20">
              SM
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-background/80 backdrop-blur-md px-8 py-6 items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest">Overview</h2>
            <p className="text-2xl font-bold text-text-dark">Welcome back, Soumen</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={togglePrivacyMode}
              className="p-2.5 rounded-xl bg-card border border-border shadow-sm hover:bg-background transition-colors text-text-muted"
            >
              {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <button 
              onClick={() => setIsTransactionModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all"
            >
              <Plus size={18} />
              <span>Add Transaction</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
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
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-card z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold italic text-text-dark tracking-tight">Finthesia</h1>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-xl hover:bg-background text-text-muted">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm",
                      isActive 
                        ? "bg-primary/10 text-primary shadow-sm" 
                        : "text-text-muted hover:bg-background hover:text-text-dark"
                    )}
                  >
                    <item.icon size={20} strokeWidth={2} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile FAB */}
      <button 
        onClick={() => setIsTransactionModalOpen(true)}
        className="lg:hidden fixed right-6 bottom-24 z-40 h-14 w-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform"
      >
        <Plus size={28} />
      </button>

      {/* Transaction Modal */}
      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
      />

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border px-4 py-2 pb-safe-area-inset-bottom">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {[
            { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
            { icon: TrendingUp, label: 'Net Worth', path: '/net-worth' },
            { icon: CreditCard, label: 'Cards', path: '/cards' },
            { icon: PieChart, label: 'Budget', path: '/budgets' },
            { icon: User, label: 'Profile', path: '/settings' },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all",
                isActive ? "text-primary" : "text-text-muted hover:text-text-dark"
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
