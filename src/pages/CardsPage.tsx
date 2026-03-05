import React, { useEffect, useState, useMemo } from 'react';
import { useUI } from '../context/UIContext';
import { 
  Plus, 
  CreditCard as CardIcon, 
  ChevronRight,
  Calendar,
  ShieldCheck,
  Building2,
  Layers,
  Receipt,
  RotateCw,
  MoreVertical
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion, AnimatePresence } from 'motion/react';
import { api, Card } from '../services/api';
import { useToast } from '../context/ToastContext';
import { CardDetailsModal } from '../components/CardDetailsModal';
import { formatCurrency } from '../lib/formatters';

const BANKS = [
  "HDFC Bank",
  "SBI Card",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "RBL Bank",
  "IDFC FIRST Bank",
  "AU Small Finance Bank",
  "Yes Bank",
  "Federal Bank",
  "Other"
];

const VARIANTS: Record<string, string[]> = {
  "HDFC Bank": ["Millennia", "Regalia / Regalia Gold", "Infinia / Infinia Metal Edition", "Diners Club Privilege", "Diners Club Black", "MoneyBack / MoneyBack+", "Tata Neu Infinity", "Tata Neu Plus", "IndianOil HDFC", "Swiggy HDFC", "Marriott Bonvoy", "Pixel Card", "Other"],
  "SBI Card": ["SimplySAVE", "SimplyCLICK", "Cashback", "PRIME", "ELITE", "IRCTC SBI Card", "BPCL SBI Card Octane", "Club Vistara Cards (co-branded)", "Other"],
  "ICICI Bank": ["Amazon Pay", "Coral", "Rubyx / Rubyx Exclusive", "Sapphiro", "Emeralde", "Platinum Chip", "HPCL Super Saver", "Other variants (travel, rewards, fuel)", "Other"],
  "Axis Bank": ["ACE", "Flipkart Axis", "My Zone", "Neo", "Rewards", "Select", "Magnus", "Reserve", "Atlas / Miles & More", "Google Pay Flex (co-branded UPI)", "Other"],
  "Kotak Mahindra Bank": ["League Platinum", "Royale Signature", "Zen Signature", "Solitaire / Solitaire Signature", "PVR Platinum / PVR cards (co-branded)", "Other"],
  "IndusInd Bank": ["Legend", "Pioneer Heritage", "Solitaire", "Indulge", "Pinnacle World", "Celesta", "EazyDiner (co-branded)", "Other"],
  "IDFC FIRST Bank": ["Millennia", "Classic", "Select", "Wealth", "Power+ (fuel)", "Private Reserve / Premium variants", "Other"],
  "RBL Bank": ["BankBazaar SaveMax", "World Safari / World Cards", "Platinum Delight", "XTRA (co-branded fuel etc.)", "Lifestyle / cashback cards", "Other"],
  "Yes Bank": ["Prosperity Cashback", "Elite+", "Marquee / Premium", "Other customer-specific variants", "Other"],
  "AU Small Finance Bank": ["LIT", "Zenith+", "Vetta", "Other lifestyle/rewards cards", "Other"],
  "Federal Bank": ["Celesta", "Empire", "Signet", "Other"],
  "Other": ["Other"]
};

