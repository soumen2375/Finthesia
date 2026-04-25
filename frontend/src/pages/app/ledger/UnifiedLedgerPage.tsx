import React, { useEffect, useState, useRef } from 'react';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/context/ToastContext';
import { 
  ArrowLeft, Users, LayoutDashboard, ScrollText, 
  Settings, Menu, X, Plus, ChevronDown, HelpCircle, LogOut,
  Search, FileText, Moon, Sun, Eye, EyeOff, BookOpen, Check, User
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import DashboardView from './views/DashboardView';
import CashbookView from './views/CashbookView';
import TransactionsView from './views/TransactionsView';
import PartiesView from './views/PartiesView';
import SettingsView from './views/SettingsView';
import AddUnifiedTransactionModal from './components/AddUnifiedTransactionModal';
import AddPartyModal from './components/AddPartyModal';
import PartyDetailView from './components/PartyDetailView';
import CreateLedgerModal from './components/CreateLedgerModal';

import type { CashEntry, PartyInfo, Ledger } from './types';

type TabView = 'dashboard' | 'parties' | 'transactions' | 'cashbook' | 'settings';
type PartiesFilter = 'all' | 'give' | 'get';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'parties', label: 'Parties', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: FileText },
  { id: 'cashbook', label: 'Cashbook', icon: ScrollText },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

