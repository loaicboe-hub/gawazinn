import crypto from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { compareProductsAnalysis } from '../shared/productEncyclopediaData';
import type {
  PriceAlert,
  Product,
  ProductAlternativeLink,
  ProductComparisonMatrixPayload,
  ProductEncyclopediaDetail,
  ProductMerchantOffer,
  ProductPricePoint,
  ShoppingList,
  ShoppingListItem,
  ShoppingListItemStatus,
  ShoppingListType,
} from '../shared/types';
import { addUserNotification, resolveActiveWorkspaceForUser } from './journeyWorkspaceService';

function safeParseJson<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'string' || !raw.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function mapProductEncyclopediaRow(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    slug: row.slug ? String(row.slug) : undefined,
    trousseauType: row.trousseau_type as Product['trousseauType'],
    category: String(row.category),
    categoryAr: String(row.category_ar),
    categoryEn: String(row.category_en),
    nameAr: String(row.name_ar),
    nameEn: String(row.name_en),
    brand: String(row.brand),
    model: row.model ? String(row.model) : undefined,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    sku: String(row.sku),
    stock: Number(row.stock),
    imageUrl: String(row.image_url),
    galleryUrls: safeParseJson<string[]>(row.gallery_json, []),
    descriptionAr: String(row.description_ar),
    descriptionEn: String(row.description_en),
    specsAr: safeParseJson<Record<string, string>>(row.specs_ar_json, {}),
    specsEn: safeParseJson<Record<string, string>>(row.specs_en_json, {}),
    dimensions: row.dimensions ? String(row.dimensions) : undefined,
    capacity: row.capacity ? String(row.capacity) : undefined,
    energyRating: row.energy_rating ? String(row.energy_rating) : undefined,
    warrantyMonths: row.warranty_months != null ? Number(row.warranty_months) : 12,
    warrantyTermsAr: row.warranty_terms_ar ? String(row.warranty_terms_ar) : undefined,
    warrantyTermsEn: row.warranty_terms_en ? String(row.warranty_terms_en) : undefined,
    originCountryAr: row.origin_country_ar ? String(row.origin_country_ar) : undefined,
    originCountryEn: row.origin_country_en ? String(row.origin_country_en) : undefined,
    prosAr: safeParseJson<string[]>(row.pros_ar_json, []),
    prosEn: safeParseJson<string[]>(row.pros_en_json, []),
    consAr: safeParseJson<string[]>(row.cons_ar_json, []),
    consEn: safeParseJson<string[]>(row.cons_en_json, []),
    buyerWarningsAr: safeParseJson<string[]>(row.buyer_warnings_ar_json, []),
    buyerWarningsEn: safeParseJson<string[]>(row.buyer_warnings_en_json, []),
    recommendedForAr: row.recommended_for_ar ? String(row.recommended_for_ar) : undefined,
    recommendedForEn: row.recommended_for_en ? String(row.recommended_for_en) : undefined,
    priceSource: row.price_source ? String(row.price_source) : undefined,
    priceUpdatedAt: row.price_updated_at ? String(row.price_updated_at) : undefined,
    isFeatured: Boolean(row.is_featured),
    isReadyPackageItem: Boolean(row.is_ready_package_item),
    isDemoData: Boolean(row.is_demo_data),
  };
}

export function mapPricePointRow(row: Record<string, unknown>): ProductPricePoint {
  return {
    id: String(row.id),
    productId: String(row.product_id),
    merchantName: String(row.merchant_name),
    price: Number(row.price),
    source: String(row.source),
    recordedAt: String(row.recorded_at),
  };
}

export function mapMerchantOfferRow(row: Record<string, unknown>): ProductMerchantOffer {
  return {
    id: String(row.id),
    productId: String(row.product_id),
    merchantName: String(row.merchant_name),
    warrantyType: row.warranty_type as ProductMerchantOffer['warrantyType'],
    price: Number(row.price),
    deliverySlaAr: String(row.delivery_sla_ar),
    deliverySlaEn: String(row.delivery_sla_en),
    inStock: Boolean(row.in_stock),
    notesAr: row.notes_ar ? String(row.notes_ar) : null,
    notesEn: row.notes_en ? String(row.notes_en) : null,
    updatedAt: String(row.updated_at),
  };
}

