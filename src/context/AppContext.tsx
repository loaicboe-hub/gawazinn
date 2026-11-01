import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Language, 
  User, 
  Product, 
  CartItem, 
  FinishingInquiry, 
  WeddingBookingRequest, 
  WeddingServiceItem, 
  Order, 
  FinancingApplication, 
  SupportCase, 
  SponsorshipInquiry, 
  PlatformSettings,
  FinishingService,
  FinishingPackage
} from '../types';
import { translations } from '../i18n/translations';
import { 
  initialSettings, 
  initialFinishingPackages, 
  initialFinishingServices, 
  initialGroomProducts, 
  initialBrideProducts, 
  initialWeddingServices, 
  sampleFinishingInquiries, 
  sampleWeddingBookings, 
  sampleOrders, 
  sampleFinancingApplications, 
  sampleSupportCases 
} from '../data/initialData';

export type SectionKey = 
  | 'home' 
  | 'finishing' 
  | 'groom' 
  | 'bride' 
  | 'wedding' 
  | 'installments' 
  | 'socialSupport' 
  | 'customerPortal' 
  | 'admin';

interface AppContextType {
  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['ar'];
  dir: 'rtl' | 'ltr';

  // Navigation
  activeSection: SectionKey;
  setActiveSection: (sec: SectionKey) => void;

