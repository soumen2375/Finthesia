import React, { useEffect, useState, useMemo } from 'react';
import { useUI } from '../context/UIContext';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ChevronRight,
  Wallet, Briefcase, Building2, Car, ShieldCheck, Package,
  CreditCard, Home, ShoppingBag, GraduationCap, HelpCircle,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api, Asset, Liability } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatCurrencyCompact } from '../lib/formatters';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';

const assetCategories = [
  { id: 'bank_accounts', label: 'Bank Accounts', icon: Wallet, color: 'text-[#27C4E1]', bg: 'bg-[#27C4E1]/10', chartColor: '#27C4E1' },
  { id: 'investments', label: 'Investments', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-500/10', chartColor: '#6366F1' },
  { id: 'real_estate', label: 'Real Estate', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-500/10', chartColor: '#F59E0B' },
  { id: 'vehicles', label: 'Vehicles', icon: Car, color: 'text-violet-600', bg: 'bg-violet-500/10', chartColor: '#8B5CF6' },
  { id: 'retirement', label: 'Retirement Funds', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-500/10', chartColor: '#22C55E' },
  { id: 'other', label: 'Other Assets', icon: Package, color: 'text-gray-500', bg: 'bg-gray-500/10', chartColor: '#6B7280' },
];

const liabilityCategories = [
  { id: 'credit_card', label: 'Credit Card', icon: CreditCard, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'personal_loan', label: 'Personal Loan', icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'home_loan', label: 'Home Loan', icon: Home, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'vehicle_loan', label: 'Vehicle Loan', icon: Car, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { id: 'bnpl', label: 'BNPL', icon: ShoppingBag, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { id: 'other', label: 'Other Debt', icon: HelpCircle, color: 'text-gray-500', bg: 'bg-gray-500/10' },
];

const COLORS = ['#27C4E1', '#6366F1', '#F59E0B', '#8B5CF6', '#22C55E', '#6B7280'];

export default function NetWorthPage() {
  const { isPrivacyMode, refreshKey } = useUI();
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
    assets.filter(a => ['investments', 'real_estate', 'retirement'].includes(a.category))
      .reduce((acc, curr) => acc + Number(curr.current_value), 0)
  , [assets]);

  // Group assets by category
  const groupedAssets = useMemo(() => {
    const map: Record<string, Asset[]> = {};
    assets.forEach(a => {
      const cat = a.category || 'other';
      if (!map[cat]) map[cat] = [];
      map[cat].push(a);
    });
    return map;
  }, [assets]);

  // Group liabilities by category
  const groupedLiabs = useMemo(() => {
    const map: Record<string, Liability[]> = {};
    liabilities.forEach(l => {
      const cat = l.liability_type || l.type || 'other';
      if (!map[cat]) map[cat] = [];
      map[cat].push(l);
    });
    return map;
  }, [liabilities]);

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
        <Link to="/assets" className="block">
          <div className="card group cursor-pointer hover:border-secondary/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm bg-secondary/10 text-secondary">
                <Wallet size={24} />
              </div>
              <ChevronRight size={18} className="text-text-muted group-hover:text-secondary transition-colors" />
            </div>
            <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Assets</p>
            <h3 className="text-2xl font-bold text-text-dark">{formatCurrency(totalAssets, isPrivacyMode)}</h3>
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-2">View Details →</p>
          </div>
        </Link>

        <Link to="/liabilities" className="block">
          <div className="card group cursor-pointer hover:border-danger/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm bg-danger/10 text-danger">
                <TrendingUp size={24} className="rotate-180" />
              </div>
              <ChevronRight size={18} className="text-text-muted group-hover:text-danger transition-colors" />
            </div>
            <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Liabilities</p>
            <h3 className="text-2xl font-bold text-text-dark">{formatCurrency(totalLiabilities, isPrivacyMode)}</h3>
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-2">View Details →</p>
          </div>
        </Link>

        <div className="card group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm bg-indigo-50 text-indigo-600">
              <Briefcase size={24} />
            </div>
            <ChevronRight size={18} className="text-text-muted group-hover:text-text-dark transition-colors" />
          </div>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Investments</p>
          <h3 className="text-2xl font-bold text-text-dark">{formatCurrency(totalInvestments, isPrivacyMode)}</h3>
        </div>
      </section>

      {/* Section 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Asset Allocation Chart */}
        <section className="card p-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
              <PieChartIcon size={20} />
            </div>
            <h3 className="text-lg font-bold text-text-dark">Asset Allocation</h3>
          </div>
          <div className="h-[300px] w-full relative min-h-0 min-w-0 flex-1">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="99%" height="99%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
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
                <span className="text-xs text-text-muted/60">({totalAssets > 0 ? ((entry.value / totalAssets) * 100).toFixed(0) : 0}%)</span>
              </div>
            ))}
          </div>
        </section>

        {/* Net Worth Growth Chart */}
        <section className="card p-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <LineChartIcon size={20} />
            </div>
            <h3 className="text-lg font-bold text-text-dark">Net Worth Growth</h3>
          </div>
          <div className="h-[300px] w-full min-h-0 min-w-0 flex-1">
            <ResponsiveContainer width="99%" height="99%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#27C4E1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#27C4E1" stopOpacity={0}/>
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
                <Area type="monotone" dataKey="value" stroke="#27C4E1" strokeWidth={3} fillOpacity={1} fill="url(#colorNetWorth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Asset Details — Category Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-bold text-text-dark">Asset Details</h3>
          <Link to="/assets">
            <button className="text-sm font-bold text-text-muted hover:text-text-dark transition-colors flex items-center">
              View All <ChevronRight size={16} className="ml-1" />
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assetCategories.map((cat) => {
            const catAssets = groupedAssets[cat.id] || [];
            const catTotal = catAssets.reduce((acc, curr) => acc + Number(curr.current_value), 0);
            return (
              <Link key={cat.id} to="/assets" className="block">
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between group cursor-pointer hover:border-secondary transition-all hover:shadow-md">
                  <div className="flex items-center space-x-4">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm", cat.bg, cat.color)}>
                      <cat.icon size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-text-dark">{cat.label}</p>
                      <p className="text-xs text-text-muted">{catAssets.length} item{catAssets.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-3">
                    <p className="font-bold text-text-dark">{formatCurrency(catTotal, isPrivacyMode)}</p>
                    <ChevronRight size={18} className="text-text-muted group-hover:text-secondary transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Liability Details — Category Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-bold text-text-dark">Liability Details</h3>
          <Link to="/liabilities">
            <button className="text-sm font-bold text-text-muted hover:text-text-dark transition-colors flex items-center">
              View All <ChevronRight size={16} className="ml-1" />
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liabilityCategories.map((cat) => {
            const catLiabs = groupedLiabs[cat.id] || [];
            const catTotal = catLiabs.reduce((acc, curr) => acc + Number(curr.balance), 0);
            return (
              <Link key={cat.id} to="/liabilities" className="block">
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between group cursor-pointer hover:border-danger/30 transition-all hover:shadow-md">
                  <div className="flex items-center space-x-4">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm", cat.bg, cat.color)}>
                      <cat.icon size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-text-dark">{cat.label}</p>
                      <p className="text-xs text-text-muted">{catLiabs.length} item{catLiabs.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-3">
                    <p className={cn("font-bold", catTotal > 0 ? "text-danger" : "text-text-dark")}>{formatCurrency(catTotal, isPrivacyMode)}</p>
                    <ChevronRight size={18} className="text-text-muted group-hover:text-danger transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