export function getProductEncyclopediaDetail(
  db: DatabaseSync,
  idOrSlug: string,
): ProductEncyclopediaDetail | null {
  const row = db
    .prepare('SELECT * FROM products WHERE id = ? OR slug = ?')
    .get(idOrSlug, idOrSlug) as Record<string, unknown> | undefined;
  if (!row) return null;

  const product = mapProductEncyclopediaRow(row);
  const priceHistory = (
    db
      .prepare('SELECT * FROM product_price_history WHERE product_id = ? ORDER BY recorded_at ASC')
      .all(product.id) as Record<string, unknown>[]
  ).map(mapPricePointRow);

  const merchantOffers = (
    db
      .prepare('SELECT * FROM product_merchant_offers WHERE product_id = ? ORDER BY price ASC')
      .all(product.id) as Record<string, unknown>[]
  ).map(mapMerchantOfferRow);

  const altRows = db
    .prepare('SELECT * FROM product_alternatives WHERE product_id = ?')
    .all(product.id) as Record<string, unknown>[];

  const alternatives: ProductAlternativeLink[] = altRows.map((ar) => {
    const altProdRow = db
      .prepare('SELECT * FROM products WHERE id = ?')
      .get(String(ar.alternative_product_id)) as Record<string, unknown> | undefined;
    return {
      id: String(ar.id),
      productId: String(ar.product_id),
      alternativeProductId: String(ar.alternative_product_id),
      relationType: ar.relation_type as ProductAlternativeLink['relationType'],
      reasonAr: String(ar.reason_ar),
      reasonEn: String(ar.reason_en),
      alternativeProduct: altProdRow ? mapProductEncyclopediaRow(altProdRow) : undefined,
    };
  });

  return { product, priceHistory, merchantOffers, alternatives };
}

export function compareProductsByIds(
  db: DatabaseSync,
  idsOrSlugs: string[],
): ProductComparisonMatrixPayload {
  const uniqueTokens = Array.from(new Set(idsOrSlugs.map((s) => s.trim()).filter(Boolean))).slice(0, 4);
  const products: Product[] = [];
  const offersByProductId: Record<string, ProductMerchantOffer[]> = {};

  for (const token of uniqueTokens) {
    const row = db.prepare('SELECT * FROM products WHERE id = ? OR slug = ?').get(token, token) as
      | Record<string, unknown>
      | undefined;
    if (!row) continue;
    const prod = mapProductEncyclopediaRow(row);
    if (products.some((p) => p.id === prod.id)) continue;
    products.push(prod);
    offersByProductId[prod.id] = (
      db
        .prepare('SELECT * FROM product_merchant_offers WHERE product_id = ? ORDER BY price ASC')
        .all(prod.id) as Record<string, unknown>[]
    ).map(mapMerchantOfferRow);
  }

  return compareProductsAnalysis(products, offersByProductId);
}

function hydrateShoppingListItems(db: DatabaseSync, listId: string): ShoppingListItem[] {
  const rows = db
    .prepare('SELECT * FROM shopping_list_items WHERE list_id = ? ORDER BY sort_order ASC, created_at ASC')
    .all(listId) as Record<string, unknown>[];

  return rows.map((r) => {
    const prodId = r.product_id ? String(r.product_id) : null;
    let product: Product | null = null;
    if (prodId) {
      const pRow = db.prepare('SELECT * FROM products WHERE id = ?').get(prodId) as
        | Record<string, unknown>
        | undefined;
      if (pRow) product = mapProductEncyclopediaRow(pRow);
    }
    return {
      id: String(r.id),
      listId: String(r.list_id),
      productId: prodId,
      product,
      customTitle: String(r.custom_title),
      categoryLabel: String(r.category_label),
      quantity: Number(r.quantity),
      targetUnitPrice: Number(r.target_unit_price),
      preferredMerchant: r.preferred_merchant ? String(r.preferred_merchant) : null,
      status: r.status as ShoppingListItemStatus,
      priority: r.priority as ShoppingListItem['priority'],
      notes: r.notes ? String(r.notes) : null,
      addedByUserId: r.added_by_user_id ? String(r.added_by_user_id) : null,
      sortOrder: Number(r.sort_order),
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
    };
  });
}

