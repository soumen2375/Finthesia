import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { api, Card, BankAccount, Transaction } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useUI } from '../context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EXPENSE_CATEGORIES = [
  'ATM', 'Bills & utilities', 'Charity', 'Commute', 'Credit bills',
  'Education', 'EMIs & Loans', 'Entertainment', 'Family & pets', 'Fees & charges',
  'Finance', 'Fitness', 'Food & drinks', 'Fuel', 'Groceries', 'Household',
  'Medical', 'Rent', 'Shopping', 'Travel', 'Money Transfers'
];

const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business Profit', 'Interest', 'Investment Returns', 'Gift', 'Others'
];

const PAYMENT_METHODS = [
  'UPI', 'Card Swipe', 'Net Banking', 'Cash', 'Cheque', 'Auto Debit'
];

const getCategoryIcon = (cat: string) => {
  const iconMap: Record<string, string> = {
    'Food & drinks': '🍔', 'Commute': '🚕', 'Entertainment': '🎬', 'Shopping': '🛍️',
    'Medical': '🏥', 'Rent': '🏠', 'Groceries': '🛒', 'Fuel': '⛽', 'Fitness': '🏋️',
    'Education': '🎓', 'Bills & utilities': '💡', 'Travel': '✈️', 'Family & pets': '🐶',
    'Charity': '🕊️', 'ATM': '🏧', 'Credit bills': '💳', 'EMIs & Loans': '🏦',
    'Fees & charges': '💸', 'Finance': '📈', 'Money Transfers': '🔄',
    'Salary': '💼', 'Freelance': '💻', 'Business Profit': '🏪', 'Interest': '📈',
    'Investment Returns': '💰', 'Gift': '🎁', 'Others': '📦'
  };
  return iconMap[cat] || '📌';
};