  // Authentication
  currentUser: User | null;
  login: (role?: 'customer' | 'admin', name?: string, phone?: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;

  // Cart & Wishlist
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;

  // Data & Management
  finishingInquiries: FinishingInquiry[];
  addFinishingInquiry: (inquiry: Omit<FinishingInquiry, 'id' | 'createdAt' | 'status'>) => string;
  updateFinishingStatus: (id: string, status: FinishingInquiry['status']) => void;

  weddingBookings: WeddingBookingRequest[];
  addWeddingBooking: (booking: Omit<WeddingBookingRequest, 'id' | 'createdAt' | 'status'>) => string;
  updateWeddingBookingStatus: (id: string, status: WeddingBookingRequest['status']) => void;

  orders: Order[];
  createOrder: (orderData: { customerName: string; phone: string; address: string; city: string; paymentMethod: Order['paymentMethod'] }) => string;
  updateOrderStatus: (id: string, status: Order['status']) => void;

  financingApplications: FinancingApplication[];
  addFinancingApplication: (application: Omit<FinancingApplication, 'id' | 'createdAt' | 'status'>) => string;
  updateFinancingStatus: (id: string, status: FinancingApplication['status']) => void;

  supportCases: SupportCase[];
  addSupportCase: (caseData: Omit<SupportCase, 'id' | 'createdAt' | 'status'>) => string;
  updateSupportCaseStatus: (id: string, status: SupportCase['status']) => void;

  sponsorshipInquiries: SponsorshipInquiry[];
  addSponsorshipInquiry: (inquiry: Omit<SponsorshipInquiry, 'id' | 'createdAt' | 'status'>) => string;

  // Products & Services
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  weddingServices: WeddingServiceItem[];
  addWeddingService: (service: WeddingServiceItem) => void;
  updateWeddingService: (service: WeddingServiceItem) => void;
  deleteWeddingService: (id: string) => void;

  finishingPackages: FinishingPackage[];
  finishingServices: FinishingService[];
  settings: PlatformSettings;
  updateSettings: (settings: PlatformSettings) => void;

  // Modals & Interactivity
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  finishingModalOpen: boolean;
  setFinishingModalOpen: (open: boolean) => void;
  weddingBookingModalOpen: boolean;
  setWeddingBookingModalOpen: (open: boolean) => void;
  selectedWeddingService: WeddingServiceItem | null;
  setSelectedWeddingService: (srv: WeddingServiceItem | null) => void;
  productDetailModalOpen: boolean;
  setProductDetailModalOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  installmentModalOpen: boolean;
  setInstallmentModalOpen: (open: boolean) => void;
  installmentPrefillAmount: number;
  setInstallmentPrefillAmount: (amt: number) => void;
  supportModalOpen: boolean;
  setSupportModalOpen: (open: boolean) => void;
  sponsorModalOpen: boolean;
  setSponsorModalOpen: (open: boolean) => void;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'gawaz_inn_';

function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Localization
  const [language, setLanguageState] = useState<Language>(() => 
    getStoredItem<Language>('lang', 'ar')
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setStoredItem('lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = translations[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Navigation
  const [activeSection, setActiveSection] = useState<SectionKey>('home');

  // Authentication: default demo customer
  const [currentUser, setCurrentUser] = useState<User | null>(() => 
    getStoredItem<User | null>('user', {
      id: 'usr-1',
      name: 'كريم عبد العزيز شريف',
      email: 'karim.sherif@example.com',
      phone: '01012345678',
      role: 'customer',
      city: 'القاهرة — مصر الجديدة',
      createdAt: '2026-10-15'
    })
  );

  const login = (role: 'customer' | 'admin' = 'customer', name = '', phone = '') => {
    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: name || (role === 'admin' ? 'المهندس مدير المنصة (Admin)' : 'أحمد خالد الصاوي'),
      email: role === 'admin' ? 'admin@gawazinn.com' : 'ahmed.khaled@example.com',
      phone: phone || '01099887766',
      role: role,
      city: 'القاهرة الجديدة',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(newUser);
    setStoredItem('user', newUser);
    showToast(language === 'ar' ? `مرحباً بك، ${newUser.name}!` : `Welcome back, ${newUser.name}!`);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'user');
    showToast(language === 'ar' ? 'تم تسجيل الخروج بنجاح.' : 'Logged out successfully.');
    if (activeSection === 'admin' || activeSection === 'customerPortal') {
      setActiveSection('home');
    }
  };

  const isLoggedIn = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => 
    getStoredItem<CartItem[]>('cart', [
      { product: initialGroomProducts[0], quantity: 1 },
      { product: initialBrideProducts[0], quantity: 1 }
    ])
  );

  useEffect(() => {
    setStoredItem('cart', cart);
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(language === 'ar' ? `تم إضافة "${language === 'ar' ? product.nameAr : product.nameEn}" للسلة.` : `Added to cart!`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Wishlist
  const [wishlist, setWishlist] = useState<Product[]>(() => 
    getStoredItem<Product[]>('wishlist', [initialGroomProducts[4]])
  );

  useEffect(() => {
    setStoredItem('wishlist', wishlist);
  }, [wishlist]);

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        showToast(language === 'ar' ? 'تمت الإزالة من المفضلة.' : 'Removed from wishlist.');
        return prev.filter(p => p.id !== product.id);
      } else {
        showToast(language === 'ar' ? 'تمت الإضافة للمفضلة.' : 'Added to wishlist.');
        return [...prev, product];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.some(p => p.id === productId);

  // Products (Combined Groom & Bride)
  const [products, setProducts] = useState<Product[]>(() => 
    getStoredItem<Product[]>('products', [...initialGroomProducts, ...initialBrideProducts])
  );

  useEffect(() => {
    setStoredItem('products', products);
  }, [products]);

  const addProduct = (prod: Product) => {
    setProducts(prev => [prod, ...prev]);
    showToast(language === 'ar' ? 'تمت إضافة المنتج بنجاح.' : 'Product added successfully.');
  };

  const updateProduct = (prod: Product) => {
    setProducts(prev => prev.map(p => p.id === prod.id ? prod : p));
    showToast(language === 'ar' ? 'تم تحديث بيانات المنتج.' : 'Product updated.');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast(language === 'ar' ? 'تم حذف المنتج.' : 'Product deleted.');
  };

  // Wedding Services
  const [weddingServices, setWeddingServices] = useState<WeddingServiceItem[]>(() => 
    getStoredItem<WeddingServiceItem[]>('wedding_services', initialWeddingServices)
  );

  useEffect(() => {
    setStoredItem('wedding_services', weddingServices);
  }, [weddingServices]);

  const addWeddingService = (srv: WeddingServiceItem) => {
    setWeddingServices(prev => [srv, ...prev]);
    showToast(language === 'ar' ? 'تمت إضافة خدمة الفرح بنجاح.' : 'Wedding service added.');
  };

  const updateWeddingService = (srv: WeddingServiceItem) => {
    setWeddingServices(prev => prev.map(s => s.id === srv.id ? srv : s));
    showToast(language === 'ar' ? 'تم تحديث خدمة الفرح.' : 'Wedding service updated.');
  };

  const deleteWeddingService = (id: string) => {
    setWeddingServices(prev => prev.filter(s => s.id !== id));
    showToast(language === 'ar' ? 'تم حذف خدمة الفرح.' : 'Wedding service deleted.');
  };

  // Finishing Packages & Services
  const [finishingPackages] = useState<FinishingPackage[]>(initialFinishingPackages);
  const [finishingServices] = useState<FinishingService[]>(initialFinishingServices);

  // Inquiries & Requests
  const [finishingInquiries, setFinishingInquiries] = useState<FinishingInquiry[]>(() => 
    getStoredItem<FinishingInquiry[]>('finishing_inquiries', sampleFinishingInquiries)
  );

  useEffect(() => {
    setStoredItem('finishing_inquiries', finishingInquiries);
  }, [finishingInquiries]);

  const addFinishingInquiry = (data: Omit<FinishingInquiry, 'id' | 'createdAt' | 'status'>) => {
    const id = 'fin-' + Date.now().toString().slice(-6);
    const newInquiry: FinishingInquiry = {
      ...data,
      id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setFinishingInquiries(prev => [newInquiry, ...prev]);
    showToast(language === 'ar' ? `تم استلام طلب المقايسة برقم مرجعي: ${id}` : `Finishing inquiry submitted (#${id})`);
    return id;
  };

  const updateFinishingStatus = (id: string, status: FinishingInquiry['status']) => {
    setFinishingInquiries(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    showToast(language === 'ar' ? `تم تحديث حالة استفسار التشطيب (#${id})` : `Updated inquiry #${id}`);
  };

  // Wedding Bookings
  const [weddingBookings, setWeddingBookings] = useState<WeddingBookingRequest[]>(() => 
    getStoredItem<WeddingBookingRequest[]>('wedding_bookings', sampleWeddingBookings)
  );

  useEffect(() => {
    setStoredItem('wedding_bookings', weddingBookings);
  }, [weddingBookings]);

  const addWeddingBooking = (data: Omit<WeddingBookingRequest, 'id' | 'createdAt' | 'status'>) => {
    const id = 'wed-' + Date.now().toString().slice(-6);
    const newBooking: WeddingBookingRequest = {
      ...data,
      id,
      status: 'pending_review',
      createdAt: new Date().toISOString()
    };
    setWeddingBookings(prev => [newBooking, ...prev]);
    showToast(language === 'ar' ? `تم تسجيل طلب حجز الفرح المبدئي برقم: ${id}` : `Wedding booking inquiry submitted (#${id})`);
    return id;
  };

  const updateWeddingBookingStatus = (id: string, status: WeddingBookingRequest['status']) => {
    setWeddingBookings(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    showToast(language === 'ar' ? `تم تحديث حالة حجز الفرح (#${id})` : `Updated wedding booking #${id}`);
  };

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => 
    getStoredItem<Order[]>('orders', sampleOrders)
  );

  useEffect(() => {
    setStoredItem('orders', orders);
  }, [orders]);

  const createOrder = (orderData: { customerName: string; phone: string; address: string; city: string; paymentMethod: Order['paymentMethod'] }) => {
    const id = 'ord-' + Date.now().toString().slice(-6);
    const newOrder: Order = {
      id,
      userId: currentUser?.id,
      customerName: orderData.customerName,
      phone: orderData.phone,
      address: orderData.address,
      city: orderData.city,
      items: [...cart],
      subtotal: cartTotal,
      deliveryFee: 0,
      total: cartTotal,
      paymentMethod: orderData.paymentMethod,
      status: 'received',
      createdAt: new Date().toISOString()
    };
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    showToast(language === 'ar' ? `تم تأكيد طلبك بنجاح برقم: ${id}` : `Order placed successfully (#${id})`);
    return id;
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    showToast(language === 'ar' ? `تم تحديث حالة الطلب (#${id})` : `Updated order status #${id}`);
  };

  // Financing Applications
  const [financingApplications, setFinancingApplications] = useState<FinancingApplication[]>(() => 
    getStoredItem<FinancingApplication[]>('financing_apps', sampleFinancingApplications)
  );

  useEffect(() => {
    setStoredItem('financing_apps', financingApplications);
  }, [financingApplications]);

  const addFinancingApplication = (appData: Omit<FinancingApplication, 'id' | 'createdAt' | 'status'>) => {
    const id = 'fin-app-' + Date.now().toString().slice(-6);
    const newApp: FinancingApplication = {
      ...appData,
      id,
      status: 'submitted',
      createdAt: new Date().toISOString()
    };
    setFinancingApplications(prev => [newApp, ...prev]);
    showToast(language === 'ar' ? `تم إرسال طلب التقسيط بنجاح (#${id})` : `Financing application submitted (#${id})`);
    return id;
  };

  const updateFinancingStatus = (id: string, status: FinancingApplication['status']) => {
    setFinancingApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    showToast(language === 'ar' ? `تم تحديث حالة طلب التمويل (#${id})` : `Updated financing application #${id}`);
  };

  // Social Support Cases
  const [supportCases, setSupportCases] = useState<SupportCase[]>(() => 
    getStoredItem<SupportCase[]>('support_cases', sampleSupportCases)
  );

  useEffect(() => {
    setStoredItem('support_cases', supportCases);
  }, [supportCases]);

  const addSupportCase = (caseData: Omit<SupportCase, 'id' | 'createdAt' | 'status'>) => {
    const id = 'case-' + Date.now().toString().slice(-6);
    const newCase: SupportCase = {
      ...caseData,
      id,
      status: 'confidential_review',
      createdAt: new Date().toISOString()
    };
    setSupportCases(prev => [newCase, ...prev]);
    showToast(language === 'ar' ? `تم تسجيل طلب المساعدة بسرية تامة برقم كودي: ${id}` : `Support application registered confidentially (#${id})`);
    return id;
  };

  const updateSupportCaseStatus = (id: string, status: SupportCase['status']) => {
    setSupportCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    showToast(language === 'ar' ? `تم تحديث حالة ملف التكافل (#${id})` : `Updated support case #${id}`);
  };

  // Sponsorship Inquiries
  const [sponsorshipInquiries, setSponsorshipInquiries] = useState<SponsorshipInquiry[]>(() => 
    getStoredItem<SponsorshipInquiry[]>('sponsorships', [])
  );

  useEffect(() => {
    setStoredItem('sponsorships', sponsorshipInquiries);
  }, [sponsorshipInquiries]);

  const addSponsorshipInquiry = (inquiry: Omit<SponsorshipInquiry, 'id' | 'createdAt' | 'status'>) => {
    const id = 'spn-' + Date.now().toString().slice(-6);
    const newInquiry: SponsorshipInquiry = {
      ...inquiry,
      id,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    setSponsorshipInquiries(prev => [newInquiry, ...prev]);
    showToast(language === 'ar' ? `شكراً لك! تم استلام طلب المساهمة الكريمة برقم: ${id}` : `Thank you for your generous sponsorship inquiry (#${id})`);
    return id;
  };

  // Platform Settings
  const [settings, setSettings] = useState<PlatformSettings>(() => 
    getStoredItem<PlatformSettings>('settings', initialSettings)
  );

  const updateSettings = (newSettings: PlatformSettings) => {
    setSettings(newSettings);
    setStoredItem('settings', newSettings);
    showToast(language === 'ar' ? 'تم حفظ إعدادات المنصة بنجاح.' : 'Settings updated successfully.');
  };

  // Modal States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [finishingModalOpen, setFinishingModalOpen] = useState(false);
  const [weddingBookingModalOpen, setWeddingBookingModalOpen] = useState(false);
  const [selectedWeddingService, setSelectedWeddingService] = useState<WeddingServiceItem | null>(null);
  const [productDetailModalOpen, setProductDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [installmentModalOpen, setInstallmentModalOpen] = useState(false);
  const [installmentPrefillAmount, setInstallmentPrefillAmount] = useState(100000);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      t,
      dir,
      activeSection,
      setActiveSection,
      currentUser,
      login,
      logout,
      isLoggedIn,
      isAdmin,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartTotal,
      cartCount,
      wishlist,
      toggleWishlist,
      isWishlisted,
      finishingInquiries,
      addFinishingInquiry,
      updateFinishingStatus,
      weddingBookings,
      addWeddingBooking,
      updateWeddingBookingStatus,
      orders,
      createOrder,
      updateOrderStatus,
      financingApplications,
      addFinancingApplication,
      updateFinancingStatus,
      supportCases,
      addSupportCase,
      updateSupportCaseStatus,
      sponsorshipInquiries,
      addSponsorshipInquiry,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      weddingServices,
      addWeddingService,
      updateWeddingService,
      deleteWeddingService,
      finishingPackages,
      finishingServices,
      settings,
      updateSettings,
      authModalOpen,
      setAuthModalOpen,
      finishingModalOpen,
      setFinishingModalOpen,
      weddingBookingModalOpen,
      setWeddingBookingModalOpen,
      selectedWeddingService,
      setSelectedWeddingService,
      productDetailModalOpen,
      setProductDetailModalOpen,
      selectedProduct,
      setSelectedProduct,
      installmentModalOpen,
      setInstallmentModalOpen,
      installmentPrefillAmount,
      setInstallmentPrefillAmount,
      supportModalOpen,
      setSupportModalOpen,
      sponsorModalOpen,
      setSponsorModalOpen,
      toastMessage,
      showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
