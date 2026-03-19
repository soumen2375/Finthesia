import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function BackToTop() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const location = useLocation();

  if (!showBackToTop) return null;

  // Don't show Back To Top on authenticated dashboard pages (AppLayout wraps these)
  const isDashboardRoute = [
    '/dashboard', '/net-worth', '/cards', '/liabilities', '/assets', 
    '/analytics', '/budgets', '/bills', '/insights', '/banks', 
    '/subscriptions', '/financial-health', '/spending-predictions', '/settings'
  ].some(route => location.pathname.startsWith(route));

  if (isDashboardRoute) return null;

  return (
    <button 
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-white rounded-full p-2 sm:p-3 shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all z-[9999] flex items-center justify-center border border-slate-100"
      aria-label="Back to top"
    >
      <ArrowUp className="w-5 h-5 stroke-[4] text-[#27C4E1]" />
    </button>
  );
}
