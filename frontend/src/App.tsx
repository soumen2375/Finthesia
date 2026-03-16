import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import BlogPage from './pages/BlogPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FaqPage from './pages/FaqPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ShippingPage from './pages/ShippingPage';
import RefundsPage from './pages/RefundsPage';
import DashboardPage from './pages/DashboardPage';
import NetWorthPage from './pages/NetWorthPage';
import CardsPage from './pages/CardsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import BudgetsPage from './pages/BudgetsPage';
import BillsPage from './pages/BillsPage';
import InsightsPage from './pages/InsightsPage';
import BankAccountsPage from './pages/BankAccountsPage';
import BankTransactionsPage from './pages/BankTransactionsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import FinancialHealthPage from './pages/FinancialHealthPage';
import SpendingPredictionPage from './pages/SpendingPredictionPage';
import LiabilitiesPage from './pages/LiabilitiesPage';
import AssetsPage from './pages/AssetsPage';
import AppLayout from './components/AppLayout';
import { UIProvider } from './context/UIContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import BackToTop from './components/BackToTop';

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
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/shipping" element={<ShippingPage />} />
                  <Route path="/refunds" element={<RefundsPage />} />
                  
                  {/* Authenticated Routes */}
                  <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/net-worth" element={<NetWorthPage />} />
                    <Route path="/cards" element={<CardsPage />} />
                    <Route path="/liabilities" element={<LiabilitiesPage />} />
                    <Route path="/assets" element={<AssetsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
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