export function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const { showToast } = useToast();
  const { triggerRefresh } = useUI();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [cards, setCards] = useState<Card[]>([]);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [account, setAccount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState('1');
  const [recurringFrequency, setRecurringFrequency] = useState('Monthly');
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [recurringRepeats, setRecurringRepeats] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getCards().then(setCards);
      api.getBanks().then(setBanks);

      // Smart Defaults
      const lastType = localStorage.getItem('fin_last_tx_type') as 'expense' | 'income';
      if (lastType) setType(lastType);

      const lastAcc = localStorage.getItem('fin_last_account');
      if (lastAcc) setAccount(lastAcc);

      resetForm();
    }
  }, [isOpen]);

  // Adjust categories when switching type
  useEffect(() => {
    if (type === 'income' && !INCOME_CATEGORIES.includes(category)) {
      setCategory(INCOME_CATEGORIES[0]);
    } else if (type === 'expense' && !EXPENSE_CATEGORIES.includes(category)) {
      setCategory(EXPENSE_CATEGORIES[0]);
    }
  }, [type]);

  const resetForm = () => {
    setAmountStr('');
    setDescription('');
    setTagsStr('');
    setIsRecurring(false);
    setDate(new Date().toISOString().split('T')[0]);
    setRecurringRepeats('');
    setRecurringEndDate('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (!rawValue) {
      setAmountStr('');
      return;
    }
    const num = parseInt(rawValue, 10);
    // Format with Indian numbering system commas
    setAmountStr(num.toLocaleString('en-IN'));
  };

  const getCleanAmount = () => {
    return parseInt(amountStr.replace(/,/g, ''), 10) || 0;
  };

  // Auto-suggestions logic (simplified map)
  useEffect(() => {
    if (type === 'expense') {
      const lowerDesc = description.toLowerCase();
      if (lowerDesc.includes('zomato') || lowerDesc.includes('swiggy')) setCategory('Food & drinks');
      if (lowerDesc.includes('uber') || lowerDesc.includes('ola')) setCategory('Commute');
      if (lowerDesc.includes('netflix') || lowerDesc.includes('prime')) setCategory('Entertainment');
      if (lowerDesc.includes('amazon') || lowerDesc.includes('flipkart')) setCategory('Shopping');
    }
  }, [description, type]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanAmount = getCleanAmount();
    if (cleanAmount <= 0) {
      showToast('Please enter a valid amount', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      localStorage.setItem('fin_last_tx_type', type);
      localStorage.setItem('fin_last_account', account);

      const isCard = cards.some(c => c.id === account);
      const card_id = isCard ? account : undefined;

      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        amount: cleanAmount,
        category,
        description,
        transaction_date: date,
        type: isCard && type === 'expense' ? 'spend' : type,
        card_id,
        account,
        paymentMethod,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
        recurringEndDate: isRecurring && recurringEndDate ? recurringEndDate : undefined,
        recurringRepeats: isRecurring && recurringRepeats ? parseInt(recurringRepeats, 10) : undefined,
      };

      await api.addTransaction(newTransaction);
      showToast('Transaction recorded successfully!', 'success');
      triggerRefresh();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to add transaction', error);
      showToast('Failed to record transaction', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Transaction">
      <form className="space-y-3 px-1 pb-1" onSubmit={handleSubmit}>

        {/* Header Toggle */}
        <div className="flex p-1 bg-gray-100 rounded-full border border-gray-200/50 max-w-[260px] mx-auto shadow-inner relative">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 flex justify-center items-center gap-2 py-2 text-xs uppercase tracking-wide font-extrabold rounded-full transition-all duration-300 z-10 ${type === 'expense'
              ? 'text-white'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {type === 'expense' && <span className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[8px] font-black">↓</span>}
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 flex justify-center items-center gap-2 py-2 text-xs uppercase tracking-wide font-extrabold rounded-full transition-all duration-300 z-10 ${type === 'income'
              ? 'text-white'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {type === 'income' && <span className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[8px] font-black">↑</span>}
            Income
          </button>
          
          {/* Animated Background Pill */}
          <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 shadow-md ${type === 'expense' ? 'bg-[#C52222] left-1' : 'bg-[#1cc925] left-[calc(50%+3px)]'}`}></div>
        </div>

        {/* Core Amount Display */}
        <div className="flex flex-col items-center pt-1 pb-2">
          <div className="relative flex items-center justify-center">
            <span className={`text-3xl sm:text-4xl font-black mr-1 transition-colors ${type === 'expense' ? 'text-[#C52222]' : 'text-[#1cc925]'}`} style={{ fontFamily: "'Poppins', sans-serif" }}>
              ₹
            </span>
            <input
              name="amountStr"
              type="text"
              value={amountStr}
              onChange={handleAmountChange}
              placeholder="0.00"
              className={`min-w-[100px] max-w-full bg-transparent text-4xl sm:text-5xl font-black focus:outline-none transition-colors text-center ${type === 'expense' ? 'text-[#C52222] placeholder-[#C52222]/30' : 'text-[#1cc925] placeholder-[#1cc925]/30'
                }`}
              style={{ width: `${Math.max(4, amountStr.length)}ch`, fontFamily: "'Poppins', sans-serif" }}
              required
              autoFocus
            />
          </div>
        </div>

        {/* Input Fields and Details */}
        
        {/* Description */}
        <div className="bg-white p-2.5 sm:p-3 rounded-[1rem] border border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus-within:ring-2 focus-within:ring-[#27C4E1]/30 transition-shadow">
          <label className="text-[10px] uppercase font-bold text-gray-800 ml-1 mb-1 block" style={{ fontFamily: "'Poppins', sans-serif" }}>Description</label>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-400 mr-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h7"></path></svg>
            <input
              name="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Swiggy - Veg Meals"
              className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none"
              style={{ fontFamily: "'Inter', sans-serif" }}
              required
            />
          </div>
        </div>

        {/* Category & Date Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* Category */}
          <div className="bg-white p-2.5 sm:p-3 rounded-[1rem] border border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus-within:ring-2 focus-within:ring-[#27C4E1]/30 transition-shadow flex flex-col justify-center overflow-hidden">
            <label className="text-[10px] uppercase font-bold text-gray-800 ml-1 mb-1 block" style={{ fontFamily: "'Poppins', sans-serif" }}>Category</label>
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#4285F4] flex items-center justify-center mr-2 text-base text-white font-bold shadow-sm shrink-0">
                  {getCategoryIcon(category) || 'C'}
                </div>
                <select
                  name="category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-transparent font-medium text-gray-900 text-xs sm:text-sm focus:outline-none cursor-pointer appearance-none truncate pr-1"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  required
                >
                  {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="bg-white p-2.5 sm:p-3 rounded-[1rem] border border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus-within:ring-2 focus-within:ring-[#27C4E1]/30 transition-shadow flex flex-col justify-center relative overflow-hidden">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] uppercase font-bold text-gray-800 ml-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Date</label>
              <button type="button" onClick={() => setDate(new Date().toISOString().split('T')[0])} className="text-[9px] bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-1.5 py-0.5 rounded-md transition-colors whitespace-nowrap">Today</button>
            </div>
            <div className="flex items-center pr-1">
              <svg className="w-4 h-4 text-gray-500 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <input
                name="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-transparent font-medium text-gray-900 text-xs sm:text-sm focus:outline-none cursor-pointer pr-1 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-4"
                style={{ fontFamily: "'Inter', sans-serif" }}
                required
              />
            </div>
          </div>
        </div>

        {/* Account & Method Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-white p-2.5 sm:p-3 rounded-[1rem] border border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus-within:ring-2 focus-within:ring-[#27C4E1]/30 transition-shadow overflow-hidden">
            <label className="text-[10px] uppercase font-bold text-gray-800 ml-1 mb-1 block" style={{ fontFamily: "'Poppins', sans-serif" }}>Account / Source</label>
            <div className="flex items-center relative">
               <div className="w-7 h-7 rounded-md bg-white border border-gray-100 flex items-center justify-center shrink-0 mr-1.5 font-black text-base shadow-sm">
                 {!account || account === '' ? '🏦' : account === 'Cash Wallet' ? '💵' : cards.some(c => c.id === account) ? '💳' : '🏦'}
               </div>
              <select
                name="account"
                value={account}
                onChange={e => setAccount(e.target.value)}
                className="w-full bg-transparent font-medium text-xs sm:text-sm text-gray-900 focus:outline-none cursor-pointer appearance-none truncate pr-4"
                style={{ fontFamily: "'Inter', sans-serif" }}
                required
              >
                <option value="" disabled>Select</option>
                <option value="Cash Wallet">Cash Wallet</option>
                {banks.length > 0 && <optgroup label="Banks">
                  {banks.map(b => (
                    <option key={b.id} value={b.id}>{b.bank_name} (****{b.provider_account_id ? b.provider_account_id.slice(-4) : b.id.slice(0, 4).toUpperCase()})</option>
                  ))}
                </optgroup>}
                {cards.length > 0 && <optgroup label="Credit Cards">
                  {cards.map(c => (
                    <option key={c.id} value={c.id}>{c.bank_name} (****{c.last4 || c.id.slice(0, 4).toUpperCase()})</option>
                  ))}
                </optgroup>}
              </select>
              <svg className="w-3.5 h-3.5 text-gray-400 absolute right-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <div className="bg-white p-2.5 sm:p-3 rounded-[1rem] border border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus-within:ring-2 focus-within:ring-[#27C4E1]/30 transition-shadow overflow-hidden">
            <label className="text-[10px] uppercase font-bold text-gray-800 ml-1 mb-1 block" style={{ fontFamily: "'Poppins', sans-serif" }}>Method (Optional)</label>
            <div className="flex items-center relative">
               <div className="w-7 h-7 rounded-md bg-white border border-gray-100 flex items-center justify-center shrink-0 mr-1.5 font-black text-base shadow-sm">
                 {paymentMethod === 'UPI' ? '📱' : paymentMethod === 'Card Swipe' ? '💳' : paymentMethod === 'Net Banking' ? '🏛️' : paymentMethod === 'Cash' ? '💵' : paymentMethod === 'Cheque' ? '📝' : paymentMethod === 'Auto Debit' ? '🔄' : '💰'}
               </div>
              <select
                name="paymentMethod"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full bg-transparent font-medium text-xs sm:text-sm text-gray-900 focus:outline-none cursor-pointer appearance-none truncate pr-4"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <option value="">None</option>
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <svg className="w-3.5 h-3.5 text-gray-400 absolute right-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Premium Features: Attach & Recurring */}
        <div className="space-y-3 pt-1">
          
          {/* Attach Receipt */}
          <div className="border-2 border-dashed border-[#27C4E1]/40 bg-[#27C4E1]/5 rounded-[1rem] p-3 sm:p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[#27C4E1]/10 transition-colors relative group min-h-[64px]">
            <label className="absolute -top-2.5 left-4 bg-white px-2 py-0.5 text-[10px] font-bold text-gray-800 tracking-wider shadow-[0_2px_4px_rgba(39,196,225,0.1)] border border-[#27C4E1]/20 rounded-md" style={{ fontFamily: "'Poppins', sans-serif" }}>ATTACH RECEIPT</label>
            <div className="text-[#27C4E1] mb-0.5 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>Tap or Drag receipt to upload (JPG, PNG, PDF)</span>
          </div>

          {/* Recurring Payment Box */}
          <div className={`border-2 rounded-[1rem] p-3 sm:p-4 transition-all relative ${isRecurring ? 'border-dashed border-[#27C4E1] bg-[#27C4E1]/5' : 'border border-gray-200 bg-white shadow-sm'}`}>
            {isRecurring && <div className="absolute inset-0 bg-white/40 rounded-[1rem] pointer-events-none -z-10"></div>}
            
            <div className="flex items-center justify-between z-10 relative">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isRecurring ? 'bg-[#27C4E1] text-white shadow-sm' : 'bg-gray-100 text-[#27C4E1]'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                </div>
                <div>
                  <div className="font-bold text-[11px] uppercase tracking-wide text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>RECURRING PAYMENT</div>
                  <div className="text-xs text-gray-500 font-medium font-sans">Repeat this expense</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#27C4E1]"></div>
              </label>
            </div>

            {/* Expanded Recurring Options */}
            <AnimatePresence>
              {isRecurring && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-[#27C4E1]/30 flex flex-col gap-3 z-10 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    <div className="flex flex-col gap-1 w-1/3">
                      <span>Frequency</span>
                      <div className="relative border border-[#27C4E1] rounded-md px-2 py-1.5 focus-within:ring-2 focus-within:ring-[#27C4E1]/30 transition-all bg-white flex items-center">
                        <select value={recurringFrequency} onChange={e => setRecurringFrequency(e.target.value)} className="bg-transparent w-full text-sm focus:outline-none cursor-pointer appearance-none pr-4 font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
                           <option value="Daily">Daily</option>
                           <option value="Weekly">Weekly</option>
                           <option value="Monthly">Monthly</option>
                           <option value="Yearly">Yearly</option>
                        </select>
                        <svg className="w-3 h-3 text-gray-500 absolute right-2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 flex-1 px-4 text-center items-center">
                      <span>End On</span>
                      <div className="border border-gray-200 rounded-md px-2 py-1.5 bg-white flex items-center text-sm w-full font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <input type="date" value={recurringEndDate} onChange={e => setRecurringEndDate(e.target.value)} className="w-full bg-transparent focus:outline-none cursor-pointer" />
                      </div>
                    </div>
                    <span className="self-end pb-2 font-medium text-gray-500">or</span>
                    <div className="flex flex-col gap-1 w-1/4 pt-[18px]">
                      <span className="sr-only">Repeats</span>
                      <div className="border border-gray-200 rounded-md px-2 py-1.5 bg-white flex items-center justify-center relative shadow-sm">
                        <label className="absolute -top-5 left-1/2 -translate-x-1/2 text-gray-800 block text-[10px] w-full text-center">Repeats</label>
                        <input type="number" min="1" placeholder="12" value={recurringRepeats} onChange={e => setRecurringRepeats(e.target.value)} className="w-full bg-transparent font-medium text-center text-sm focus:outline-none" style={{ fontFamily: "'Inter', sans-serif" }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 text-center uppercase tracking-wider">
                     {recurringRepeats ? `Repeats ${recurringFrequency.toLowerCase()} ${recurringRepeats} times` : recurringEndDate ? `Repeats ${recurringFrequency.toLowerCase()} until ${new Date(recurringEndDate).toLocaleDateString()}` : `Repeats ${recurringFrequency.toLowerCase()} ongoing`}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-1">
          <Button 
            type="submit" 
            className="w-full py-3 sm:py-3.5 rounded-2xl shadow-[0_4px_14px_0_rgba(39,196,225,0.39)] text-base font-bold hover:shadow-[0_6px_20px_rgba(39,196,225,0.23)] hover:-translate-y-0.5 transition-all bg-[#27C4E1] text-white hover:bg-[#23B3CF] border-none flex items-center justify-center gap-2" 
            isLoading={isLoading}
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <span><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span>
            Save Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
}
