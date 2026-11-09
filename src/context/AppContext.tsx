import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type {
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
  FinishingPackage,
  FinishingTier,
  Article,
  ContentCategory,
  LocationNode,
  AuditLogEntry,
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
  sampleSupportCases,
} from '../data/initialData';
import { SEED_ARTICLES, SEED_CATEGORIES, SEED_LOCATIONS } from '../../shared/cmsSeedData';
import { ADMIN_PANEL_ROLES, hasAnyRole } from '../../shared/rbac';
import { estimateFinishingRange, maskNationalId } from '../../shared/catalogMeta';
import { apiRequest, ApiClientError } from '../services/api';

export type SectionKey =
  | 'home'
  | 'finishing'
  | 'groom'
  | 'bride'
  | 'wedding'
  | 'installments'
  | 'socialSupport'
  | 'encyclopedia'
  | 'discover'
  | 'customerPortal'
  | 'admin';

export const SECTION_ROUTES: Record<SectionKey, string> = {
  home: '/',
  finishing: '/finishing',
  groom: '/groom',
  bride: '/bride',
  wedding: '/wedding',
  installments: '/installments',
  socialSupport: '/social-support',
  encyclopedia: '/encyclopedia',
  discover: '/discover',
  customerPortal: '/portal',
  admin: '/admin',
};

export interface FinishingPrefill {
  areaSqm: number;
  roomsCount: number;
  bathroomsCount: number;
  finishingTier: FinishingTier;
}

export interface AdminOverviewStats {
  totalUsers: number;
  activeCustomers: number;
  totalOrders: number;
  totalFinishing: number;
  totalBookings: number;
  totalFinancing: number;
  totalSupport: number;
  totalArticles: number;
}

interface BootstrapPayload {
  user: User | null;
  products: Product[];
  finishingPackages: FinishingPackage[];
  finishingServices: FinishingService[];
  weddingServices: WeddingServiceItem[];
  categories: ContentCategory[];
  locations: LocationNode[];
  articles: Article[];
  settings: PlatformSettings | null;
}

interface AdminOverviewPayload {
  counts: AdminOverviewStats;
  users: User[];
  orders: Order[];
  finishingInquiries: FinishingInquiry[];
  weddingBookings: WeddingBookingRequest[];
  financingApplications: FinancingApplication[];
  supportCases: SupportCase[];
  sponsorships: SponsorshipInquiry[];
  articles: Article[];
  auditLogs: AuditLogEntry[];
}

interface AppContextType {
  // Backend Connectivity
  apiConnected: boolean;
  isHydrating: boolean;

  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['ar'];
  dir: 'rtl' | 'ltr';

  // Navigation (Router-backed)
  activeSection: SectionKey;
  setActiveSection: (sec: SectionKey) => void;

  // Authentication
  currentUser: User | null;
  loginWithCredentials: (identifier: string, password: string) => Promise<User>;
  registerAccount: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    city?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isStaff: boolean;

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

  // Persisted Bridal Checklist & Groom Budget Builder
  brideChecklist: string[];
  toggleBrideChecklistItem: (itemId: string) => void;
  groomBudgetTarget: number;
  setGroomBudgetTarget: (target: number) => void;
  groomBudgetItems: string[];
  toggleGroomBudgetItem: (productId: string) => void;

