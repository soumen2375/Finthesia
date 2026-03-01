import React, { useEffect, useState } from 'react';
import { useUI } from '../context/UIContext';
import { 
  Plus, 
  CreditCard as CardIcon, 
  AlertCircle,
  ChevronRight,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'motion/react';
import { api, Card } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function CardsPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const formatCurrency = (value: number) => {
    if (isPrivacyMode) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const handleAddCard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const colors = [
      'bg-gradient-to-br from-amber-400 to-amber-600',
      'bg-gradient-to-br from-blue-600 to-indigo-900',
      'bg-gradient-to-br from-slate-700 to-slate-900',
      'bg-gradient-to-br from-emerald-500 to-emerald-700'
    ];
    
    const newCard: Card = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      card_type: 'Visa', // Default for now
      credit_limit: Number(formData.get('limit')),
      current_balance: Number(formData.get('balance')),
      payment_due_date: formData.get('dueDate') as string,
      last4: Math.floor(1000 + Math.random() * 9000).toString(),
      color: colors[cards.length % colors.length]
    };
    
    await api.addCard(newCard);
    setIsModalOpen(false);
    showToast(`${newCard.name} added successfully!`, 'success');
    fetchCards();
  };

  const activeCard = cards[activeCardIndex];
  const utilization = activeCard ? (activeCard.current_balance / activeCard.credit_limit) * 100 : 0;

  return (
    <div className="space-y-8 pb-8">
      {/* Visual Card Stack */}
      {cards.length > 0 ? (
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
                    isSelected ? "shadow-blue-600/20" : "shadow-none"
                  )}
                >
                  <div className="flex justify-between items-start h-full flex-col">
                    <div className="flex justify-between w-full">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{card.card_type}</p>
                        <p className="text-lg font-bold">{card.name}</p>
                      </div>
                      <ShieldCheck size={24} className="opacity-50" />
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
      ) : (
        <div className="h-64 flex items-center justify-center text-slate-400 italic">
          No cards added yet.
        </div>
      )}

      {/* Card Details */}
      {activeCard && (
        <section className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Current Balance</p>
                <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(activeCard.current_balance)}</h3>
              </div>
              <div className="text-right space-y-1">
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Credit Limit</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(activeCard.credit_limit)}</p>
              </div>
            </div>

            {/* Utilization Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <p className="text-sm font-bold text-slate-900">Utilization</p>
                <p className={cn(
                  "text-sm font-bold",
                  utilization > 70 ? "text-red-500" : utilization > 30 ? "text-amber-500" : "text-emerald-500"
                )}>
                  {utilization.toFixed(1)}%
                </p>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${utilization}%` }}
                  className={cn(
                    "h-full rounded-full",
                    utilization > 70 ? "bg-red-500" : utilization > 30 ? "bg-amber-500" : "bg-emerald-500"
                  )}
                />
              </div>
              {utilization > 70 && (
                <div className="flex items-center text-xs text-red-500 font-medium">
                  <AlertCircle size={14} className="mr-1" />
                  High utilization may impact your credit score.
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl">
                <Calendar className="text-blue-600" size={20} />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Due Date</p>
                  <p className="text-sm font-bold text-slate-900">{activeCard.payment_due_date || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl">
                <CardIcon className="text-indigo-600" size={20} />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">APR</p>
                  <p className="text-sm font-bold text-slate-900">{activeCard.apr || '18.24'}%</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Button className="w-full py-4 rounded-3xl" onClick={() => setIsModalOpen(true)}>
        <Plus size={20} className="mr-2" /> Add New Card
      </Button>

      {/* Modal for adding card */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add Credit Card"
      >
        <form className="space-y-4" onSubmit={handleAddCard}>
          <Input name="name" label="Card Name" placeholder="e.g. Chase Sapphire Preferred" required />
          <div className="grid grid-cols-2 gap-4">
            <Input name="limit" label="Credit Limit" type="number" placeholder="0.00" required />
            <Input name="balance" label="Current Balance" type="number" placeholder="0.00" required />
          </div>
          <Input name="dueDate" label="Payment Due Date" type="date" required />
          <div className="pt-4">
            <Button type="submit" className="w-full">Save Card</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
