import crypto from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import type {
  Article,
  HomeAssetCategory,
  HomeCareDirectoryPayload,
  HomeFileAsset,
  HomeFileOverviewPayload,
  HomeInventoryItem,
  HomeItemCondition,
  MaintenanceReminder,
  MaintenanceSystemCategory,
  UserWarrantyItem,
} from '../shared/types';
import {
  NEWLYWED_TRACKS_META,
  addMonthsIsoDate,
  computeMaintenanceDueStatus,
  isWarrantyExpiringWithinDays,
} from '../shared/stage11Data';
import {
  addUserNotification,
  listVisibleDocumentsForUser,
  mapWarrantyRow,
} from './journeyWorkspaceService';
import { listVendorCategories, listVendors } from './vendorMarketplaceService';

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 12)}`;
}

function createHttpError(statusCode: number, code: string, message: string): Error {
  const err = new Error(message) as Error & { statusCode?: number; code?: string };
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function mapAssetRow(row: Record<string, unknown>): HomeFileAsset {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    roomLabel: String(row.room_label),
    assetCategory: row.asset_category as HomeAssetCategory,
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    codeOrSerial: row.code_or_serial ? String(row.code_or_serial) : null,
    vendorOrBrand: row.vendor_or_brand ? String(row.vendor_or_brand) : null,
    notes: row.notes ? String(row.notes) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapReminderRow(row: Record<string, unknown>, referenceDate?: string): MaintenanceReminder {
  const nextDueDate = String(row.next_due_date);
  return {
    id: String(row.id),
    userId: String(row.user_id),
    systemCategory: row.system_category as MaintenanceSystemCategory,
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    intervalMonths: Number(row.interval_months),
    nextDueDate,
    lastCompletedAt: row.last_completed_at ? String(row.last_completed_at) : null,
    status: computeMaintenanceDueStatus(nextDueDate, referenceDate),
    estimatedCostEgp: Number(row.estimated_cost_egp ?? 0),
    vendorCategorySlug: String(row.vendor_category_slug || 'home_maintenance'),
    notes: row.notes ? String(row.notes) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapInventoryRow(row: Record<string, unknown>): HomeInventoryItem {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    roomLabel: String(row.room_label),
    itemName: String(row.item_name),
    brandModel: String(row.brand_model),
    purchaseDate: row.purchase_date ? String(row.purchase_date) : null,
    purchasePriceEgp: Number(row.purchase_price_egp ?? 0),
    warrantyExpiryDate: row.warranty_expiry_date ? String(row.warranty_expiry_date) : null,
    condition: row.condition as HomeItemCondition,
    notes: row.notes ? String(row.notes) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapPublishedArticleRow(row: Record<string, unknown>): Article {
  return {
    id: String(row.id),
    slug: String(row.slug),
    categoryId: String(row.category_id),
    domain: row.domain as Article['domain'],
    contentType: row.content_type as Article['contentType'],
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    excerptAr: String(row.excerpt_ar),
    excerptEn: String(row.excerpt_en),
    bodyAr: String(row.body_ar),
    bodyEn: String(row.body_en),
    featuredImage: String(row.featured_image),
    authorName: String(row.author_name),
    tags: JSON.parse(String(row.tags_json || '[]')) as string[],
    faqs: JSON.parse(String(row.faqs_json || '[]')) as Article['faqs'],
    relatedCalculators: JSON.parse(String(row.related_calculators_json || '[]')) as string[],
    seoTitleAr: row.seo_title_ar ? String(row.seo_title_ar) : undefined,
    seoTitleEn: row.seo_title_en ? String(row.seo_title_en) : undefined,
    metaDescAr: row.meta_desc_ar ? String(row.meta_desc_ar) : undefined,
    metaDescEn: row.meta_desc_en ? String(row.meta_desc_en) : undefined,
    status: row.status as Article['status'],
    readingMinutes: Number(row.reading_minutes),
    viewCount: Number(row.view_count),
    isFeatured: Boolean(row.is_featured),
    publishedAt: String(row.published_at),
    updatedAt: String(row.updated_at),
  };
}

export function getHomeCareDirectorySummary(db: DatabaseSync): HomeCareDirectoryPayload {
  const categories = listVendorCategories(db).filter((c) => c.domain === 'post_marriage');
  const vendors = listVendors(db, { domain: 'post_marriage', includeRejected: false });
  const articleRows = db
    .prepare(
      "SELECT * FROM articles WHERE status = 'published' AND domain = 'married_life' ORDER BY is_featured DESC, published_at DESC",
    )
    .all() as Record<string, unknown>[];

  return {
    tracks: NEWLYWED_TRACKS_META,
    categories,
    vendors,
    articles: articleRows.map(mapPublishedArticleRow),
  };
}

export function buildUserHomeFileOverview(
  db: DatabaseSync,
  userId: string,
): HomeFileOverviewPayload {
  const todayIso = new Date().toISOString().slice(0, 10);

  const assets = (
    db
      .prepare('SELECT * FROM home_file_assets WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId) as Record<string, unknown>[]
  ).map(mapAssetRow);

  const statusOrder: Record<MaintenanceReminder['status'], number> = {
    overdue: 0,
    due_soon: 1,
    upcoming: 2,
    completed: 3,
  };

  const reminders = (
    db
      .prepare('SELECT * FROM maintenance_reminders WHERE user_id = ? ORDER BY next_due_date ASC')
      .all(userId) as Record<string, unknown>[]
  )
    .map((r) => mapReminderRow(r, todayIso))
    .sort((a, b) => {
      const diff = statusOrder[a.status] - statusOrder[b.status];
      return diff !== 0 ? diff : a.nextDueDate.localeCompare(b.nextDueDate);
    });

  const inventory = (
    db
      .prepare('SELECT * FROM home_inventory_items WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId) as Record<string, unknown>[]
  ).map(mapInventoryRow);

  const warranties: UserWarrantyItem[] = (
    db
      .prepare('SELECT * FROM user_warranties WHERE user_id = ? ORDER BY expiry_date ASC')
      .all(userId) as Record<string, unknown>[]
  ).map(mapWarrantyRow);

  const documents = listVisibleDocumentsForUser(db, userId);

  const overdueReminders = reminders.filter((r) => r.status === 'overdue').length;
  const dueSoonReminders = reminders.filter((r) => r.status === 'due_soon').length;
  const activeWarrantiesCount = warranties.filter((w) => w.expiryDate.slice(0, 10) >= todayIso).length;
  const expiringWarrantiesCount = warranties.filter((w) =>
    isWarrantyExpiringWithinDays(w.expiryDate, 90, todayIso),
  ).length;
  const totalInventoryValueEgp = inventory.reduce((sum, item) => sum + item.purchasePriceEgp, 0);
  const projectedAnnualMaintenanceEgp = reminders.reduce((sum, rem) => {
    const cyclesPerYear = 12 / Math.max(1, rem.intervalMonths);
    return sum + Math.round(rem.estimatedCostEgp * cyclesPerYear);
  }, 0);

  return {
    assets,
    reminders,
    inventory,
    warranties,
    documents,
    summary: {
      totalAssets: assets.length,
      totalReminders: reminders.length,
      overdueReminders,
      dueSoonReminders,
      totalInventoryItems: inventory.length,
      activeWarrantiesCount,
      expiringWarrantiesCount,
      totalInventoryValueEgp,
      projectedAnnualMaintenanceEgp,
    },
  };
}

export function createHomeAsset(
  db: DatabaseSync,
  userId: string,
  input: {
    roomLabel: string;
    assetCategory: HomeAssetCategory;
    titleAr: string;
    titleEn?: string;
    codeOrSerial?: string | null;
    vendorOrBrand?: string | null;
    notes?: string | null;
  },
): HomeFileOverviewPayload {
  const id = newId('hfa');
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO home_file_assets
      (id, user_id, room_label, asset_category, title_ar, title_en, code_or_serial, vendor_or_brand, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    userId,
    input.roomLabel.trim(),
    input.assetCategory,
    input.titleAr.trim(),
    (input.titleEn || input.titleAr).trim(),
    input.codeOrSerial?.trim() || null,
    input.vendorOrBrand?.trim() || null,
    input.notes?.trim() || null,
    now,
    now,
  );
  return buildUserHomeFileOverview(db, userId);
}

export function deleteHomeAsset(
  db: DatabaseSync,
  userId: string,
  assetId: string,
): HomeFileOverviewPayload {
  const row = db
    .prepare('SELECT id, user_id FROM home_file_assets WHERE id = ?')
    .get(assetId) as { id: string; user_id: string } | undefined;
  if (!row) throw createHttpError(404, 'NOT_FOUND', 'Home file asset not found');
  if (row.user_id !== userId) throw createHttpError(403, 'FORBIDDEN', 'Owner access required');
  db.prepare('DELETE FROM home_file_assets WHERE id = ?').run(assetId);
  return buildUserHomeFileOverview(db, userId);
}

export function createMaintenanceReminder(
  db: DatabaseSync,
  userId: string,
  input: {
    systemCategory: MaintenanceSystemCategory;
    titleAr: string;
    titleEn?: string;
    intervalMonths: number;
    nextDueDate?: string;
    estimatedCostEgp: number;
    vendorCategorySlug: string;
    notes?: string | null;
  },
): HomeFileOverviewPayload {
  const id = newId('mrem');
  const now = new Date().toISOString();
  const todayIso = now.slice(0, 10);
  const nextDue = input.nextDueDate || addMonthsIsoDate(todayIso, input.intervalMonths);
  const status = computeMaintenanceDueStatus(nextDue, todayIso);

  db.prepare(
    `INSERT INTO maintenance_reminders
      (id, user_id, system_category, title_ar, title_en, interval_months, next_due_date, last_completed_at, status, estimated_cost_egp, vendor_category_slug, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    userId,
    input.systemCategory,
    input.titleAr.trim(),
    (input.titleEn || input.titleAr).trim(),
    input.intervalMonths,
    nextDue,
    status,
    input.estimatedCostEgp,
    input.vendorCategorySlug,
    input.notes?.trim() || null,
    now,
    now,
  );
  return buildUserHomeFileOverview(db, userId);
}

