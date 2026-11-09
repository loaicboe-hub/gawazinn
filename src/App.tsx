import React, { Suspense, lazy, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Toast } from './components/layout/Toast';
import { SeoHead } from './components/common/SeoHead';
import { IntroSplashScreen } from './components/intro/IntroSplashScreen';
import { SplashHome } from './components/home/SplashHome';
import { NotFoundView } from './components/common/NotFoundView';
import { AuthModal } from './components/modals/AuthModal';
import { FinishingQuoteModal } from './components/modals/FinishingQuoteModal';
import { WeddingBookingModal } from './components/modals/WeddingBookingModal';
import { ProductDetailModal } from './components/modals/ProductDetailModal';
import { InstallmentModal } from './components/modals/InstallmentModal';
import { SupportModal } from './components/modals/SupportModal';
import { SponsorModal } from './components/modals/SponsorModal';
import { ProductCompareModal } from './components/modals/ProductCompareModal';
import { CartDrawer } from './components/cart/CartDrawer';
import type { Product } from './types';

const FinishingView = lazy(() =>
  import('./components/finishing/FinishingView').then((m) => ({ default: m.FinishingView })),
);
const FinishingEncyclopediaView = lazy(() =>
  import('./components/finishing/FinishingEncyclopediaView').then((m) => ({
    default: m.FinishingEncyclopediaView,
  })),
);
const GroomView = lazy(() =>
  import('./components/groom/GroomView').then((m) => ({ default: m.GroomView })),
);
const GroomEncyclopediaView = lazy(() =>
  import('./components/groom/GroomEncyclopediaView').then((m) => ({
    default: m.GroomEncyclopediaView,
  })),
);
const BrideView = lazy(() =>
  import('./components/bride/BrideView').then((m) => ({ default: m.BrideView })),
);
const BrideEncyclopediaView = lazy(() =>
  import('./components/bride/BrideEncyclopediaView').then((m) => ({
    default: m.BrideEncyclopediaView,
  })),
);
const WeddingPlannerView = lazy(() =>
  import('./components/wedding/WeddingPlannerView').then((m) => ({
    default: m.WeddingPlannerView,
  })),
);
const FinancingView = lazy(() =>
  import('./components/financing/FinancingView').then((m) => ({ default: m.FinancingView })),
);
const SocialSupportView = lazy(() =>
  import('./components/social/SocialSupportView').then((m) => ({ default: m.SocialSupportView })),
);
const EncyclopediaHubView = lazy(() =>
  import('./components/encyclopedia/EncyclopediaHubView').then((m) => ({
    default: m.EncyclopediaHubView,
  })),
);
const GlossaryFaqView = lazy(() =>
  import('./components/encyclopedia/GlossaryFaqView').then((m) => ({
    default: m.GlossaryFaqView,
  })),
);
const ArticleDetailView = lazy(() =>
  import('./components/encyclopedia/ArticleDetailView').then((m) => ({
    default: m.ArticleDetailView,
  })),
);
const LocalDiscoveryView = lazy(() =>
  import('./components/discovery/LocalDiscoveryView').then((m) => ({
    default: m.LocalDiscoveryView,
  })),
);
const CustomerPortalView = lazy(() =>
  import('./components/customer/CustomerPortalView').then((m) => ({
    default: m.CustomerPortalView,
  })),
);
const AdminDashboardView = lazy(() =>
  import('./components/admin/AdminDashboardView').then((m) => ({
    default: m.AdminDashboardView,
  })),
);
const CalculatorsHubView = lazy(() =>
  import('./components/calculators/CalculatorsHubView').then((m) => ({
    default: m.CalculatorsHubView,
  })),
);
const CalculatorDetailView = lazy(() =>
  import('./components/calculators/CalculatorDetailView').then((m) => ({
    default: m.CalculatorDetailView,
  })),
);
const BudgetManagerView = lazy(() =>
  import('./components/budget/BudgetManagerView').then((m) => ({
    default: m.BudgetManagerView,
  })),
);
const EarlyStartDashboardView = lazy(() =>
  import('./components/earlyStart/EarlyStartDashboardView').then((m) => ({
    default: m.EarlyStartDashboardView,
  })),
);

