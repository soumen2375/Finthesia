import React, { useEffect, useState } from 'react';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/context/ToastContext';
import { 
  ArrowLeft, Users, LayoutDashboard, ScrollText, BarChart3, 
  Settings, Menu, X, Plus, Bell, ChevronDown, HelpCircle, LogOut,
  Search, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import DashboardView from './views/DashboardView';
import CashbookView from './views/CashbookView';
import ReportsView from './views/ReportsView';
import TransactionsView from './views/TransactionsView';
import PartiesView from './views/PartiesView';
import AddUnifiedTransactionModal from './components/AddUnifiedTransactionModal';
import AddPartyModal from './components/AddPartyModal';
import PartyDetailView from './components/PartyDetailView';
import CreateLedgerModal from './components/CreateLedgerModal';

import type { CashEntry, PartyInfo } from './types';

type TabView = 'dashboard' | 'parties' | 'reports' | 'transactions' | 'cashbook' | 'settings';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'parties', label: 'Parties', icon: Users },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'transactions', label: 'Transactions', icon: FileText },
  { id: 'cashbook', label: 'Cashbook', icon: ScrollText },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

export default function UnifiedLedgerPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const { currentUser, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabView>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data
  const [cashEntries, setCashEntries] = useState<CashEntry[]>([]);
  const [parties, setParties] = useState<PartyInfo[]>([]);

  // Modals & Navigation State
  const [showTxModal, setShowTxModal] = useState(false);
  const [txModalMode, setTxModalMode] = useState<'cash' | 'party'>('cash');
  const [txModalType, setTxModalType] = useState<'cash_in' | 'cash_out' | 'gave' | 'got'>('cash_in');
  const [txModalPartyId, setTxModalPartyId] = useState('');
  
  const [showAddParty, setShowAddParty] = useState(false);
  const [showCreateLedger, setShowCreateLedger] = useState(false);
  const [selectedParty, setSelectedParty] = useState<PartyInfo | null>(null);

  // Data Fetching
  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch last 30 days for now, could be dynamic per view later
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    const [cRes, pRes] = await Promise.all([
      supabase.from('cashbook_entries').select('*')
        .eq('user_id', user.id)
        .gte('entry_date', startDate)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase.from('party_balances').select('*')
        .eq('user_id', user.id)
        .order('name')
    ]);

    if (cRes.data) setCashEntries(cRes.data);
    if (pRes.data) setParties(pRes.data);
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [refreshKey]);

  // Actions
  const openCashModal = (type: 'cash_in' | 'cash_out') => {
    setTxModalMode('cash'); setTxModalType(type); setTxModalPartyId(''); setShowTxModal(true);
  };
  const openPartyTxModal = (partyId: string, type: 'gave' | 'got') => {
    setTxModalMode('party'); setTxModalType(type); setTxModalPartyId(partyId); setShowTxModal(true);
  };

  const handleDeleteCashEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    const { error } = await supabase.from('cashbook_entries').delete().eq('id', id);
    if (error) { showToast('Failed to delete transaction', 'error'); return; }
    showToast('Transaction deleted', 'success');
    fetchData();
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // If a specific party is selected, render the PartyDetailView entirely
  if (selectedParty) {
    return (
      <div className="font-sans min-h-screen bg-slate-50 p-6 md:p-8">
        <PartyDetailView
          party={selectedParty}
          isPrivacyMode={isPrivacyMode}
          onBack={() => { setSelectedParty(null); fetchData(); }}
          onAddTransaction={(type) => openPartyTxModal(selectedParty.party_id, type)}
          onRefresh={fetchData}
        />
        <AddUnifiedTransactionModal
          open={showTxModal} onClose={() => setShowTxModal(false)} onSaved={() => { fetchData(); setShowTxModal(false); }}
          parties={parties} defaultMode={txModalMode} defaultType={txModalType} defaultPartyId={txModalPartyId}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans tracking-tight">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-border flex-col sticky top-0 h-screen z-40">
        <div className="px-6 py-6 pb-2">
          <div className="flex flex-col text-left">
            <span className="text-2xl font-bold font-headline"><span className="text-text-dark">fin</span><span className="text-primary">thesia</span></span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted mt-1">Premium Ledger</span>
          </div>
        </div>
        
        <div className="px-5 py-4 mt-2">
          <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-2 w-full px-4 py-2.5 bg-[#eaf8fa] text-primary focus:bg-[#d8f4f6] hover:bg-[#d8f4f6] rounded-xl text-sm font-bold transition-colors">
            <ArrowLeft size={16} />
            <span>Back to Main Dashboard</span>
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as TabView)}
                className={cn(
                  "flex items-center w-full space-x-3 px-6 py-3.5 transition-all duration-200 text-[15px] border-l-4",
                  isActive 
                    ? "bg-[#f0fafa] text-primary border-primary font-bold"
                    : "text-text-muted border-transparent hover:bg-slate-50 hover:text-text-dark font-medium"
                )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} /> 
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-5 space-y-2 border-t border-border">
          <button onClick={() => setShowCreateLedger(true)} className="w-full py-3 bg-[#0f6466] text-white rounded-xl font-bold text-sm shadow-md shadow-primary/20 hover:opacity-90 transition-colors flex items-center justify-center space-x-2">
            <Plus size={18} />
            <span>New Ledger</span>
          </button>
          <div className="grid grid-cols-2 gap-2 mt-4">
             <button className="flex items-center justify-center space-x-2 px-3 py-2 text-text-muted hover:text-text-dark hover:bg-slate-50 rounded-lg transition-colors text-xs font-medium">
               <HelpCircle size={16} />
               <span>Help</span>
             </button>
             <button onClick={signOut} className="flex items-center justify-center space-x-2 px-3 py-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs font-medium">
               <LogOut size={16} />
               <span>Sign Out</span>
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-border px-4 md:px-8 py-3 w-full flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 md:flex-none">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-text-muted hover:bg-slate-100 transition-colors"
            >
              <Menu size={24} />
            </button>
            
            {/* Search Bar - only visible on md+ */}
            <div className="hidden md:flex relative w-80 lg:w-96">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Search transactions, parties..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-border rounded-lg text-sm focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-5">
            <div className="hidden sm:flex items-center">
              <button className="flex items-center space-x-2 bg-[#0f6466] text-white text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                <span>Switch Ledger</span>
                <ChevronDown size={16} />
              </button>
            </div>
            <button className="text-text-muted hover:text-text-dark transition-colors"><Bell size={20} strokeWidth={2} /></button>
            <button className="text-text-muted hover:text-text-dark transition-colors hidden sm:block"><Settings size={20} strokeWidth={2} /></button>
            <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-sm overflow-hidden border border-primary/20">
              {currentUser?.user_metadata?.avatar_url ? (
                <img src={currentUser.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                getInitials(currentUser?.user_metadata?.full_name || currentUser?.email)
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-[1200px] mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' && (
                  <DashboardView 
                    cashEntries={cashEntries} 
                    parties={parties} 
                    isLoading={isLoading} 
                    isPrivacyMode={isPrivacyMode}
                    onAddParty={() => setShowAddParty(true)}
                    onSelectParty={setSelectedParty}
                  />
                )}
                {activeTab === 'parties' && (
                  <PartiesView 
                    parties={parties} 
                    isLoading={isLoading} 
                    isPrivacyMode={isPrivacyMode}
                    onAddParty={() => setShowAddParty(true)}
                    onSelectParty={setSelectedParty}
                  />
                )}
                {activeTab === 'cashbook' && (
                  <CashbookView 
                    cashEntries={cashEntries} 
                    isLoading={isLoading} 
                    isPrivacyMode={isPrivacyMode}
                    onDeleteEntry={handleDeleteCashEntry}
                    onAddEntry={(type) => openCashModal(type)}
                  />
                )}
                {activeTab === 'transactions' && (
                  <TransactionsView 
                    cashEntries={cashEntries} 
                    parties={parties}
                    isLoading={isLoading} 
                    isPrivacyMode={isPrivacyMode}
                  />
                )}
                {activeTab === 'reports' && (
                  <ReportsView isPrivacyMode={isPrivacyMode} />
                )}
                {activeTab === 'settings' && (
                  <div className="p-12 text-center text-text-muted">Settings coming soon</div>
                )}
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
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <div className="flex flex-col text-left">
                  <span className="text-xl font-bold font-headline"><span className="text-text-dark">fin</span><span className="text-primary">thesia</span></span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted mt-1">Premium Ledger</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 -mr-2 text-text-muted hover:bg-slate-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              
              <div className="px-5 py-4">
                <button onClick={() => { setIsSidebarOpen(false); navigate('/dashboard'); }} className="flex items-center space-x-2 w-full px-4 py-2.5 bg-[#eaf8fa] text-primary focus:bg-[#d8f4f6] hover:bg-[#d8f4f6] rounded-xl text-sm font-bold transition-colors">
                  <ArrowLeft size={16} />
                  <span>Back to Dashboard</span>
                </button>
              </div>

              <nav className="flex-1 py-2 space-y-1 overflow-y-auto">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button 
                      key={tab.id} 
                      onClick={() => { setActiveTab(tab.id as TabView); setIsSidebarOpen(false); }}
                      className={cn(
                        "flex items-center w-full space-x-3 px-6 py-3.5 transition-all text-[15px] border-l-4",
                        activeTab === tab.id 
                          ? "bg-[#f0fafa] text-primary border-primary font-bold"
                          : "text-text-muted border-transparent hover:bg-slate-50 hover:text-text-dark font-medium"
                      )}>
                      <Icon size={20} /> <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
              
              <div className="p-5 space-y-2 border-t border-border">
                <button onClick={() => { setIsSidebarOpen(false); setShowCreateLedger(true); }} className="w-full py-3 bg-[#0f6466] text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2">
                  <Plus size={18} />
                  <span>New Ledger</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Global Modals for Ledger */}
      <CreateLedgerModal open={showCreateLedger} onClose={() => setShowCreateLedger(false)} />
      <AddUnifiedTransactionModal
        open={showTxModal} onClose={() => setShowTxModal(false)}
        onSaved={() => { fetchData(); setShowTxModal(false); }}
        parties={parties} defaultMode={txModalMode} defaultType={txModalType} defaultPartyId={txModalPartyId}
      />
      <AddPartyModal open={showAddParty} onClose={() => setShowAddParty(false)} onSaved={fetchData}/>
    </div>
  );
}
