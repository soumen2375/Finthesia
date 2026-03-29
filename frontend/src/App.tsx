import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ScrollToTop from '@/components/common/ScrollToTop';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import LandingPage from '@/pages/public/marketing/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import FeaturesPage from '@/pages/public/marketing/FeaturesPage';
import PricingPage from '@/pages/public/marketing/PricingPage';
import BlogPage from '@/pages/public/marketing/BlogPage';
import AboutPage from '@/pages/public/marketing/AboutPage';
import ContactPage from '@/pages/public/marketing/ContactPage';
import FaqPage from '@/pages/public/marketing/FaqPage';
import TermsPage from '@/pages/public/legal/TermsPage';
import PrivacyPage from '@/pages/public/legal/PrivacyPage';
import ShippingPage from '@/pages/public/legal/ShippingPage';
import RefundsPage from '@/pages/public/legal/RefundsPage';
import DashboardPage from '@/pages/app/dashboard/DashboardPage';
import NetWorthPage from '@/pages/app/dashboard/NetWorthPage';
import CardsPage from '@/pages/app/accounts/CardsPage';
import AnalyticsPage from '@/pages/app/dashboard/AnalyticsPage';
import SettingsPage from '@/pages/app/settings/SettingsPage';
import BudgetsPage from '@/pages/app/planning/BudgetsPage';
import BillsPage from '@/pages/app/planning/BillsPage';
import InsightsPage from '@/pages/app/dashboard/InsightsPage';
import BankAccountsPage from '@/pages/app/accounts/BankAccountsPage';
import BankTransactionsPage from '@/pages/app/accounts/BankTransactionsPage';
import SubscriptionsPage from '@/pages/app/planning/SubscriptionsPage';
import FinancialHealthPage from '@/pages/app/dashboard/FinancialHealthPage';
import SpendingPredictionPage from '@/pages/app/dashboard/SpendingPredictionPage';
import LiabilitiesPage from '@/pages/app/assets_liabilities/LiabilitiesPage';
import AssetsPage from '@/pages/app/assets_liabilities/AssetsPage';
import AppLayout from '@/components/layout/AppLayout';
import { UIProvider } from '@/context/UIContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import BackToTop from '@/components/common/BackToTop';
import UnifiedLedgerPage from '@/pages/app/ledger/UnifiedLedgerPage';

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "82556317420-qg2qa3c150969dliqrpl8mufhaimtiga.apps.googleusercontent.com";

  return (
    <ErrorBoundary>
    <AuthProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <Router>
            <UIProvider>
              <ToastProvider>
                <ScrollToTop />
                <BackToTop />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPage />} />
                  <Route path="/privacy-policy/" element={<PrivacyPage />} />
                  <Route path="/shipping" element={<ShippingPage />} />
                  <Route path="/refunds" element={<RefundsPage />} />
                  
                  {/* Authenticated Routes */}
                  <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/net-worth" element={<NetWorthPage />} />
                    <Route path="/cards" element={<CardsPage />} />
                    <Route path="/liabilities" element={<LiabilitiesPage />} />
                    <Route path="/assets" element={<AssetsPage />} />
                    <Route path="/budgets" element={<BudgetsPage />} />
                    <Route path="/bills" element={<BillsPage />} />
                    <Route path="/insights" element={<InsightsPage />} />
                    <Route path="/banks" element={<BankAccountsPage />} />
                    <Route path="/banks/:bankId" element={<BankTransactionsPage />} />
                    <Route path="/subscriptions" element={<SubscriptionsPage />} />
                    <Route path="/financial-health" element={<FinancialHealthPage />} />
                    <Route path="/spending-predictions" element={<SpendingPredictionPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                  
                  {/* Standalone Ledger Layout Route */}
                  <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                    <Route path="/ledger" element={<UnifiedLedgerPage />} />
                  </Route>
                  
                  {/* Default route */}
                  <Route path="/" element={<LandingPage />} />
                </Routes>
              </ToastProvider>
            </UIProvider>
          </Router>
      </GoogleOAuthProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}
