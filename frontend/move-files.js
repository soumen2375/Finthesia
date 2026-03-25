import fs from 'fs';
import path from 'path';

const moves = [
  // pages/auth
  ['src/pages/LoginPage', 'src/pages/auth/LoginPage'],
  ['src/pages/RegisterPage', 'src/pages/auth/RegisterPage'],
  ['src/pages/ForgotPasswordPage', 'src/pages/auth/ForgotPasswordPage'],

  // pages/public/marketing
  ['src/pages/LandingPage', 'src/pages/public/marketing/LandingPage'],
  ['src/pages/FeaturesPage', 'src/pages/public/marketing/FeaturesPage'],
  ['src/pages/PricingPage', 'src/pages/public/marketing/PricingPage'],
  ['src/pages/BlogPage', 'src/pages/public/marketing/BlogPage'],
  ['src/pages/AboutPage', 'src/pages/public/marketing/AboutPage'],
  ['src/pages/ContactPage', 'src/pages/public/marketing/ContactPage'],
  ['src/pages/FaqPage', 'src/pages/public/marketing/FaqPage'],

  // pages/public/legal
  ['src/pages/TermsPage', 'src/pages/public/legal/TermsPage'],
  ['src/pages/PrivacyPage', 'src/pages/public/legal/PrivacyPage'],
  ['src/pages/ShippingPage', 'src/pages/public/legal/ShippingPage'],
  ['src/pages/RefundsPage', 'src/pages/public/legal/RefundsPage'],

  // pages/app/dashboard
  ['src/pages/DashboardPage', 'src/pages/app/dashboard/DashboardPage'],
  ['src/pages/AnalyticsPage', 'src/pages/app/dashboard/AnalyticsPage'],
  ['src/pages/InsightsPage', 'src/pages/app/dashboard/InsightsPage'],
  ['src/pages/FinancialHealthPage', 'src/pages/app/dashboard/FinancialHealthPage'],
  ['src/pages/SpendingPredictionPage', 'src/pages/app/dashboard/SpendingPredictionPage'],
  ['src/pages/NetWorthPage', 'src/pages/app/dashboard/NetWorthPage'],

  // pages/app/accounts
  ['src/pages/BankAccountsPage', 'src/pages/app/accounts/BankAccountsPage'],
  ['src/pages/BankTransactionsPage', 'src/pages/app/accounts/BankTransactionsPage'],
  ['src/pages/CardsPage', 'src/pages/app/accounts/CardsPage'],

  // pages/app/assets_liabilities
  ['src/pages/AssetsPage', 'src/pages/app/assets_liabilities/AssetsPage'],
  ['src/pages/LiabilitiesPage', 'src/pages/app/assets_liabilities/LiabilitiesPage'],

  // pages/app/planning
  ['src/pages/BudgetsPage', 'src/pages/app/planning/BudgetsPage'],
  ['src/pages/BillsPage', 'src/pages/app/planning/BillsPage'],
  ['src/pages/SubscriptionsPage', 'src/pages/app/planning/SubscriptionsPage'],

  // pages/app/settings
  ['src/pages/SettingsPage', 'src/pages/app/settings/SettingsPage'],

  // COMPONENTS
  // components/layout
  ['src/components/AppLayout', 'src/components/layout/AppLayout'],
  ['src/components/Navbar', 'src/components/layout/Navbar'],
  ['src/components/Footer', 'src/components/layout/Footer'],
  ['src/components/PublicHeader', 'src/components/layout/PublicHeader'],
  ['src/components/PublicFooter', 'src/components/layout/PublicFooter'],

  // components/app (modals)
  ['src/components/TransactionModal', 'src/components/app/TransactionModal'],
  ['src/components/CardDetailsModal', 'src/components/app/CardDetailsModal'],
  ['src/components/AddBankAccountModal', 'src/components/app/AddBankAccountModal'],
  ['src/components/AddAssetModal', 'src/components/app/AddAssetModal'],
  ['src/components/AddLiabilityModal', 'src/components/app/AddLiabilityModal'],
  ['src/components/CSVUploadModal', 'src/components/app/CSVUploadModal'],
  ['src/components/PDFStatementModal', 'src/components/app/PDFStatementModal'],
  ['src/components/PDFImportButton', 'src/components/app/PDFImportButton'],

  // components/marketing
  ['src/components/Hero', 'src/components/marketing/Hero'],
  ['src/components/Features', 'src/components/marketing/Features'],
  ['src/components/Showcase', 'src/components/marketing/Showcase'],
  ['src/components/Workflow', 'src/components/marketing/Workflow'],
  ['src/components/CTA', 'src/components/marketing/CTA'],

  // components/common
  ['src/components/ErrorBoundary', 'src/components/common/ErrorBoundary'],
  ['src/components/ProtectedRoute', 'src/components/common/ProtectedRoute'],
  ['src/components/ScrollToTop', 'src/components/common/ScrollToTop'],
  ['src/components/BackToTop', 'src/components/common/BackToTop'],
];

// Step 1: Move the files
console.log('Moving files...');
for (const [src, dest] of moves) {
  const srcFile = src + '.tsx';
  const destFile = dest + '.tsx';
  if (fs.existsSync(srcFile)) {
    fs.mkdirSync(path.dirname(destFile), { recursive: true });
    fs.renameSync(srcFile, destFile);
  }
}

// Step 2: Global Search and Replace in all .ts and .tsx files
console.log('Updating imports...');

function walk(dir, call) {
  for (const f of fs.readdirSync(dir)) {
    const fPath = path.join(dir, f);
    if (fs.statSync(fPath).isDirectory()) walk(fPath, call);
    else call(fPath);
  }
}

walk('./src', (f) => {
  if (!f.endsWith('.ts') && !f.endsWith('.tsx')) return;
  let code = fs.readFileSync(f, 'utf8');
  let changed = false;

  for (const [src, dest] of moves) {
    // We want to replace `@/pages/LoginPage` with `@/pages/auth/LoginPage`
    const searchString = '@/' + src.replace('src/', '');
    const replacementString = '@/' + dest.replace('src/', '');

    // Replace all exact matches (usually inside quotes)
    if (code.includes(searchString)) {
      // split and join is an easy way to replaceAll without regex escaping
      code = code.split(searchString).join(replacementString);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(f, code);
  }
});

console.log('Done organizing project structure.');
