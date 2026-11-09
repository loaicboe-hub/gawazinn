import crypto from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import type {
  GiftPriority,
  GiftRegistryItem,
  GuestGroup,
  GuestSide,
  MoodboardItem,
  MoodboardItemType,
  PublicRsvpPayload,
  RoomMoodboard,
  RoomThemeSlug,
  RoomType,
  RsvpStatus,
  SeatingTable,
  TableZone,
  TimelineEventStatus,
  WeddingDayOverviewPayload,
  WeddingGuest,
  WeddingTimelineEvent,
} from '../shared/types';
import { ROOM_THEME_META, computeMoodboardMetrics } from '../shared/stage10Data';
import { addUserNotification } from './journeyWorkspaceService';

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 12)}`;
}

function generateRsvpCode(): string {
  return `GI-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto
    .randomBytes(2)
    .toString('hex')
    .toUpperCase()}`;
}

function createHttpError(statusCode: number, code: string, message: string): Error {
  const err = new Error(message) as Error & { statusCode?: number; code?: string };
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function mapMoodboardItemRow(row: Record<string, unknown>): MoodboardItem {
  return {
    id: String(row.id),
    moodboardId: String(row.moodboard_id),
    userId: String(row.user_id),
    itemType: row.item_type as MoodboardItemType,
    productId: row.product_id ? String(row.product_id) : null,
    materialSlug: row.material_slug ? String(row.material_slug) : null,
    labelAr: String(row.label_ar),
    labelEn: String(row.label_en),
    widthCm: Number(row.width_cm),
    depthCm: Number(row.depth_cm),
    posXPct: Number(row.pos_x_pct),
    posYPct: Number(row.pos_y_pct),
    estimatedPriceEgp: Number(row.estimated_price_egp),
    colorHex: String(row.color_hex),
    notes: row.notes ? String(row.notes) : null,
    createdAt: String(row.created_at),
  };
}

export function listRoomMoodboardsForUser(
  db: DatabaseSync,
  userId: string,
): RoomMoodboard[] {
  const boards = db
    .prepare('SELECT * FROM room_moodboards WHERE user_id = ? ORDER BY updated_at DESC')
    .all(userId) as Record<string, unknown>[];

  return boards.map((b) => {
    const itemsRows = db
      .prepare('SELECT * FROM moodboard_items WHERE moodboard_id = ? ORDER BY created_at ASC')
      .all(String(b.id)) as Record<string, unknown>[];
    const items = itemsRows.map(mapMoodboardItemRow);
    const lengthM = Number(b.length_m);
    const widthM = Number(b.width_m);
    const metrics = computeMoodboardMetrics(lengthM, widthM, items);
    let palette: string[] = [];
    try {
      const parsed = JSON.parse(String(b.palette_hex_json || '[]'));
      if (Array.isArray(parsed)) palette = parsed.map(String);
    } catch {
      palette = [];
    }
    const themeSlug = b.theme_slug as RoomThemeSlug;
    if (palette.length === 0) {
      palette = ROOM_THEME_META[themeSlug]?.palette || ['#FAF7F2', '#D91B3E'];
    }
    return {
      id: String(b.id),
      userId: String(b.user_id),
      titleAr: String(b.title_ar),
      titleEn: String(b.title_en),
      roomType: b.room_type as RoomType,
      lengthM,
      widthM,
      heightM: Number(b.height_m),
      themeSlug,
      paletteHex: palette,
      notes: b.notes ? String(b.notes) : null,
      isSharedWithPartner: Boolean(b.is_shared_with_partner),
      items,
      totalEstimatedCostEgp: metrics.totalEstimatedCostEgp,
      floorAreaSqm: metrics.floorAreaSqm,
      occupiedAreaPercent: metrics.occupiedAreaPercent,
      createdAt: String(b.created_at),
      updatedAt: String(b.updated_at),
    };
  });
}

export function createRoomMoodboard(
  db: DatabaseSync,
  userId: string,
  input: {
    titleAr: string;
    titleEn?: string;
    roomType: RoomType;
    lengthM: number;
    widthM: number;
    heightM: number;
    themeSlug: RoomThemeSlug;
    paletteHex?: string[];
    notes?: string | null;
    isSharedWithPartner: boolean;
  },
): RoomMoodboard {
  const id = newId('mb');
  const now = new Date().toISOString();
  const palette =
    input.paletteHex && input.paletteHex.length > 0
      ? input.paletteHex
      : ROOM_THEME_META[input.themeSlug]?.palette || ['#FAF7F2', '#D91B3E'];

  db.prepare(
    `INSERT INTO room_moodboards
      (id, user_id, title_ar, title_en, room_type, length_m, width_m, height_m, theme_slug, palette_hex_json, notes, is_shared_with_partner, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    userId,
    input.titleAr.trim(),
    (input.titleEn || input.titleAr).trim(),
    input.roomType,
    input.lengthM,
    input.widthM,
    input.heightM,
    input.themeSlug,
    JSON.stringify(palette),
    input.notes || null,
    input.isSharedWithPartner ? 1 : 0,
    now,
    now,
  );

  return listRoomMoodboardsForUser(db, userId).find((b) => b.id === id)!;
}

