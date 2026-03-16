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
  User,
  Moon,
  Sun,
  LogOut,
  Landmark,
  RefreshCw,
  Heart,
  Brain
} from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { TransactionModal } from './TransactionModal';

const navGroups = [
  {
    title: 'OVERVIEW',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: TrendingUp, label: 'Net Worth', path: '/net-worth' },
    ]
  },
  {
    title: 'ACCOUNTS',
    items: [
      { icon: CreditCard, label: 'Cards', path: '/cards' },
      { icon: Landmark, label: 'Bank Accounts', path: '/banks' },
    ]
  },
  {
    title: 'PLANNING',
    items: [
      { icon: PieChart, label: 'Budgets', path: '/budgets' },
      { icon: Calendar, label: 'Bills & EMIs', path: '/bills' },
      { icon: RefreshCw, label: 'Subscriptions', path: '/subscriptions' },
    ]
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { icon: Heart, label: 'Financial Health', path: '/financial-health' },
      { icon: Brain, label: 'Predictions', path: '/spending-predictions' },
      { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { icon: Settings, label: 'Settings', path: '/settings' },
    ]
  }
];

export default function AppLayout() {
  const { isPrivacyMode, togglePrivacyMode, isDarkMode, toggleDarkMode } = useUI();
  const { currentUser, signOut } = useAuth();
  const location = useLocation();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex w-72 bg-card border-r border-border flex-col sticky top-0 h-screen z-40">
        <div className="px-6 py-6 pb-2">
          <div className="flex items-center space-x-2">
            <div className="logo">
              <span className="logo-fin">fin</span><span className="logo-thesia">thesia</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-6 overflow-y-auto py-4">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="px-3 mb-2 text-[11px] font-bold text-text-muted/70 tracking-wider uppercase">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm",
                      isActive 
                        ? "bg-primary/10 text-primary font-bold shadow-sm" 
                        : "text-text-muted hover:bg-background hover:text-text-dark font-medium"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <div className={cn("transition-transform duration-200", isActive ? "scale-105" : "group-hover:scale-105")}>
                          <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* Pro Feature Card */}
          <div className="mx-2 mt-8 mb-2 p-4 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-0.5 group">
            <p className="font-bold text-sm mb-1 group-hover:scale-105 transition-transform origin-left">Upgrade to Pro 🚀</p>
            <p className="text-xs text-white/90 mb-3 leading-relaxed">AI Predictions & Unlimited Analytics</p>
            <button className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition-colors backdrop-blur-sm">
              Upgrade Now
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-background cursor-pointer transition-colors group border border-transparent hover:border-border/50">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm overflow-hidden group-hover:bg-primary group-hover:text-white transition-colors">
              {currentUser?.user_metadata?.avatar_url ? (
                <img src={currentUser.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                getInitials(currentUser?.user_metadata?.full_name || currentUser?.email)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-dark truncate">{currentUser?.user_metadata?.full_name || currentUser?.email}</p>
              <p className="text-[10px] font-medium text-text-muted truncate uppercase tracking-wider">Free Plan</p>
            </div>
            <button 
              onClick={signOut}
              className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
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
            <div className="logo" style={{ fontSize: '24px' }}>
              <span className="logo-fin">fin</span><span className="logo-thesia">thesia</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-background transition-colors text-text-muted"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={togglePrivacyMode}
              className="p-2 rounded-full hover:bg-background transition-colors text-text-muted"
            >
              {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <button 
              onClick={() => window.location.href = '/settings'}
              className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary/20 overflow-hidden hover:opacity-90 transition-opacity"
            >
              {currentUser?.user_metadata?.avatar_url ? (
                <img src={currentUser.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                getInitials(currentUser?.user_metadata?.full_name || currentUser?.email)
              )}
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-background/80 backdrop-blur-md px-8 py-6 items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest">Overview</h2>
            <p className="text-2xl font-bold text-text-dark">Welcome back{currentUser?.user_metadata?.full_name ? `, ${currentUser.user_metadata.full_name.split(' ')[0]}` : ''}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-card border border-border shadow-sm hover:bg-background transition-colors text-text-muted"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
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
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div className="logo" style={{ fontSize: '24px' }}>
                    <span className="logo-fin">fin</span><span className="logo-thesia">thesia</span>
                  </div>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 rounded-xl hover:bg-background text-text-muted"
                  ><X size={24} />
                </button>
              </div>
              <nav className="flex-1 px-3 space-y-6 overflow-y-auto py-4">
                {navGroups.map((group) => (
                  <div key={group.title}>
                    <p className="px-3 mb-2 text-[11px] font-bold text-text-muted/70 tracking-wider uppercase">
                      {group.title}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsSidebarOpen(false)}
                          className={({ isActive }) => cn(
                            "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm",
                            isActive 
                              ? "bg-primary/10 text-primary font-bold shadow-sm" 
                              : "text-text-muted hover:bg-background hover:text-text-dark font-medium"
                          )}
                        >
                          {({ isActive }) => (
                            <>
                              <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                              <span>{item.label}</span>
                            </>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Pro Feature Card */}
                <div className="mx-2 mt-8 mb-2 p-4 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/20 cursor-pointer">
                  <p className="font-bold text-sm mb-1">Upgrade to Pro 🚀</p>
                  <p className="text-xs text-white/90 mb-3 leading-relaxed">AI Predictions & Unlimited Analytics</p>
                  <button className="w-full py-2.5 bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-sm">
                    Upgrade Now
                  </button>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile FAB removed since it's going into the bottom nav */}

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
            { isAction: true, icon: Plus, label: 'Add' },
            { icon: CreditCard, label: 'Cards', path: '/cards' },
            { icon: PieChart, label: 'Budget', path: '/budgets' },
          ].map((item, index) => (
            item.isAction ? (
              <button
                key="action-button"
                onClick={() => setIsTransactionModalOpen(true)}
                className="flex flex-col items-center justify-center px-2 py-2 -mt-6"
                aria-label="Add Transaction"
              >
                <div className="h-14 w-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform border-4 border-card">
                  <item.icon size={28} strokeWidth={2.5} />
                </div>
              </button>
            ) : (
              <NavLink
                key={item.path}
                to={item.path as string}
                className={({ isActive }) => cn(
                  "flex flex-col items-center justify-center space-y-1 px-3 py-3 rounded-xl transition-all",
                  isActive ? "text-primary bg-primary/10" : "text-text-muted hover:text-text-dark"
                )}
                title={item.label}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="sr-only">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          ))}
        </div>
      </nav>
    </div>
  );
}