const RouteLoadingFallback: React.FC = () => {
  const { language } = useApp();
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 px-4 py-16">
      <div className="w-10 h-10 rounded-full border-4 border-[#FDE8ED] border-t-[#D91B3E] animate-spin" />
      <p className="text-xs font-bold text-[#B31331]">
        {language === 'ar' ? 'جاري تحميل القسم...' : 'Loading section...'}
      </p>
    </div>
  );
};

const MainContent: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [productsToCompare, setProductsToCompare] = useState<Product[]>([]);

  const handleOpenCompare = (prods: Product[]) => {
    setProductsToCompare(prods);
    setCompareModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-[#2A1D20] selection:bg-[#D91B3E]/20 selection:text-[#D91B3E]">
      <SeoHead />

      {/* 5-Second Wedding Intro Splash Screen */}
      <IntroSplashScreen />

      {/* Universal Wedding Header */}
      <Header onOpenCart={() => setIsCartOpen(true)} />

      {/* Main Content Area with React Router Routes */}
      <main className="flex-1">
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<SplashHome />} />
            <Route path="/finishing" element={<FinishingView />} />
            <Route path="/finishing/encyclopedia" element={<FinishingEncyclopediaView />} />
            <Route path="/finishing/materials" element={<FinishingEncyclopediaView />} />
            <Route path="/finishing/contractors" element={<FinishingEncyclopediaView />} />
            <Route path="/groom" element={<GroomView onOpenCompare={handleOpenCompare} />} />
            <Route path="/groom/encyclopedia" element={<GroomEncyclopediaView />} />
            <Route path="/bride" element={<BrideView />} />
            <Route path="/bride/encyclopedia" element={<BrideEncyclopediaView />} />
            <Route path="/wedding" element={<WeddingPlannerView />} />
            <Route path="/installments" element={<FinancingView />} />
            <Route path="/social-support" element={<SocialSupportView />} />
            <Route path="/encyclopedia" element={<EncyclopediaHubView />} />
            <Route path="/encyclopedia/:domain" element={<EncyclopediaHubView />} />
            <Route path="/glossary" element={<GlossaryFaqView />} />
            <Route path="/faqs" element={<GlossaryFaqView />} />
            <Route path="/guides/:slug" element={<ArticleDetailView />} />
            <Route path="/discover" element={<LocalDiscoveryView />} />
            <Route path="/locations/:govSlug" element={<LocalDiscoveryView />} />
            <Route path="/calculators" element={<CalculatorsHubView />} />
            <Route path="/calculators/:slug" element={<CalculatorDetailView />} />
            <Route path="/my/budget" element={<BudgetManagerView />} />
            <Route path="/early-start" element={<EarlyStartDashboardView />} />
            <Route
              path="/early-start/academy"
              element={<EarlyStartDashboardView initialTab="academy" />}
            />
            <Route
              path="/my/future-fund"
              element={<EarlyStartDashboardView initialTab="fund" />}
            />
            <Route
              path="/portal"
              element={<CustomerPortalView onOpenCart={() => setIsCartOpen(true)} />}
            />
            <Route path="/admin" element={<AdminDashboardView />} />
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </Suspense>
      </main>

      {/* Universal Wedding Footer */}
      <Footer />

      {/* Modals & Slide-out Drawers */}
      <AuthModal />
      <FinishingQuoteModal />
      <WeddingBookingModal />
      <ProductDetailModal />
      <InstallmentModal />
      <SupportModal />
      <SponsorModal />
      <ProductCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        productsToCompare={productsToCompare}
      />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Floating Animated Toast */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
