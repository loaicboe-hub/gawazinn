import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ROOM_THEME_META, ROOM_TYPE_META } from '../../../shared/stage10Data';
import type { MoodboardItemType, RoomThemeSlug, RoomType } from '../../types';
import {
  LayoutGrid,
  Plus,
  Trash2,
  Move,
  Palette,
  Package,
  Layers,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

export const RoomDesignerView: React.FC = () => {
  const {
    language,
    currentUser,
    setAuthModalOpen,
    products,
    finishingMaterials,
    roomMoodboards,
    createRoomMoodboard,
    deleteRoomMoodboard,
    addMoodboardItem,
    updateMoodboardItem,
    deleteMoodboardItem,
  } = useApp();

  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);

  // Create New Board State
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newRoomType, setNewRoomType] = useState<RoomType>('bedroom');
  const [newLengthM, setNewLengthM] = useState(4.5);
  const [newWidthM, setNewWidthM] = useState(4.0);
  const [newThemeSlug, setNewThemeSlug] = useState<RoomThemeSlug>('warm_beige');
  const [creatingBoard, setCreatingBoard] = useState(false);

  // Add Item State
  const [addItemType, setAddItemType] = useState<MoodboardItemType>('product');
  const [pickedProductId, setPickedProductId] = useState(products[0]?.id || '');
  const [pickedMaterialSlug, setPickedMaterialSlug] = useState(finishingMaterials[0]?.slug || '');
  const [customLabelAr, setCustomLabelAr] = useState('');
  const [customWidthCm, setCustomWidthCm] = useState(140);
  const [customDepthCm, setCustomDepthCm] = useState(80);
  const [customPriceEgp, setCustomPriceEgp] = useState(12500);
  const [addingItem, setAddingItem] = useState(false);

  const activeBoard = useMemo(() => {
    if (roomMoodboards.length === 0) return null;
    if (selectedBoardId) {
      const exact = roomMoodboards.find((b) => b.id === selectedBoardId);
      if (exact) return exact;
    }
    return roomMoodboards[0];
  }, [roomMoodboards, selectedBoardId]);

  const selectedItem = useMemo(() => {
    if (!activeBoard || !selectedItemId) return activeBoard?.items[0] || null;
    return activeBoard.items.find((it) => it.id === selectedItemId) || activeBoard.items[0] || null;
  }, [activeBoard, selectedItemId]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setCreatingBoard(true);
    try {
      const created = await createRoomMoodboard({
        titleAr: newTitleAr.trim(),
        roomType: newRoomType,
        lengthM: Number(newLengthM),
        widthM: Number(newWidthM),
        themeSlug: newThemeSlug,
      });
      setSelectedBoardId(created.id);
      setNewTitleAr('');
      setShowNewBoardForm(false);
    } finally {
      setCreatingBoard(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBoard) return;
    setAddingItem(true);
    try {
      let labelAr = customLabelAr.trim() || 'قطعة جديدة';
      let price = Number(customPriceEgp) || 0;
      if (addItemType === 'product' && pickedProductId) {
        const p = products.find((x) => x.id === pickedProductId);
        if (p) {
          labelAr = p.nameAr;
          price = p.price;
        }
      } else if (addItemType === 'material' && pickedMaterialSlug) {
        const m = finishingMaterials.find((x) => x.slug === pickedMaterialSlug);
        if (m) {
          labelAr = m.nameAr;
          price = Math.round((m.priceMinEgp + m.priceMaxEgp) / 2);
        }
      }

      const updated = await addMoodboardItem(activeBoard.id, {
        itemType: addItemType,
        productId: addItemType === 'product' ? pickedProductId : null,
        materialSlug: addItemType === 'material' ? pickedMaterialSlug : null,
        labelAr,
        widthCm: Number(customWidthCm),
        depthCm: Number(customDepthCm),
        posXPct: 50,
        posYPct: 50,
        estimatedPriceEgp: price,
        colorHex: addItemType === 'product' ? '#D91B3E' : '#2A1D20',
      });
      const lastItem = updated.items[updated.items.length - 1];
      if (lastItem) setSelectedItemId(lastItem.id);
      setCustomLabelAr('');
    } finally {
      setAddingItem(false);
    }
  };

  const themeMeta = activeBoard
    ? ROOM_THEME_META[activeBoard.themeSlug] || ROOM_THEME_META.modern_cairo
    : ROOM_THEME_META.modern_cairo;

  return (
    <div className="space-y-8 pb-24">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-10 lg:py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <LayoutGrid className="w-4 h-4 text-white" />
              <span>
                {language === 'ar'
                  ? 'مخطط الغرف ثنائي الأبعاد ولوحات الإلهام والألوان'
                  : '2D Scaled Room Planner & Material Moodboard Studio'}
              </span>
            </div>
            <h1
              data-testid="room-designer-heading"
              className="text-2xl sm:text-4xl font-black text-white leading-tight"
            >
              {language === 'ar'
                ? 'صمّم غرف شقتك بالمساحات الفعلية واربطها بمنتجات جواز إن'
                : 'Design Rooms to Scale & Link Live Catalog Products'}
            </h1>
            <p className="text-sm sm:text-base text-rose-100 leading-relaxed">
              {language === 'ar'
                ? 'رتب الأثاث والأجهزة والخامات على مقاسات الغرفة بالمتر واحسب نسبة الإشغال والتكلفة التقديرية مباشرة.'
                : 'Place appliances, finishing materials, and custom furniture across real apartment dimensions and compute total cost live.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              data-testid="room-open-create-btn"
              onClick={() => {
                if (!currentUser) {
                  setAuthModalOpen(true);
                } else {
                  setShowNewBoardForm((v) => !v);
                }
              }}
              className="bg-white text-[#B31331] hover:bg-[#FDE8ED] font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إنشاء غرفة جديدة' : 'New Room Board'}</span>
            </button>
            <Link
              to="/my/budget"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold text-xs sm:text-sm px-4 py-3 rounded-xl transition flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>{language === 'ar' ? 'ميزانية الزواج' : 'Budget Manager'}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {!currentUser ? (
          <div className="bg-[#FFF8F9] rounded-3xl p-6 sm:p-8 border border-[#D91B3E]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#D91B3E] font-black text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>
                  {language === 'ar'
                    ? 'سجل الدخول لحفظ لوحات الغرف والأثاث المرتبطة بحسابك'
                    : 'Sign In to Save & Edit Interactive Room Moodboards'}
                </span>
              </div>
              <p className="text-xs text-gray-600 max-w-xl">
                {language === 'ar'
                  ? 'اختر الألوان والستايل، حدد طول وعرض كل غرفة، وأضف أجهزة الكتالوج لحساب التكلفة الفعلية للفرش.'
                  : 'Customize Egyptian apartment dimensions, drag placements, pick color palettes, and link real DB prices.'}
              </p>
            </div>
            <button
              type="button"
              data-testid="room-signin-btn"
              onClick={() => setAuthModalOpen(true)}
              className="bg-red-gradient text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md shrink-0 cursor-pointer"
            >
              {language === 'ar' ? 'تسجيل الدخول والبدء' : 'Sign In & Design'}
            </button>
          </div>
        ) : (
          <>
            {/* Create Room Form */}
            {showNewBoardForm && (
              <form
                onSubmit={handleCreateBoard}
                data-testid="room-create-form"
                className="bg-[#FAF7F2] rounded-3xl p-5 sm:p-6 border border-[#D91B3E]/20 space-y-4 text-xs"
              >
                <h2 className="text-base font-black text-[#2A1D20]">
                  {language === 'ar' ? 'إضافة لوحة غرفة جديدة' : 'Create Room Floor Plan'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="space-y-1 block">
                    <span className="font-bold text-gray-800 block">
                      {language === 'ar' ? 'اسم الغرفة *' : 'Room Title *'}
                    </span>
                    <input
                      type="text"
                      required
                      minLength={2}
                      data-testid="room-title-input"
                      value={newTitleAr}
                      onChange={(e) => setNewTitleAr(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: غرفة النوم الماستر' : 'Master Suite'}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                    />
                  </label>
                  <label className="space-y-1 block">
                    <span className="font-bold text-gray-800 block">
                      {language === 'ar' ? 'نوع الغرفة' : 'Room Type'}
                    </span>
                    <select
                      data-testid="room-type-select"
                      value={newRoomType}
                      onChange={(e) => setNewRoomType(e.target.value as RoomType)}
                      className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                    >
                      {(Object.keys(ROOM_TYPE_META) as RoomType[]).map((rt) => (
                        <option key={rt} value={rt}>
                          {language === 'ar' ? ROOM_TYPE_META[rt].nameAr : ROOM_TYPE_META[rt].nameEn}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 block">
                    <span className="font-bold text-gray-800 block">
                      {language === 'ar' ? 'لوحة الألوان والطراز' : 'Theme Palette'}
                    </span>
                    <select
                      data-testid="room-theme-select"
                      value={newThemeSlug}
                      onChange={(e) => setNewThemeSlug(e.target.value as RoomThemeSlug)}
                      className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                    >
                      {(Object.keys(ROOM_THEME_META) as RoomThemeSlug[]).map((ts) => (
                        <option key={ts} value={ts}>
                          {language === 'ar' ? ROOM_THEME_META[ts].nameAr : ROOM_THEME_META[ts].nameEn}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                  <label className="space-y-1 block">
                    <span className="font-bold text-gray-800 block">
                      {language === 'ar' ? 'الطول (متر)' : 'Length (m)'}
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      min={1.5}
                      max={20}
                      value={newLengthM}
                      onChange={(e) => setNewLengthM(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                    />
                  </label>
                  <label className="space-y-1 block">
                    <span className="font-bold text-gray-800 block">
                      {language === 'ar' ? 'العرض (متر)' : 'Width (m)'}
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      min={1.5}
                      max={20}
                      value={newWidthM}
                      onChange={(e) => setNewWidthM(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                    />
                  </label>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button
                      type="submit"
                      data-testid="room-create-submit"
                      disabled={creatingBoard || newTitleAr.trim().length < 2}
                      className="bg-red-gradient text-white font-black px-5 py-2.5 rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {creatingBoard ? '...' : language === 'ar' ? 'حفظ الغرفة' : 'Create Room'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Room Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {roomMoodboards.map((board) => (
                <button
                  key={board.id}
                  type="button"
                  data-testid={`room-tab-${board.id}`}
                  onClick={() => {
                    setSelectedBoardId(board.id);
                    setSelectedItemId(null);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition cursor-pointer ${
                    activeBoard?.id === board.id
                      ? 'bg-[#D91B3E] text-white border-[#D91B3E] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#D91B3E]/40'
                  }`}
                >
                  {language === 'ar' ? board.titleAr : board.titleEn} ({board.lengthM}×{board.widthM}m)
                </button>
              ))}
            </div>

            {activeBoard && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 2D Floor Plan Canvas + Moodboard Strip */}
                <div className="lg:col-span-7 space-y-5 min-w-0">
                  <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-[#2A1D20]">
                          {language === 'ar' ? activeBoard.titleAr : activeBoard.titleEn}
                        </h2>
                        <p className="text-xs text-gray-500">
                          {activeBoard.floorAreaSqm} m² ({activeBoard.lengthM}m × {activeBoard.widthM}m) •{' '}
                          {language === 'ar'
                            ? `نسبة الإشغال: ${activeBoard.occupiedAreaPercent}%`
                            : `Floor Occupied: ${activeBoard.occupiedAreaPercent}%`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          data-testid="room-total-cost"
                          className="px-3 py-1.5 rounded-xl bg-[#FDE8ED] text-[#B31331] text-xs font-black"
                        >
                          {activeBoard.totalEstimatedCostEgp.toLocaleString()}{' '}
                          {language === 'ar' ? 'ج.م' : 'EGP'}
                        </span>
                        {roomMoodboards.length > 1 && (
                          <button
                            type="button"
                            onClick={() => void deleteRoomMoodboard(activeBoard.id)}
                            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-rose-700 cursor-pointer"
                            title={language === 'ar' ? 'حذف الغرفة' : 'Delete room'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Theme Swatches Moodboard */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-gray-600 flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5 text-[#D91B3E]" />
                        {language === 'ar' ? 'باليتة الألوان:' : 'Palette:'}
                      </span>
                      {activeBoard.paletteHex.map((hex) => (
                        <span
                          key={hex}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-[11px] font-bold"
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/15"
                            style={{ backgroundColor: hex }}
                          />
                          <span>{hex}</span>
                        </span>
                      ))}
                    </div>

                    {/* Interactive Scaled 2D Floor Plan Box */}
                    <div
                      data-testid="room-designer-canvas"
                      className="relative w-full rounded-2xl border-2 border-[#2A1D20]/30 overflow-hidden shadow-inner"
                      style={{
                        backgroundColor: themeMeta.canvasBgHex,
                        backgroundImage:
                          'linear-gradient(to right, rgba(42,29,32,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(42,29,32,0.06) 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                        aspectRatio: `${Math.max(1, activeBoard.lengthM)} / ${Math.max(1, activeBoard.widthM)}`,
                        minHeight: '260px',
                      }}
                    >
                      {activeBoard.items.map((item) => {
                        const wPct = Math.max(
                          12,
                          Math.min(48, (item.widthCm / 100 / activeBoard.lengthM) * 100),
                        );
                        const hPct = Math.max(
                          12,
                          Math.min(48, (item.depthCm / 100 / activeBoard.widthM) * 100),
                        );
                        const isSelected = selectedItem?.id === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            data-testid={`canvas-item-${item.id}`}
                            onClick={() => setSelectedItemId(item.id)}
                            style={{
                              left: `${item.posXPct}%`,
                              top: `${item.posYPct}%`,
                              width: `${wPct}%`,
                              height: `${hPct}%`,
                              transform: 'translate(-50%, -50%)',
                              backgroundColor: item.colorHex || '#2A1D20',
                            }}
                            className={`absolute rounded-xl text-white p-1.5 flex flex-col items-center justify-center text-center shadow-md transition cursor-pointer ${
                              isSelected ? 'ring-4 ring-[#D91B3E] z-20' : 'opacity-90 hover:opacity-100 z-10'
                            }`}
                          >
                            <span className="text-[10px] sm:text-xs font-black leading-tight line-clamp-2">
                              {language === 'ar' ? item.labelAr : item.labelEn}
                            </span>
                            <span className="text-[9px] opacity-80">
                              {item.widthCm}×{item.depthCm}cm
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Item Position Controls */}
                    {selectedItem && (
                      <div
                        data-testid="selected-item-controls"
                        className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#D91B3E]/15 space-y-3 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-black text-[#2A1D20] flex items-center gap-1.5">
                            <Move className="w-4 h-4 text-[#D91B3E]" />
                            <span>
                              {language === 'ar' ? selectedItem.labelAr : selectedItem.labelEn}
                            </span>
                          </span>
                          <button
                            type="button"
                            data-testid={`delete-item-${selectedItem.id}`}
                            onClick={() => void deleteMoodboardItem(selectedItem.id)}
                            className="text-rose-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'إزالة' : 'Remove'}</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label className="space-y-1 block">
                            <span className="font-bold text-gray-700 block">
                              {language === 'ar' ? 'الموضع الأفقي X%' : 'Horizontal X%'} ({Math.round(selectedItem.posXPct)}%)
                            </span>
                            <input
                              type="range"
                              min={10}
                              max={90}
                              value={selectedItem.posXPct}
                              onChange={(e) =>
                                void updateMoodboardItem(selectedItem.id, {
                                  posXPct: Number(e.target.value),
                                })
                              }
                              className="w-full accent-[#D91B3E]"
                            />
                          </label>
                          <label className="space-y-1 block">
                            <span className="font-bold text-gray-700 block">
                              {language === 'ar' ? 'الموضع الرأسي Y%' : 'Vertical Y%'} ({Math.round(selectedItem.posYPct)}%)
                            </span>
                            <input
                              type="range"
                              min={10}
                              max={90}
                              value={selectedItem.posYPct}
                              onChange={(e) =>
                                void updateMoodboardItem(selectedItem.id, {
                                  posYPct: Number(e.target.value),
                                })
                              }
                              className="w-full accent-[#D91B3E]"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel: Add Linked Product / Material / Custom Furniture + Itemized Cost */}
                <div className="lg:col-span-5 space-y-5 min-w-0">
                  <form
                    onSubmit={handleAddItem}
                    data-testid="room-add-item-form"
                    className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#D91B3E]/20 space-y-4 text-xs"
                  >
                    <h3 className="text-sm sm:text-base font-black text-[#2A1D20] flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#D91B3E]" />
                      <span>
                        {language === 'ar' ? 'إضافة قطعة أو منتج للمخطط' : 'Place Product / Material / Furniture'}
                      </span>
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {(['product', 'material', 'custom_furniture'] as MoodboardItemType[]).map(
                        (kind) => (
                          <button
                            key={kind}
                            type="button"
                            data-testid={`add-type-${kind}`}
                            onClick={() => setAddItemType(kind)}
                            className={`px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                              addItemType === kind
                                ? 'bg-[#D91B3E] text-white border-[#D91B3E]'
                                : 'bg-white text-gray-700 border-gray-200'
                            }`}
                          >
                            {kind === 'product'
                              ? language === 'ar'
                                ? 'منتج كتالوج حي'
                                : 'Catalog Product'
                              : kind === 'material'
                                ? language === 'ar'
                                  ? 'خامة تشطيب'
                                  : 'Finishing Material'
                                : language === 'ar'
                                  ? 'قطعة أثاث مخصصة'
                                  : 'Custom Furniture'}
                          </button>
                        ),
                      )}
                    </div>

                    {addItemType === 'product' ? (
                      <label className="space-y-1 block">
                        <span className="font-bold text-gray-800 block">
                          {language === 'ar' ? 'اختر من كتالوج المنتجات الموثق' : 'Select DB Product'}
                        </span>
                        <select
                          data-testid="room-pick-product"
                          value={pickedProductId}
                          onChange={(e) => setPickedProductId(e.target.value)}
                          className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {language === 'ar' ? p.nameAr : p.nameEn} ({p.price.toLocaleString()} EGP)
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : addItemType === 'material' ? (
                      <label className="space-y-1 block">
                        <span className="font-bold text-gray-800 block">
                          {language === 'ar' ? 'اختر خامة من موسوعة التشطيب' : 'Select Finishing Material'}
                        </span>
                        <select
                          data-testid="room-pick-material"
                          value={pickedMaterialSlug}
                          onChange={(e) => setPickedMaterialSlug(e.target.value)}
                          className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                        >
                          {finishingMaterials.map((m) => (
                            <option key={m.slug} value={m.slug}>
                              {language === 'ar' ? m.nameAr : m.nameEn} ({m.priceMinEgp}–{m.priceMaxEgp} EGP)
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="space-y-1 block sm:col-span-2">
                          <span className="font-bold text-gray-800 block">
                            {language === 'ar' ? 'اسم القطعة *' : 'Furniture Name *'}
                          </span>
                          <input
                            type="text"
                            required
                            minLength={2}
                            data-testid="room-custom-label"
                            value={customLabelAr}
                            onChange={(e) => setCustomLabelAr(e.target.value)}
                            placeholder={language === 'ar' ? 'مثال: دولاب دريسنج 240 سم' : '240cm Dressing Wardrobe'}
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="font-bold text-gray-800 block">
                            {language === 'ar' ? 'السعر التقديري (ج.م)' : 'Est. Price (EGP)'}
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={customPriceEgp}
                            onChange={(e) => setCustomPriceEgp(Number(e.target.value))}
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                          />
                        </label>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <label className="space-y-1 block">
                        <span className="font-bold text-gray-700 block">
                          {language === 'ar' ? 'العرض (سم)' : 'Width (cm)'}
                        </span>
                        <input
                          type="number"
                          min={20}
                          max={600}
                          value={customWidthCm}
                          onChange={(e) => setCustomWidthCm(Number(e.target.value))}
                          className="w-full p-2 rounded-xl border border-gray-300 bg-white font-bold"
                        />
                      </label>
                      <label className="space-y-1 block">
                        <span className="font-bold text-gray-700 block">
                          {language === 'ar' ? 'العمق (سم)' : 'Depth (cm)'}
                        </span>
                        <input
                          type="number"
                          min={20}
                          max={600}
                          value={customDepthCm}
                          onChange={(e) => setCustomDepthCm(Number(e.target.value))}
                          className="w-full p-2 rounded-xl border border-gray-300 bg-white font-bold"
                        />
                      </label>
                    </div>

                    <button
                      type="submit"
                      data-testid="room-add-item-submit"
                      disabled={addingItem}
                      className="w-full bg-red-gradient text-white font-black py-3 rounded-xl shadow-md hover:opacity-95 cursor-pointer disabled:opacity-50"
                    >
                      {addingItem ? '...' : language === 'ar' ? 'إضافة على المخطط' : 'Add to Floor Plan'}
                    </button>
                  </form>

                  {/* Itemized List */}
                  <div className="bg-white rounded-3xl p-5 border border-gray-200 space-y-3">
                    <h3 className="text-sm font-black text-[#2A1D20] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#D91B3E]" />
                      <span>
                        {language === 'ar'
                          ? `مكونات الغرفة (${activeBoard.items.length})`
                          : `Placed Items (${activeBoard.items.length})`}
                      </span>
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {activeBoard.items.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#FAF7F2] border border-gray-200 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-[#2A1D20] truncate">
                              {language === 'ar' ? it.labelAr : it.labelEn}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {it.widthCm}×{it.depthCm}cm
                            </p>
                          </div>
                          <span className="font-black text-[#D91B3E] shrink-0">
                            {it.estimatedPriceEgp.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

