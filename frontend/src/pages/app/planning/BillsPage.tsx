import React, { useEffect, useState } from 'react';
import { Calendar, CreditCard, CheckCircle2, Clock, Plus, Edit2, Trash2, X } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useUI } from '@/context/UIContext';
import { api, Card, EMI } from '@/services/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'motion/react';

export default function BillsPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const { showToast } = useToast();
  const [cards, setCards] = useState<Card[]>([]);
  const [emis, setEmis] = useState<EMI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddEMIOpen, setIsAddEMIOpen] = useState(false);
  const [editingEMI, setEditingEMI] = useState<EMI | null>(null);
  const [markingCardId, setMarkingCardId] = useState<string | null>(null);
  const [markingEMIId, setMarkingEMIId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cardsData, emisData] = await Promise.all([
        api.getCards(),
        api.getAllEMIs()
      ]);
      setCards(cardsData);
      setEmis(emisData);
    } catch (error) {
      console.error('Failed to fetch bills and emis', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [refreshKey]);

  const upcomingBills = cards.filter(c => (c.total_amount_due || 0) > 0);
  const totalUpcoming = upcomingBills.reduce((s, c) => s + (c.total_amount_due || 0), 0);
  const totalEMIs = emis.reduce((s, e) => s + e.monthly_payment, 0);

  const handleMarkCardPaid = async (cardId: string) => {
    setMarkingCardId(cardId);
    try {
      await api.markCardAsPaid(cardId);
      showToast('Bill marked as paid', 'success');
      fetchData();
    } catch (error) {
      showToast('Failed to mark as paid', 'error');
    } finally {
      setMarkingCardId(null);
    }
  };

  const handleMarkEMIPaid = async (emiId: string) => {
    setMarkingEMIId(emiId);
    try {
      await api.markEMIAsPaid(emiId);
      showToast('EMI installment marked as paid', 'success');
      fetchData();
    } catch (error) {
      showToast('Failed to mark EMI as paid', 'error');
    } finally {
      setMarkingEMIId(null);
    }
  };

  const handleSaveEMI = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emiData: Partial<EMI> = {
      card_id: formData.get('card_id') as string,
      description: formData.get('description') as string,
      original_amount: Number(formData.get('original_amount')),
      remaining_amount: Number(formData.get('remaining_amount')),
      monthly_payment: Number(formData.get('monthly_payment')),
      remaining_months: Number(formData.get('remaining_months')),
      next_due_date: formData.get('next_due_date') as string,
    };
    try {
      if (editingEMI) {
        await api.updateEMI(editingEMI.id, emiData);
        showToast('EMI updated', 'success');
      } else {
        const fullEmiData: EMI = {
          id: crypto.randomUUID(),
          ...emiData as any,
        };
        await api.addEMI(fullEmiData);
        showToast('EMI added successfully', 'success');
      }
      setIsAddEMIOpen(false);
      setEditingEMI(null);
      fetchData();
    } catch (error) {
      showToast('Failed to save EMI', 'error');
    }
  };

  const handleDeleteEMI = async (id: string) => {
    if (!confirm('Are you sure you want to delete this EMI?')) return;
    try {
      await api.deleteEMI(id);
      showToast('EMI deleted', 'success');
      fetchData();
    } catch (error) {
      showToast('Failed to delete EMI', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-slate-200/20 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-slate-200/20 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="animate-slam">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-text-dark tracking-tight">Bills & EMIs</h2>
            <p className="text-text-muted text-sm font-medium">Manage your upcoming credit card payments and active EMIs</p>
          </div>
          <Button 
            onClick={() => { setEditingEMI(null); setIsAddEMIOpen(true); }}
            className="flex items-center space-x-2 shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            <span>Add EMI</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slam" style={{ animationDelay: '0.05s' }}>
        <div className="card p-5 flex items-center space-x-4">
          <div className="h-12 w-12 bg-warning/10 text-warning rounded-2xl flex items-center justify-center shadow-sm">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Upcoming Bills</p>
            <p className="text-xl font-bold text-text-dark">{formatCurrency(totalUpcoming, isPrivacyMode)}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center space-x-4">
          <div className="h-12 w-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center shadow-sm">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Monthly EMIs</p>
            <p className="text-xl font-bold text-text-dark">{formatCurrency(totalEMIs, isPrivacyMode)}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center space-x-4">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-sm">
            <CreditCard size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Obligations</p>
            <p className="text-xl font-bold text-text-dark">{formatCurrency(totalUpcoming + totalEMIs, isPrivacyMode)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Upcoming Payments */}
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
                <motion.div 
                  key={card.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-5 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                      <div className="h-12 w-12 bg-background rounded-2xl flex items-center justify-center text-text-muted border border-border shadow-inner group-hover:bg-secondary/5 group-hover:text-secondary transition-colors shrink-0">
                        <CreditCard size={24} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-text-dark truncate">{card.bank_name} {card.card_variant}</h4>
                        <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Due: {card.payment_due_date || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1 shrink-0 ml-3">
                      <p className="text-base sm:text-lg font-bold text-text-dark">{formatCurrency(card.total_amount_due || 0, isPrivacyMode)}</p>
                      <div className="inline-flex items-center px-2 py-0.5 bg-warning/10 text-warning rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                        Due Soon
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleMarkCardPaid(card.id)}
                    disabled={markingCardId === card.id}
                    className={cn(
                      "w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 border shadow-sm",
                      markingCardId === card.id
                        ? "bg-background text-text-muted border-border cursor-wait"
                        : "bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20"
                    )}
                  >
                    <CheckCircle2 size={16} />
                    <span>{markingCardId === card.id ? 'Marking...' : 'Mark As Paid'}</span>
                  </button>
                </motion.div>
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

        {/* Active EMIs */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 px-1">
              <div className="h-8 w-8 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center shadow-sm">
                <Calendar size={18} />
              </div>
              <h3 className="text-xl font-bold text-text-dark">Active EMIs</h3>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-9"
              onClick={() => { setEditingEMI(null); setIsAddEMIOpen(true); }}
            >
              <Plus size={16} className="mr-2" /> Add EMI
            </Button>
          </div>

          {emis.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {emis.map((emi) => {
                const card = cards.find(c => c.id === emi.card_id);
                const progress = Math.max(5, 100 - ((emi.remaining_amount / emi.original_amount) * 100));
                return (
                  <motion.div 
                    key={emi.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card flex flex-col group p-5"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1 min-w-0 flex-1">
                        <h4 className="font-bold text-text-dark truncate">{emi.description}</h4>
                        <p className="text-xs text-text-muted font-bold uppercase tracking-widest">
                          {card ? `${card.bank_name} - ${card.card_variant}` : 'Credit Card'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0 ml-3">
                        <button
                          onClick={() => { setEditingEMI(emi); setIsAddEMIOpen(true); }}
                          className="p-1.5 rounded-lg bg-background border border-border text-text-muted hover:text-secondary transition-colors"
                          title="Edit EMI"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteEMI(emi.id)}
                          className="p-1.5 rounded-lg bg-background border border-border text-text-muted hover:text-red-500 transition-colors"
                          title="Delete EMI"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-3 bg-background rounded-xl border border-border">
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1">Monthly</p>
                        <p className="text-sm font-bold text-secondary">{formatCurrency(emi.monthly_payment, isPrivacyMode)}</p>
                      </div>
                      <div className="text-center p-3 bg-background rounded-xl border border-border">
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1">Remaining</p>
                        <p className="text-sm font-bold text-text-dark">{formatCurrency(emi.remaining_amount, isPrivacyMode)}</p>
                      </div>
                      <div className="text-center p-3 bg-background rounded-xl border border-border">
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1">Months</p>
                        <p className="text-sm font-bold text-text-dark">{emi.remaining_months}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs font-bold text-text-muted">
                        <span>{emi.remaining_months} months left</span>
                        <span className="text-secondary">Next: {emi.next_due_date}</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-2 border border-border">
                        <div 
                          className="bg-secondary h-full rounded-full transition-all duration-700" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleMarkEMIPaid(emi.id)}
                      disabled={markingEMIId === emi.id}
                      className={cn(
                        "w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 border shadow-sm mt-auto",
                        markingEMIId === emi.id
                          ? "bg-background text-text-muted border-border cursor-wait"
                          : "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary hover:text-white hover:border-secondary hover:shadow-lg hover:shadow-secondary/20"
                      )}
                    >
                      <CheckCircle2 size={16} />
                      <span>{markingEMIId === emi.id ? 'Marking...' : 'Mark As Paid'}</span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="card p-12 text-center text-text-muted italic font-medium bg-background/50 border-dashed space-y-4">
              <div className="h-16 w-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Calendar size={28} />
              </div>
              <div>
                <p className="text-text-dark font-bold text-base not-italic">No active EMIs</p>
                <p className="text-text-muted text-sm not-italic">Click "Add EMI" to start tracking your installments.</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Add/Edit EMI Modal */}
      <Modal
        isOpen={isAddEMIOpen}
        onClose={() => { setIsAddEMIOpen(false); setEditingEMI(null); }}
        title={editingEMI ? 'Edit EMI' : 'Add New EMI'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveEMI} className="space-y-6 pb-4">
          {/* Card Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest">
              Select Credit Card *
            </label>
            <select
              name="card_id"
              defaultValue={editingEMI?.card_id || ''}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-dark text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            >
              <option value="" disabled>Choose a card...</option>
              {cards.map(card => (
                <option key={card.id} value={card.id}>
                  {card.bank_name} - {card.card_variant || card.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <Input
            name="description"
            label="Description *"
            defaultValue={editingEMI?.description}
            placeholder="e.g. iPhone 15 Pro, Laptop EMI"
            required
          />

          {/* Amount Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="original_amount"
              label="Original Amount (₹) *"
              type="number"
              defaultValue={editingEMI?.original_amount}
              placeholder="0"
              required
            />
            <Input
              name="remaining_amount"
              label="Remaining Amount (₹) *"
              type="number"
              defaultValue={editingEMI?.remaining_amount}
              placeholder="0"
              required
            />
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="monthly_payment"
              label="Monthly Payment (₹) *"
              type="number"
              defaultValue={editingEMI?.monthly_payment}
              placeholder="0"
              required
            />
            <Input
              name="remaining_months"
              label="Remaining Months *"
              type="number"
              defaultValue={editingEMI?.remaining_months}
              placeholder="0"
              required
            />
          </div>

          {/* Due Date */}
          <Input
            name="next_due_date"
            label="Next Due Date *"
            type="date"
            defaultValue={editingEMI?.next_due_date}
            required
          />

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => { setIsAddEMIOpen(false); setEditingEMI(null); }}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingEMI ? 'Update EMI' : 'Add EMI'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
