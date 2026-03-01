import React, { useEffect, useState } from 'react';
import { useUI } from '../context/UIContext';
import { 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Building2,
  Wallet,
  Coins,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api, Asset, Liability } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../lib/formatters';

const assetCategories = [
  { id: 'savings', label: 'Savings', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'investments', label: 'Investments', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'real_estate', label: 'Real Estate', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'crypto', label: 'Crypto', icon: Coins, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const liabilityTypes = [
  { id: 'mortgage', label: 'Mortgage' },
  { id: 'loan', label: 'Personal Loan' },
  { id: 'student_loan', label: 'Student Loan' },
  { id: 'other', label: 'Other Debt' },
];

export default function NetWorthPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const { showToast } = useToast();
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isLiabilityModalOpen, setIsLiabilityModalOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [assetsData, liabilitiesData] = await Promise.all([
        api.getAssets(),
        api.getLiabilities()
      ]);
      setAssets(assetsData);
      setLiabilities(liabilitiesData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const totalAssets = assets.reduce((acc, curr) => acc + Number(curr.current_value), 0);
  const totalLiabilities = liabilities.reduce((acc, curr) => acc + Number(curr.balance), 0);
  const netWorth = totalAssets - totalLiabilities;

  const handleAddAsset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAsset: Asset = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      current_value: Number(formData.get('value')),
    };
    await api.addAsset(newAsset);
    setIsAssetModalOpen(false);
    showToast(`${newAsset.name} added successfully!`, 'success');
    fetchData();
  };

  const handleAddLiability = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newLiability: Liability = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      balance: Number(formData.get('balance')),
    };
    await api.addLiability(newLiability);
    setIsLiabilityModalOpen(false);
    showToast(`${newLiability.name} added successfully!`, 'success');
    fetchData();
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header Summary */}
      <div className="text-center space-y-2 animate-slam">
        <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Current Net Worth</p>
        <h2 className="text-5xl font-bold text-slate-900 tracking-tight">
          {formatCurrency(netWorth, isPrivacyMode)}
        </h2>
        <div className="flex items-center justify-center space-x-2">
          <span className="flex items-center text-emerald-500 text-sm font-bold">
            <ArrowUpRight size={16} className="mr-1" />
            +0.0%
          </span>
          <span className="text-slate-400 text-sm font-medium">this month</span>
        </div>
      </div>

      {/* Assets Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-bold text-slate-900">Assets</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsAssetModalOpen(true)}>
            <Plus size={18} className="mr-1" /> Add
          </Button>
        </div>
        <div className="grid gap-4">
          {assetCategories.map((cat) => {
            const catAssets = assets.filter(a => a.category === cat.id);
            const catTotal = catAssets.reduce((acc, curr) => acc + Number(curr.current_value), 0);
            
            return (
              <div key={cat.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-blue-200 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", cat.bg, cat.color)}>
                    <cat.icon size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{cat.label}</p>
                    <p className="text-xs text-slate-500">{catAssets.length} items</p>
                  </div>
                </div>
                <div className="text-right flex items-center space-x-3">
                  <p className="font-bold text-slate-900">{formatCurrency(catTotal, isPrivacyMode)}</p>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Liabilities Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-bold text-slate-900">Liabilities</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsLiabilityModalOpen(true)}>
            <Plus size={18} className="mr-1" /> Add
          </Button>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[100px]">
          {isLoading ? (
            <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
          ) : liabilities.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No liabilities tracked yet.</div>
          ) : (
            liabilities.map((lib, i) => (
              <div key={lib.id} className={cn(
                "p-5 flex items-center justify-between",
                i !== liabilities.length - 1 && "border-b border-slate-50"
              )}>
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} className="rotate-180" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{lib.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{lib.type}</p>
                  </div>
                </div>
                <p className="font-bold text-slate-900">{formatCurrency(lib.balance, isPrivacyMode)}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Modal for adding asset */}
      <Modal 
        isOpen={isAssetModalOpen} 
        onClose={() => setIsAssetModalOpen(false)} 
        title="Add Asset"
      >
        <form className="space-y-4" onSubmit={handleAddAsset}>
          <Input name="name" label="Asset Name" placeholder="e.g. Vanguard Index Fund" required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 ml-1">Category</label>
            <select name="category" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all">
              {assetCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <Input name="value" label="Current Value (₹)" type="number" placeholder="0" required />
          <div className="pt-4">
            <Button type="submit" className="w-full">Save Asset</Button>
          </div>
        </form>
      </Modal>

      {/* Modal for adding liability */}
      <Modal 
        isOpen={isLiabilityModalOpen} 
        onClose={() => setIsLiabilityModalOpen(false)} 
        title="Add Liability"
      >
        <form className="space-y-4" onSubmit={handleAddLiability}>
          <Input name="name" label="Liability Name" placeholder="e.g. Home Mortgage" required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 ml-1">Type</label>
            <select name="type" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all">
              {liabilityTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <Input name="balance" label="Current Balance (₹)" type="number" placeholder="0" required />
          <div className="pt-4">
            <Button type="submit" className="w-full">Save Liability</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
