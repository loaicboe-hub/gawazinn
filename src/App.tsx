import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Toast } from './components/layout/Toast';
import { IntroSplashScreen } from './components/intro/IntroSplashScreen';
import { SplashHome } from './components/home/SplashHome';
import { FinishingView } from './components/finishing/FinishingView';
import { GroomView } from './components/groom/GroomView';
import { BrideView } from './components/bride/BrideView';
import { WeddingPlannerView } from './components/wedding/WeddingPlannerView';
import { FinancingView } from './components/financing/FinancingView';
import { SocialSupportView } from './components/social/SocialSupportView';
import { CustomerPortalView } from './components/customer/CustomerPortalView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AuthModal } from './components/modals/AuthModal';
import { FinishingQuoteModal } from './components/modals/FinishingQuoteModal';
import { WeddingBookingModal } from './components/modals/WeddingBookingModal';
import { ProductDetailModal } from './components/modals/ProductDetailModal';
import { InstallmentModal } from './components/modals/InstallmentModal';
import { SupportModal } from './components/modals/SupportModal';
import { SponsorModal } from './components/modals/SponsorModal';
import { ProductCompareModal } from './components/modals/ProductCompareModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { Product } from './types';

const MainContent: React.FC = () => {
  const { activeSection } = useApp();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [productsToCompare, setProductsToCompare] = useState<Product[]>([]);

  const handleOpenCompare = (prods: Product[]) => {
    setProductsToCompare(prods);
    setCompareModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-[#2A1D20] selection:bg-[#D91B3E]/20 selection:text-[#D91B3E]">
      
      {/* 5-Second Wedding Intro Splash Screen */}
      <IntroSplashScreen />

      {/* Universal Wedding Header */}
      <Header onOpenCart={() => setIsCartOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeSection === 'home' && <SplashHome />}
        {activeSection === 'finishing' && <FinishingView />}
        {activeSection === 'groom' && <GroomView onOpenCompare={handleOpenCompare} />}
        {activeSection === 'bride' && <BrideView />}
        {activeSection === 'wedding' && <WeddingPlannerView />}
        {activeSection === 'installments' && <FinancingView />}
        {activeSection === 'socialSupport' && <SocialSupportView />}
        {activeSection === 'customerPortal' && <CustomerPortalView onOpenCart={() => setIsCartOpen(true)} />}
        {activeSection === 'admin' && <AdminDashboardView />}
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
