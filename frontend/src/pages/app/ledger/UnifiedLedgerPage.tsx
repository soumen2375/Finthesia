import React, { useEffect, useState } from 'react';
import { useUI } from '@/context/UIContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, Users, LayoutDashboard, ScrollText, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import DashboardView from './views/DashboardView';
import CashbookView from './views/CashbookView';
import ReportsView from './views/ReportsView';
import AddUnifiedTransactionModal from './components/AddUnifiedTransactionModal';
import AddPartyModal from './components/AddPartyModal';
import PartyDetailView from './components/PartyDetailView';

import type { CashEntry, PartyInfo } from './types';

type TabView = 'dashboard' | 'parties' | 'cashbook' | 'reports';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'parties', label: 'Parties', icon: Users },
  { id: 'cashbook', label: 'Cashbook', icon: ScrollText },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
] as const;

export default function UnifiedLedgerPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabView>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Data
  const [cashEntries, setCashEntries] = useState<CashEntry[]>([]);
  const [parties, setParties] = useState<PartyInfo[]>([]);

  // Modals & Navigation State
  const [showTxModal, setShowTxModal] = useState(false);
  const [txModalMode, setTxModalMode] = useState<'cash' | 'party'>('cash');
  const [txModalType, setTxModalType] = useState<'cash_in' | 'cash_out' | 'gave' | 'got'>('cash_in');
  const [txModalPartyId, setTxModalPartyId] = useState('');
  
  const [showAddParty, setShowAddParty] = useState(false);
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

  // If a specific party is selected, render the PartyDetailView entirely
  if (selectedParty) {
    return (
      <div className="font-sans">
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
    <div className="space-y-6 pb-12 font-sans tracking-tight">
      {/* Universal Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] shadow-sm border border-border">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2.5 rounded-full bg-background border border-border shadow-sm hover:bg-slate-50 text-text-muted transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold font-headline text-text-dark tracking-tight">Finthesia Onyx</h2>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Premium Ledger</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-background rounded-full border border-border overflow-x-auto hide-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as TabView)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                  isActive ? "bg-card text-primary shadow-sm" : "text-text-muted hover:text-text-dark hover:bg-slate-50/50"
                )}>
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {(activeTab === 'dashboard' || activeTab === 'parties') && (
            <DashboardView 
              cashEntries={cashEntries} 
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
            />
          )}
          {activeTab === 'reports' && (
            <ReportsView isPrivacyMode={isPrivacyMode} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Global Modals for Ledger */}
      <AddUnifiedTransactionModal
        open={showTxModal} onClose={() => setShowTxModal(false)}
        onSaved={() => { fetchData(); setShowTxModal(false); }}
        parties={parties} defaultMode={txModalMode} defaultType={txModalType} defaultPartyId={txModalPartyId}
      />
      <AddPartyModal open={showAddParty} onClose={() => setShowAddParty(false)} onSaved={fetchData}/>

      {/* Floating Action Button (Global Add Transaction) */}
      {!selectedParty && (
        <button onClick={() => setShowTxModal(true)} 
          className="fixed bottom-8 right-8 md:bottom-12 md:right-12 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group">
          <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      )}
    </div>
  );
}
