import React, { useEffect, useState, useMemo } from 'react';
import { useUI } from '@/context/UIContext';
import { useNavigate } from 'react-router-dom';
import { api, Asset } from '@/services/api';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/context/ToastContext';
import {
  Wallet, Briefcase, Building2, Car, ShieldCheck, Package,
  Plus, Pencil, Trash2, ArrowLeft,
  PieChart as PieChartIcon, ChevronDown, ChevronUp, TrendingUp
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip as RechartsTooltip
} from 'recharts';
import { AddAssetModal } from '@/components/app/AddAssetModal';

export const ASSET_CATEGORIES = [
  {
    id: 'bank_accounts', label: 'Bank Accounts', icon: Wallet, color: '#27C4E1', bg: 'bg-[#27C4E1]', bgLight: 'bg-[#27C4E1]/10', textColor: 'text-[#27C4E1]',
    subcategories: ['Savings Account', 'Current Account', 'Salary Account', 'Fixed Deposit (FD)', 'Recurring Deposit (RD)', 'Cash Wallet', 'UPI Wallet Balance']
  },
  {
    id: 'investments', label: 'Investments', icon: Briefcase, color: '#6366F1', bg: 'bg-indigo-500', bgLight: 'bg-indigo-500/10', textColor: 'text-indigo-500',
    subcategories: ['Stocks / Equity', 'Mutual Funds', 'ETFs', 'Bonds', 'Cryptocurrency', 'Gold Investments', 'Index Funds', 'Startup / Private Equity']
  },
  {
    id: 'real_estate', label: 'Real Estate', icon: Building2, color: '#F59E0B', bg: 'bg-amber-500', bgLight: 'bg-amber-500/10', textColor: 'text-amber-500',
    subcategories: ['Primary Residence', 'Rental Property', 'Commercial Property', 'Land / Plot']
  },
  {
    id: 'vehicles', label: 'Vehicles', icon: Car, color: '#8B5CF6', bg: 'bg-violet-500', bgLight: 'bg-violet-500/10', textColor: 'text-violet-500',
    subcategories: ['Car', 'Bike / Motorcycle', 'Electric Vehicle', 'Commercial Vehicle']
  },
  {
    id: 'retirement', label: 'Retirement Funds', icon: ShieldCheck, color: '#22C55E', bg: 'bg-emerald-500', bgLight: 'bg-emerald-500/10', textColor: 'text-emerald-500',
    subcategories: ['EPF (Employee Provident Fund)', 'PPF (Public Provident Fund)', 'NPS (National Pension System)', 'Pension Plans', 'Retirement Mutual Funds']
  },
  {
    id: 'other', label: 'Other Assets', icon: Package, color: '#6B7280', bg: 'bg-gray-500', bgLight: 'bg-gray-500/10', textColor: 'text-gray-500',
    subcategories: ['Gold Jewellery', 'Collectibles', 'Business Ownership', 'Digital Assets', 'Emergency Cash', 'Insurance Cash Value']
  },
];

export function getAssetCategoryConfig(cat: string) {
  return ASSET_CATEGORIES.find(c => c.id === cat) || ASSET_CATEGORIES[ASSET_CATEGORIES.length - 1];
}

