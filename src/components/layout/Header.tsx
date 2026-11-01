import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  FileText
} from 'lucide-react';

export const Header: React.FC<{ onOpenCart: () => void }> = ({ onOpenCart }) => {
  const { 
    language, 
    setLanguage, 
    dir, 
    activeSection, 
    setActiveSection, 
    currentUser, 
    logout, 
    cartCount, 
    setAuthModalOpen
  } = useApp();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { key: 'finishing', labelAr: 'تشطيب الشقة', labelEn: 'Apartment Finishing', icon: <Building2 className="w-4 h-4" /> },
    { key: 'groom', labelAr: 'جهاز العريس', labelEn: "Groom's Essentials", icon: <Briefcase className="w-4 h-4" /> },
    { key: 'bride', labelAr: 'جهاز العروسة', labelEn: "Bride's Essentials", icon: <Sparkles className="w-4 h-4" /> },
    { key: 'wedding', labelAr: 'فرحي', labelEn: 'Wedding Planner', icon: <Heart className="w-4 h-4" /> },
  ];

  const handleNavClick = (key: any) => {
    setActiveSection(key);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D91B3E]/15 shadow-sm">
      
      {/* Top Tagline Announcement Bar */}
      <div className="bg-[#FFF8F9] text-[#B31331] text-[11px] sm:text-xs py-1.5 px-4 border-b border-[#FDE8ED]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-medium">
            <Heart className="w-3.5 h-3.5 fill-[#D91B3E] text-[#D91B3E]" />
            <span className="font-bold">
              {language === 'ar' ? 'من أول الشقة.. لحد ليلة العمر.' : 'From Apartment Keys.. To Your Dream Wedding.'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="text-[#D91B3E] hover:text-[#99132B] font-bold text-xs flex items-center gap-1 transition px-2 py-0.5 rounded-lg hover:bg-white"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Name */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center cursor-pointer group"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-[#2A1D20] tracking-tight group-hover:text-[#D91B3E] transition">
                  {language === 'ar' ? 'جواز إن' : 'GAWAZ INN'}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#D91B3E]"></span>
              </div>
              <span className="text-[11px] text-[#B31331] font-semibold hidden sm:block">
                {language === 'ar' ? 'من أول الشقة.. لحد ليلة العمر' : 'Wedding & Home Platform'}
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Available across sections) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.key;
              return (
                <button
                  key={link.key}
                  onClick={() => handleNavClick(link.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#D91B3E] text-white shadow-md'
                      : 'text-gray-700 hover:text-[#D91B3E] hover:bg-[#FDE8ED]'
                  }`}
                >
                  {link.icon}
                  <span>{language === 'ar' ? link.labelAr : link.labelEn}</span>
                </button>
              );
            })}
          </nav>

          {/* User Actions (Cart, Profile / Login) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Unified Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-[#FDE8ED] text-gray-700 hover:text-[#D91B3E] border border-gray-200 hover:border-[#D91B3E]/30 transition group"
              title={language === 'ar' ? 'سلة المشتريات' : 'Shopping Cart'}
            >
              <ShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-[#D91B3E] transition" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D91B3E] text-white text-[11px] font-black rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {/* My Requests Hub Shortcut */}
            <button
              onClick={() => handleNavClick('customerPortal')}
              className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold ${
                activeSection === 'customerPortal'
                  ? 'bg-[#D91B3E] text-white border-[#D91B3E]'
                  : 'bg-gray-50 hover:bg-[#FDE8ED] text-gray-700 border-gray-200 hover:border-[#D91B3E]/30'
              }`}
              title={language === 'ar' ? 'طلباتي ومتابعاتي' : 'My Requests'}
            >
              <FileText className="w-4 h-4 text-[#D91B3E]" />
              <span className="hidden xl:inline">{language === 'ar' ? 'طلباتي' : 'Requests'}</span>
            </button>

            {/* User Account / Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 pl-2 rounded-xl bg-gray-50 hover:bg-[#FDE8ED] border border-gray-200 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-red-gradient text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-gray-800 hidden sm:inline">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div 
                    className={`absolute mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50 ${
                      dir === 'rtl' ? 'left-0' : 'right-0'
                    }`}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{currentUser.phone}</p>
                    </div>

                    <button
                      onClick={() => {
                        handleNavClick('customerPortal');
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-right text-xs text-gray-700 hover:bg-[#FDE8ED] hover:text-[#D91B3E] font-medium flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#D91B3E]" />
                      <span>{language === 'ar' ? 'حسابي ومتابعة الطلبات' : 'My Account & Requests'}</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          handleNavClick('admin');
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-right text-xs text-[#D91B3E] bg-[#FDE8ED] hover:bg-[#FCE4EC] font-bold flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#D91B3E]" />
                        <span>{language === 'ar' ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-right text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-red-gradient text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md hover:opacity-95 transition flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-gray-50 text-gray-700 hover:text-[#D91B3E]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.key}
              onClick={() => handleNavClick(link.key)}
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
            </button>
          ))}
        </div>
      )}

    </header>
  );
};
