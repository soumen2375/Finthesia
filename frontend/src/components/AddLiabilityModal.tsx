import React, { useState, useEffect } from 'react';
import { api, Liability, Card } from '../services/api';
import { X, CreditCard as CreditCardIcon, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { LIABILITY_CATEGORIES } from '../pages/LiabilitiesPage';
import { formatCurrency } from '../lib/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingLiab: Liability | null;
}

export function AddLiabilityModal({ isOpen, onClose, onSaved, editingLiab }: Props) {
  const [name, setName] = useState('');
  const [liabilityType, setLiabilityType] = useState('credit_card');
  const [provider, setProvider] = useState('');
  const [balance, setBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [tenureMonths, setTenureMonths] = useState('');
  const [remainingMonths, setRemainingMonths] = useState('');
  const [propertyValue, setPropertyValue] = useState('');
  const [moratoriumStatus, setMoratoriumStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Card linking state
  const [cards, setCards] = useState<Card[]>([]);
  const [cardLinkMode, setCardLinkMode] = useState<'existing' | 'new'>('new');
  const [selectedCardId, setSelectedCardId] = useState('');

  // Fetch cards when credit_card type is selected
  useEffect(() => {
    if (liabilityType === 'credit_card' && isOpen) {
      api.getCards().then(setCards).catch(console.error);
    }
  }, [liabilityType, isOpen]);

  useEffect(() => {
    if (editingLiab) {
      setName(editingLiab.name);
      setLiabilityType(editingLiab.liability_type || editingLiab.type || 'other');
      setProvider(editingLiab.provider || '');
      setBalance(editingLiab.balance.toString());
      setInterestRate(editingLiab.interest_rate?.toString() || '');
      setMonthlyPayment(editingLiab.minimum_payment?.toString() || '');
      setDueDate(editingLiab.due_date || '');
      setCreditLimit(editingLiab.credit_limit?.toString() || '');
      setTenureMonths(editingLiab.tenure_months?.toString() || '');
      setRemainingMonths(editingLiab.remaining_months?.toString() || '');
      setPropertyValue(editingLiab.property_value?.toString() || '');
      setMoratoriumStatus(editingLiab.moratorium_status || '');
      setSelectedCardId(editingLiab.linked_card_id || '');
      setCardLinkMode(editingLiab.linked_card_id ? 'existing' : 'new');
    } else {
      setName('');
      setLiabilityType('credit_card');
      setProvider('');
      setBalance('');
      setInterestRate('');
      setMonthlyPayment('');
      setDueDate('');
      setCreditLimit('');
      setTenureMonths('');
      setRemainingMonths('');
      setPropertyValue('');
      setMoratoriumStatus('');
      setSelectedCardId('');
      setCardLinkMode('new');
    }
    setError('');
  }, [editingLiab, isOpen]);

  // Auto-fill from selected card
  const handleCardSelect = (cardId: string) => {
    setSelectedCardId(cardId);
    const card = cards.find(c => c.id === cardId);
    if (card) {
      setName(`${card.bank_name} ${card.card_variant}`);
      setProvider(card.bank_name);
      setCreditLimit(card.credit_limit?.toString() || '');
      const outstanding = (card.credit_limit || 0) - (card.available_credit || 0);
      setBalance(outstanding.toString());
      setMonthlyPayment(card.minimum_amount_due?.toString() || card.total_amount_due?.toString() || '');
      setDueDate(card.payment_due_date || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const data: any = {
        name: name.trim(),
        type: liabilityType,
        liability_type: liabilityType,
        balance: parseFloat(balance),
        provider: provider.trim() || undefined,
        interest_rate: interestRate ? parseFloat(interestRate) : undefined,
        minimum_payment: monthlyPayment ? parseFloat(monthlyPayment) : undefined,
        due_date: dueDate || undefined,
        credit_limit: creditLimit ? parseFloat(creditLimit) : undefined,
        tenure_months: tenureMonths ? parseInt(tenureMonths) : undefined,
        remaining_months: remainingMonths ? parseInt(remainingMonths) : undefined,
        property_value: propertyValue ? parseFloat(propertyValue) : undefined,
        moratorium_status: moratoriumStatus || undefined,
        linked_card_id: undefined as string | undefined,
      };

      // Handle credit card linking
      if (liabilityType === 'credit_card') {
        if (cardLinkMode === 'existing' && selectedCardId) {
          data.linked_card_id = selectedCardId;
        } else if (cardLinkMode === 'new' && !editingLiab) {
          // Create a new card entry automatically
          const colors = [
            'bg-gradient-to-br from-[#27C4E1] to-[#1EB0CC]',
            'bg-gradient-to-br from-[#00BFFF] to-[#1E90FF]',
            'bg-gradient-to-br from-[#545E63] to-[#2D3748]',
            'bg-gradient-to-br from-[#8A8F93] to-[#545E63]'
          ];
          const newCardId = crypto.randomUUID();
          const newCard: Card = {
            id: newCardId,
            bank_name: provider.trim() || name.trim(),
            card_variant: name.trim(),
            name: name.trim(),
            card_type: 'Visa',
            credit_limit: creditLimit ? parseFloat(creditLimit) : 0,
            available_credit: creditLimit ? parseFloat(creditLimit) - parseFloat(balance || '0') : 0,
            billing_cycle: '',
            payment_due_date: dueDate || '',
            total_amount_due: parseFloat(balance || '0'),
            last4: Math.floor(1000 + Math.random() * 9000).toString(),
            color: colors[cards.length % colors.length],
            minimum_amount_due: monthlyPayment ? parseFloat(monthlyPayment) : 0,
            utilization_alert_threshold: 70,
            remind_before_days: 3,
            remind_on_due_date: true,
            allow_manual_override: false,
          };
          await api.addCard(newCard);
          data.linked_card_id = newCardId;
        }
      }

      if (editingLiab) {
        await api.updateLiability(editingLiab.id, data);
      } else {
        data.id = crypto.randomUUID();
        await api.addLiability(data);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save liability');
    } finally {
      setIsSubmitting(false);
    }
  };

  const catConfig = LIABILITY_CATEGORIES.find(c => c.id === liabilityType);
  const showCreditLimit = liabilityType === 'credit_card';
  const showTenure = ['personal_loan', 'home_loan', 'vehicle_loan', 'education_loan'].includes(liabilityType);
  const showPropertyValue = liabilityType === 'home_loan';
  const showMoratorium = liabilityType === 'education_loan';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card rounded-[2rem] shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  {catConfig && (
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg", catConfig.bg)}>
                      <catConfig.icon size={20} />
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-text-dark">
                    {editingLiab ? 'Edit Liability' : 'Add Liability'}
                  </h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-background text-text-muted transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">{error}</div>
                )}

                {/* Category Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Liability Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {LIABILITY_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setLiabilityType(cat.id)}
                        className={cn(
                          "p-2.5 rounded-xl border-2 text-xs font-bold transition-all flex items-center space-x-2",
                          liabilityType === cat.id
                            ? `border-current ${cat.textColor} ${cat.bgLight}`
                            : 'border-border text-text-muted hover:border-border/80'
                        )}
                      >
                        <cat.icon size={16} />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Linking — Only for credit cards */}
                {liabilityType === 'credit_card' && cards.length > 0 && !editingLiab && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center space-x-2 text-blue-600">
                      <Link2 size={16} />
                      <span className="text-[11px] font-bold uppercase tracking-widest">Link to Card Stack</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { setCardLinkMode('existing'); }}
                        className={cn(
                          "p-2.5 rounded-xl border-2 text-xs font-bold transition-all",
                          cardLinkMode === 'existing'
                            ? "border-blue-500 bg-blue-500/10 text-blue-600"
                            : "border-border text-text-muted"
                        )}
                      >
                        Link Existing Card
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCardLinkMode('new'); setSelectedCardId(''); }}
                        className={cn(
                          "p-2.5 rounded-xl border-2 text-xs font-bold transition-all",
                          cardLinkMode === 'new'
                            ? "border-blue-500 bg-blue-500/10 text-blue-600"
                            : "border-border text-text-muted"
                        )}
                      >
                        Create New Card
                      </button>
                    </div>
                    {cardLinkMode === 'existing' && (
                      <div className="space-y-2 mt-2">
                        {cards.map(card => {
                          const outstanding = (card.credit_limit || 0) - (card.available_credit || 0);
                          return (
                            <button
                              key={card.id}
                              type="button"
                              onClick={() => handleCardSelect(card.id)}
                              className={cn(
                                "w-full p-3 rounded-xl border-2 text-left transition-all flex items-center space-x-3",
                                selectedCardId === card.id
                                  ? "border-blue-500 bg-blue-500/5"
                                  : "border-border hover:border-blue-500/50"
                              )}
                            >
                              <div className="h-8 w-8 bg-gradient-to-br from-[#27C4E1] to-[#1EB0CC] rounded-lg flex items-center justify-center">
                                <CreditCardIcon size={14} className="text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-text-dark truncate">{card.bank_name} {card.card_variant}</p>
                                <p className="text-[10px] text-text-muted">Outstanding: {formatCurrency(outstanding, false)}</p>
                              </div>
                              {selectedCardId === card.id && (
                                <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {cardLinkMode === 'new' && (
                      <p className="text-[10px] text-blue-600/60 font-medium">
                        A new card will be automatically created in your Card Stack when you save this liability.
                      </p>
                    )}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={liabilityType === 'credit_card' ? 'e.g., HDFC Credit Card' : 'e.g., Home Loan – SBI'}
                    className="input-field"
                    required
                  />
                </div>

                {/* Provider */}
                <div>
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Provider / Lender</label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder={liabilityType === 'bnpl' ? 'e.g., Amazon Pay Later' : 'e.g., HDFC, SBI, ICICI'}
                    className="input-field"
                  />
                </div>

                {/* Balance + Interest Rate */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">
                      {showCreditLimit ? 'Outstanding Balance *' : 'Remaining Balance *'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      placeholder="0.00"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      placeholder="0.00"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Monthly Payment + Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">
                      {showCreditLimit ? 'Minimum Payment (₹)' : 'EMI Amount (₹)'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={monthlyPayment}
                      onChange={(e) => setMonthlyPayment(e.target.value)}
                      placeholder="0.00"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Due Date</label>
                    <input
                      type="text"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      placeholder="e.g., 5 April"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Credit Limit — Only for credit cards */}
                {showCreditLimit && (
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Credit Limit (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                      placeholder="e.g., 100000"
                      className="input-field"
                    />
                  </div>
                )}

                {/* Tenure fields — For loans */}
                {showTenure && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Total Tenure (months)</label>
                      <input
                        type="number"
                        value={tenureMonths}
                        onChange={(e) => setTenureMonths(e.target.value)}
                        placeholder="e.g., 36"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Remaining (months)</label>
                      <input
                        type="number"
                        value={remainingMonths}
                        onChange={(e) => setRemainingMonths(e.target.value)}
                        placeholder="e.g., 24"
                        className="input-field"
                      />
                    </div>
                  </div>
                )}

                {/* Property Value — Only for home loans */}
                {showPropertyValue && (
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Property Value (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(e.target.value)}
                      placeholder="e.g., 5000000"
                      className="input-field"
                    />
                  </div>
                )}

                {/* Moratorium — Only for education loans */}
                {showMoratorium && (
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Moratorium Status</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['active', 'ended'].map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setMoratoriumStatus(status)}
                          className={cn(
                            "p-2.5 rounded-xl border-2 text-sm font-bold transition-all capitalize",
                            moratoriumStatus === status
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-text-muted hover:border-primary/50"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim() || !balance}
                    className="btn-primary flex-1 py-3 font-bold"
                  >
                    {isSubmitting ? 'Saving...' : editingLiab ? 'Update Liability' : 'Add Liability'}
                  </button>
                  <button type="button" onClick={onClose} className="btn-secondary px-6 py-3">Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