export function completeMaintenanceReminder(
  db: DatabaseSync,
  userId: string,
  reminderId: string,
  input: { completedDate?: string; notes?: string | null },
): HomeFileOverviewPayload {
  const row = db
    .prepare('SELECT * FROM maintenance_reminders WHERE id = ?')
    .get(reminderId) as Record<string, unknown> | undefined;
  if (!row) throw createHttpError(404, 'NOT_FOUND', 'Maintenance reminder not found');
  if (String(row.user_id) !== userId) {
    throw createHttpError(403, 'FORBIDDEN', 'Owner access required');
  }

  const now = new Date().toISOString();
  const completedIso = input.completedDate || now.slice(0, 10);
  const intervalMonths = Number(row.interval_months || 6);
  const nextDue = addMonthsIsoDate(completedIso, intervalMonths);
  const nextStatus = computeMaintenanceDueStatus(nextDue, now.slice(0, 10));

  db.prepare(
    `UPDATE maintenance_reminders
     SET last_completed_at = ?, next_due_date = ?, status = ?, notes = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    completedIso,
    nextDue,
    nextStatus,
    input.notes !== undefined ? input.notes : (row.notes ? String(row.notes) : null),
    now,
    reminderId,
  );

  addUserNotification(db, {
    userId,
    notifType: 'milestone',
    titleAr: `تم تسجيل صيانة: ${String(row.title_ar)}`,
    titleEn: `Maintenance Completed: ${String(row.title_en)}`,
    bodyAr: `تم تحديث الدورة تلقائياً؛ الموعد القادم للصيانة هو ${nextDue}.`,
    bodyEn: `Cycle advanced cleanly; your next scheduled maintenance is on ${nextDue}.`,
    linkPath: '/my/home-file?tab=maintenance',
  });

  return buildUserHomeFileOverview(db, userId);
}

export function deleteMaintenanceReminder(
  db: DatabaseSync,
  userId: string,
  reminderId: string,
): HomeFileOverviewPayload {
  const row = db
    .prepare('SELECT id, user_id FROM maintenance_reminders WHERE id = ?')
    .get(reminderId) as { id: string; user_id: string } | undefined;
  if (!row) throw createHttpError(404, 'NOT_FOUND', 'Maintenance reminder not found');
  if (row.user_id !== userId) throw createHttpError(403, 'FORBIDDEN', 'Owner access required');
  db.prepare('DELETE FROM maintenance_reminders WHERE id = ?').run(reminderId);
  return buildUserHomeFileOverview(db, userId);
}

export function createHomeInventoryItem(
  db: DatabaseSync,
  userId: string,
  input: {
    roomLabel: string;
    itemName: string;
    brandModel: string;
    purchaseDate?: string | null;
    purchasePriceEgp: number;
    warrantyExpiryDate?: string | null;
    condition: HomeItemCondition;
    notes?: string | null;
  },
): HomeFileOverviewPayload {
  const id = newId('hinv');
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO home_inventory_items
      (id, user_id, room_label, item_name, brand_model, purchase_date, purchase_price_egp, warranty_expiry_date, condition, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    userId,
    input.roomLabel.trim(),
    input.itemName.trim(),
    input.brandModel.trim(),
    input.purchaseDate || null,
    input.purchasePriceEgp,
    input.warrantyExpiryDate || null,
    input.condition,
    input.notes?.trim() || null,
    now,
    now,
  );
  return buildUserHomeFileOverview(db, userId);
}

export function updateHomeInventoryItem(
  db: DatabaseSync,
  userId: string,
  itemId: string,
  patch: {
    roomLabel?: string;
    itemName?: string;
    brandModel?: string;
    purchaseDate?: string | null;
    purchasePriceEgp?: number;
    warrantyExpiryDate?: string | null;
    condition?: HomeItemCondition;
    notes?: string | null;
  },
): HomeFileOverviewPayload {
  const row = db
    .prepare('SELECT * FROM home_inventory_items WHERE id = ?')
    .get(itemId) as Record<string, unknown> | undefined;
  if (!row) throw createHttpError(404, 'NOT_FOUND', 'Home inventory item not found');
  if (String(row.user_id) !== userId) {
    throw createHttpError(403, 'FORBIDDEN', 'Owner access required');
  }

  db.prepare(
    `UPDATE home_inventory_items
     SET room_label = ?, item_name = ?, brand_model = ?, purchase_date = ?, purchase_price_egp = ?, warranty_expiry_date = ?, condition = ?, notes = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    patch.roomLabel?.trim() || String(row.room_label),
    patch.itemName?.trim() || String(row.item_name),
    patch.brandModel?.trim() || String(row.brand_model),
    patch.purchaseDate !== undefined ? patch.purchaseDate : (row.purchase_date ? String(row.purchase_date) : null),
    patch.purchasePriceEgp ?? Number(row.purchase_price_egp),
    patch.warrantyExpiryDate !== undefined
      ? patch.warrantyExpiryDate
      : (row.warranty_expiry_date ? String(row.warranty_expiry_date) : null),
    patch.condition ?? (row.condition as HomeItemCondition),
    patch.notes !== undefined ? patch.notes : (row.notes ? String(row.notes) : null),
    new Date().toISOString(),
    itemId,
  );
  return buildUserHomeFileOverview(db, userId);
}

export function deleteHomeInventoryItem(
  db: DatabaseSync,
  userId: string,
  itemId: string,
): HomeFileOverviewPayload {
  const row = db
    .prepare('SELECT id, user_id FROM home_inventory_items WHERE id = ?')
    .get(itemId) as { id: string; user_id: string } | undefined;
  if (!row) throw createHttpError(404, 'NOT_FOUND', 'Home inventory item not found');
  if (row.user_id !== userId) throw createHttpError(403, 'FORBIDDEN', 'Owner access required');
  db.prepare('DELETE FROM home_inventory_items WHERE id = ?').run(itemId);
  return buildUserHomeFileOverview(db, userId);
}