export default function AssetsPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAssets();
      setAssets(data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [refreshKey]);

  // Bank-injected assets (id starts with 'bank-asset-') are virtual — they
  // are derived from the banks table and cannot be deleted here.
  const isBankAsset = (id: string) => id.startsWith('bank-asset-');

  const handleDelete = async (id: string) => {
    if (isBankAsset(id)) {
      setDeleteConfirm(null);
      showToast('This is a bank account balance. Go to Bank Accounts to manage it.', 'error');
      return;
    }
    try {
      await api.deleteAsset(id);
      setDeleteConfirm(null);
      showToast('Asset deleted', 'success');
      fetchData();
    } catch (error) {
      console.error('Failed to delete:', error);
      showToast('Failed to delete asset', 'error');
    }
  };

  const totalAssets = assets.reduce((s, a) => s + Number(a.current_value), 0);

  const grouped = useMemo(() => {
    const map: Record<string, Asset[]> = {};
    assets.forEach(a => {
      const cat = a.category || 'other';
      if (!map[cat]) map[cat] = [];
      map[cat].push(a);
    });
    return map;
  }, [assets]);

  const pieData = useMemo(() => {
    return ASSET_CATEGORIES
      .map(cat => ({
        name: cat.label,
        value: (grouped[cat.id] || []).reduce((s, a) => s + Number(a.current_value), 0),
        color: cat.color,
      }))
      .filter(d => d.value > 0);
  }, [grouped]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-56 bg-slate-200/20 rounded-[2rem]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-200/20 rounded-[2rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-sans tracking-tight">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#27C4E1] via-[#1EB0CC] to-[#0EA5E9] rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 text-white shadow-2xl animate-slam">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4 flex-1">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/net-worth')}
                className="h-10 w-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="inline-flex items-center px-4 py-1.5 bg-white/20 text-white text-[10px] font-bold uppercase rounded-full tracking-widest">
                <TrendingUp size={14} className="mr-2 stroke-[3]" />
                Asset Dashboard
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter">
                {formatCurrency(totalAssets, isPrivacyMode)}
              </h1>
              <p className="text-white/60 text-sm font-medium">
                Total across {assets.length} asset{assets.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setEditingAsset(null); setIsModalOpen(true); }}
            className="h-[4.5rem] w-[4.5rem] bg-white text-[#27C4E1] hover:bg-gray-100 rounded-3xl flex items-center justify-center transition-all shadow-xl group shrink-0"
          >
            <Plus size={32} className="group-hover:rotate-90 transition-transform stroke-[2.5]" />
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
      </section>

      {/* Chart + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Pie Chart */}
        <section className="lg:col-span-2 bg-card p-6 lg:p-8 rounded-[2rem] shadow-xl border border-border animate-slam" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-[#27C4E1]/10 text-[#27C4E1] rounded-xl flex items-center justify-center">
              <PieChartIcon size={20} />
            </div>
            <h3 className="text-lg font-bold text-text-dark">Asset Allocation</h3>
          </div>
          <div className="h-[260px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="99%" height="99%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => formatCurrency(value, isPrivacyMode)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-card)', color: 'var(--color-text-dark)' }}
                    itemStyle={{ color: 'var(--color-text-dark)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted italic text-sm">
                Add assets to see allocation
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {pieData.map(entry => (
              <div key={entry.name} className="flex items-center space-x-2">
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-bold text-text-muted truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Category Cards */}
        <section className="lg:col-span-3 space-y-4 animate-slam" style={{ animationDelay: '0.15s' }}>
          {ASSET_CATEGORIES.map((cat) => {
            const items = grouped[cat.id] || [];
            const catTotal = items.reduce((s, a) => s + Number(a.current_value), 0);
            const isExpanded = expandedCategory === cat.id;

            if (items.length === 0) return null;

            return (
              <div key={cat.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg", cat.bg)}>
                      <cat.icon size={22} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-text-dark">{cat.label}</p>
                      <p className="text-text-muted text-xs">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="font-bold text-text-dark text-lg">{formatCurrency(catTotal, isPrivacyMode)}</p>
                    {isExpanded ? <ChevronUp size={20} className="text-text-muted" /> : <ChevronDown size={20} className="text-text-muted" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border divide-y divide-border">
                        {items.map((asset) => (
                          <div key={asset.id} className="p-5 hover:bg-background/30 transition-all relative">
                            {deleteConfirm === asset.id && (
                              <div className="absolute inset-0 bg-card/95 backdrop-blur-sm z-10 flex items-center justify-center space-x-3 p-4">
                                <p className="font-bold text-text-dark text-sm">Delete?</p>
                                <button onClick={() => handleDelete(asset.id)} className="px-4 py-1.5 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-600 transition-colors">Yes</button>
                                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-1.5 bg-background border border-border text-text-dark rounded-lg font-bold text-sm transition-colors">No</button>
                              </div>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-bold text-text-dark truncate text-sm sm:text-base">{asset.name}</p>
                                  {asset.subcategory && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-background border border-border text-text-muted shrink-0">
                                      {asset.subcategory}
                                    </span>
                                  )}
                                </div>
                                {asset.notes && (
                                  <p className="text-text-muted text-xs truncate">{asset.notes}</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 shrink-0 self-end sm:self-auto">
                                <p className="text-lg sm:text-xl font-bold text-text-dark">{formatCurrency(asset.current_value, isPrivacyMode)}</p>
                                 <div className="flex items-center space-x-1">
                                   {isBankAsset(asset.id) ? (
                                     <span
                                       className="px-2 py-1.5 rounded-lg bg-background border border-border text-[9px] font-bold text-text-muted uppercase tracking-widest cursor-default select-none"
                                       title="Managed via Bank Accounts"
                                     >
                                       Auto
                                     </span>
                                   ) : (
                                     <>
                                       <button
                                         onClick={() => { setEditingAsset(asset); setIsModalOpen(true); }}
                                         className="p-1.5 rounded-lg bg-background border border-border text-text-muted hover:text-text-dark transition-colors"
                                         title="Edit"
                                       >
                                         <Pencil size={14} />
                                       </button>
                                       <button
                                         onClick={() => setDeleteConfirm(asset.id)}
                                         className="p-1.5 rounded-lg bg-background border border-border text-text-muted hover:text-red-500 transition-colors"
                                         title="Delete"
                                       >
                                         <Trash2 size={14} />
                                       </button>
                                     </>
                                   )}
                                 </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {assets.length === 0 && (
            <div className="bg-card p-12 rounded-[2.5rem] shadow-xl border border-border text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center border border-border">
                  <Wallet size={32} className="text-border" strokeWidth={2} />
                </div>
                <p className="font-bold text-text-dark text-lg">No assets tracked</p>
                <p className="text-text-muted text-sm max-w-md">
                  Add your bank accounts, investments, real estate, and other assets to track your total wealth.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-primary mt-2 flex items-center space-x-2"
                >
                  <Plus size={18} />
                  <span>Add Asset</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <AddAssetModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingAsset(null); }}
        onSaved={fetchData}
        editingAsset={editingAsset}
      />
    </div>
  );
}
