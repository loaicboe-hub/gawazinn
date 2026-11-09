import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp, SECTION_ROUTES, type SectionKey } from '../../context/AppContext';
import {
  Building2,
  Briefcase,
  Sparkles,
  Heart,
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Languages,
  FileText,
  BookOpen,
  MapPin,
  CreditCard,
  HeartHandshake,
  Wrench,
  HelpCircle,
  Calculator,
  Wallet,
  Compass,
  Layers,
  Gem,
  ListTodo,
  Store,
} from 'lucide-react';

export const Header: React.FC<{ onOpenCart: () => void }> = ({ onOpenCart }) => {
  const {
    language,
    setLanguage,
    dir,
    activeSection,
    currentUser,
    isStaff,
    logout,
    cartCount,
    setAuthModalOpen,
    settings,
  } = useApp();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: {
    key: SectionKey;
    to: string;
    labelAr: string;
    labelEn: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'finishing',
      to: '/finishing',
      labelAr: 'تشطيب الشقة',
      labelEn: 'Finishing',
      icon: <Building2 className="w-4 h-4 shrink-0" />,
    },
    {
      key: 'groom',
      to: '/groom',
      labelAr: 'جهاز العريس',
      labelEn: 'Groom',
      icon: <Briefcase className="w-4 h-4 shrink-0" />,
    },
    {
      key: 'bride',
      to: '/bride',
      labelAr: 'جهاز العروسة',
      labelEn: 'Bride',
      icon: <Sparkles className="w-4 h-4 shrink-0" />,
    },
    {
      key: 'wedding',
      to: '/wedding',
      labelAr: 'فرحي',
      labelEn: 'Wedding',
      icon: <Heart className="w-4 h-4 shrink-0" />,
    },
    {
      key: 'encyclopedia',
      to: '/encyclopedia',
      labelAr: 'الموسوعة',
      labelEn: 'Encyclopedia',
      icon: <BookOpen className="w-4 h-4 shrink-0" />,
    },
    {
      key: 'calculators',
      to: '/calculators',
      labelAr: 'الحاسبات',
      labelEn: 'Calculators',
      icon: <Calculator className="w-4 h-4 shrink-0" />,
    },
    {
      key: 'discover',
      to: '/discover',
      labelAr: 'المحافظات',
      labelEn: 'Locations',
      icon: <MapPin className="w-4 h-4 shrink-0" />,
    },
  ];

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D91B3E]/15 shadow-sm">
      {/* Top Tagline Announcement Bar */}
      <div className="bg-[#FFF8F9] text-[#B31331] text-[11px] sm:text-xs py-1.5 px-4 border-b border-[#FDE8ED]">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium min-w-0">
            <Heart className="w-3.5 h-3.5 fill-[#D91B3E] text-[#D91B3E] shrink-0" />
            <span className="font-bold truncate">
              {language === 'ar' ? settings.sloganAr : settings.sloganEn}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/vendors"
              className="hidden lg:inline-flex items-center gap-1 text-[11px] font-bold text-[#B31331] hover:text-[#D91B3E] transition"
            >
              <Store className="w-3 h-3" />
              <span>{language === 'ar' ? 'دليل الشركاء' : 'Vendors'}</span>
            </Link>
            <Link
              to="/real-weddings"
              className="hidden xl:inline-flex items-center gap-1 text-[11px] font-bold text-[#B31331] hover:text-[#D91B3E] transition"
            >
              <Heart className="w-3 h-3" />
              <span>{language === 'ar' ? 'قصص الزفاف' : 'Real Weddings'}</span>
            </Link>
            <Link
              to="/community"
              className="hidden lg:inline-flex items-center gap-1 text-[11px] font-bold text-[#B31331] hover:text-[#D91B3E] transition"
            >
              <HelpCircle className="w-3 h-3" />
              <span>{language === 'ar' ? 'المجتمع' : 'Community'}</span>
            </Link>
            <Link
              to="/products"
              className="hidden lg:inline-flex items-center gap-1 text-[11px] font-bold text-[#B31331] hover:text-[#D91B3E] transition"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>{language === 'ar' ? 'المنتجات والأسعار' : 'Products'}</span>
            </Link>
            <Link
              to="/onboarding"
              className="hidden xl:inline-flex items-center gap-1 text-[11px] font-bold text-[#B31331] hover:text-[#D91B3E] transition"
            >
              <Layers className="w-3 h-3" />
              <span>{language === 'ar' ? '11 مرحلة' : '11 Stages'}</span>
            </Link>
            <Link
              to="/early-start"
              className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-[#B31331] hover:text-[#D91B3E] transition"
            >
              <Compass className="w-3 h-3" />
              <span>{language === 'ar' ? 'البداية المبكرة' : 'Early Start'}</span>
            </Link>
            <Link
              to="/my/budget"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#B31331] hover:text-[#D91B3E] transition"
            >
              <Wallet className="w-3 h-3" />
              <span>{language === 'ar' ? 'ميزانية الزواج' : 'Wedding Budget'}</span>
            </Link>
            <Link
              to="/installments"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#B31331] hover:text-[#D91B3E] transition"
            >
              <CreditCard className="w-3 h-3" />
              <span>{language === 'ar' ? 'التقسيط' : 'Installments'}</span>
            </Link>
            <button
              type="button"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              data-testid="lang-switch-btn"
              className="text-[#D91B3E] hover:text-[#99132B] font-bold text-xs flex items-center gap-1 transition px-2 py-0.5 rounded-lg hover:bg-white cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo & Brand Name */}
          <Link
            to="/"
            onClick={closeMenus}
            className="flex items-center group shrink-0 min-w-0"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xl sm:text-3xl font-black text-[#2A1D20] tracking-tight group-hover:text-[#D91B3E] transition">
                  {language === 'ar' ? 'جواز إن' : 'GAWAZ INN'}
                </span>
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#D91B3E]" />
              </div>
              <span className="text-[11px] text-[#B31331] font-semibold hidden sm:block">
                {language === 'ar' ? 'من أول الشقة.. لحد ليلة العمر' : 'Marriage & Home Ecosystem'}
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-0.5 xl:gap-1 min-w-0">
            {navLinks.map((link) => {
              const isActive = activeSection === link.key;
              return (
                <Link
                  key={link.key}
                  to={link.to}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={`px-2 xl:px-2.5 py-2 rounded-xl text-[11px] xl:text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#D91B3E] text-white shadow-md'
                      : 'text-gray-700 hover:text-[#D91B3E] hover:bg-[#FDE8ED]'
                  }`}
                >
                  {link.icon}
                  <span>{language === 'ar' ? link.labelAr : link.labelEn}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              data-testid="header-cart-btn"
              className="relative p-2 sm:p-2.5 rounded-xl bg-gray-50 hover:bg-[#FDE8ED] text-gray-700 hover:text-[#D91B3E] border border-gray-200 hover:border-[#D91B3E]/30 transition group cursor-pointer"
              title={language === 'ar' ? 'سلة المشتريات' : 'Shopping Cart'}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 group-hover:text-[#D91B3E] transition" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D91B3E] text-white text-[11px] font-black rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {/* My Requests Portal Shortcut */}
            <Link
              to={SECTION_ROUTES.customerPortal}
              onClick={closeMenus}
              className={`p-2 sm:p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold ${
                activeSection === 'customerPortal'
                  ? 'bg-[#D91B3E] text-white border-[#D91B3E]'
                  : 'bg-gray-50 hover:bg-[#FDE8ED] text-gray-700 border-gray-200 hover:border-[#D91B3E]/30'
              }`}
              title={language === 'ar' ? 'طلباتي ومتابعاتي' : 'My Requests'}
            >
              <FileText className="w-4 h-4 text-current" />
              <span className="hidden xl:inline">
                {language === 'ar' ? 'طلباتي' : 'Requests'}
              </span>
            </Link>

            {/* User Account / Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  data-testid="user-menu-btn"
                  className="flex items-center gap-1.5 sm:gap-2 p-1.5 pe-2 sm:pe-2.5 ps-1.5 rounded-xl bg-gray-50 hover:bg-[#FDE8ED] border border-gray-200 transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-red-gradient text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-gray-800 hidden sm:inline">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div
                    className={`absolute mt-2 w-60 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50 ${
                      dir === 'rtl' ? 'left-0' : 'right-0'
                    }`}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{currentUser.email}</p>
                    </div>

                    <Link
                      to="/portal"
                      onClick={closeMenus}
                      className="w-full px-4 py-2 text-start text-xs text-gray-700 hover:bg-[#FDE8ED] hover:text-[#D91B3E] font-medium flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#D91B3E]" />
                      <span>
                        {language === 'ar' ? 'حسابي ومتابعة الطلبات' : 'My Account & Requests'}
                      </span>
                    </Link>

                    <Link
                      to="/my/workspace"
                      onClick={closeMenus}
                      data-testid="usermenu-my-workspace"
                      className="w-full px-4 py-2 text-start text-xs text-[#D91B3E] bg-[#FFF8F9] hover:bg-[#FDE8ED] font-bold flex items-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#D91B3E]" />
                      <span>
                        {language === 'ar'
                          ? 'مركزي (17 وحدة) ومساحة الزوجين'
                          : 'My Hub (17) & Couple Workspace'}
                      </span>
                    </Link>

                    <Link
                      to="/onboarding"
                      onClick={closeMenus}
                      className="w-full px-4 py-2 text-start text-xs text-gray-700 hover:bg-[#FDE8ED] hover:text-[#D91B3E] font-medium flex items-center gap-2"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#D91B3E]" />
                      <span>
                        {language === 'ar' ? 'مسارك في 11 مرحلة' : '11-Stage Onboarding'}
                      </span>
                    </Link>

                    <Link
                      to="/engagement"
                      onClick={closeMenus}
                      className="w-full px-4 py-2 text-start text-xs text-gray-700 hover:bg-[#FDE8ED] hover:text-[#D91B3E] font-medium flex items-center gap-2"
                    >
                      <Gem className="w-3.5 h-3.5 text-[#D91B3E]" />
                      <span>
                        {language === 'ar' ? 'مخطط الخطوبة والشبكة' : 'Engagement Planner'}
                      </span>
                    </Link>

                    <Link
                      to="/journey"
                      onClick={closeMenus}
                      className="w-full px-4 py-2 text-start text-xs text-gray-700 hover:bg-[#FDE8ED] hover:text-[#D91B3E] font-medium flex items-center gap-2"
                    >
                      <ListTodo className="w-3.5 h-3.5 text-[#D91B3E]" />
                      <span>
                        {language === 'ar' ? 'مخطط رحلة الزواج' : 'Wedding Journey Planner'}
                      </span>
                    </Link>

                    <Link
                      to="/my/future-fund"
                      onClick={closeMenus}
                      className="w-full px-4 py-2 text-start text-xs text-gray-700 hover:bg-[#FDE8ED] hover:text-[#D91B3E] font-medium flex items-center gap-2"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#D91B3E]" />
                      <span>
                        {language === 'ar' ? 'البداية المبكرة وصندوق مستقبلي' : 'Early Start & Future Fund'}
                      </span>
                    </Link>

                    <Link
                      to="/my/budget"
                      onClick={closeMenus}
                      className="w-full px-4 py-2 text-start text-xs text-gray-700 hover:bg-[#FDE8ED] hover:text-[#D91B3E] font-medium flex items-center gap-2"
                    >
                      <Wallet className="w-3.5 h-3.5 text-[#D91B3E]" />
                      <span>
                        {language === 'ar' ? 'مدير ميزانية الزواج' : 'Wedding Budget Manager'}
                      </span>
                    </Link>

                    <Link
                      to="/my/shopping-lists"
                      onClick={closeMenus}
                      className="w-full px-4 py-2 text-start text-xs text-gray-700 hover:bg-[#FDE8ED] hover:text-[#D91B3E] font-medium flex items-center gap-2"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#D91B3E]" />
                      <span>
                        {language === 'ar' ? 'سلال المشتريات وتنبيهات الأسعار' : 'Shopping Baskets & Alerts'}
                      </span>
                    </Link>

                    <Link
                      to="/calculators"
                      onClick={closeMenus}
                      className="w-full px-4 py-2 text-start text-xs text-gray-700 hover:bg-[#FDE8ED] hover:text-[#D91B3E] font-medium flex items-center gap-2"
                    >
                      <Calculator className="w-3.5 h-3.5 text-[#D91B3E]" />
                      <span>{language === 'ar' ? '20 حاسبة ذكية' : '20 Smart Calculators'}</span>
                    </Link>

                    <Link
                      to="/vendors"
                      onClick={closeMenus}
                      className="w-full px-4 py-2 text-start text-xs text-gray-700 hover:bg-[#FDE8ED] hover:text-[#D91B3E] font-medium flex items-center gap-2"
                    >
                      <Store className="w-3.5 h-3.5 text-[#D91B3E]" />
                      <span>{language === 'ar' ? 'دليل الشركاء (17 تصنيفاً)' : 'Vendors Directory'}</span>
                    </Link>

                    <Link
                      to="/rfq"
                      onClick={closeMenus}
                      data-testid="usermenu-rfq-center"
                      className="w-full px-4 py-2 text-start text-xs text-gray-700 hover:bg-[#FDE8ED] hover:text-[#D91B3E] font-medium flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#D91B3E]" />
                      <span>
                        {language === 'ar' ? 'طلبات التسعير والمواعيد' : 'RFQs & Slot Bookings'}
                      </span>
                    </Link>

                    <Link
                      to="/vendor"
                      onClick={closeMenus}
                      data-testid="usermenu-vendor-portal"
                      className="w-full px-4 py-2 text-start text-xs text-[#D91B3E] bg-[#FFF8F9] hover:bg-[#FDE8ED] font-bold flex items-center gap-2"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-[#D91B3E]" />
                      <span>{language === 'ar' ? 'بوابة الشريك التجاري' : 'Vendor Partner Portal'}</span>
                    </Link>

                    {isStaff && (
                      <Link
                        to="/admin"
                        onClick={closeMenus}
                        className="w-full px-4 py-2 text-start text-xs text-[#D91B3E] bg-[#FDE8ED] hover:bg-[#FCE4EC] font-bold flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#D91B3E]" />
                        <span>
                          {language === 'ar' ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}
                        </span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        void logout();
                        closeMenus();
                      }}
                      className="w-full px-4 py-2 text-start text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                data-testid="header-login-btn"
                className="bg-red-gradient text-white font-bold text-[11px] sm:text-xs px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md hover:opacity-95 transition flex items-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
              className="lg:hidden p-2 rounded-xl bg-gray-50 text-gray-700 hover:text-[#D91B3E] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              to={link.to}
              onClick={closeMenus}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeSection === link.key
                  ? 'bg-[#D91B3E] text-white'
                  : 'text-gray-700 hover:bg-[#FDE8ED]'
              }`}
            >
              <div className="flex items-center gap-3">
                {link.icon}
                <span>{language === 'ar' ? link.labelAr : link.labelEn}</span>
              </div>
            </Link>
          ))}
          <Link
            to="/onboarding"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-[#D91B3E] bg-[#FFF8F9] hover:bg-[#FDE8ED]"
          >
            <Layers className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'مسارك في 11 مرحلة + مركزي' : '11-Stage Onboarding & Hub'}</span>
          </Link>
          <Link
            to="/engagement"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#FDE8ED]"
          >
            <Gem className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'مخطط الخطوبة' : 'Engagement Planner'}</span>
          </Link>
          <Link
            to="/journey"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#FDE8ED]"
          >
            <ListTodo className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'مخطط رحلة الزواج' : 'Wedding Journey Planner'}</span>
          </Link>
          <Link
            to="/early-start"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-[#D91B3E] bg-[#FFF8F9] hover:bg-[#FDE8ED]"
          >
            <Compass className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'البداية المبكرة وصندوق المستقبل' : 'Early Start & Future Fund'}</span>
          </Link>
          <Link
            to="/my/budget"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-[#D91B3E] bg-[#FDE8ED]/70 hover:bg-[#FDE8ED]"
          >
            <Wallet className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'مدير ميزانية الزواج' : 'Wedding Budget Manager'}</span>
          </Link>
          <Link
            to="/products"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#FDE8ED]"
          >
            <ShoppingBag className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'موسوعة المنتجات ومقارنة الأسعار' : 'Products & Price Compare'}</span>
          </Link>
          <Link
            to="/vendors"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-[#D91B3E] bg-[#FFF8F9] hover:bg-[#FDE8ED]"
          >
            <Store className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'دليل الشركاء والموردين (17 تصنيفاً)' : 'Vendors Directory'}</span>
          </Link>
          <Link
            to="/real-weddings"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#FDE8ED]"
          >
            <Heart className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'قصص الزفاف والميزانيات' : 'Real Weddings & Budgets'}</span>
          </Link>
          <Link
            to="/community"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#FDE8ED]"
          >
            <HelpCircle className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'منتدى الأسئلة والخبراء' : 'Community Q&A'}</span>
          </Link>
          <Link
            to="/experts"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#FDE8ED]"
          >
            <Sparkles className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'دليل الخبراء المعتمدين' : 'Verified Experts Directory'}</span>
          </Link>
          <Link
            to="/rfq"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#FDE8ED]"
          >
            <FileText className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'طلبات التسعير ومقارنة العروض' : 'RFQs & Quote Compare'}</span>
          </Link>
          <Link
            to="/vendor"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#FDE8ED]"
          >
            <Briefcase className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'بوابة الشريك التجاري' : 'Vendor Partner Portal'}</span>
          </Link>
          <Link
            to="/my/shopping-lists"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#FDE8ED]"
          >
            <ListTodo className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'سلال المشتريات وتنبيهات الأسعار' : 'Shopping Baskets & Alerts'}</span>
          </Link>
          <Link
            to="/finishing/materials"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#FDE8ED]"
          >
            <Wrench className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'دليل الخامات والمقاولين' : 'Materials & Contractors'}</span>
          </Link>
          <Link
            to="/glossary"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#FDE8ED]"
          >
            <BookOpen className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'قاموس المصطلحات' : 'Glossary'}</span>
          </Link>
          <Link
            to="/faqs"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#FDE8ED]"
          >
            <HelpCircle className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'الأسئلة الشائعة' : 'FAQs'}</span>
          </Link>
          <Link
            to="/installments"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#FDE8ED]"
          >
            <CreditCard className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'حلول التقسيط' : 'Installments'}</span>
          </Link>
          <Link
            to="/social-support"
            onClick={closeMenus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-[#B31331] bg-[#FFF8F9]"
          >
            <HeartHandshake className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'مبادرة الدعم المجتمعي' : 'Social Support'}</span>
          </Link>
        </div>
      )}
    </header>
  );
};