function mapShoppingListRow(db: DatabaseSync, row: Record<string, unknown>): ShoppingList {
  const id = String(row.id);
  const items = hydrateShoppingListItems(db, id);
  const totalEstimatedCost = items.reduce(
    (sum, item) => sum + item.quantity * (item.targetUnitPrice || item.product?.price || 0),
    0,
  );
  const totalPurchasedCost = items
    .filter((i) => i.status === 'purchased')
    .reduce(
      (sum, item) => sum + item.quantity * (item.targetUnitPrice || item.product?.price || 0),
      0,
    );

  return {
    id,
    userId: String(row.user_id),
    workspaceId: row.workspace_id ? String(row.workspace_id) : null,
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    listType: row.list_type as ShoppingListType,
    isSharedWithPartner: Boolean(row.is_shared_with_partner),
    budgetTarget: Number(row.budget_target || 0),
    notes: row.notes ? String(row.notes) : null,
    items,
    totalEstimatedCost,
    totalPurchasedCost,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function listShoppingListsForUser(db: DatabaseSync, userId: string): ShoppingList[] {
  const { workspaceRow, myRole, myPermissions } = resolveActiveWorkspaceForUser(db, userId);
  const workspaceId = String(workspaceRow.id);
  const canReadSharedPartnerLists = myRole === 'owner' || myPermissions.shoppingRead;

  const rows = canReadSharedPartnerLists
    ? (db
        .prepare(
          `SELECT * FROM shopping_lists
           WHERE user_id = ?
              OR (workspace_id = ? AND is_shared_with_partner = 1)
           ORDER BY created_at DESC`,
        )
        .all(userId, workspaceId) as Record<string, unknown>[])
    : (db
        .prepare('SELECT * FROM shopping_lists WHERE user_id = ? ORDER BY created_at DESC')
        .all(userId) as Record<string, unknown>[]);

  return rows.map((row) => mapShoppingListRow(db, row));
}

export function authorizeShoppingListAccess(
  db: DatabaseSync,
  listId: string,
  userId: string,
  requireWrite: boolean,
): 'ok' | 'forbidden' | 'not_found' {
  const listRow = db
    .prepare('SELECT id, user_id, workspace_id, is_shared_with_partner FROM shopping_lists WHERE id = ?')
    .get(listId) as
    | { id: string; user_id: string; workspace_id: string | null; is_shared_with_partner: number }
    | undefined;
  if (!listRow) return 'not_found';
  if (listRow.user_id === userId) return 'ok';
  if (!listRow.is_shared_with_partner || !listRow.workspace_id) return 'not_found';

  const { workspaceRow, myRole, myPermissions } = resolveActiveWorkspaceForUser(db, userId);
  if (String(workspaceRow.id) !== listRow.workspace_id) return 'not_found';
  if (myRole === 'owner') return 'ok';
  if (requireWrite && !myPermissions.shoppingWrite) return 'forbidden';
  if (!requireWrite && !myPermissions.shoppingRead) return 'forbidden';
  return 'ok';
}

export function evaluateTriggeredPriceAlertsForProduct(db: DatabaseSync, productId: string): void {
  const productRow = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as
    | Record<string, unknown>
    | undefined;
  if (!productRow) return;
  const price = Number(productRow.price);
  const slug = productRow.slug ? String(productRow.slug) : String(productRow.id);
  const nameAr = String(productRow.name_ar);
  const nameEn = String(productRow.name_en);
  const now = new Date().toISOString();

  const activeAlerts = db
    .prepare("SELECT * FROM price_alerts WHERE product_id = ? AND status = 'active'")
    .all(productId) as Record<string, unknown>[];

  for (const alert of activeAlerts) {
    const targetPrice = Number(alert.target_price);
    if (price <= targetPrice) {
      db.prepare(
        `UPDATE price_alerts SET status = 'triggered', current_price_snapshot = ?, triggered_at = ? WHERE id = ?`,
      ).run(price, now, String(alert.id));

      addUserNotification(db, {
        userId: String(alert.user_id),
        notifType: 'budget_alert',
        titleAr: `تنبيه انخفاض سعر: ${nameAr}`,
        titleEn: `Price Drop Triggered: ${nameEn}`,
        bodyAr: `وصل السعر الحالي إلى ${price.toLocaleString()} ج.م (ضمن هدفك ${targetPrice.toLocaleString()} ج.م).`,
        bodyEn: `Current price reached ${price.toLocaleString()} EGP (meeting your ${targetPrice.toLocaleString()} EGP target).`,
        linkPath: `/products/${encodeURIComponent(slug)}`,
      });
    } else {
      db.prepare('UPDATE price_alerts SET current_price_snapshot = ? WHERE id = ?').run(price, String(alert.id));
    }
  }
}

export function listPriceAlertsForUser(db: DatabaseSync, userId: string): PriceAlert[] {
  const rows = db
    .prepare('SELECT * FROM price_alerts WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as Record<string, unknown>[];

  // Auto-evaluate active alerts cleanly on read against current catalog price
  for (const r of rows) {
    if (String(r.status) === 'active') {
      evaluateTriggeredPriceAlertsForProduct(db, String(r.product_id));
    }
  }

  const freshRows = db
    .prepare('SELECT * FROM price_alerts WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as Record<string, unknown>[];

  return freshRows.map((r) => {
    const pRow = db.prepare('SELECT * FROM products WHERE id = ?').get(String(r.product_id)) as
      | Record<string, unknown>
      | undefined;
    return {
      id: String(r.id),
      userId: String(r.user_id),
      productId: String(r.product_id),
      product: pRow ? mapProductEncyclopediaRow(pRow) : null,
      targetPrice: Number(r.target_price),
      currentPriceSnapshot: Number(r.current_price_snapshot),
      status: r.status as PriceAlert['status'],
      triggeredAt: r.triggered_at ? String(r.triggered_at) : null,
      createdAt: String(r.created_at),
    };
  });
}

export function upsertUserPriceAlert(
  db: DatabaseSync,
  userId: string,
  productId: string,
  targetPrice: number,
): PriceAlert | null {
  const pRow = db.prepare('SELECT * FROM products WHERE id = ? OR slug = ?').get(productId, productId) as
    | Record<string, unknown>
    | undefined;
  if (!pRow) return null;

  const actualProductId = String(pRow.id);
  const currentPrice = Number(pRow.price);
  const now = new Date().toISOString();
  const isAlreadyHit = currentPrice <= targetPrice;

  const existing = db
    .prepare('SELECT id FROM price_alerts WHERE user_id = ? AND product_id = ?')
    .get(userId, actualProductId) as { id: string } | undefined;

  if (existing) {
    db.prepare(
      `UPDATE price_alerts SET
        target_price = ?,
        current_price_snapshot = ?,
        status = ?,
        triggered_at = ?
       WHERE id = ?`,
    ).run(targetPrice, currentPrice, isAlreadyHit ? 'triggered' : 'active', isAlreadyHit ? now : null, existing.id);
  } else {
    db.prepare(
      `INSERT INTO price_alerts (id, user_id, product_id, target_price, current_price_snapshot, status, triggered_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      `pal-${crypto.randomUUID().slice(0, 10)}`,
      userId,
      actualProductId,
      targetPrice,
      currentPrice,
      isAlreadyHit ? 'triggered' : 'active',
      isAlreadyHit ? now : null,
      now,
    );
  }

  const alerts = listPriceAlertsForUser(db, userId);
  return alerts.find((a) => a.productId === actualProductId) ?? null;
}

export function ensureStarterShoppingListsForKarim(db: DatabaseSync): void {
  const { workspaceRow } = resolveActiveWorkspaceForUser(db, 'usr-1');
  const workspaceId = String(workspaceRow.id);
  const now = new Date().toISOString();

  const existing = db.prepare("SELECT COUNT(*) as c FROM shopping_lists WHERE user_id = 'usr-1'").get() as {
    c: number;
  };
  if (existing.c > 0) return;

  const list1Id = 'sl-karim-appliances';
  const list2Id = 'sl-karim-private-watch';

  db.prepare(
    `INSERT INTO shopping_lists
       (id, user_id, workspace_id, title_ar, title_en, list_type, is_shared_with_partner, budget_target, notes, created_at, updated_at)
     VALUES (?, 'usr-1', ?, 'قائمة الأجهزة الكهربائية المشتركة للشقة', 'Shared Apartment Appliances Basket', 'groom_appliances', 1, 145000, 'مقارنة الموديلات والضمان قبل التعاقد النهائي مع الوكيل الرسمي', ?, ?)`,
  ).run(list1Id, workspaceId, now, now);

  db.prepare(
    `INSERT INTO shopping_lists
       (id, user_id, workspace_id, title_ar, title_en, list_type, is_shared_with_partner, budget_target, notes, created_at, updated_at)
     VALUES (?, 'usr-1', ?, 'قائمة خاصة بهدية أو تجهيز مبدئي', 'Private Surprise & Reserve Gear List', 'general', 0, 35000, 'قائمة خاصة بصاحب الحساب ولا تظهر في مساحة الزوجين إلا عند التفعيل', ?, ?)`,
  ).run(list2Id, workspaceId, now, now);

  const insItem = db.prepare(
    `INSERT INTO shopping_list_items
       (id, list_id, product_id, custom_title, category_label, quantity, target_unit_price, preferred_merchant, status, priority, notes, added_by_user_id, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'usr-1', ?, ?, ?)`,
  );

  insItem.run(
    'sli-seed-1',
    list1Id,
    'groom-p1',
    'ثلاجة شارب ديجيتال نوفروست 450 لتر إنفرتر — أسود زجاجي',
    'appliances',
    1,
    36500,
    'توكيل ومعارض العربي الرسمية',
    'shortlisted',
    'high',
    'تأكد من عرض باب المطبخ قبل الاستلام',
    1,
    now,
    now,
  );
  insItem.run(
    'sli-seed-2',
    list1Id,
    'groom-p2',
    'غسالة إل جي أوتوماتيك 9 كيلو بالبخار ونظام AI DD',
    'appliances',
    1,
    29800,
    'معرض LG الرسمي المعتمد',
    'ready_to_buy',
    'high',
    'تأسيس خط 16 أمبير وصرف 70 سم مكتمل',
    2,
    now,
    now,
  );
  insItem.run(
    'sli-seed-3',
    list1Id,
    'groom-p10',
    'تكييف كاريير أوبتيماكس برو 2.25 حصان إنفرتر (للريسبشن)',
    'ac_climate',
    1,
    38500,
    'ميراكو كاريير الرسمي',
    'planned',
    'medium',
    'انتظار عروض الشتاء أو كبس النحاس بالنيتروجين',
    3,
    now,
    now,
  );
  insItem.run(
    'sli-seed-4',
    list2Id,
    'bride-p6',
    'قلاية هوائية فيليبس XL 6.2 لتر (هدية تجهيز مفاجئة)',
    'appliances',
    1,
    8950,
    'وكيل فيليبس الرسمي',
    'planned',
    'low',
    'خاصة بالمالك فقط',
    1,
    now,
    now,
  );

  // Seed 2 starter price alerts for Karim
  db.prepare(
    `INSERT OR IGNORE INTO price_alerts (id, user_id, product_id, target_price, current_price_snapshot, status, triggered_at, created_at)
     VALUES (?, 'usr-1', ?, ?, ?, 'active', NULL, ?)`,
  ).run('pal-seed-1', 'groom-p1', 34500, 36500, now);

  db.prepare(
    `INSERT OR IGNORE INTO price_alerts (id, user_id, product_id, target_price, current_price_snapshot, status, triggered_at, created_at)
     VALUES (?, 'usr-1', ?, ?, ?, 'triggered', ?, ?)`,
  ).run('pal-seed-2', 'groom-p9', 22000, 21400, now, now);
}