export default function CardsPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form states
  const [selectedBank, setSelectedBank] = useState("");
  const [customBank, setCustomBank] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [customVariant, setCustomVariant] = useState("");
  const [creditLimit, setCreditLimit] = useState<number>(0);
  const [availableCredit, setAvailableCredit] = useState<number>(0);
  const [totalAmountDue, setTotalAmountDue] = useState<number>(0);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCards();
      setCards(data);
    } catch (error) {
      console.error('Failed to fetch cards', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [refreshKey]);

  // Auto-calculate Total Amount Due
  useEffect(() => {
    const calculated = Math.max(0, creditLimit - availableCredit);
    setTotalAmountDue(calculated);
  }, [creditLimit, availableCredit]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCards();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleAddCard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const bank = selectedBank === "Other" ? customBank : selectedBank;
    const variant = selectedVariant === "Other" ? customVariant : selectedVariant;
    
    const colors = [
      'bg-gradient-to-br from-amber-400 to-amber-600',
      'bg-gradient-to-br from-blue-600 to-indigo-900',
      'bg-gradient-to-br from-slate-700 to-slate-900',
      'bg-gradient-to-br from-emerald-500 to-emerald-700'
    ];
    
    const totalDue = Number(formData.get('totalAmountDue'));
    const minDue = Number(formData.get('minDue'));
    
    if (creditLimit < (creditLimit - availableCredit)) {
      showToast('Credit limit cannot be less than outstanding balance', 'error');
      return;
    }

    const newCard: Card = {
      id: crypto.randomUUID(),
      bank_name: bank,
      card_variant: variant,
      name: `${bank} ${variant}`,
      card_type: 'Visa',
      credit_limit: creditLimit,
      available_credit: availableCredit,
      billing_cycle: formData.get('billingCycle') as string,
      payment_due_date: formData.get('dueDate') as string,
      total_amount_due: Number(formData.get('totalAmountDue')),
      last4: Math.floor(1000 + Math.random() * 9000).toString(),
      color: colors[cards.length % colors.length],
      minimum_amount_due: Number(formData.get('minDue')),
      utilization_alert_threshold: 70,
      remind_before_days: 3,
      remind_on_due_date: true,
      allow_manual_override: false
    };
    
    await api.addCard(newCard);
    setIsModalOpen(false);
    showToast(`${newCard.name} added successfully!`, 'success');
    
    // Reset form
    setSelectedBank("");
    setCustomBank("");
    setSelectedVariant("");
    setCustomVariant("");
    setCreditLimit(0);
    setAvailableCredit(0);
    setTotalAmountDue(0);
    
    fetchCards();
  };

  const variantsList = useMemo(() => {
    return VARIANTS[selectedBank] || ["Other"];
  }, [selectedBank]);

  const activeCard = cards[activeCardIndex];
  const utilization = activeCard ? ((activeCard.credit_limit - activeCard.available_credit) / activeCard.credit_limit) * 100 : 0;
  const currentBalance = activeCard ? activeCard.credit_limit - activeCard.available_credit : 0;

  const isOverdue = useMemo(() => {
    if (!activeCard?.payment_due_date) return false;
    const dueDate = new Date(activeCard.payment_due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }, [activeCard?.payment_due_date]);

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex justify-between items-center animate-slam">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-text-dark">My Cards</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefresh}
            className={cn(
              "p-2 rounded-full text-text-muted hover:text-text-dark transition-colors",
              isRefreshing && "animate-spin"
            )}
          >
            <RotateCw size={20} />
          </button>
        </div>
      </div>

      {/* Cards Stack */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="h-64 w-full bg-slate-200 animate-pulse rounded-3xl" />
        ) : cards.length > 0 ? (
          <div className="space-y-8">
            <section className="relative h-64 mt-4 animate-slam">
              <div className="absolute inset-0 flex items-center justify-center">
                {cards.map((card, i) => {
                  const isSelected = i === activeCardIndex;
                  const offset = (i - activeCardIndex) * 20;
                  const scale = 1 - Math.abs(i - activeCardIndex) * 0.05;
                  const zIndex = 10 - Math.abs(i - activeCardIndex);
                  
                  return (
                    <motion.div
                      key={card.id}
                      onClick={() => setActiveCardIndex(i)}
                      animate={{
                        x: offset,
                        scale: scale,
                        zIndex: zIndex,
                        opacity: Math.abs(i - activeCardIndex) > 2 ? 0 : 1,
                        rotate: isSelected ? 0 : (i - activeCardIndex) * 2
                      }}
                      className={cn(
                        "absolute w-full max-w-[320px] aspect-[1.6/1] rounded-3xl p-6 text-white shadow-2xl cursor-pointer transition-shadow",
                        card.color || 'bg-slate-900',
                        isSelected ? "shadow-secondary/20" : "shadow-none"
                      )}
                    >
                      <div className="flex justify-between items-start h-full flex-col">
                        <div className="flex justify-between w-full">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{card.card_type || 'Visa'}</p>
                            <p className="text-lg font-bold truncate max-w-[220px]">
                              {card.bank_name || 'Bank'} {card.card_variant || 'Card'}
                            </p>
                          </div>
                          <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <ShieldCheck size={20} className="text-white/80" />
                          </div>
                        </div>
                        <div className="w-full flex justify-between items-end">
                          <p className="text-xl font-mono tracking-widest">•••• •••• •••• {card.last4}</p>
                          <div className="h-8 w-12 bg-white/20 rounded-lg backdrop-blur-sm"></div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Card Details Summary */}
            {activeCard && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div 
                  onClick={() => {
                    setSelectedCard(activeCard);
                    setIsDetailsOpen(true);
                  }}
                  className={cn(
                    "card p-8 space-y-8 cursor-pointer group",
                    isOverdue ? "border-danger/20 ring-4 ring-danger/5" : "hover:border-secondary/50"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Available Credit</p>
                      <h3 className="text-3xl font-bold text-text-dark">{formatCurrency(activeCard.available_credit, isPrivacyMode)}</h3>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Credit Limit</p>
                      <p className="text-lg font-bold text-text-dark/80">{formatCurrency(activeCard.credit_limit, isPrivacyMode)}</p>
                    </div>
                  </div>

                  {/* Utilization Bar */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Utilization</p>
                      <p className={cn(
                        "text-sm font-bold px-2 py-0.5 rounded-lg",
                        utilization > 90 ? "bg-danger/10 text-danger" : "text-text-muted"
                      )}>
                        {utilization.toFixed(1)}%
                      </p>
                    </div>
                    <div className="h-4 w-full bg-background rounded-full overflow-hidden p-1 border border-border">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${utilization}%` }}
                        className={cn(
                          "h-full rounded-full transition-colors duration-500 shadow-sm",
                          utilization < 30 ? "bg-primary" : 
                          utilization < 70 ? "bg-warning" : 
                          utilization < 90 ? "bg-orange-500" : "bg-danger"
                        )}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-text-muted font-bold uppercase tracking-widest">
                      <span>Used: {formatCurrency(currentBalance, isPrivacyMode)}</span>
                      <span>Left: {formatCurrency(activeCard.available_credit, isPrivacyMode)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-4 p-5 bg-background rounded-2xl border border-border">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm",
                        isOverdue ? "bg-danger/10 text-danger" : "bg-secondary/10 text-secondary"
                      )}>
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center">
                          Due Date {isOverdue && <span className="ml-2 text-danger animate-pulse">Alert!</span>}
                        </p>
                        <p className={cn("text-sm font-bold", isOverdue ? "text-danger" : "text-text-dark")}>
                          {activeCard.payment_due_date || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-5 bg-background rounded-2xl border border-border">
                      <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Receipt size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Amount Due</p>
                        <p className="text-sm font-bold text-text-dark">{formatCurrency(activeCard.total_amount_due || 0, isPrivacyMode)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-center">
                    <button 
                      className="text-sm font-medium text-text-muted hover:text-text-dark transition-all flex items-center group/btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCard(activeCard);
                        setIsDetailsOpen(true);
                      }}
                    >
                      View Details 
                      <ChevronRight size={14} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-text-muted space-y-4 bg-white rounded-3xl border border-dashed border-border">
            <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center border border-border shadow-inner">
              <CardIcon size={32} className="text-border" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-bold text-text-dark">No cards added yet</p>
              <p className="text-sm text-text-muted">Add a credit card to start tracking your finances.</p>
            </div>
          </div>
        )}
      </div>

      <Button className="w-full py-5 rounded-3xl shadow-lg bg-white text-text-dark border border-border hover:bg-slate-50 font-bold" onClick={() => setIsModalOpen(true)}>
        <Plus size={20} className="mr-2" /> Add New Card
      </Button>

      {selectedCard && (
        <CardDetailsModal 
          isOpen={isDetailsOpen} 
          onClose={() => setIsDetailsOpen(false)} 
          card={selectedCard}
          onUpdate={fetchCards}
        />
      )}

      {/* Modal for adding card */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add Credit Card"
      >
        <form className="space-y-6" onSubmit={handleAddCard}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center">
                <Building2 size={14} className="mr-2" /> Choose Bank Name
              </label>
              <select 
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-text-dark"
                value={selectedBank}
                onChange={(e) => {
                  setSelectedBank(e.target.value);
                  setSelectedVariant("");
                }}
                required
              >
                <option value="">Select Bank</option>
                {BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)}
              </select>
              {selectedBank === "Other" && (
                <Input 
                  placeholder="Enter Bank Name" 
                  value={customBank} 
                  onChange={(e) => setCustomBank(e.target.value)} 
                  required 
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center">
                <Layers size={14} className="mr-2" /> Choose Card Variant
              </label>
              <select 
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-text-dark disabled:opacity-50"
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                disabled={!selectedBank}
                required
              >
                <option value="">Select Variant</option>
                {variantsList.map(variant => <option key={variant} value={variant}>{variant}</option>)}
              </select>
              {selectedVariant === "Other" && (
                <Input 
                  placeholder="Enter Variant Name" 
                  value={customVariant} 
                  onChange={(e) => setCustomVariant(e.target.value)} 
                  required 
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Credit Limit (₹)</label>
              <Input 
                type="number" 
                placeholder="0" 
                value={creditLimit || ''} 
                onChange={(e) => setCreditLimit(Number(e.target.value))} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Available Credit (₹)</label>
              <Input 
                type="number" 
                placeholder="0" 
                value={availableCredit || ''} 
                onChange={(e) => setAvailableCredit(Number(e.target.value))} 
                required 
              />
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-border">
            <h4 className="text-xs font-bold text-text-dark uppercase tracking-widest">Billing & Payment</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Billing Cycle</label>
                <Input name="billingCycle" placeholder="e.g. 22nd to 21st" defaultValue="22nd to 21st" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Payment Due Date</label>
                <Input name="dueDate" type="date" defaultValue="2026-03-12" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Amount Due (₹)</label>
                <Input 
                  name="totalAmountDue" 
                  type="number" 
                  placeholder="0"
                  value={totalAmountDue} 
                  onChange={(e) => setTotalAmountDue(Number(e.target.value))} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Min. Amount Due (₹)</label>
                <Input name="minDue" type="number" placeholder="0" defaultValue={0} />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full py-4 rounded-2xl">Save Card</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
