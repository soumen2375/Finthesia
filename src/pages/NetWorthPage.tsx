import React, { useEffect, useState, useMemo } from 'react';
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
  ChevronRight,
  ShieldCheck,
  Landmark,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api, Asset, Liability } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatCurrencyCompact } from '../lib/formatters';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';

const assetCategories = [
  { id: 'savings', label: 'Savings', icon: Wallet, color: 'text-secondary', bg: 'bg-secondary/10' },
  { id: 'investments', label: 'Investments', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'crypto', label: 'Crypto', icon: Coins, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'real_estate', label: 'Real Estate', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'gold', label: 'Gold', icon: Coins, color: 'text-warning', bg: 'bg-warning/10' },
  { id: 'retirement', label: 'PF / Retirement', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10' },
];

const liabilityTypes = [
  { id: 'mortgage', label: 'Mortgage' },
  { id: 'loan', label: 'Personal Loan' },
  { id: 'student_loan', label: 'Student Loan' },
  { id: 'credit_card', label: 'Credit Card Debt' },
  { id: 'other', label: 'Other Debt' },
];

const COLORS = ['#2D7FF9', '#6366F1', '#22C55E', '#F59E0B', '#D97706', '#00C853'];

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

  const totalInvestments = useMemo(() => 
    assets.filter(a => ['investments', 'crypto', 'gold', 'retirement'].includes(a.category))
      .reduce((acc, curr) => acc + Number(curr.current_value), 0)
  , [assets]);

  const pieData = useMemo(() => {
    return assetCategories.map(cat => ({
      name: cat.label,
      value: assets.filter(a => a.category === cat.id).reduce((acc, curr) => acc + Number(curr.current_value), 0)
    })).filter(d => d.value > 0);
  }, [assets]);

  // Mock growth data
  const growthData = [
    { name: 'Oct', value: netWorth * 0.85 },
    { name: 'Nov', value: netWorth * 0.92 },
    { name: 'Dec', value: netWorth * 0.88 },
    { name: 'Jan', value: netWorth * 0.95 },
    { name: 'Feb', value: netWorth * 0.98 },
    { name: 'Mar', value: netWorth },
  ];

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
    <div className="space-y-8 pb-12">
      {/* Section 1: Total Net Worth Summary */}
      <section className="text-center space-y-3 animate-slam py-8">
        <p className="text-text-muted text-sm font-bold uppercase tracking-[0.2em]">Total Net Worth</p>
        <h2 className="text-6xl font-black text-text-dark tracking-tight">
          {formatCurrency(netWorth, isPrivacyMode)}
        </h2>
        <div className="flex items-center justify-center space-x-2">
          <div className="flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
            <ArrowUpRight size={14} className="mr-1" />
            +4.2%
          </div>
          <span className="text-text-muted text-xs font-bold uppercase tracking-wider">this month</span>
        </div>
      </section>

      {/* Section 2: Breakdown Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Assets', value: totalAssets, icon: Wallet, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Liabilities', value: totalLiabilities, icon: TrendingUp, color: 'text-danger', bg: 'bg-danger/10', rotate: true },
          { label: 'Investments', value: totalInvestments, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((item) => (
          <div key={item.label} className="card group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm", item.bg, item.color)}>
                <item.icon size={24} className={cn(item.rotate && "rotate-180")} />
              </div>
              <ChevronRight size={18} className="text-text-muted group-hover:text-text-dark transition-colors" />
            </div>
            <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">{item.label}</p>
            <h3 className="text-2xl font-bold text-text-dark">{formatCurrency(item.value, isPrivacyMode)}</h3>
          </div>
        ))}
      </section>

      {/* Section 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Asset Allocation Chart */}
        <section className="card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                <PieChartIcon size={20} />
              </div>
              <h3 className="text-lg font-bold text-text-dark">Asset Allocation</h3>
            </div>
          </div>
          
          <div className="h-[300px] w-full relative min-h-0 min-w-0 flex-1">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="99%" height="99%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => formatCurrency(value, isPrivacyMode)}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-card)', color: 'var(--color-text-dark)' }}
                    itemStyle={{ color: 'var(--color-text-dark)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-text-muted italic text-sm">
                Add assets to see allocation
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs font-bold text-text-muted">{entry.name}</span>
                <span className="text-xs text-text-muted/60">({((entry.value / totalAssets) * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </section>

        {/* Net Worth Growth Chart */}
        <section className="card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <LineChartIcon size={20} />
              </div>
              <h3 className="text-lg font-bold text-text-dark">Net Worth Growth</h3>
            </div>
          </div>

          <div className="h-[300px] w-full min-h-0 min-w-0 flex-1">
            <ResponsiveContainer width="99%" height="99%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C853" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} tickFormatter={(v) => formatCurrencyCompact(v, isPrivacyMode)} />
                <RechartsTooltip 
                  formatter={(value: number) => formatCurrency(value, isPrivacyMode)}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-card)', color: 'var(--color-text-dark)' }}
                  itemStyle={{ color: 'var(--color-text-dark)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#00C853" strokeWidth={3} fillOpacity={1} fill="url(#colorNetWorth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Detailed Assets List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-bold text-text-dark">Asset Details</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsAssetModalOpen(true)}>
            <Plus size={18} className="mr-1" /> Add Asset
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assetCategories.map((cat) => {
            const catAssets = assets.filter(a => a.category === cat.id);
            const catTotal = catAssets.reduce((acc, curr) => acc + Number(curr.current_value), 0);
            
            return (
              <div key={cat.id} className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between group cursor-pointer hover:border-secondary transition-all hover:shadow-md">
                <div className="flex items-center space-x-4">
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm", cat.bg, cat.color)}>
                    <cat.icon size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-text-dark">{cat.label}</p>
                    <p className="text-xs text-text-muted">{catAssets.length} items</p>
                  </div>
                </div>
                <div className="text-right flex items-center space-x-3">
                  <p className="font-bold text-text-dark">{formatCurrency(catTotal, isPrivacyMode)}</p>
                  <ChevronRight size={18} className="text-text-muted group-hover:text-secondary transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detailed Liabilities List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-bold text-text-dark">Liability Details</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsLiabilityModalOpen(true)}>
            <Plus size={18} className="mr-1" /> Add Liability
          </Button>
        </div>
        <div className="card p-0 overflow-hidden min-h-[100px]">
          {isLoading ? (
            <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
          ) : liabilities.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-sm italic">No liabilities tracked yet.</div>
          ) : (
            liabilities.map((lib, i) => (
              <div key={lib.id} className={cn(
                "p-6 flex items-center justify-between",
                i !== liabilities.length - 1 && "border-b border-border"
              )}>
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-danger/10 text-danger rounded-xl flex items-center justify-center shadow-sm">
                    <TrendingUp size={20} className="rotate-180" />
                  </div>
                  <div>
                    <p className="font-bold text-text-dark">{lib.name}</p>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest">{lib.type}</p>
                  </div>
                </div>
                <p className="font-bold text-text-dark">{formatCurrency(lib.balance, isPrivacyMode)}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Modals */}
      <Modal 
        isOpen={isAssetModalOpen} 
        onClose={() => setIsAssetModalOpen(false)} 
        title="Add Asset"
      >
        <form className="space-y-4" onSubmit={handleAddAsset}>
          <Input name="name" label="Asset Name" placeholder="e.g. Vanguard Index Fund" required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-dark ml-1">Category</label>
            <select name="category" className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-dark">
              {assetCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <Input name="value" label="Current Value (₹)" type="number" placeholder="0" required />
          <div className="pt-4">
            <Button type="submit" className="w-full">Save Asset</Button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isLiabilityModalOpen} 
        onClose={() => setIsLiabilityModalOpen(false)} 
        title="Add Liability"
      >
        <form className="space-y-4" onSubmit={handleAddLiability}>
          <Input name="name" label="Liability Name" placeholder="e.g. Home Mortgage" required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-dark ml-1">Type</label>
            <select name="type" className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-dark">
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