export function deleteRoomMoodboard(
  db: DatabaseSync,
  userId: string,
  moodboardId: string,
): void {
  const existing = db
    .prepare('SELECT id, user_id FROM room_moodboards WHERE id = ?')
    .get(moodboardId) as { id: string; user_id: string } | undefined;
  if (!existing) throw createHttpError(404, 'NOT_FOUND', 'Moodboard not found');
  if (existing.user_id !== userId) throw createHttpError(403, 'FORBIDDEN', 'Owner access required');
  db.prepare('DELETE FROM room_moodboards WHERE id = ?').run(moodboardId);
}

export function addMoodboardItem(
  db: DatabaseSync,
  userId: string,
  moodboardId: string,
  input: {
    itemType: MoodboardItemType;
    productId?: string | null;
    materialSlug?: string | null;
    labelAr: string;
    labelEn?: string;
    widthCm: number;
    depthCm: number;
    posXPct: number;
    posYPct: number;
    estimatedPriceEgp: number;
    colorHex: string;
    notes?: string | null;
  },
): RoomMoodboard {
  const board = db
    .prepare('SELECT id, user_id FROM room_moodboards WHERE id = ?')
    .get(moodboardId) as { id: string; user_id: string } | undefined;
  if (!board) throw createHttpError(404, 'NOT_FOUND', 'Moodboard not found');
  if (board.user_id !== userId) throw createHttpError(403, 'FORBIDDEN', 'Owner access required');

  let finalLabelAr = input.labelAr.trim();
  let finalLabelEn = (input.labelEn || input.labelAr).trim();
  let finalPrice = input.estimatedPriceEgp;
  let productId: string | null = null;
  let materialSlug: string | null = null;

  if (input.itemType === 'product' && input.productId) {
    const product = db
      .prepare('SELECT id, name_ar, name_en, price FROM products WHERE id = ?')
      .get(input.productId) as
      | { id: string; name_ar: string; name_en: string; price: number }
      | undefined;
    if (!product) throw createHttpError(404, 'PRODUCT_NOT_FOUND', 'Linked product not found');
    productId = product.id;
    finalLabelAr = product.name_ar;
    finalLabelEn = product.name_en;
    finalPrice = Number(product.price);
  } else if (input.itemType === 'material' && input.materialSlug) {
    const mat = db
      .prepare(
        'SELECT slug, name_ar, name_en, price_min_egp, price_max_egp FROM finishing_materials WHERE slug = ?',
      )
      .get(input.materialSlug) as
      | {
          slug: string;
          name_ar: string;
          name_en: string;
          price_min_egp: number;
          price_max_egp: number;
        }
      | undefined;
    if (mat) {
      materialSlug = mat.slug;
      finalLabelAr = mat.name_ar;
      finalLabelEn = mat.name_en;
      if (finalPrice <= 0) {
        finalPrice = Math.round((Number(mat.price_min_egp) + Number(mat.price_max_egp)) / 2);
      }
    }
  }

  const now = new Date().toISOString();
  const itemId = newId('mbi');
  db.prepare(
    `INSERT INTO moodboard_items
      (id, moodboard_id, user_id, item_type, product_id, material_slug, label_ar, label_en, width_cm, depth_cm, pos_x_pct, pos_y_pct, estimated_price_egp, color_hex, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    itemId,
    moodboardId,
    userId,
    input.itemType,
    productId,
    materialSlug,
    finalLabelAr,
    finalLabelEn,
    input.widthCm,
    input.depthCm,
    input.posXPct,
    input.posYPct,
    finalPrice,
    input.colorHex,
    input.notes || null,
    now,
  );
  db.prepare('UPDATE room_moodboards SET updated_at = ? WHERE id = ?').run(now, moodboardId);

  return listRoomMoodboardsForUser(db, userId).find((b) => b.id === moodboardId)!;
}

export function updateMoodboardItem(
  db: DatabaseSync,
  userId: string,
  itemId: string,
  patch: {
    posXPct?: number;
    posYPct?: number;
    widthCm?: number;
    depthCm?: number;
    labelAr?: string;
    estimatedPriceEgp?: number;
    notes?: string | null;
  },
): RoomMoodboard {
  const item = db
    .prepare('SELECT id, moodboard_id, user_id, product_id FROM moodboard_items WHERE id = ?')
    .get(itemId) as
    | { id: string; moodboard_id: string; user_id: string; product_id: string | null }
    | undefined;
  if (!item) throw createHttpError(404, 'NOT_FOUND', 'Moodboard item not found');
  if (item.user_id !== userId) throw createHttpError(403, 'FORBIDDEN', 'Owner access required');

  const current = db
    .prepare('SELECT * FROM moodboard_items WHERE id = ?')
    .get(itemId) as Record<string, unknown>;
  const now = new Date().toISOString();

  const nextPrice =
    item.product_id !== null
      ? Number(current.estimated_price_egp)
      : (patch.estimatedPriceEgp ?? Number(current.estimated_price_egp));

  db.prepare(
    `UPDATE moodboard_items
     SET pos_x_pct = ?, pos_y_pct = ?, width_cm = ?, depth_cm = ?, label_ar = ?, estimated_price_egp = ?, notes = ?
     WHERE id = ?`,
  ).run(
    patch.posXPct ?? Number(current.pos_x_pct),
    patch.posYPct ?? Number(current.pos_y_pct),
    patch.widthCm ?? Number(current.width_cm),
    patch.depthCm ?? Number(current.depth_cm),
    patch.labelAr?.trim() || String(current.label_ar),
    nextPrice,
    patch.notes !== undefined ? patch.notes : (current.notes ? String(current.notes) : null),
    itemId,
  );
  db.prepare('UPDATE room_moodboards SET updated_at = ? WHERE id = ?').run(now, item.moodboard_id);

  return listRoomMoodboardsForUser(db, userId).find((b) => b.id === item.moodboard_id)!;
}

export function deleteMoodboardItem(
  db: DatabaseSync,
  userId: string,
  itemId: string,
): RoomMoodboard {
  const item = db
    .prepare('SELECT id, moodboard_id, user_id FROM moodboard_items WHERE id = ?')
    .get(itemId) as { id: string; moodboard_id: string; user_id: string } | undefined;
  if (!item) throw createHttpError(404, 'NOT_FOUND', 'Moodboard item not found');
  if (item.user_id !== userId) throw createHttpError(403, 'FORBIDDEN', 'Owner access required');

  db.prepare('DELETE FROM moodboard_items WHERE id = ?').run(itemId);
  db.prepare('UPDATE room_moodboards SET updated_at = ? WHERE id = ?').run(
    new Date().toISOString(),
    item.moodboard_id,
  );
  return listRoomMoodboardsForUser(db, userId).find((b) => b.id === item.moodboard_id)!;
}

// =========================================================================
// WEDDING DAY OPERATIONS (GUESTS, SEATING TABLES, TIMELINE, REGISTRY, RSVP)
// =========================================================================

function mapGuestRow(row: Record<string, unknown>): WeddingGuest {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    fullName: String(row.full_name),
    phone: row.phone ? String(row.phone) : null,
    side: row.side as GuestSide,
    guestGroup: row.guest_group as GuestGroup,
    invitedCount: Number(row.invited_count),
    plusOneAllowed: Boolean(row.plus_one_allowed),
    rsvpCode: String(row.rsvp_code),
    rsvpStatus: row.rsvp_status as RsvpStatus,
    attendingCount: Number(row.attending_count),
    mealPreference: String(row.meal_preference || 'standard'),
    dietaryNotes: row.dietary_notes ? String(row.dietary_notes) : null,
    tableId: row.table_id ? String(row.table_id) : null,
    respondedAt: row.responded_at ? String(row.responded_at) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapTimelineRow(row: Record<string, unknown>): WeddingTimelineEvent {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    startTime: String(row.start_time),
    endTime: String(row.end_time),
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    assignee: String(row.assignee),
    locationNote: row.location_note ? String(row.location_note) : null,
    status: row.status as TimelineEventStatus,
    sortOrder: Number(row.sort_order),
    createdAt: String(row.created_at),
  };
}

function mapGiftRow(row: Record<string, unknown>): GiftRegistryItem {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    productId: row.product_id ? String(row.product_id) : null,
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    categoryLabel: String(row.category_label),
    targetPriceEgp: Number(row.target_price_egp),
    priority: row.priority as GiftPriority,
    reservationStatus: row.reservation_status as GiftRegistryItem['reservationStatus'],
    reservedByName: row.reserved_by_name ? String(row.reserved_by_name) : null,
    reservedAt: row.reserved_at ? String(row.reserved_at) : null,
    notes: row.notes ? String(row.notes) : null,
    createdAt: String(row.created_at),
  };
}

function effectiveSeatsForGuest(g: {
  rsvpStatus: RsvpStatus;
  attendingCount: number;
  invitedCount: number;
}): number {
  if (g.rsvpStatus === 'declined') return 0;
  if (g.rsvpStatus === 'confirmed') return Math.max(1, g.attendingCount || g.invitedCount);
  return Math.max(1, g.invitedCount);
}

export function buildWeddingDayOverview(
  db: DatabaseSync,
  userId: string,
): WeddingDayOverviewPayload {
  const guests = (
    db
      .prepare('SELECT * FROM wedding_guests WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId) as Record<string, unknown>[]
  ).map(mapGuestRow);

  const tableRows = db
    .prepare('SELECT * FROM seating_tables WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC')
    .all(userId) as Record<string, unknown>[];

  const tables: SeatingTable[] = tableRows.map((row) => {
    const id = String(row.id);
    const seatedGuests = guests.filter((g) => g.tableId === id);
    const assignedHeadcount = seatedGuests.reduce(
      (sum, g) => sum + effectiveSeatsForGuest(g),
      0,
    );
    const capacity = Number(row.capacity);
    return {
      id,
      userId: String(row.user_id),
      tableName: String(row.table_name),
      zone: row.zone as TableZone,
      capacity,
      notes: row.notes ? String(row.notes) : null,
      sortOrder: Number(row.sort_order),
      assignedHeadcount,
      assignedGuestsCount: seatedGuests.length,
      isFull: assignedHeadcount >= capacity,
      createdAt: String(row.created_at),
    };
  });

  const timelineEvents = (
    db
      .prepare(
        'SELECT * FROM wedding_timeline_events WHERE user_id = ? ORDER BY start_time ASC, sort_order ASC',
      )
      .all(userId) as Record<string, unknown>[]
  ).map(mapTimelineRow);

  const giftRegistry = (
    db
      .prepare('SELECT * FROM gift_registry_items WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId) as Record<string, unknown>[]
  ).map(mapGiftRow);

  return {
    guests,
    tables,
    timelineEvents,
    giftRegistry,
    stats: {
      totalInvitedParties: guests.length,
      totalInvitedSeats: guests.reduce((s, g) => s + g.invitedCount, 0),
      confirmedParties: guests.filter((g) => g.rsvpStatus === 'confirmed').length,
      confirmedHeadcount: guests
        .filter((g) => g.rsvpStatus === 'confirmed')
        .reduce((s, g) => s + Math.max(1, g.attendingCount), 0),
      pendingParties: guests.filter((g) => g.rsvpStatus === 'pending').length,
      declinedParties: guests.filter((g) => g.rsvpStatus === 'declined').length,
      totalTableSeats: tables.reduce((s, t) => s + t.capacity, 0),
      seatedHeadcount: tables.reduce((s, t) => s + t.assignedHeadcount, 0),
      timelineTotal: timelineEvents.length,
      timelineReadyOrDone: timelineEvents.filter((ev) => ev.status !== 'planned').length,
      registryTotal: giftRegistry.length,
      registryReservedOrReceived: giftRegistry.filter(
        (g) => g.reservationStatus !== 'available',
      ).length,
    },
  };
}

function assertTableAssignmentAvailable(
  db: DatabaseSync,
  userId: string,
  tableId: string,
  incomingSeats: number,
  excludeGuestId?: string,
): void {
  const tbl = db
    .prepare('SELECT id, user_id, capacity, table_name FROM seating_tables WHERE id = ?')
    .get(tableId) as
    | { id: string; user_id: string; capacity: number; table_name: string }
    | undefined;
  if (!tbl) throw createHttpError(404, 'TABLE_NOT_FOUND', 'Seating table not found');
  if (tbl.user_id !== userId) throw createHttpError(403, 'FORBIDDEN', 'Table belongs to another couple');

  const otherGuests = (
    db
      .prepare('SELECT * FROM wedding_guests WHERE table_id = ? AND user_id = ?')
      .all(tableId, userId) as Record<string, unknown>[]
  )
    .map(mapGuestRow)
    .filter((g) => g.id !== excludeGuestId);

  const used = otherGuests.reduce((sum, g) => sum + effectiveSeatsForGuest(g), 0);
  if (used + incomingSeats > Number(tbl.capacity)) {
    throw createHttpError(
      409,
      'TABLE_CAPACITY_EXCEEDED',
      `Table "${tbl.table_name}" capacity (${tbl.capacity}) would be exceeded (${used} used + ${incomingSeats} requested).`,
    );
  }
}

export function createSeatingTable(
  db: DatabaseSync,
  userId: string,
  input: { tableName: string; zone: TableZone; capacity: number; notes?: string | null },
): WeddingDayOverviewPayload {
  const id = newId('tbl');
  const countRow = db
    .prepare('SELECT COUNT(*) as c FROM seating_tables WHERE user_id = ?')
    .get(userId) as { c: number };
  db.prepare(
    `INSERT INTO seating_tables (id, user_id, table_name, zone, capacity, notes, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    userId,
    input.tableName.trim(),
    input.zone,
    input.capacity,
    input.notes || null,
    Number(countRow.c) + 1,
    new Date().toISOString(),
  );
  return buildWeddingDayOverview(db, userId);
}

export function deleteSeatingTable(
  db: DatabaseSync,
  userId: string,
  tableId: string,
): WeddingDayOverviewPayload {
  const tbl = db
    .prepare('SELECT id, user_id FROM seating_tables WHERE id = ?')
    .get(tableId) as { id: string; user_id: string } | undefined;
  if (!tbl) throw createHttpError(404, 'NOT_FOUND', 'Seating table not found');
  if (tbl.user_id !== userId) throw createHttpError(403, 'FORBIDDEN', 'Owner access required');
  db.prepare('DELETE FROM seating_tables WHERE id = ?').run(tableId);
  return buildWeddingDayOverview(db, userId);
}

export function createWeddingGuest(
  db: DatabaseSync,
  userId: string,
  input: {
    fullName: string;
    phone?: string | null;
    side: GuestSide;
    guestGroup: GuestGroup;
    invitedCount: number;
    plusOneAllowed: boolean;
    tableId?: string | null;
  },
): WeddingDayOverviewPayload {
  if (input.tableId) {
    assertTableAssignmentAvailable(db, userId, input.tableId, input.invitedCount);
  }
  const id = newId('wg');
  const now = new Date().toISOString();
  const rsvpCode = generateRsvpCode();
  db.prepare(
    `INSERT INTO wedding_guests
      (id, user_id, full_name, phone, side, guest_group, invited_count, plus_one_allowed, rsvp_code, rsvp_status, attending_count, meal_preference, table_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, 'standard', ?, ?, ?)`,
  ).run(
    id,
    userId,
    input.fullName.trim(),
    input.phone || null,
    input.side,
    input.guestGroup,
    input.invitedCount,
    input.plusOneAllowed ? 1 : 0,
    rsvpCode,
    input.tableId || null,
    now,
    now,
  );
  return buildWeddingDayOverview(db, userId);
}

export function updateWeddingGuest(
  db: DatabaseSync,
  userId: string,
  guestId: string,
  patch: {
    fullName?: string;
    side?: GuestSide;
    guestGroup?: GuestGroup;
    rsvpStatus?: RsvpStatus;
    attendingCount?: number;
    mealPreference?: string;
    tableId?: string | null;
  },
): WeddingDayOverviewPayload {
  const row = db
    .prepare('SELECT * FROM wedding_guests WHERE id = ?')
    .get(guestId) as Record<string, unknown> | undefined;
  if (!row) throw createHttpError(404, 'NOT_FOUND', 'Guest not found');
  if (String(row.user_id) !== userId) throw createHttpError(403, 'FORBIDDEN', 'Owner access required');

  const current = mapGuestRow(row);
  const nextStatus = patch.rsvpStatus ?? current.rsvpStatus;
  const nextAttending =
    patch.attendingCount ??
    (nextStatus === 'declined'
      ? 0
      : nextStatus === 'confirmed'
        ? Math.max(1, current.attendingCount || current.invitedCount)
        : current.attendingCount);
  const nextTableId = patch.tableId !== undefined ? patch.tableId : current.tableId;

  if (nextTableId) {
    assertTableAssignmentAvailable(
      db,
      userId,
      nextTableId,
      effectiveSeatsForGuest({
        rsvpStatus: nextStatus,
        attendingCount: nextAttending,
        invitedCount: current.invitedCount,
      }),
      guestId,
    );
  }

  db.prepare(
    `UPDATE wedding_guests
     SET full_name = ?, side = ?, guest_group = ?, rsvp_status = ?, attending_count = ?, meal_preference = ?, table_id = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    patch.fullName?.trim() || current.fullName,
    patch.side ?? current.side,
    patch.guestGroup ?? current.guestGroup,
    nextStatus,
    nextAttending,
    patch.mealPreference ?? current.mealPreference,
    nextTableId ?? null,
    new Date().toISOString(),
    guestId,
  );
  return buildWeddingDayOverview(db, userId);
}

export function deleteWeddingGuest(
  db: DatabaseSync,
  userId: string,
  guestId: string,
): WeddingDayOverviewPayload {
  const row = db
    .prepare('SELECT id, user_id FROM wedding_guests WHERE id = ?')
    .get(guestId) as { id: string; user_id: string } | undefined;
  if (!row) throw createHttpError(404, 'NOT_FOUND', 'Guest not found');
  if (row.user_id !== userId) throw createHttpError(403, 'FORBIDDEN', 'Owner access required');
  db.prepare('DELETE FROM wedding_guests WHERE id = ?').run(guestId);
  return buildWeddingDayOverview(db, userId);
}

export function createTimelineEvent(
  db: DatabaseSync,
  userId: string,
  input: {
    startTime: string;
    endTime: string;
    titleAr: string;
    titleEn?: string;
    assignee: string;
    locationNote?: string | null;
  },
): WeddingDayOverviewPayload {
  const id = newId('wte');
  const countRow = db
    .prepare('SELECT COUNT(*) as c FROM wedding_timeline_events WHERE user_id = ?')
    .get(userId) as { c: number };
  db.prepare(
    `INSERT INTO wedding_timeline_events
      (id, user_id, start_time, end_time, title_ar, title_en, assignee, location_note, status, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'planned', ?, ?)`,
  ).run(
    id,
    userId,
    input.startTime,
    input.endTime,
    input.titleAr.trim(),
    (input.titleEn || input.titleAr).trim(),
    input.assignee.trim(),
    input.locationNote || null,
    Number(countRow.c) + 1,
    new Date().toISOString(),
  );
  return buildWeddingDayOverview(db, userId);
}

export function updateTimelineEvent(
  db: DatabaseSync,
  userId: string,
  eventId: string,
  patch: {
    status?: TimelineEventStatus;
    startTime?: string;
    endTime?: string;
    assignee?: string;
  },
): WeddingDayOverviewPayload {
  const row = db
    .prepare('SELECT * FROM wedding_timeline_events WHERE id = ?')
    .get(eventId) as Record<string, unknown> | undefined;
  if (!row) throw createHttpError(404, 'NOT_FOUND', 'Timeline event not found');
  if (String(row.user_id) !== userId) throw createHttpError(403, 'FORBIDDEN', 'Owner access required');

  db.prepare(
    `UPDATE wedding_timeline_events SET status = ?, start_time = ?, end_time = ?, assignee = ? WHERE id = ?`,
  ).run(
    patch.status ?? String(row.status),
    patch.startTime ?? String(row.start_time),
    patch.endTime ?? String(row.end_time),
    patch.assignee?.trim() || String(row.assignee),
    eventId,
  );
  return buildWeddingDayOverview(db, userId);
}

export function deleteTimelineEvent(
  db: DatabaseSync,
  userId: string,
  eventId: string,
): WeddingDayOverviewPayload {
  const row = db
    .prepare('SELECT id, user_id FROM wedding_timeline_events WHERE id = ?')
    .get(eventId) as { id: string; user_id: string } | undefined;
  if (!row) throw createHttpError(404, 'NOT_FOUND', 'Timeline event not found');
  if (row.user_id !== userId) throw createHttpError(403, 'FORBIDDEN', 'Owner access required');
  db.prepare('DELETE FROM wedding_timeline_events WHERE id = ?').run(eventId);
  return buildWeddingDayOverview(db, userId);
}

export function createGiftRegistryItem(
  db: DatabaseSync,
  userId: string,
  input: {
    productId?: string | null;
    titleAr: string;
    titleEn?: string;
    categoryLabel: string;
    targetPriceEgp: number;
    priority: GiftPriority;
    notes?: string | null;
  },
): WeddingDayOverviewPayload {
  let finalTitleAr = input.titleAr.trim();
  let finalTitleEn = (input.titleEn || input.titleAr).trim();
  let finalPrice = input.targetPriceEgp;
  let productId: string | null = null;

  if (input.productId) {
    const product = db
      .prepare('SELECT id, name_ar, name_en, price FROM products WHERE id = ?')
      .get(input.productId) as
      | { id: string; name_ar: string; name_en: string; price: number }
      | undefined;
    if (!product) throw createHttpError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    productId = product.id;
    finalTitleAr = product.name_ar;
    finalTitleEn = product.name_en;
    finalPrice = Number(product.price);
  }

  db.prepare(
    `INSERT INTO gift_registry_items
      (id, user_id, product_id, title_ar, title_en, category_label, target_price_egp, priority, reservation_status, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?)`,
  ).run(
    newId('gift'),
    userId,
    productId,
    finalTitleAr,
    finalTitleEn,
    input.categoryLabel.trim(),
    finalPrice,
    input.priority,
    input.notes || null,
    new Date().toISOString(),
  );
  return buildWeddingDayOverview(db, userId);
}

export function deleteGiftRegistryItem(
  db: DatabaseSync,
  userId: string,
  itemId: string,
): WeddingDayOverviewPayload {
  const row = db
    .prepare('SELECT id, user_id FROM gift_registry_items WHERE id = ?')
    .get(itemId) as { id: string; user_id: string } | undefined;
  if (!row) throw createHttpError(404, 'NOT_FOUND', 'Registry item not found');
  if (row.user_id !== userId) throw createHttpError(403, 'FORBIDDEN', 'Owner access required');
  db.prepare('DELETE FROM gift_registry_items WHERE id = ?').run(itemId);
  return buildWeddingDayOverview(db, userId);
}

export function getPublicRsvpByCode(db: DatabaseSync, code: string): PublicRsvpPayload {
  const normalized = code.trim().toUpperCase();
  const row = db
    .prepare('SELECT * FROM wedding_guests WHERE UPPER(rsvp_code) = ?')
    .get(normalized) as Record<string, unknown> | undefined;
  if (!row) throw createHttpError(404, 'RSVP_NOT_FOUND', 'Invitation code not found');

  const guest = mapGuestRow(row);
  const hostUser = db
    .prepare('SELECT name FROM users WHERE id = ?')
    .get(guest.userId) as { name: string } | undefined;
  const ws = db
    .prepare(
      'SELECT wedding_date FROM couple_workspaces WHERE owner_user_id = ? AND wedding_date IS NOT NULL ORDER BY updated_at DESC LIMIT 1',
    )
    .get(guest.userId) as { wedding_date: string | null } | undefined;
  const prefs = !ws?.wedding_date
    ? (db
        .prepare('SELECT expected_marriage_date FROM early_start_profiles WHERE user_id = ?')
        .get(guest.userId) as { expected_marriage_date: string | null } | undefined)
    : undefined;

  const registryRows = db
    .prepare('SELECT * FROM gift_registry_items WHERE user_id = ? ORDER BY created_at ASC')
    .all(guest.userId) as Record<string, unknown>[];

  return {
    guest: {
      id: guest.id,
      fullName: guest.fullName,
      side: guest.side,
      guestGroup: guest.guestGroup,
      invitedCount: guest.invitedCount,
      plusOneAllowed: guest.plusOneAllowed,
      maxAllowedHeadcount: guest.invitedCount + (guest.plusOneAllowed ? 1 : 0),
      rsvpCode: guest.rsvpCode,
      rsvpStatus: guest.rsvpStatus,
      attendingCount: guest.attendingCount,
      mealPreference: guest.mealPreference,
      dietaryNotes: guest.dietaryNotes,
      respondedAt: guest.respondedAt,
    },
    hostCoupleName: hostUser?.name || 'GAWAZ INN Couple',
    expectedWeddingDate: ws?.wedding_date || prefs?.expected_marriage_date || null,
    giftRegistry: registryRows.map((g) => ({
      id: String(g.id),
      productId: g.product_id ? String(g.product_id) : null,
      titleAr: String(g.title_ar),
      titleEn: String(g.title_en),
      categoryLabel: String(g.category_label),
      targetPriceEgp: Number(g.target_price_egp),
      priority: g.priority as GiftPriority,
      reservationStatus: g.reservation_status as GiftRegistryItem['reservationStatus'],
    })),
  };
}

export function submitPublicRsvp(
  db: DatabaseSync,
  code: string,
  input: {
    rsvpStatus: 'confirmed' | 'declined';
    attendingCount: number;
    mealPreference: string;
    dietaryNotes?: string | null;
  },
): PublicRsvpPayload {
  const normalized = code.trim().toUpperCase();
  const row = db
    .prepare('SELECT * FROM wedding_guests WHERE UPPER(rsvp_code) = ?')
    .get(normalized) as Record<string, unknown> | undefined;
  if (!row) throw createHttpError(404, 'RSVP_NOT_FOUND', 'Invitation code not found');

  const guest = mapGuestRow(row);
  const maxAllowed = guest.invitedCount + (guest.plusOneAllowed ? 1 : 0);
  const effectiveAttending =
    input.rsvpStatus === 'declined'
      ? 0
      : Math.min(maxAllowed, Math.max(1, input.attendingCount));

  const now = new Date().toISOString();
  db.prepare(
    `UPDATE wedding_guests
     SET rsvp_status = ?, attending_count = ?, meal_preference = ?, dietary_notes = ?, responded_at = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    input.rsvpStatus,
    effectiveAttending,
    input.mealPreference,
    input.dietaryNotes || null,
    now,
    now,
    guest.id,
  );

  addUserNotification(db, {
    userId: guest.userId,
    notifType: 'milestone',
    titleAr:
      input.rsvpStatus === 'confirmed'
        ? `تأكيد حضور: ${guest.fullName} (${effectiveAttending} أفراد)`
        : `اعتذار عن الحضور: ${guest.fullName}`,
    titleEn:
      input.rsvpStatus === 'confirmed'
        ? `RSVP Confirmed: ${guest.fullName} (${effectiveAttending} attending)`
        : `RSVP Declined: ${guest.fullName}`,
    bodyAr: `تم تحديث استجابة الدعوة (${guest.rsvpCode}) — الوجبة: ${input.mealPreference}`,
    bodyEn: `Invitation ${guest.rsvpCode} updated — meal choice: ${input.mealPreference}`,
    linkPath: '/wedding-day',
  });

  return getPublicRsvpByCode(db, normalized);
}

export function reservePublicRegistryGift(
  db: DatabaseSync,
  code: string,
  giftId: string,
  guestName?: string,
): PublicRsvpPayload {
  const normalized = code.trim().toUpperCase();
  const guestRow = db
    .prepare('SELECT * FROM wedding_guests WHERE UPPER(rsvp_code) = ?')
    .get(normalized) as Record<string, unknown> | undefined;
  if (!guestRow) throw createHttpError(404, 'RSVP_NOT_FOUND', 'Invitation code not found');

  const guest = mapGuestRow(guestRow);
  const giftRow = db
    .prepare('SELECT * FROM gift_registry_items WHERE id = ? AND user_id = ?')
    .get(giftId, guest.userId) as Record<string, unknown> | undefined;
  if (!giftRow) throw createHttpError(404, 'GIFT_NOT_FOUND', 'Registry item not found');
  if (String(giftRow.reservation_status) !== 'available') {
    throw createHttpError(
      409,
      'GIFT_ALREADY_RESERVED',
      'This gift has already been reserved by another guest.',
    );
  }

  const now = new Date().toISOString();
  const reserver = (guestName && guestName.trim()) || guest.fullName;
  const upd = db
    .prepare(
      `UPDATE gift_registry_items
       SET reservation_status = 'reserved', reserved_by_name = ?, reserved_at = ?
       WHERE id = ? AND reservation_status = 'available'`,
    )
    .run(reserver, now, giftId);
  if (Number(upd.changes) === 0) {
    throw createHttpError(
      409,
      'GIFT_ALREADY_RESERVED',
      'This gift has already been reserved by another guest.',
    );
  }

  addUserNotification(db, {
    userId: guest.userId,
    notifType: 'milestone',
    titleAr: `تم حجز هدية من القائمة: ${String(giftRow.title_ar)}`,
    titleEn: `Gift Registry Reserved: ${String(giftRow.title_en)}`,
    bodyAr: `قام "${reserver}" بحجز الهدية عبر دعوة الزفاف الخاصة بك.`,
    bodyEn: `"${reserver}" reserved this gift from your public RSVP registry.`,
    linkPath: '/wedding-day',
  });

  return getPublicRsvpByCode(db, normalized);
}
