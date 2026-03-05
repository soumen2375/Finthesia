import React, { useEffect, useState } from 'react';
import { Calendar, CreditCard, CheckCircle2, Clock } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';
import { useUI } from '../context/UIContext';
import { api, Card } from '../services/api';
import { cn } from '../lib/utils';

export default function BillsPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    fetchCards();
  }, [refreshKey]);

  const upcomingBills = cards.filter(c => (c.total_amount_due || 0) > 0);

  return (
    <div className="space-y-8 pb-12">
      <div className="animate-slam">
        <h2 className="text-3xl font-bold text-text-dark tracking-tight">Bills & EMIs</h2>
        <p className="text-text-muted text-sm font-medium">Manage your upcoming credit card payments and active EMIs</p>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-1">
            <div className="h-8 w-8 bg-warning/10 text-warning rounded-lg flex items-center justify-center shadow-sm">
              <Clock size={18} />
            </div>
            <h3 className="text-xl font-bold text-text-dark">Upcoming Payments</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingBills.length > 0 ? (
              upcomingBills.map(card => (
                <div key={card.id} className="card p-6 flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-background rounded-2xl flex items-center justify-center text-text-muted border border-border shadow-inner group-hover:bg-secondary/5 group-hover:text-secondary transition-colors">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-dark">{card.bank_name} {card.card_variant}</h4>
                      <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Due: {card.payment_due_date || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-lg font-bold text-text-dark">{formatCurrency(card.total_amount_due || 0, isPrivacyMode)}</p>
                    <div className="inline-flex items-center px-2 py-0.5 bg-warning/10 text-warning rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                      Due Soon
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 card p-12 text-center space-y-4">
                <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-1">
                  <p className="text-text-dark font-bold text-lg">All bills are paid!</p>
                  <p className="text-text-muted font-medium">You're on track with your credit card payments.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-1">
            <div className="h-8 w-8 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center shadow-sm">
              <Calendar size={18} />
            </div>
            <h3 className="text-xl font-bold text-text-dark">Active EMIs</h3>
          </div>
          <div className="card p-12 text-center text-text-muted italic font-medium bg-background/50 border-dashed">
            No active EMIs tracked yet.
          </div>
        </section>
      </div>
    </div>
  );
}