  // Customer & Admin Data
  finishingInquiries: FinishingInquiry[];
  addFinishingInquiry: (inquiry: Omit<FinishingInquiry, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateFinishingStatus: (id: string, status: FinishingInquiry['status']) => Promise<void>;

  weddingBookings: WeddingBookingRequest[];
  addWeddingBooking: (booking: Omit<WeddingBookingRequest, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateWeddingBookingStatus: (id: string, status: WeddingBookingRequest['status']) => Promise<void>;

  orders: Order[];
  createOrder: (orderData: {
    customerName: string;
    phone: string;
    address: string;
    city: string;
    paymentMethod: Order['paymentMethod'];
  }) => Promise<string>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;

  financingApplications: FinancingApplication[];
  addFinancingApplication: (application: Omit<FinancingApplication, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateFinancingStatus: (id: string, status: FinancingApplication['status']) => Promise<void>;

  supportCases: SupportCase[];
  addSupportCase: (caseData: Omit<SupportCase, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateSupportCaseStatus: (id: string, status: SupportCase['status']) => Promise<void>;

  sponsorshipInquiries: SponsorshipInquiry[];
  addSponsorshipInquiry: (inquiry: Omit<SponsorshipInquiry, 'id' | 'createdAt' | 'status'>) => Promise<string>;

  // Products & Services
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  weddingServices: WeddingServiceItem[];
  addWeddingService: (service: WeddingServiceItem) => Promise<void>;
  updateWeddingService: (service: WeddingServiceItem) => Promise<void>;
  deleteWeddingService: (id: string) => Promise<void>;

  // CMS & Locations (Stage 1 Foundation)
  categories: ContentCategory[];
  articles: Article[];
  locations: LocationNode[];
  addArticle: (article: Omit<Article, 'id' | 'viewCount' | 'publishedAt' | 'updatedAt' | 'authorName'>) => Promise<void>;

  // Admin Overview & Audit
  adminStats: AdminOverviewStats | null;
  adminUsers: User[];
  auditLogs: AuditLogEntry[];
  refreshAdminData: () => Promise<void>;

  finishingPackages: FinishingPackage[];
  finishingServices: FinishingService[];
  settings: PlatformSettings;
  updateSettings: (settings: PlatformSettings) => Promise<void>;

  // Modals & Interactivity
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  finishingModalOpen: boolean;
  setFinishingModalOpen: (open: boolean) => void;
  finishingPrefill: FinishingPrefill;
  setFinishingPrefill: (prefill: FinishingPrefill) => void;
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
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors safely
  }
}

function resolveSectionFromPath(pathname: string): SectionKey {
  if (pathname.startsWith('/finishing')) return 'finishing';
  if (pathname.startsWith('/groom')) return 'groom';
  if (pathname.startsWith('/bride')) return 'bride';
  if (pathname.startsWith('/wedding')) return 'wedding';
  if (pathname.startsWith('/installments')) return 'installments';
  if (pathname.startsWith('/social-support')) return 'socialSupport';
  if (pathname.startsWith('/encyclopedia') || pathname.startsWith('/guides')) return 'encyclopedia';
  if (pathname.startsWith('/discover') || pathname.startsWith('/locations')) return 'discover';
  if (pathname.startsWith('/portal') || pathname.startsWith('/my')) return 'customerPortal';
  if (pathname.startsWith('/admin')) return 'admin';
  return 'home';
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [apiConnected, setApiConnected] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  // Localization
  const [language, setLanguageState] = useState<Language>(() =>
    getStoredItem<Language>('lang', 'ar'),
  );

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setStoredItem('lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = translations[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Router-backed activeSection
  const activeSection = resolveSectionFromPath(location.pathname);

  const setActiveSection = useCallback(
    (sec: SectionKey) => {
      const target = SECTION_ROUTES[sec] || '/';
      if (location.pathname !== target) {
        navigate(target);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [location.pathname, navigate],
  );

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // Auth State — SECURE BY DEFAULT: visitors start unauthenticated (null)!
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Catalog & Public CMS State
  const [products, setProducts] = useState<Product[]>(() => [...initialGroomProducts, ...initialBrideProducts]);
  const [weddingServices, setWeddingServices] = useState<WeddingServiceItem[]>(initialWeddingServices);
  const [finishingPackages, setFinishingPackages] = useState<FinishingPackage[]>(initialFinishingPackages);
  const [finishingServices, setFinishingServices] = useState<FinishingService[]>(initialFinishingServices);
  const [categories, setCategories] = useState<ContentCategory[]>(SEED_CATEGORIES);
  const [articles, setArticles] = useState<Article[]>(SEED_ARTICLES);
  const [locations, setLocations] = useState<LocationNode[]>(SEED_LOCATIONS);
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings);

  // Scoped Transaction State
  const [finishingInquiries, setFinishingInquiries] = useState<FinishingInquiry[]>([]);
  const [weddingBookings, setWeddingBookings] = useState<WeddingBookingRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [financingApplications, setFinancingApplications] = useState<FinancingApplication[]>([]);
  const [supportCases, setSupportCases] = useState<SupportCase[]>([]);
  const [sponsorshipInquiries, setSponsorshipInquiries] = useState<SponsorshipInquiry[]>([]);

  // Admin Overview State
  const [adminStats, setAdminStats] = useState<AdminOverviewStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const loadUserScopedData = useCallback(async (user: User | null, connected: boolean) => {
    if (!user) {
      setOrders([]);
      setFinishingInquiries([]);
      setWeddingBookings([]);
      setFinancingApplications([]);
      setSupportCases([]);
      setAdminStats(null);
      setAdminUsers([]);
      setAuditLogs([]);
      return;
    }

    if (!connected) {
      // Static demo offline fallback scoped strictly to userId
      const localOrders = getStoredItem<Order[]>('orders_v2', sampleOrders).filter(
        (o) => o.userId === user.id || user.role === 'admin',
      );
      const localFin = getStoredItem<FinishingInquiry[]>('finishing_v2', sampleFinishingInquiries).filter(
        (f) => f.userId === user.id || user.role === 'admin',
      );
      const localWed = getStoredItem<WeddingBookingRequest[]>('bookings_v2', sampleWeddingBookings).filter(
        (b) => b.userId === user.id || user.role === 'admin',
      );
      const localFnc = getStoredItem<FinancingApplication[]>('financing_v2', sampleFinancingApplications).filter(
        (a) => a.userId === user.id || user.role === 'admin',
      );
      setOrders(localOrders);
      setFinishingInquiries(localFin);
      setWeddingBookings(localWed);
      setFinancingApplications(localFnc);
      setSupportCases(
        hasAnyRole(user.role, ['admin', 'super_admin', 'moderator'])
          ? getStoredItem<SupportCase[]>('support_v2', sampleSupportCases)
          : [],
      );
      return;
    }

    try {
      const [uOrders, uFin, uWed, uFnc, uSup] = await Promise.all([
        apiRequest<Order[]>('/orders'),
        apiRequest<FinishingInquiry[]>('/finishing-inquiries'),
        apiRequest<WeddingBookingRequest[]>('/wedding-bookings'),
        apiRequest<FinancingApplication[]>('/financing-applications'),
        apiRequest<SupportCase[]>('/support-cases'),
      ]);
      setOrders(uOrders);
      setFinishingInquiries(uFin);
      setWeddingBookings(uWed);
      setFinancingApplications(uFnc);
      setSupportCases(uSup);
    } catch {
      // Non-fatal fallback
    }
  }, []);

  const refreshAdminData = useCallback(async () => {
    if (!apiConnected || !currentUser || !hasAnyRole(currentUser.role, ADMIN_PANEL_ROLES)) {
      return;
    }
    const overview = await apiRequest<AdminOverviewPayload>('/admin/overview');
    setAdminStats(overview.counts);
    setAdminUsers(overview.users);
    if (overview.orders.length > 0 || hasAnyRole(currentUser.role, ['admin', 'super_admin'])) {
      setOrders(overview.orders);
      setFinishingInquiries(overview.finishingInquiries);
      setWeddingBookings(overview.weddingBookings);
      setFinancingApplications(overview.financingApplications);
      setSponsorshipInquiries(overview.sponsorships);
      setAuditLogs(overview.auditLogs);
    }
    if (hasAnyRole(currentUser.role, ['admin', 'super_admin', 'moderator'])) {
      setSupportCases(overview.supportCases);
    }
    setArticles(overview.articles);
  }, [apiConnected, currentUser]);

  // Initial Bootstrap from Backend API
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const payload = await apiRequest<BootstrapPayload>('/bootstrap');
        if (!active) return;
        setApiConnected(true);
        if (payload.products.length > 0) setProducts(payload.products);
        if (payload.finishingPackages.length > 0) setFinishingPackages(payload.finishingPackages);
        if (payload.finishingServices.length > 0) setFinishingServices(payload.finishingServices);
        if (payload.weddingServices.length > 0) setWeddingServices(payload.weddingServices);
        if (payload.categories.length > 0) setCategories(payload.categories);
        if (payload.articles.length > 0) setArticles(payload.articles);
        if (payload.locations.length > 0) setLocations(payload.locations);
        if (payload.settings) setSettings(payload.settings);
        setCurrentUser(payload.user);
        if (payload.user) {
          await loadUserScopedData(payload.user, true);
          if (hasAnyRole(payload.user.role, ADMIN_PANEL_ROLES)) {
            const ov = await apiRequest<AdminOverviewPayload>('/admin/overview');
            if (!active) return;
            setAdminStats(ov.counts);
            setAdminUsers(ov.users);
            if (hasAnyRole(payload.user.role, ['admin', 'super_admin'])) {
              setOrders(ov.orders);
              setFinishingInquiries(ov.finishingInquiries);
              setWeddingBookings(ov.weddingBookings);
              setFinancingApplications(ov.financingApplications);
              setSponsorshipInquiries(ov.sponsorships);
              setAuditLogs(ov.auditLogs);
            }
            setSupportCases(ov.supportCases);
            setArticles(ov.articles);
          }
        }
      } catch {
        if (!active) return;
        setApiConnected(false);
      } finally {
        if (active) setIsHydrating(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadUserScopedData]);

  // Auth Methods
  const loginWithCredentials = async (identifier: string, password: string): Promise<User> => {
    if (!apiConnected) {
      throw new ApiClientError(
        503,
        'API_UNAVAILABLE',
        language === 'ar'
          ? 'الخادم غير متصل حالياً لتأكيد الحساب.'
          : 'Backend authentication service is offline.',
      );
    }
    const res = await apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    setCurrentUser(res.user);
    await loadUserScopedData(res.user, true);
    if (hasAnyRole(res.user.role, ADMIN_PANEL_ROLES)) {
      const ov = await apiRequest<AdminOverviewPayload>('/admin/overview');
      setAdminStats(ov.counts);
      setAdminUsers(ov.users);
      if (hasAnyRole(res.user.role, ['admin', 'super_admin'])) {
        setOrders(ov.orders);
        setFinishingInquiries(ov.finishingInquiries);
        setWeddingBookings(ov.weddingBookings);
        setFinancingApplications(ov.financingApplications);
        setSponsorshipInquiries(ov.sponsorships);
        setAuditLogs(ov.auditLogs);
      }
      setSupportCases(ov.supportCases);
      setArticles(ov.articles);
    }
    showToast(
      language === 'ar' ? `أهلاً بك، ${res.user.name}!` : `Welcome back, ${res.user.nameEn || res.user.name}!`,
    );
    return res.user;
  };

  const registerAccount = async (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    city?: string;
  }): Promise<User> => {
    if (!apiConnected) {
      throw new ApiClientError(
        503,
        'API_UNAVAILABLE',
        language === 'ar' ? 'الخادم غير متصل حالياً.' : 'Backend registration service is offline.',
      );
    }
    const res = await apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...input, language }),
    });
    setCurrentUser(res.user);
    await loadUserScopedData(res.user, true);
    showToast(language === 'ar' ? `تم إنشاء حسابك بنجاح، ${res.user.name}!` : `Account created for ${res.user.name}!`);
    return res.user;
  };

  const logout = async () => {
    if (apiConnected) {
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
      } catch {
        // Proceed with client state clear
      }
    }
    setCurrentUser(null);
    await loadUserScopedData(null, apiConnected);
    showToast(language === 'ar' ? 'تم تسجيل الخروج بنجاح.' : 'Logged out successfully.');
    if (activeSection === 'admin' || activeSection === 'customerPortal') {
      setActiveSection('home');
    }
  };

  const isLoggedIn = !!currentUser;
  const isStaff = hasAnyRole(currentUser?.role, ADMIN_PANEL_ROLES);
  const isAdmin = hasAnyRole(currentUser?.role, ['admin', 'super_admin']);

  // Cart (persisted locally for seamless browsing)
  const [cart, setCart] = useState<CartItem[]>(() =>
    getStoredItem<CartItem[]>('cart_v2', []),
  );

  useEffect(() => {
    setStoredItem('cart_v2', cart);
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(
      language === 'ar'
        ? `تم إضافة "${product.nameAr}" للسلة.`
        : `Added "${product.nameEn}" to cart.`,
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Wishlist
  const [wishlist, setWishlist] = useState<Product[]>(() =>
    getStoredItem<Product[]>('wishlist_v2', []),
  );

  useEffect(() => {
    setStoredItem('wishlist_v2', wishlist);
  }, [wishlist]);

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast(language === 'ar' ? 'تمت الإزالة من المفضلة.' : 'Removed from wishlist.');
        return prev.filter((p) => p.id !== product.id);
      }
      showToast(language === 'ar' ? 'تمت الإضافة للمفضلة.' : 'Added to wishlist.');
      return [...prev, product];
    });
  };

  const isWishlisted = (productId: string) => wishlist.some((p) => p.id === productId);

  // Persisted Bridal Checklist & Groom Budget
  const [brideChecklist, setBrideChecklist] = useState<string[]>(() =>
    getStoredItem<string[]>('bride_checklist_v2', ['chk-1', 'chk-4']),
  );
  useEffect(() => {
    setStoredItem('bride_checklist_v2', brideChecklist);
  }, [brideChecklist]);

  const toggleBrideChecklistItem = (itemId: string) => {
    setBrideChecklist((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  const [groomBudgetTarget, setGroomBudgetTargetState] = useState<number>(() =>
    getStoredItem<number>('groom_budget_target_v2', 150000),
  );
  const [groomBudgetItems, setGroomBudgetItems] = useState<string[]>(() =>
    getStoredItem<string[]>('groom_budget_items_v2', ['groom-p1', 'groom-p2']),
  );

  const setGroomBudgetTarget = (target: number) => {
    setGroomBudgetTargetState(target);
    setStoredItem('groom_budget_target_v2', target);
  };

  useEffect(() => {
    setStoredItem('groom_budget_items_v2', groomBudgetItems);
  }, [groomBudgetItems]);

  const toggleGroomBudgetItem = (productId: string) => {
    setGroomBudgetItems((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  // Transactions
  const addFinishingInquiry = async (
    data: Omit<FinishingInquiry, 'id' | 'createdAt' | 'status'>,
  ): Promise<string> => {
    if (apiConnected) {
      const created = await apiRequest<FinishingInquiry>('/finishing-inquiries', {
        method: 'POST',
        body: JSON.stringify({
          customerName: data.customerName,
          phone: data.phone,
          governorate: data.governorate,
          areaSqm: data.areaSqm,
          roomsCount: data.roomsCount,
          bathroomsCount: data.bathroomsCount,
          finishingTier: data.finishingTier,
          budgetEGP: data.budgetEGP,
          notes: data.notes,
        }),
      });
      setFinishingInquiries((prev) => [created, ...prev]);
      showToast(
        language === 'ar'
          ? `تم استلام طلب المقايسة برقم مرجعي: ${created.id}`
          : `Finishing inquiry submitted (#${created.id})`,
      );
      return created.id;
    }

    const est = estimateFinishingRange(data.areaSqm, data.finishingTier);
    const id = 'fin-' + Date.now().toString().slice(-6);
    const created: FinishingInquiry = {
      ...data,
      id,
      userId: currentUser?.id,
      estimatedCostMin: est.min,
      estimatedCostMax: est.max,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setFinishingInquiries((prev) => {
      const next = [created, ...prev];
      setStoredItem('finishing_v2', next);
      return next;
    });
    showToast(
      language === 'ar' ? `تم حفظ المقايسة (#${id})` : `Finishing inquiry saved (#${id})`,
    );
    return id;
  };

  const updateFinishingStatus = async (id: string, status: FinishingInquiry['status']) => {
    if (apiConnected) {
      await apiRequest(`/admin/finishing-inquiries/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
    setFinishingInquiries((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    showToast(language === 'ar' ? `تم تحديث حالة الاستفسار (#${id})` : `Updated inquiry #${id}`);
  };

  const addWeddingBooking = async (
    data: Omit<WeddingBookingRequest, 'id' | 'createdAt' | 'status'>,
  ): Promise<string> => {
    if (apiConnected) {
      const created = await apiRequest<WeddingBookingRequest>('/wedding-bookings', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: data.serviceId,
          customerName: data.customerName,
          phone: data.phone,
          weddingDate: data.weddingDate,
          guestCount: data.guestCount,
          governorate: data.governorate,
          notes: data.notes,
        }),
      });
      setWeddingBookings((prev) => [created, ...prev]);
      showToast(
        language === 'ar'
          ? `تم تسجيل طلب حجز الفرح المبدئي: ${created.id}`
          : `Wedding booking inquiry submitted (#${created.id})`,
      );
      return created.id;
    }

    const id = 'wed-' + Date.now().toString().slice(-6);
    const created: WeddingBookingRequest = {
      ...data,
      id,
      userId: currentUser?.id,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
    };
    setWeddingBookings((prev) => {
      const next = [created, ...prev];
      setStoredItem('bookings_v2', next);
      return next;
    });
    return id;
  };

  const updateWeddingBookingStatus = async (
    id: string,
    status: WeddingBookingRequest['status'],
  ) => {
    if (apiConnected) {
      await apiRequest(`/admin/wedding-bookings/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
    setWeddingBookings((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    showToast(language === 'ar' ? `تم تحديث حالة الحجز (#${id})` : `Updated wedding booking #${id}`);
  };

  const createOrder = async (orderData: {
    customerName: string;
    phone: string;
    address: string;
    city: string;
    paymentMethod: Order['paymentMethod'];
  }): Promise<string> => {
    if (apiConnected) {
      const created = await apiRequest<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          ...orderData,
          items: cart.map((it) => ({ productId: it.product.id, quantity: it.quantity })),
        }),
      });
      setOrders((prev) => [created, ...prev]);
      clearCart();
      showToast(
        language === 'ar'
          ? `تم تأكيد طلبك بنجاح برقم: ${created.id}`
          : `Order placed successfully (#${created.id})`,
      );
      return created.id;
    }

    const id = 'ord-' + Date.now().toString().slice(-6);
    const created: Order = {
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
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => {
      const next = [created, ...prev];
      setStoredItem('orders_v2', next);
      return next;
    });
    clearCart();
    showToast(language === 'ar' ? `تم تأكيد الطلب (#${id})` : `Order confirmed (#${id})`);
    return id;
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    if (apiConnected) {
      await apiRequest(`/admin/orders/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    showToast(language === 'ar' ? `تم تحديث حالة الطلب (#${id})` : `Updated order #${id}`);
  };

  const addFinancingApplication = async (
    appData: Omit<FinancingApplication, 'id' | 'createdAt' | 'status'>,
  ): Promise<string> => {
    if (apiConnected) {
      const created = await apiRequest<FinancingApplication>('/financing-applications', {
        method: 'POST',
        body: JSON.stringify({
          customerName: appData.customerName,
          phone: appData.phone,
          nationalId: appData.nationalId,
          monthlyIncome: appData.monthlyIncome,
          employer: appData.employer,
          governorate: appData.governorate,
          requestedAmount: appData.requestedAmount,
          tenureMonths: appData.tenureMonths,
          preferredProvider: appData.preferredProvider,
          associatedSection: appData.associatedSection,
        }),
      });
      setFinancingApplications((prev) => [created, ...prev]);
      showToast(
        language === 'ar'
          ? `تم إرسال طلب التقسيط بنجاح (#${created.id})`
          : `Financing application submitted (#${created.id})`,
      );
      return created.id;
    }

    const id = 'fnc-' + Date.now().toString().slice(-6);
    const created: FinancingApplication = {
      ...appData,
      id,
      userId: currentUser?.id,
      nationalId: maskNationalId(appData.nationalId),
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };
    setFinancingApplications((prev) => [created, ...prev]);
    return id;
  };

  const updateFinancingStatus = async (id: string, status: FinancingApplication['status']) => {
    if (apiConnected) {
      await apiRequest(`/admin/financing-applications/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
    setFinancingApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    showToast(language === 'ar' ? `تم تحديث طلب التمويل (#${id})` : `Updated financing #${id}`);
  };

  const addSupportCase = async (
    caseData: Omit<SupportCase, 'id' | 'createdAt' | 'status'>,
  ): Promise<string> => {
    if (apiConnected) {
      const created = await apiRequest<SupportCase>('/support-cases', {
        method: 'POST',
        body: JSON.stringify({
          applicantName: caseData.applicantName,
          nationalId: caseData.nationalId,
          phone: caseData.phone,
          governorate: caseData.governorate,
          address: caseData.address,
          category: caseData.category,
          caseDescription: caseData.caseDescription,
          urgencyLevel: caseData.urgencyLevel,
          documentsSubmitted: caseData.documentsSubmitted,
        }),
      });
      if (hasAnyRole(currentUser?.role, ['admin', 'super_admin', 'moderator'])) {
        setSupportCases((prev) => [created, ...prev]);
      }
      showToast(
        language === 'ar'
          ? `تم تسجيل طلب المساعدة بسرية تامة: ${created.id}`
          : `Support case registered confidentially (#${created.id})`,
      );
      return created.id;
    }

    const id = 'sup-' + Date.now().toString().slice(-6);
    showToast(language === 'ar' ? `تم التسجيل برقم كودي: ${id}` : `Registered (#${id})`);
    return id;
  };

  const updateSupportCaseStatus = async (id: string, status: SupportCase['status']) => {
    if (apiConnected) {
      await apiRequest(`/admin/support-cases/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
    setSupportCases((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    showToast(language === 'ar' ? `تم تحديث حالة الملف (#${id})` : `Updated support case #${id}`);
  };

  const addSponsorshipInquiry = async (
    inquiry: Omit<SponsorshipInquiry, 'id' | 'createdAt' | 'status'>,
  ): Promise<string> => {
    if (apiConnected) {
      const created = await apiRequest<SponsorshipInquiry>('/sponsorship-inquiries', {
        method: 'POST',
        body: JSON.stringify(inquiry),
      });
      showToast(
        language === 'ar'
          ? `شكراً لك! تم استلام طلب المساهمة الكريمة برقم: ${created.id}`
          : `Sponsorship inquiry received (#${created.id})`,
      );
      return created.id;
    }
    const id = 'spn-' + Date.now().toString().slice(-6);
    showToast(language === 'ar' ? `تم استلام المساهمة (${id})` : `Saved (#${id})`);
    return id;
  };

  // Products Admin CRUD
  const addProduct = async (prod: Product) => {
    if (apiConnected) {
      const created = await apiRequest<Product>('/admin/products', {
        method: 'POST',
        body: JSON.stringify(prod),
      });
      setProducts((prev) => [created, ...prev]);
    } else {
      setProducts((prev) => [prod, ...prev]);
    }
    showToast(language === 'ar' ? 'تمت إضافة المنتج بنجاح.' : 'Product added successfully.');
  };

  const updateProduct = async (prod: Product) => {
    if (apiConnected) {
      const updated = await apiRequest<Product>(`/admin/products/${encodeURIComponent(prod.id)}`, {
        method: 'PATCH',
        body: JSON.stringify(prod),
      });
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      setProducts((prev) => prev.map((p) => (p.id === prod.id ? prod : p)));
    }
    showToast(language === 'ar' ? 'تم تحديث بيانات المنتج.' : 'Product updated.');
  };

  const deleteProduct = async (id: string) => {
    if (apiConnected) {
      await apiRequest(`/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(language === 'ar' ? 'تم حذف المنتج.' : 'Product deleted.');
  };

  // Wedding Services Admin CRUD
  const addWeddingService = async (srv: WeddingServiceItem) => {
    if (apiConnected) {
      const created = await apiRequest<WeddingServiceItem>('/admin/wedding-services', {
        method: 'POST',
        body: JSON.stringify(srv),
      });
      setWeddingServices((prev) => [created, ...prev]);
    } else {
      setWeddingServices((prev) => [srv, ...prev]);
    }
    showToast(language === 'ar' ? 'تمت إضافة خدمة الفرح بنجاح.' : 'Wedding service added.');
  };

  const updateWeddingService = async (srv: WeddingServiceItem) => {
    if (apiConnected) {
      const updated = await apiRequest<WeddingServiceItem>(
        `/admin/wedding-services/${encodeURIComponent(srv.id)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(srv),
        },
      );
      setWeddingServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } else {
      setWeddingServices((prev) => prev.map((s) => (s.id === srv.id ? srv : s)));
    }
    showToast(language === 'ar' ? 'تم تحديث خدمة الفرح.' : 'Wedding service updated.');
  };

  const deleteWeddingService = async (id: string) => {
    if (apiConnected) {
      await apiRequest(`/admin/wedding-services/${encodeURIComponent(id)}`, { method: 'DELETE' });
    }
    setWeddingServices((prev) => prev.filter((s) => s.id !== id));
    showToast(language === 'ar' ? 'تم حذف خدمة الفرح.' : 'Wedding service deleted.');
  };

  // CMS Article Creation
  const addArticle = async (
    articleData: Omit<Article, 'id' | 'viewCount' | 'publishedAt' | 'updatedAt' | 'authorName'>,
  ) => {
    if (apiConnected) {
      const created = await apiRequest<Article>('/admin/articles', {
        method: 'POST',
        body: JSON.stringify(articleData),
      });
      setArticles((prev) => [created, ...prev]);
    }
    showToast(language === 'ar' ? 'تم نشر المقال في الموسوعة.' : 'Article published to encyclopedia.');
  };

  const updateSettings = async (newSettings: PlatformSettings) => {
    if (apiConnected) {
      await apiRequest('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(newSettings),
      });
    }
    setSettings(newSettings);
    showToast(language === 'ar' ? 'تم حفظ إعدادات المنصة بنجاح.' : 'Settings saved successfully.');
  };

  // Modals & Prefill
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [finishingModalOpen, setFinishingModalOpen] = useState(false);
  const [finishingPrefill, setFinishingPrefill] = useState<FinishingPrefill>({
    areaSqm: 130,
    roomsCount: 3,
    bathroomsCount: 2,
    finishingTier: 'luxury',
  });
  const [weddingBookingModalOpen, setWeddingBookingModalOpen] = useState(false);
  const [selectedWeddingService, setSelectedWeddingService] = useState<WeddingServiceItem | null>(null);
  const [productDetailModalOpen, setProductDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [installmentModalOpen, setInstallmentModalOpen] = useState(false);
  const [installmentPrefillAmount, setInstallmentPrefillAmount] = useState(100000);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);

  return (
    <AppContext.Provider
      value={{
        apiConnected,
        isHydrating,
        language,
        setLanguage,
        t,
        dir,
        activeSection,
        setActiveSection,
        currentUser,
        loginWithCredentials,
        registerAccount,
        logout,
        isLoggedIn,
        isAdmin,
        isStaff,
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
        brideChecklist,
        toggleBrideChecklistItem,
        groomBudgetTarget,
        setGroomBudgetTarget,
        groomBudgetItems,
        toggleGroomBudgetItem,
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
        categories,
        articles,
        locations,
        addArticle,
        adminStats,
        adminUsers,
        auditLogs,
        refreshAdminData,
        finishingPackages,
        finishingServices,
        settings,
        updateSettings,
        authModalOpen,
        setAuthModalOpen,
        finishingModalOpen,
        setFinishingModalOpen,
        finishingPrefill,
        setFinishingPrefill,
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
      }}
    >
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