export default function UnifiedLedgerPage() {
  const { isPrivacyMode, togglePrivacyMode, isDarkMode, toggleDarkMode, refreshKey } = useUI();
  const { currentUser, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabView>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileLedgerExpanded, setMobileLedgerExpanded] = useState(false);

  // Parties filter from dashboard navigation
  const [partiesFilter, setPartiesFilter] = useState<PartiesFilter>('all');

  // Switch Ledger dropdown state
  const [showLedgerDropdown, setShowLedgerDropdown] = useState(false);
  const ledgerDropdownRef = useRef<HTMLDivElement>(null);

  // Profile dropdown state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Ledger States
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [activeLedger, setActiveLedger] = useState<Ledger | null>(null);

  // Global search
  const [globalSearch, setGlobalSearch] = useState('');

  // Data
  const [cashEntries, setCashEntries] = useState<CashEntry[]>([]);
  const [parties, setParties] = useState<PartyInfo[]>([]);

  // Modals & Navigation State
  const [showTxModal, setShowTxModal] = useState(false);
  const [txModalMode, setTxModalMode] = useState<'cash' | 'party'>('cash');
  const [txModalType, setTxModalType] = useState<'cash_in' | 'cash_out' | 'gave' | 'got'>('cash_in');
  const [txModalPartyId, setTxModalPartyId] = useState('');
  
  const [showAddParty, setShowAddParty] = useState(false);
  const [addPartyType, setAddPartyType] = useState<'customer' | 'vendor'>('customer');
  const [showCreateLedger, setShowCreateLedger] = useState(false);
  const [selectedParty, setSelectedParty] = useState<PartyInfo | null>(null);

  // Handle URL params for navigation from main dashboard
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'give' || filter === 'get') {
      setActiveTab('parties');
      setPartiesFilter(filter);
    }
  }, [searchParams]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ledgerDropdownRef.current && !ledgerDropdownRef.current.contains(e.target as Node)) {
        setShowLedgerDropdown(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Data Fetching
  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let currentLedgerId = activeLedger?.id;
    
    // Fetch ledgers
    const { data: ledgerData } = await supabase.from('ledgers').select('*').eq('user_id', user.id).order('created_at');
    
    if (ledgerData && ledgerData.length > 0) {
      setLedgers(ledgerData);
      if (!currentLedgerId || !ledgerData.find(l => l.id === currentLedgerId)) {
        const def = ledgerData.find(l => l.is_default) || ledgerData[0];
        currentLedgerId = def.id;
        setActiveLedger(def);
      }
    } else {
      const fallbackId = crypto.randomUUID();
      await supabase.from('ledgers').insert({
        id: fallbackId, user_id: user.id, name: 'My Personal Ledger', description: 'Your default personal ledger', is_default: true, is_active: true
      });
      const newL: any = { id: fallbackId, name: 'My Personal Ledger', is_default: true, user_id: user.id };
      setLedgers([newL]);
      currentLedgerId = fallbackId;
      setActiveLedger(newL);
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    const [cRes, pRes] = await Promise.all([
      supabase.from('cashbook_entries').select('*')
        .eq('user_id', user.id)
        .eq('ledger_id', currentLedgerId)
        .gte('entry_date', startDate)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase.from('party_ledger_parties').select('*')
        .eq('user_id', user.id)
        .eq('ledger_id', currentLedgerId)
        .order('name')
    ]);

    if (cRes.data) setCashEntries(cRes.data);
    if (pRes.data) setParties(pRes.data);
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [refreshKey, activeLedger?.id]);

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

  const handleNavigateToParties = (filter: 'give' | 'get') => {
    setPartiesFilter(filter);
    setActiveTab('parties');
  };

  const handleOpenAddParty = (type?: 'customer' | 'vendor') => {
    setAddPartyType(type || 'customer');
    setShowAddParty(true);
  };

  const handleNavigateToTab = (tab: string) => {
    if (['dashboard', 'parties', 'transactions', 'cashbook', 'settings'].includes(tab)) {
      setActiveTab(tab as TabView);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // If a specific party is selected, render the PartyDetailView entirely
  if (selectedParty) {
    return (
      <div className="font-sans min-h-screen bg-background p-3 sm:p-6 md:p-8">
        <PartyDetailView
          party={selectedParty}
          isPrivacyMode={isPrivacyMode}
          onBack={() => { setSelectedParty(null); fetchData(); }}
          onAddTransaction={(type) => openPartyTxModal(selectedParty.id, type)}
          onRefresh={fetchData}
        />
        <AddUnifiedTransactionModal
          open={showTxModal} onClose={() => setShowTxModal(false)} onSaved={() => { fetchData(); setShowTxModal(false); }}
          parties={parties} defaultMode={txModalMode} defaultType={txModalType} defaultPartyId={txModalPartyId}
          ledgerId={activeLedger?.id}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex font-sans tracking-tight">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col sticky top-0 h-screen z-40">
        <div className="px-6 py-6 pb-2">
          <div className="flex flex-col text-left">
            <span className="text-2xl font-bold font-headline"><span className="text-text-dark">fin</span><span className="text-primary">thesia</span></span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted mt-1">Premium Ledger</span>
          </div>
        </div>
        
        <div className="px-5 py-4 mt-2">
          <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-2 w-full px-4 py-2.5 bg-primary/10 text-primary focus:bg-primary/15 hover:bg-primary/15 rounded-xl text-sm font-bold transition-colors">
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
                onClick={() => { setActiveTab(tab.id as TabView); if (tab.id !== 'parties') setPartiesFilter('all'); }}
                className={cn(
                  "flex items-center w-full space-x-3 px-6 py-3.5 transition-all duration-200 text-[15px] border-l-4",
                  isActive 
                    ? "bg-primary/10 text-primary border-primary font-bold"
                    : "text-text-muted border-transparent hover:bg-background hover:text-text-dark font-medium"
                )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} /> 
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-5 space-y-2 border-t border-border">
          <button onClick={() => setShowCreateLedger(true)} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md shadow-primary/20 hover:opacity-90 transition-colors flex items-center justify-center space-x-2">
            <Plus size={18} />
            <span>New Ledger</span>
          </button>
          <div className="grid grid-cols-2 gap-2 mt-4">
             <button className="flex items-center justify-center space-x-2 px-3 py-2 text-text-muted hover:text-text-dark hover:bg-background rounded-lg transition-colors text-xs font-medium">
               <HelpCircle size={16} />
               <span>Help</span>
             </button>
             <button onClick={signOut} className="flex items-center justify-center space-x-2 px-3 py-2 text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-xs font-medium">
               <LogOut size={16} />
               <span>Sign Out</span>
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 md:px-8 py-3 w-full flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 md:flex-none">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-text-muted hover:bg-background transition-colors"
            >
              <Menu size={24} />
            </button>

            {/* Mobile Ledger Name */}
            <div className="lg:hidden flex items-center gap-2">
              <BookOpen size={16} className="text-primary" />
              <span className="text-sm font-bold text-text-dark truncate max-w-[120px]">{activeLedger?.name || 'Ledger'}</span>
            </div>
            
            {/* Search Bar - only visible on md+ */}
            <div className="hidden md:flex relative w-80 lg:w-96">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text" placeholder="Search transactions, parties..."
                value={globalSearch} onChange={e => setGlobalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-text-dark focus:ring-1 focus:ring-primary focus:outline-none transition-shadow"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Dark Mode Toggle */}
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-background transition-colors text-text-muted">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {/* Privacy Toggle */}
            <button onClick={togglePrivacyMode} className="p-2 rounded-full hover:bg-background transition-colors text-text-muted">
              {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            {/* Switch Ledger Dropdown — visible on sm+ */}
            <div className="hidden sm:flex items-center relative" ref={ledgerDropdownRef}>
              <button 
                onClick={() => setShowLedgerDropdown(!showLedgerDropdown)}
                className="flex items-center space-x-2 bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity max-w-[200px]"
              >
                <BookOpen size={16} className="shrink-0" />
                <span className="truncate">{activeLedger?.name || 'Default Ledger'}</span>
                <ChevronDown size={16} className={cn("transition-transform shrink-0", showLedgerDropdown && "rotate-180")} />
              </button>
              {showLedgerDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-card rounded-xl shadow-xl border border-border py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">Your Ledgers</div>
                  <div className="max-h-60 overflow-y-auto">
                    {ledgers.map(l => (
                      <button
                        key={l.id}
                        onClick={() => { setActiveLedger(l); setShowLedgerDropdown(false); }}
                        className="w-full px-4 py-2 text-left text-sm font-bold hover:bg-background flex items-center justify-between transition-colors"
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className={cn("truncate", activeLedger?.id === l.id ? "text-primary" : "text-text-dark")}>{l.name}</span>
                          {l.is_default && <span className="text-[10px] text-text-muted font-normal">Default</span>}
                        </div>
                        {activeLedger?.id === l.id && <Check size={16} className="text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-border my-1" />
                  <button 
                    onClick={() => { setShowLedgerDropdown(false); setShowCreateLedger(true); }}
                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-primary hover:bg-primary/5 flex items-center space-x-2 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Create New Ledger</span>
                  </button>
                </div>
              )}
            </div>

            {/* Profile Avatar with dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-sm overflow-hidden border border-primary/20 hover:ring-2 hover:ring-primary/30 transition-all"
              >
                {currentUser?.user_metadata?.avatar_url ? (
                  <img src={currentUser.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  getInitials(currentUser?.user_metadata?.full_name || currentUser?.email)
                )}
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-xl border border-border py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-bold text-text-dark truncate">{currentUser?.user_metadata?.full_name || 'User'}</p>
                    <p className="text-xs text-text-muted truncate">{currentUser?.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-text-dark hover:bg-background flex items-center gap-2 transition-colors"
                  >
                    <User size={14} /> Account Settings
                  </button>
                  <button
                    onClick={() => { setShowProfileMenu(false); setActiveTab('settings'); }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-text-dark hover:bg-background flex items-center gap-2 transition-colors"
                  >
                    <Settings size={14} /> Ledger Settings
                  </button>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={() => { setShowProfileMenu(false); signOut(); }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger/5 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 pb-24 lg:pb-8 relative">
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
                    onAddParty={() => handleOpenAddParty('customer')}
                    onSelectParty={setSelectedParty}
                    onNavigateToParties={handleNavigateToParties}
                    onNavigateToTab={handleNavigateToTab}
                    onAddCashEntry={openCashModal}
                    userName={currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User'}
                  />
                )}
                {activeTab === 'parties' && (
                  <PartiesView 
                    parties={parties}
                    cashEntries={cashEntries}
                    isLoading={isLoading} 
                    isPrivacyMode={isPrivacyMode}
                    onAddParty={handleOpenAddParty}
                    onSelectParty={setSelectedParty}
                    searchQuery={globalSearch}
                    setSearchQuery={setGlobalSearch}
                    activeLedgerId={activeLedger?.id}
                  />
                )}
                {activeTab === 'cashbook' && (
                  <CashbookView 
                    cashEntries={cashEntries} 
                    isLoading={isLoading} 
                    isPrivacyMode={isPrivacyMode}
                    onDeleteEntry={handleDeleteCashEntry}
                    onAddEntry={(type) => openCashModal(type)}
                    onRefresh={fetchData}
                  />
                )}
                {activeTab === 'transactions' && (
                  <TransactionsView isPrivacyMode={isPrivacyMode} />
                )}
                {activeTab === 'settings' && (
                  <SettingsView
                    activeLedger={activeLedger}
                    ledgers={activeLedger ? [activeLedger] : []}
                    onLedgersChanged={fetchData}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border px-2 py-1.5 pb-safe-area-inset-bottom">
        <div className="flex items-center justify-around">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabView)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-all min-w-0",
                  isActive ? "text-primary" : "text-text-muted"
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-card z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <div className="flex flex-col text-left">
                  <span className="text-xl font-bold font-headline"><span className="text-text-dark">fin</span><span className="text-primary">thesia</span></span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted mt-1">Premium Ledger</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 -mr-2 text-text-muted hover:bg-background rounded-lg">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Ledger Switcher — collapsible dropdown */}
              <div className="px-5 py-4 border-b border-border space-y-2">
                <button
                  onClick={() => setMobileLedgerExpanded(!mobileLedgerExpanded)}
                  className="w-full flex items-center justify-between px-3 py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <BookOpen size={16} className="shrink-0" />
                    <div className="flex flex-col items-start truncate">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Active Ledger</span>
                      <span className="text-sm font-bold truncate">{activeLedger?.name || 'Select Ledger'}</span>
                    </div>
                  </div>
                  <ChevronDown size={18} className={cn("transition-transform shrink-0", mobileLedgerExpanded && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {mobileLedgerExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1.5 pt-1 max-h-40 overflow-y-auto">
                        {ledgers.map(l => (
                          <button
                            key={l.id}
                            onClick={() => { setActiveLedger(l); setMobileLedgerExpanded(false); }}
                            className={cn(
                              "w-full px-3 py-2.5 rounded-xl text-left text-sm font-bold flex items-center justify-between transition-colors",
                              activeLedger?.id === l.id
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-background text-text-dark hover:bg-border/30 border border-transparent"
                            )}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <BookOpen size={14} className="shrink-0" />
                              <span className="truncate">{l.name}</span>
                            </div>
                            {activeLedger?.id === l.id && <Check size={14} className="text-primary shrink-0" />}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => { setIsSidebarOpen(false); setMobileLedgerExpanded(false); setShowCreateLedger(true); }}
                        className="w-full mt-2 px-3 py-2 rounded-xl text-sm font-bold text-primary bg-primary/5 border border-primary/20 flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
                      >
                        <Plus size={14} /> New Ledger
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="px-5 py-4">
                <button onClick={() => { setIsSidebarOpen(false); navigate('/dashboard'); }} className="flex items-center space-x-2 w-full px-4 py-2.5 bg-primary/10 text-primary focus:bg-primary/15 hover:bg-primary/15 rounded-xl text-sm font-bold transition-colors">
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
                          ? "bg-primary/10 text-primary border-primary font-bold"
                          : "text-text-muted border-transparent hover:bg-background hover:text-text-dark font-medium"
                      )}>
                      <Icon size={20} /> <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
              
              <div className="p-5 space-y-2 border-t border-border">
                <button onClick={signOut} className="w-full py-3 border border-border text-text-muted rounded-xl font-bold text-sm flex items-center justify-center space-x-2 hover:text-danger hover:border-danger/30 transition-colors">
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Global Modals for Ledger */}
      <CreateLedgerModal open={showCreateLedger} onClose={() => setShowCreateLedger(false)} onSaved={(newId) => {
        fetchData();
        setShowCreateLedger(false);
      }} />
      <AddUnifiedTransactionModal
        open={showTxModal} onClose={() => setShowTxModal(false)}
        onSaved={() => { fetchData(); setShowTxModal(false); }}
        parties={parties} defaultMode={txModalMode} defaultType={txModalType} defaultPartyId={txModalPartyId}
        ledgerId={activeLedger?.id}
      />
      <AddPartyModal 
        open={showAddParty} onClose={() => setShowAddParty(false)} 
        onSaved={fetchData} defaultType={addPartyType} 
        ledgerId={activeLedger?.id} 
      />
    </div>
  );
}
