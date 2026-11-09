import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  BookmarkPlus,
  CheckCircle2,
  HeartHandshake,
  Lock,
  Plus,
  Send,
  ShoppingBag,
  Trash2,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ShoppingListItemStatus, ShoppingListType } from '../../types';

export const ShoppingListsView: React.FC = () => {
  const {
    language,
    currentUser,
    isLoggedIn,
    setAuthModalOpen,
    products,
    addToCart,
    shoppingLists,
    priceAlerts,
    createShoppingList,
    updateShoppingList,
    deleteShoppingList,
    addShoppingListItem,
    updateShoppingListItem,
    deleteShoppingListItem,
    updatePriceAlert,
    deletePriceAlert,
    createWorkspaceApproval,
    showToast,
  } = useApp();

  const isAr = language === 'ar';
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [newListTitleAr, setNewListTitleAr] = useState('');
  const [newListTitleEn, setNewListTitleEn] = useState('');
  const [newListType, setNewListType] = useState<ShoppingListType>('general');
  const [newListBudget, setNewListBudget] = useState('50000');
  const [newListShared, setNewListShared] = useState(false);

  const [itemProductId, setItemProductId] = useState<string>('');
  const [itemCustomTitle, setItemCustomTitle] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemPrice, setItemPrice] = useState('');
  const [itemPriority, setItemPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const activeList = useMemo(() => {
    if (selectedListId) {
      const found = shoppingLists.find((l) => l.id === selectedListId);
      if (found) return found;
    }
    return shoppingLists[0] ?? null;
  }, [selectedListId, shoppingLists]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitleAr.trim() && !newListTitleEn.trim()) return;
    const titleAr = newListTitleAr.trim() || newListTitleEn.trim();
    const titleEn = newListTitleEn.trim() || newListTitleAr.trim();
    const id = await createShoppingList({
      titleAr,
      titleEn,
      listType: newListType,
      isSharedWithPartner: newListShared,
      budgetTarget: Number(newListBudget) || 0,
    });
    setSelectedListId(id);
    setNewListTitleAr('');
    setNewListTitleEn('');
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeList) return;
    const chosenProduct = itemProductId ? products.find((p) => p.id === itemProductId) : null;
    const customTitle =
      itemCustomTitle.trim() ||
      (chosenProduct ? (isAr ? chosenProduct.nameAr : chosenProduct.nameEn) : '');
    if (customTitle.length < 2) return;

    await addShoppingListItem(activeList.id, {
      productId: chosenProduct?.id ?? null,
      customTitle,
      categoryLabel: chosenProduct?.category ?? activeList.listType,
      quantity: Math.max(1, Number(itemQty) || 1),
      targetUnitPrice: Number(itemPrice) || chosenProduct?.price || 0,
      priority: itemPriority,
    });
    setItemProductId('');
    setItemCustomTitle('');
    setItemQty('1');
    setItemPrice('');
  };

  const handleSendToPartnerApproval = async (title: string, category: string, amount: number) => {
    await createWorkspaceApproval({ title, category, estimatedAmount: amount });
    showToast(
      isAr
        ? 'تم إرسال طلب الاعتماد إلى مساحة الزوجين المشتركة.'
        : 'Sent purchase approval request to Couple Workspace.',
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-rose-100 p-8 text-center shadow-sm space-y-4">
          <BookmarkPlus className="w-12 h-12 text-[#D91B3E] mx-auto" />
          <h1 className="text-2xl font-black text-[#2A1D20]">
            {isAr ? 'سلال التسوق المتعددة وتنبيهات الأسعار' : 'Multi-List Shopping Baskets & Price Alerts'}
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isAr
              ? 'سجّل الدخول لإنشاء قوائم مشتريات خاصة أو مشتركة مع شريك حياتك، ومتابعة تنبيهات انخفاض أسعار الأجهزة.'
              : 'Sign in to organize private or partner-shared shopping baskets and manage live price drop alerts.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              data-testid="shopping-signin-btn"
              onClick={() => setAuthModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-red-gradient text-white text-xs font-bold shadow cursor-pointer"
            >
              {isAr ? 'تسجيل الدخول للمتابعة' : 'Sign In to Continue'}
            </button>
            <Link
              to="/products"
              className="px-6 py-3 rounded-xl bg-gray-100 text-gray-800 text-xs font-bold"
            >
              {isAr ? 'تصفح موسوعة المنتجات أولاً' : 'Browse Products First'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-20">
      <section className="bg-red-gradient text-white py-9 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <BookmarkPlus className="w-6 h-6" />
              <span>{isAr ? 'سلال التسوق المتعددة وتنبيهات الأسعار' : 'Multi-List Shopping Baskets & Price Alerts'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/90">
              {isAr
                ? 'رتب مشتريات العريس، مطبخ العروسة، وخامات التشطيب مع تحكم كامل في الخصوصية أو المشاركة في مساحة الزوجين.'
                : 'Organize groom appliances, bride kitchen gear & finishing hardware with strict Private vs. Partner-Shared visibility.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/products"
              className="px-4 py-2 rounded-xl bg-white text-[#D91B3E] text-xs font-bold shadow-sm"
            >
              {isAr ? 'موسوعة المنتجات' : 'Product Encyclopedia'}
            </Link>
            <Link
              to="/my/workspace"
              className="px-4 py-2 rounded-xl bg-[#2A1D20] text-white text-xs font-bold shadow-sm"
            >
              {isAr ? 'مساحة جواز إن المشتركة' : 'My Gawaz Inn Hub'}
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Lists + Create List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-black text-[#2A1D20]">
                {isAr ? `قوائم المشتريات (${shoppingLists.length})` : `My Shopping Baskets (${shoppingLists.length})`}
              </h2>
              <div data-testid="shopping-lists-sidebar" className="space-y-2.5">
                {shoppingLists.length === 0 ? (
                  <p className="text-xs text-gray-500 py-2">
                    {isAr ? 'لا توجد سلال تسوق بعد. أنشئ أول سلة أدناه.' : 'No baskets yet. Create one below.'}
                  </p>
                ) : (
                  shoppingLists.map((list) => {
                    const isOwner = list.userId === currentUser?.id;
                    const isActive = activeList?.id === list.id;
                    return (
                      <div
                        key={list.id}
                        data-testid={`shopping-list-card-${list.id}`}
                        className={`rounded-2xl border p-3.5 transition ${
                          isActive ? 'border-[#D91B3E] bg-[#FFF8F8]' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedListId(list.id)}
                          className="w-full text-start cursor-pointer space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <strong className="text-xs font-bold text-[#2A1D20]">
                              {isAr ? list.titleAr : list.titleEn}
                            </strong>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shrink-0 ${
                                list.isSharedWithPartner
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {list.isSharedWithPartner ? (
                                <>
                                  <Users className="w-3 h-3" />
                                  {isAr ? 'مشترك' : 'Shared'}
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3" />
                                  {isAr ? 'خاص' : 'Private'}
                                </>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <span>{list.items.length} {isAr ? 'عنصر' : 'items'}</span>
                            <strong className="text-[#D91B3E]">
                              {list.totalEstimatedCost.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                            </strong>
                          </div>
                        </button>
                        {isOwner && (
                          <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-gray-100 text-[11px]">
                            <button
                              type="button"
                              data-testid={`toggle-share-list-${list.id}`}
                              onClick={() =>
                                void updateShoppingList(list.id, {
                                  isSharedWithPartner: !list.isSharedWithPartner,
                                })
                              }
                              className="text-gray-600 hover:text-[#D91B3E] font-semibold cursor-pointer"
                            >
                              {list.isSharedWithPartner
                                ? isAr
                                  ? 'تحويل لقائمة خاصة'
                                  : 'Make Private'
                                : isAr
                                  ? 'مشاركة مع الشريك'
                                  : 'Share with Partner'}
                            </button>
                            <button
                              type="button"
                              data-testid={`delete-list-${list.id}`}
                              onClick={() => void deleteShoppingList(list.id)}
                              className="text-rose-500 hover:text-rose-700 cursor-pointer"
                              aria-label="Delete list"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Create List Form */}
            <form
              onSubmit={handleCreateList}
              data-testid="create-shopping-list-form"
              className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-3"
            >
              <h3 className="text-sm font-black text-[#2A1D20] flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#D91B3E]" />
                <span>{isAr ? 'إنشاء سلة تسوق جديدة' : 'Create New Basket'}</span>
              </h3>
              <input
                type="text"
                required
                data-testid="new-list-title-ar"
                value={newListTitleAr}
                onChange={(e) => setNewListTitleAr(e.target.value)}
                placeholder={isAr ? 'اسم القائمة بالعربية (مثال: تجهيزات المطبخ)' : 'Arabic Title (e.g. Kitchen Gear)'}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
              />
              <input
                type="text"
                data-testid="new-list-title-en"
                value={newListTitleEn}
                onChange={(e) => setNewListTitleEn(e.target.value)}
                placeholder={isAr ? 'الاسم بالإنجليزية (اختياري)' : 'English Title'}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newListType}
                  onChange={(e) => setNewListType(e.target.value as ShoppingListType)}
                  className="px-2.5 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                >
                  <option value="groom_appliances">{isAr ? 'أجهزة العريس' : 'Groom Appliances'}</option>
                  <option value="bride_kitchen">{isAr ? 'مطبخ وجهاز العروسة' : 'Bride Kitchen'}</option>
                  <option value="finishing_hardware">{isAr ? 'خامات وتشطيب' : 'Finishing Materials'}</option>
                  <option value="home_furniture">{isAr ? 'الأثاث والغرف' : 'Furniture'}</option>
                  <option value="general">{isAr ? 'عام' : 'General'}</option>
                </select>
                <input
                  type="number"
                  min={0}
                  value={newListBudget}
                  onChange={(e) => setNewListBudget(e.target.value)}
                  placeholder="Budget EGP"
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="new-list-shared-checkbox"
                  checked={newListShared}
                  onChange={(e) => setNewListShared(e.target.checked)}
                  className="accent-[#D91B3E]"
                />
                <span>
                  {isAr ? 'مشاركة السلة في مساحة الزوجين' : 'Share basket inside Couple Workspace'}
                </span>
              </label>
              <button
                type="submit"
                data-testid="create-shopping-list-submit"
                className="w-full py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold shadow cursor-pointer"
              >
                {isAr ? 'إنشاء القائمة' : 'Create Shopping Basket'}
              </button>
            </form>
          </div>

          {/* Right Column: Selected List Items */}
          <div className="lg:col-span-8 space-y-6">
            {activeList ? (
              <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl font-black text-[#2A1D20]">
                      {isAr ? activeList.titleAr : activeList.titleEn}
                    </h2>
                    {activeList.notes && (
                      <p className="text-xs text-gray-500 mt-1">{activeList.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <div className="bg-[#FAF7F2] px-3 py-2 rounded-xl border border-gray-100">
                      <span className="text-gray-500 block">{isAr ? 'إجمالي التقديري' : 'Estimated Total'}</span>
                      <strong className="text-[#D91B3E]">
                        {activeList.totalEstimatedCost.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                      </strong>
                    </div>
                    <div className="bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                      <span className="text-emerald-700 block">{isAr ? 'تم شراؤه' : 'Purchased'}</span>
                      <strong className="text-emerald-800">
                        {activeList.totalPurchasedCost.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Add Item to Active List */}
                <form
                  onSubmit={handleAddItem}
                  data-testid="add-shopping-item-form"
                  className="bg-[#FAF7F2] rounded-2xl border border-gray-200 p-4 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <select
                      data-testid="basket-select-product"
                      value={itemProductId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItemProductId(val);
                        const prod = products.find((p) => p.id === val);
                        if (prod) {
                          setItemCustomTitle(isAr ? prod.nameAr : prod.nameEn);
                          setItemPrice(String(prod.price));
                        }
                      }}
                      className="sm:col-span-5 px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                    >
                      <option value="">
                        {isAr ? '-- اختياري: منتج من الموسوعة أو اكتب يدوياً --' : '-- Optional: Pick Catalog Item --'}
                      </option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {(isAr ? p.nameAr : p.nameEn).slice(0, 48)} ({p.price.toLocaleString()})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      required={!itemProductId}
                      data-testid="basket-item-title-input"
                      value={itemCustomTitle}
                      onChange={(e) => setItemCustomTitle(e.target.value)}
                      placeholder={isAr ? 'اسم الصنف المطلوب...' : 'Item title...'}
                      className="sm:col-span-4 px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                    />
                    <input
                      type="number"
                      min={1}
                      value={itemQty}
                      onChange={(e) => setItemQty(e.target.value)}
                      placeholder="Qty"
                      className="sm:col-span-1 px-2.5 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                    />
                    <input
                      type="number"
                      min={0}
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      placeholder={isAr ? 'السعر' : 'Price'}
                      className="sm:col-span-2 px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <select
                      value={itemPriority}
                      onChange={(e) => setItemPriority(e.target.value as 'high' | 'medium' | 'low')}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-white"
                    >
                      <option value="high">{isAr ? 'أولوية عالية' : 'High Priority'}</option>
                      <option value="medium">{isAr ? 'أولوية متوسطة' : 'Medium Priority'}</option>
                      <option value="low">{isAr ? 'أولوية مرنة' : 'Low Priority'}</option>
                    </select>
                    <button
                      type="submit"
                      data-testid="basket-add-item-submit"
                      className="px-5 py-2 rounded-xl bg-[#D91B3E] text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إضافة للسلة' : 'Add to Basket'}</span>
                    </button>
                  </div>
                </form>

                {/* Basket Items */}
                <div data-testid="shopping-items-list" className="space-y-3">
                  {activeList.items.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-6">
                      {isAr ? 'هذه القائمة فارغة حتى الآن.' : 'This basket has no items yet.'}
                    </p>
                  ) : (
                    activeList.items.map((item) => (
                      <div
                        key={item.id}
                        data-testid={`shopping-item-row-${item.id}`}
                        className="rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-rose-200 transition"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.priority === 'high'
                                  ? 'bg-rose-100 text-[#D91B3E]'
                                  : item.priority === 'low'
                                    ? 'bg-gray-100 text-gray-600'
                                    : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {item.priority}
                            </span>
                            {item.product ? (
                              <Link
                                to={`/products/${encodeURIComponent(item.product.slug || item.product.id)}`}
                                className="font-bold text-sm text-[#2A1D20] hover:text-[#D91B3E]"
                              >
                                {item.customTitle}
                              </Link>
                            ) : (
                              <strong className="font-bold text-sm text-[#2A1D20]">{item.customTitle}</strong>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span>
                              {isAr ? 'الكمية:' : 'Qty:'} <strong>{item.quantity}</strong>
                            </span>
                            <span>
                              {isAr ? 'التكلفة:' : 'Subtotal:'}{' '}
                              <strong className="text-[#D91B3E]">
                                {(item.quantity * item.targetUnitPrice).toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                              </strong>
                            </span>
                            {item.preferredMerchant && <span>• {item.preferredMerchant}</span>}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <select
                            data-testid={`item-status-select-${item.id}`}
                            value={item.status}
                            onChange={(e) =>
                              void updateShoppingListItem(item.id, {
                                status: e.target.value as ShoppingListItemStatus,
                              })
                            }
                            aria-label="Item status"
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white font-semibold"
                          >
                            <option value="planned">{isAr ? 'مخطط' : 'Planned'}</option>
                            <option value="shortlisted">{isAr ? 'مرشح للشراء' : 'Shortlisted'}</option>
                            <option value="ready_to_buy">{isAr ? 'جاهز للطلب' : 'Ready to Buy'}</option>
                            <option value="purchased">{isAr ? 'تم الشراء' : 'Purchased'}</option>
                          </select>

                          {item.product && (
                            <button
                              type="button"
                              onClick={() => addToCart(item.product!, item.quantity)}
                              title={isAr ? 'أضف لعربة الطلب' : 'Add to Cart'}
                              className="p-2 rounded-lg bg-[#FDE8ED] text-[#D91B3E] hover:bg-[#D91B3E] hover:text-white transition cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            data-testid={`request-partner-approval-${item.id}`}
                            onClick={() =>
                              void handleSendToPartnerApproval(
                                item.customTitle,
                                item.categoryLabel,
                                item.quantity * item.targetUnitPrice,
                              )
                            }
                            title={isAr ? 'طلب اعتماد الشريك للشراء' : 'Request Partner Purchase Approval'}
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                          >
                            <HeartHandshake className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => void deleteShoppingListItem(item.id)}
                            aria-label="Delete item"
                            className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center text-xs text-gray-500">
                {isAr ? 'أنشئ أول سلة تسوق من اللوحة الجانبية لبدء تنظيم مشترياتك.' : 'Create a shopping basket on the side to begin.'}
              </div>
            )}

            {/* Price Alerts Panel */}
            <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-black text-[#2A1D20] flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#D91B3E]" />
                  <span>{isAr ? `تنبيهات الأسعار المتابعة (${priceAlerts.length})` : `Tracked Price Drop Alerts (${priceAlerts.length})`}</span>
                </h2>
                <Link to="/products" className="text-xs font-bold text-[#D91B3E] hover:underline inline-flex items-center gap-1">
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAr ? 'أضف تنبيهاً من الموسوعة' : 'Add Alert from Encyclopedia'}</span>
                </Link>
              </div>

              {priceAlerts.length === 0 ? (
                <p className="text-xs text-gray-500">
                  {isAr ? 'لم تضف تنبيهات سعر حتى الآن.' : 'No price alerts configured yet.'}
                </p>
              ) : (
                <div data-testid="price-alerts-list" className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {priceAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      data-testid={`price-alert-card-${alert.productId}`}
                      className={`rounded-2xl border p-4 space-y-2 ${
                        alert.status === 'triggered'
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-[#FAF7F2] border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/products/${encodeURIComponent(alert.product?.slug || alert.productId)}`}
                          className="font-bold text-xs text-[#2A1D20] hover:text-[#D91B3E]"
                        >
                          {alert.product
                            ? isAr
                              ? alert.product.nameAr
                              : alert.product.nameEn
                            : alert.productId}
                        </Link>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            alert.status === 'triggered'
                              ? 'bg-emerald-600 text-white'
                              : alert.status === 'paused'
                                ? 'bg-gray-200 text-gray-600'
                                : 'bg-[#FDE8ED] text-[#D91B3E]'
                          }`}
                        >
                          {alert.status === 'triggered'
                            ? isAr
                              ? 'متحقق!'
                              : 'Triggered!'
                            : alert.status === 'paused'
                              ? isAr
                                ? 'متوقف مؤقتاً'
                                : 'Paused'
                              : isAr
                                ? 'نشط'
                                : 'Active'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-700">
                        <span>
                          {isAr ? 'الهدف:' : 'Target:'}{' '}
                          <strong className="text-[#D91B3E]">{alert.targetPrice.toLocaleString()}</strong>
                        </span>
                        <span>
                          {isAr ? 'الحالي:' : 'Current:'}{' '}
                          <strong>{alert.currentPriceSnapshot.toLocaleString()}</strong>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        {alert.status !== 'triggered' && (
                          <button
                            type="button"
                            onClick={() =>
                              void updatePriceAlert(alert.id, {
                                status: alert.status === 'paused' ? 'active' : 'paused',
                              })
                            }
                            className="text-[11px] font-bold text-gray-600 hover:text-[#D91B3E] cursor-pointer"
                          >
                            {alert.status === 'paused'
                              ? isAr
                                ? 'استئناف'
                                : 'Resume'
                              : isAr
                                ? 'إيقاف مؤقت'
                                : 'Pause'}
                          </button>
                        )}
                        {alert.status === 'triggered' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {isAr ? 'السعر مناسب الآن' : 'Ready at Target Price'}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => void deletePriceAlert(alert.id)}
                          aria-label="Delete price alert"
                          className="text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
