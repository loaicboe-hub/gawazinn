import type { DatabaseSync } from 'node:sqlite';
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
} from '../shared/catalogSeedData';
import { SEED_ARTICLES, SEED_CATEGORIES, SEED_LOCATIONS } from '../shared/cmsSeedData';
import {
  FINISHING_CONTRACTORS_DIRECTORY,
  FINISHING_ENCYCLOPEDIA_CATEGORIES,
  FINISHING_MATERIALS_DB,
  STAGE2_BEFORE_AFTER_PROJECTS,
} from '../shared/finishingEncyclopediaData';
import {
  BRIDE_CHECKLIST_TEMPLATES,
  BRIDE_ENCYCLOPEDIA_CATEGORIES,
  GROOM_CONFIGURABLE_PACKAGES,
  GROOM_SUBCATEGORIES,
} from '../shared/trousseauEncyclopediaData';
import { STAGE2_FAQ_ITEMS, STAGE2_GLOSSARY_TERMS } from '../shared/knowledgeGlossaryData';
import { maskNationalId } from '../shared/catalogMeta';
import { runCalculator } from '../shared/calculators';
import { ensureUserBudgetPlan, upsertBudgetExpenseFromSource } from './budgetService';
import {
  computeExpectedDateFromMonths,
  ensureUserEarlyStartProfile,
  evaluateAndAwardPrivateBadges,
} from './earlyStartService';
import {
  ensureUserEngagementAndJourney,
  mapEngagementItemRow,
} from './journeyWorkspaceService';
import {
  PRODUCT_ENCYCLOPEDIA_EXTENSIONS,
  STAGE6_ADDITIONAL_PRODUCTS,
  buildSeedPriceHistoryAndOffers,
} from '../shared/productEncyclopediaData';
import {
  ensureStarterShoppingListsForKarim,
  mapProductEncyclopediaRow,
} from './productShoppingService';
import {
  EXTRA_EGYPTIAN_LOCATIONS,
  STAGE7_VENDORS_SEED,
  STAGE7_VENDOR_PROMOTIONS_SEED,
  STAGE7_VENDOR_SERVICES_SEED,
  SUBSCRIPTION_PLANS_SEED,
  VENDOR_CATEGORIES_SEED,
} from '../shared/vendorMarketplaceData';
import { computeMaintenanceDueStatus } from '../shared/stage11Data';
import { hashPassword, hashSensitiveField } from './security';

function offsetIsoDate(daysOffset: number): string {
  const dt = new Date(Date.now() + daysOffset * 86400000);
  return dt.toISOString().slice(0, 10);
}

export function seedDatabase(
  db: DatabaseSync,
  secret = 'gawazinn-dev-local-secret-change-in-production',
): {
  seeded: boolean;
  stage2Seeded: boolean;
  stage3Seeded: boolean;
  stage4Seeded: boolean;
  stage5Seeded: boolean;
  stage6Seeded: boolean;
  stage7Seeded: boolean;
  stage8Seeded: boolean;
  stage9Seeded: boolean;
  stage10Seeded: boolean;
  stage11Seeded: boolean;
} {
  const userCountRow = db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number };
  const stage2CatCountRow = db.prepare('SELECT COUNT(*) as cnt FROM finishing_categories').get() as { cnt: number };
  const stage3PlanCountRow = db.prepare('SELECT COUNT(*) as cnt FROM budget_plans').get() as { cnt: number };
  const stage4EarlyCountRow = db.prepare('SELECT COUNT(*) as cnt FROM early_start_profiles').get() as { cnt: number };
  const stage5JourneyCountRow = db.prepare('SELECT COUNT(*) as cnt FROM journey_tasks').get() as { cnt: number };
  const stage6HistoryCountRow = db.prepare('SELECT COUNT(*) as cnt FROM product_price_history').get() as {
    cnt: number;
  };
  const stage6SlugFixRow = db
    .prepare("SELECT COUNT(*) as cnt FROM products WHERE id = 'groom-p1' AND (slug IS NULL OR slug = id)")
    .get() as { cnt: number };
  const stage7VendorCountRow = db.prepare('SELECT COUNT(*) as cnt FROM vendors').get() as { cnt: number };
  const stage7LocCountRow = db.prepare('SELECT COUNT(*) as cnt FROM locations').get() as { cnt: number };
  const stage8RfqCountRow = db.prepare('SELECT COUNT(*) as cnt FROM rfq_requests').get() as { cnt: number };
  const stage9StoryCountRow = db.prepare('SELECT COUNT(*) as cnt FROM real_weddings').get() as { cnt: number };
  const stage10BoardCountRow = db.prepare('SELECT COUNT(*) as cnt FROM room_moodboards').get() as { cnt: number };
  const stage11AssetCountRow = db.prepare('SELECT COUNT(*) as cnt FROM home_file_assets').get() as { cnt: number };
  const needsStage1 = userCountRow.cnt === 0;
  const needsStage2 = stage2CatCountRow.cnt === 0;
  const needsStage3 = stage3PlanCountRow.cnt === 0;
  const needsStage4 = stage4EarlyCountRow.cnt === 0;
  const needsStage5 = stage5JourneyCountRow.cnt === 0;
  const needsStage6 = stage6HistoryCountRow.cnt === 0;
  const needsBaseProductSlugFix = stage6SlugFixRow.cnt > 0;
  const needsStage7 = stage7VendorCountRow.cnt === 0;
  const needsExtraLocs = stage7LocCountRow.cnt < 15;
  const needsStage8 = stage8RfqCountRow.cnt === 0;
  const needsStage9 = stage9StoryCountRow.cnt === 0;
  const needsStage10 = stage10BoardCountRow.cnt === 0;
  const needsStage11 = stage11AssetCountRow.cnt === 0;

  if (
    !needsStage1 &&
    !needsStage2 &&
    !needsStage3 &&
    !needsStage4 &&
    !needsStage5 &&
    !needsStage6 &&
    !needsBaseProductSlugFix &&
    !needsStage7 &&
    !needsExtraLocs &&
    !needsStage8 &&
    !needsStage9 &&
    !needsStage10 &&
    !needsStage11
  ) {
    return {
      seeded: false,
      stage2Seeded: false,
      stage3Seeded: false,
      stage4Seeded: false,
      stage5Seeded: false,
      stage6Seeded: false,
      stage7Seeded: false,
      stage8Seeded: false,
      stage9Seeded: false,
      stage10Seeded: false,
      stage11Seeded: false,
    };
  }

  const now = new Date().toISOString();

  db.exec('BEGIN;');
  try {
    if (needsStage1) {
      // 1. Seeded Users across roles (explicitly flagged is_demo_data = 1)
      const demoPassHash = hashPassword('DemoPass@2026');
      const adminPassHash = hashPassword('AdminPass@2026');

      const insertUser = db.prepare(
        `INSERT INTO users (id, name, name_en, email, phone, password_hash, role, status, city, governorate_slug, current_stage, language, is_demo_data, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, 'ar', 1, ?, ?)`,
      );

      const demoUsers = [
        {
          id: 'usr-1',
          name: 'كريم عبد العزيز شريف',
          nameEn: 'Karim Sherif',
          email: 'karim@gawazinn.demo',
          phone: '01012345678',
          hash: demoPassHash,
          role: 'customer',
          city: 'القاهرة — مصر الجديدة',
          gov: 'cairo',
          stage: 'finishing_apartment',
        },
        {
          id: 'usr-2',
          name: 'سارة عبد الرحمن المنشاوي',
          nameEn: 'Sara El-Menshawy',
          email: 'sara@gawazinn.demo',
          phone: '01123456789',
          hash: demoPassHash,
          role: 'customer',
          city: 'الجيزة — الشيخ زايد',
          gov: 'giza',
          stage: 'preparing_bride',
        },
        {
          id: 'usr-admin',
          name: 'م. طارق المنياوي (إدارة المنصة)',
          nameEn: 'Eng. Tarek El-Minyaoui (Admin)',
          email: 'admin@gawazinn.demo',
          phone: '01000000001',
          hash: adminPassHash,
          role: 'admin',
          city: 'القاهرة الجديدة — التجمع الخامس',
          gov: 'cairo',
          stage: 'newlywed',
        },
        {
          id: 'usr-editor',
          name: 'د. سلمى نصر (محرر الموسوعة)',
          nameEn: 'Dr. Salma Nasr (Editor)',
          email: 'editor@gawazinn.demo',
          phone: '01000000002',
          hash: demoPassHash,
          role: 'editor',
          city: 'القاهرة',
          gov: 'cairo',
          stage: 'newlywed',
        },
        {
          id: 'usr-mod',
          name: 'أ. خالد عفيفي (مشرف المجتمع)',
          nameEn: 'Khaled Afifi (Moderator)',
          email: 'mod@gawazinn.demo',
          phone: '01000000003',
          hash: demoPassHash,
          role: 'moderator',
          city: 'الإسكندرية',
          gov: 'alexandria',
          stage: 'newlywed',
        },
        {
          id: 'usr-vendor',
          name: 'شركة الرواد للتشطيبات (شريك تجريبي)',
          nameEn: 'El-Rowad Contracting (Demo Vendor)',
          email: 'vendor@gawazinn.demo',
          phone: '01000000004',
          hash: demoPassHash,
          role: 'vendor',
          city: 'القاهرة الجديدة',
          gov: 'cairo',
          stage: 'maintaining_home',
        },
        {
          id: 'usr-expert',
          name: 'محمود سليم (خبير مالي معتمد)',
          nameEn: 'Mahmoud Selim (Verified Expert)',
          email: 'expert@gawazinn.demo',
          phone: '01000000005',
          hash: demoPassHash,
          role: 'expert',
          city: 'الجيزة',
          gov: 'giza',
          stage: 'maintaining_home',
        },
      ];

      for (const u of demoUsers) {
        insertUser.run(
          u.id,
          u.name,
          u.nameEn,
          u.email,
          u.phone,
          u.hash,
          u.role,
          u.city,
          u.gov,
          u.stage,
          now,
          now,
        );
      }

      // 2. Locations
      const insertLocation = db.prepare(
        `INSERT INTO locations (id, slug, level, parent_id, name_ar, name_en, summary_ar, summary_en, cost_factor, is_featured, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const loc of SEED_LOCATIONS) {
        insertLocation.run(
          loc.id,
          loc.slug,
          loc.level,
          loc.parentId ?? null,
          loc.nameAr,
          loc.nameEn,
          loc.summaryAr,
          loc.summaryEn,
          loc.costFactor,
          loc.isFeatured ? 1 : 0,
          loc.sortOrder,
        );
      }
    }

    // 3. Content Categories (13 total — idempotent across Stage 1 -> Stage 2 upgrade)
    const insertCat = db.prepare(
      `INSERT OR IGNORE INTO content_categories (id, slug, domain, parent_id, name_ar, name_en, description_ar, description_en, icon_name, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const c of SEED_CATEGORIES) {
      insertCat.run(
        c.id,
        c.slug,
        c.domain,
        c.parentId ?? null,
        c.nameAr,
        c.nameEn,
        c.descriptionAr,
        c.descriptionEn,
        c.iconName,
        c.sortOrder,
      );
    }

    // 4. CMS Articles (12 total — idempotent across Stage 1 -> Stage 2 upgrade)
    const insertArt = db.prepare(
      `INSERT OR IGNORE INTO articles (id, slug, category_id, domain, content_type, title_ar, title_en, excerpt_ar, excerpt_en, body_ar, body_en, featured_image, author_id, author_name, tags_json, faq_json, related_calculators_json, seo_title_ar, seo_title_en, meta_desc_ar, meta_desc_en, status, reading_minutes, view_count, is_featured, published_at, updated_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'usr-editor', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const art of SEED_ARTICLES) {
      insertArt.run(
        art.id,
        art.slug,
        art.categoryId,
        art.domain,
        art.contentType,
        art.titleAr,
        art.titleEn,
        art.excerptAr,
        art.excerptEn,
        art.bodyAr,
        art.bodyEn,
        art.featuredImage,
        art.authorName,
        JSON.stringify(art.tags),
        JSON.stringify(art.faqs),
        JSON.stringify(art.relatedCalculators),
        art.titleAr,
        art.titleEn,
        art.excerptAr,
        art.excerptEn,
        art.status,
        art.readingMinutes,
        art.viewCount,
        art.isFeatured ? 1 : 0,
        art.publishedAt,
        art.updatedAt,
        art.publishedAt,
      );
    }

    if (needsStage1) {
      // 5. Finishing Packages & Services
      const insertPkg = db.prepare(
        `INSERT INTO finishing_packages (id, tier, name_ar, name_en, price_per_meter, description_ar, description_en, features_ar_json, features_en_json, recommended_for_ar, recommended_for_en, badge, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      initialFinishingPackages.forEach((p, idx) => {
        insertPkg.run(
          p.id,
          p.tier,
          p.nameAr,
          p.nameEn,
          p.pricePerMeter,
          p.descriptionAr,
          p.descriptionEn,
          JSON.stringify(p.featuresAr),
          JSON.stringify(p.featuresEn),
          p.recommendedForAr,
          p.recommendedForEn,
          p.badge ?? null,
          idx + 1,
        );
      });

      const insertFinSrv = db.prepare(
        `INSERT INTO finishing_services (id, title_ar, title_en, description_ar, description_en, icon_name, image_url, starting_price_per_meter, duration_days, included_items_ar_json, included_items_en_json, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      initialFinishingServices.forEach((s, idx) => {
        insertFinSrv.run(
          s.id,
          s.titleAr,
          s.titleEn,
          s.descriptionAr,
          s.descriptionEn,
          s.iconName,
          s.imageUrl,
          s.startingPricePerMeter,
          s.durationDays,
          JSON.stringify(s.includedItemsAr),
          JSON.stringify(s.includedItemsEn),
          idx + 1,
        );
      });

      // 6. Products
      const insertProd = db.prepare(
        `INSERT INTO products (id, slug, sku, trousseau_type, category, category_ar, category_en, name_ar, name_en, brand, price, original_price, stock, image_url, gallery_json, description_ar, description_en, specs_ar_json, specs_en_json, price_source, price_updated_at, is_featured, is_ready_package_item, is_demo_data, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      );
      for (const prod of [...initialGroomProducts, ...initialBrideProducts]) {
        insertProd.run(
          prod.id,
          prod.slug || prod.id,
          prod.sku,
          prod.trousseauType,
          prod.category,
          prod.categoryAr,
          prod.categoryEn,
          prod.nameAr,
          prod.nameEn,
          prod.brand,
          prod.price,
          prod.originalPrice ?? null,
          prod.stock,
          prod.imageUrl,
          JSON.stringify(prod.galleryUrls ?? []),
          prod.descriptionAr,
          prod.descriptionEn,
          JSON.stringify(prod.specsAr),
          JSON.stringify(prod.specsEn),
          'GAWAZ INN Verified Baseline (Sample Price)',
          now,
          prod.isFeatured ? 1 : 0,
          prod.isReadyPackageItem ? 1 : 0,
          now,
          now,
        );
      }

      // 7. Wedding Services
      const insertWed = db.prepare(
        `INSERT INTO wedding_services (id, slug, category, name_ar, name_en, governorate_slug, location_ar, location_en, starting_price, pricing_type, image_url, gallery_json, rating, reviews_count, capacity, description_ar, description_en, features_ar_json, features_en_json, badge, is_demo_data, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      );
      for (const srv of initialWeddingServices) {
        const govSlug = srv.locationEn.toLowerCase().includes('zayed') || srv.locationEn.toLowerCase().includes('mohandessin')
          ? 'giza'
          : 'cairo';
        insertWed.run(
          srv.id,
          srv.id,
          srv.category,
          srv.nameAr,
          srv.nameEn,
          govSlug,
          srv.locationAr,
          srv.locationEn,
          srv.startingPrice,
          srv.pricingType,
          srv.imageUrl,
          JSON.stringify(srv.galleryUrls),
          srv.rating,
          srv.reviewsCount,
          srv.capacity ?? null,
          srv.descriptionAr,
          srv.descriptionEn,
          JSON.stringify(srv.featuresAr),
          JSON.stringify(srv.featuresEn),
          srv.badge ?? null,
          now,
        );
      }

      // 8. Sample Orders & Inquiries (properly scoped to user_id!)
      const insertOrder = db.prepare(
        `INSERT INTO orders (id, user_id, customer_name, phone, address, city, subtotal, delivery_fee, total, payment_method, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      const insertOrderItem = db.prepare(
        `INSERT INTO order_items (id, order_id, product_id, product_snapshot_json, unit_price, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
      );
      for (const ord of sampleOrders) {
        insertOrder.run(
          ord.id,
          ord.userId ?? 'usr-1',
          ord.customerName,
          ord.phone,
          ord.address,
          ord.city,
          ord.subtotal,
          ord.deliveryFee,
          ord.total,
          ord.paymentMethod,
          ord.status,
          ord.createdAt,
          ord.createdAt,
        );
        ord.items.forEach((it, idx) => {
          insertOrderItem.run(
            `${ord.id}-item-${idx + 1}`,
            ord.id,
            it.product.id,
            JSON.stringify(it.product),
            it.product.price,
            it.quantity,
          );
        });
      }

      const insertFin = db.prepare(
        `INSERT INTO finishing_inquiries (id, user_id, customer_name, phone, governorate, area_sqm, rooms_count, bathrooms_count, finishing_tier, budget_egp, notes, status, estimated_cost_min, estimated_cost_max, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const inq of sampleFinishingInquiries) {
        insertFin.run(
          inq.id,
          inq.userId ?? 'usr-1',
          inq.customerName,
          inq.phone,
          inq.governorate,
          inq.areaSqm,
          inq.roomsCount,
          inq.bathroomsCount,
          inq.finishingTier,
          inq.budgetEGP ?? null,
          inq.notes ?? null,
          inq.status,
          inq.estimatedCostMin ?? null,
          inq.estimatedCostMax ?? null,
          inq.createdAt,
          inq.createdAt,
        );
      }

      const insertWedBook = db.prepare(
        `INSERT INTO wedding_bookings (id, user_id, service_id, service_name, category, customer_name, phone, wedding_date, guest_count, governorate, notes, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const b of sampleWeddingBookings) {
        insertWedBook.run(
          b.id,
          b.userId ?? 'usr-1',
          b.serviceId,
          b.serviceName,
          b.category,
          b.customerName,
          b.phone,
          b.weddingDate,
          b.guestCount ?? null,
          b.governorate,
          b.notes ?? null,
          b.status,
          b.createdAt,
          b.createdAt,
        );
      }

      const insertFnc = db.prepare(
        `INSERT INTO financing_applications (id, user_id, customer_name, phone, national_id_masked, national_id_hash, monthly_income, employer, governorate, requested_amount, tenure_months, preferred_provider, associated_section, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const f of sampleFinancingApplications) {
        insertFnc.run(
          f.id,
          f.userId ?? 'usr-1',
          f.customerName,
          f.phone,
          maskNationalId(f.nationalId),
          hashSensitiveField(f.nationalId, secret),
          f.monthlyIncome,
          f.employer,
          f.governorate,
          f.requestedAmount,
          f.tenureMonths,
          f.preferredProvider,
          f.associatedSection,
          f.status,
          f.createdAt,
          f.createdAt,
        );
      }

      const insertSup = db.prepare(
        `INSERT INTO support_cases (id, user_id, applicant_name, national_id_masked, national_id_hash, phone, governorate, address, category, case_description, urgency_level, documents_submitted_json, status, support_value_estimated, internal_notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const sc of sampleSupportCases) {
        insertSup.run(
          sc.id,
          sc.userId ?? 'usr-2',
          sc.applicantName,
          maskNationalId(sc.nationalId),
          hashSensitiveField(sc.nationalId, secret),
          sc.phone,
          sc.governorate,
          sc.address,
          sc.category,
          sc.caseDescription,
          sc.urgencyLevel,
          JSON.stringify(sc.documentsSubmitted),
          sc.status,
          sc.supportValueEstimated ?? null,
          sc.internalNotes ?? null,
          sc.createdAt,
          sc.createdAt,
        );
      }

      // 9. Platform Settings
      db.prepare(
        `INSERT INTO platform_settings (key, value_json, updated_at) VALUES ('main', ?, ?)`,
      ).run(JSON.stringify(initialSettings), now);
    }

    // 10. Stage 2 Complete Encyclopedia & Knowledge Hub Tables (Idempotent)
    if (needsStage2) {
      const insertFinCat = db.prepare(
        `INSERT OR IGNORE INTO finishing_categories (id, slug, step_order, phase_key, name_ar, name_en, summary_ar, summary_en, budget_share_percent, typical_duration_ar, typical_duration_en, technical_specs_ar_json, technical_specs_en_json, common_mistakes_ar_json, common_mistakes_en_json, inspection_checklist_ar_json, inspection_checklist_en_json, recommended_materials_ar_json, recommended_materials_en_json, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const fc of FINISHING_ENCYCLOPEDIA_CATEGORIES) {
        insertFinCat.run(
          fc.id,
          fc.slug,
          fc.stepOrder,
          fc.phaseKey,
          fc.nameAr,
          fc.nameEn,
          fc.summaryAr,
          fc.summaryEn,
          fc.budgetSharePercent,
          fc.typicalDurationAr,
          fc.typicalDurationEn,
          JSON.stringify(fc.technicalSpecsAr),
          JSON.stringify(fc.technicalSpecsEn),
          JSON.stringify(fc.commonMistakesAr),
          JSON.stringify(fc.commonMistakesEn),
          JSON.stringify(fc.inspectionChecklistAr),
          JSON.stringify(fc.inspectionChecklistEn),
          JSON.stringify(fc.recommendedMaterialsAr),
          JSON.stringify(fc.recommendedMaterialsEn),
          fc.imageUrl,
        );
      }

      const insertMat = db.prepare(
        `INSERT OR IGNORE INTO finishing_materials (id, slug, category_slug, material_group, name_ar, name_en, summary_ar, summary_en, origin_ar, origin_en, unit_ar, unit_en, price_min_egp, price_max_egp, price_source, price_updated_at, pros_ar_json, pros_en_json, cons_ar_json, cons_en_json, alternatives_ar_json, alternatives_en_json, specs_ar_json, specs_en_json, best_use_ar, best_use_en, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const m of FINISHING_MATERIALS_DB) {
        insertMat.run(
          m.id,
          m.slug,
          m.categorySlug,
          m.materialGroup,
          m.nameAr,
          m.nameEn,
          m.summaryAr,
          m.summaryEn,
          m.originAr,
          m.originEn,
          m.unitAr,
          m.unitEn,
          m.priceMinEgp,
          m.priceMaxEgp,
          m.priceSource,
          m.priceUpdatedAt,
          JSON.stringify(m.prosAr),
          JSON.stringify(m.prosEn),
          JSON.stringify(m.consAr),
          JSON.stringify(m.consEn),
          JSON.stringify(m.alternativesAr),
          JSON.stringify(m.alternativesEn),
          JSON.stringify(m.specsAr),
          JSON.stringify(m.specsEn),
          m.bestUseAr,
          m.bestUseEn,
          m.imageUrl,
        );
      }

      const insertProj = db.prepare(
        `INSERT OR IGNORE INTO before_after_projects (id, slug, title_ar, title_en, governorate_slug, governorate_ar, governorate_en, area_sqm, tier, tier_ar, tier_en, duration_days, duration_ar, duration_en, estimated_band_ar, estimated_band_en, before_image, after_image, description_ar, description_en, scope_highlights_ar_json, scope_highlights_en_json, is_sample_listing, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      STAGE2_BEFORE_AFTER_PROJECTS.forEach((p, idx) => {
        insertProj.run(
          p.id,
          p.slug,
          p.titleAr,
          p.titleEn,
          p.governorateSlug,
          p.governorateAr,
          p.governorateEn,
          p.areaSqm,
          p.tier,
          p.tierAr,
          p.tierEn,
          p.durationDays,
          p.durationAr,
          p.durationEn,
          p.estimatedBandAr,
          p.estimatedBandEn,
          p.beforeImage,
          p.afterImage,
          p.descriptionAr,
          p.descriptionEn,
          JSON.stringify(p.scopeHighlightsAr),
          JSON.stringify(p.scopeHighlightsEn),
          p.isSampleListing ? 1 : 0,
          idx + 1,
        );
      });

      const insertContractor = db.prepare(
        `INSERT OR IGNORE INTO finishing_contractors (id, slug, name_ar, name_en, role_title_ar, role_title_en, specialty_group, specialty_ar, specialty_en, governorates_json, experience_years, verification_badge, pricing_model_ar, pricing_model_en, portfolio_highlights_ar_json, portfolio_highlights_en_json, warranty_offered_ar, warranty_offered_en, reviews_count, rating_note_ar, rating_note_en, is_sample_listing, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      FINISHING_CONTRACTORS_DIRECTORY.forEach((c, idx) => {
        insertContractor.run(
          c.id,
          c.slug,
          c.nameAr,
          c.nameEn,
          c.roleTitleAr,
          c.roleTitleEn,
          c.specialtyGroup,
          c.specialtyAr,
          c.specialtyEn,
          JSON.stringify(c.governoratesCovered),
          c.experienceYears,
          c.verificationBadge,
          c.pricingModelAr,
          c.pricingModelEn,
          JSON.stringify(c.portfolioHighlightsAr),
          JSON.stringify(c.portfolioHighlightsEn),
          c.warrantyOfferedAr,
          c.warrantyOfferedEn,
          c.reviewsCount,
          c.ratingNoteAr,
          c.ratingNoteEn,
          c.isSampleListing ? 1 : 0,
          idx + 1,
        );
      });

      const insertGroomSub = db.prepare(
        `INSERT OR IGNORE INTO groom_subcategories (id, slug, group_key, name_ar, name_en, summary_ar, summary_en, priority, budget_share_percent, estimated_min_egp, estimated_max_egp, buying_checklist_ar_json, buying_checklist_en_json, warranty_tips_ar, warranty_tips_en, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      GROOM_SUBCATEGORIES.forEach((sub, idx) => {
        insertGroomSub.run(
          sub.id,
          sub.slug,
          sub.groupKey,
          sub.nameAr,
          sub.nameEn,
          sub.summaryAr,
          sub.summaryEn,
          sub.priority,
          sub.budgetSharePercent,
          sub.estimatedMinEgp,
          sub.estimatedMaxEgp,
          JSON.stringify(sub.buyingChecklistAr),
          JSON.stringify(sub.buyingChecklistEn),
          sub.warrantyTipsAr,
          sub.warrantyTipsEn,
          idx + 1,
        );
      });

      const insertGroomPkg = db.prepare(
        `INSERT OR IGNORE INTO groom_package_templates (id, slug, tier_key, target_budget_egp, name_ar, name_en, tagline_ar, tagline_en, warranty_note_ar, warranty_note_en, price_updated_at, slots_json, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      GROOM_CONFIGURABLE_PACKAGES.forEach((pkg, idx) => {
        insertGroomPkg.run(
          pkg.id,
          pkg.slug,
          pkg.tierKey,
          pkg.targetBudgetEgp,
          pkg.nameAr,
          pkg.nameEn,
          pkg.taglineAr,
          pkg.taglineEn,
          pkg.warrantyNoteAr,
          pkg.warrantyNoteEn,
          pkg.priceUpdatedAt,
          JSON.stringify(pkg.slots),
          idx + 1,
        );
      });

      const insertBrideCat = db.prepare(
        `INSERT OR IGNORE INTO bride_categories (id, slug, sort_order, group_key, name_ar, name_en, summary_ar, summary_en, budget_weight_percent, anti_waste_tip_ar, anti_waste_tip_en, recommended_count_label_ar, recommended_count_label_en)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const bc of BRIDE_ENCYCLOPEDIA_CATEGORIES) {
        insertBrideCat.run(
          bc.id,
          bc.slug,
          bc.sortOrder,
          bc.groupKey,
          bc.nameAr,
          bc.nameEn,
          bc.summaryAr,
          bc.summaryEn,
          bc.budgetWeightPercent,
          bc.antiWasteTipAr,
          bc.antiWasteTipEn,
          bc.recommendedCountLabelAr,
          bc.recommendedCountLabelEn,
        );
      }

      const insertBrideChk = db.prepare(
        `INSERT OR IGNORE INTO bride_checklist_templates (id, category_id, label_ar, label_en, recommended_qty, unit_label_ar, unit_label_en, priority, estimated_unit_price_egp, presets_json, note_ar, note_en, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      BRIDE_CHECKLIST_TEMPLATES.forEach((item, idx) => {
        insertBrideChk.run(
          item.id,
          item.categoryId,
          item.labelAr,
          item.labelEn,
          item.recommendedQty,
          item.unitLabelAr,
          item.unitLabelEn,
          item.priority,
          item.estimatedUnitPriceEgp,
          JSON.stringify(item.presets),
          item.noteAr,
          item.noteEn,
          idx + 1,
        );
      });

      const insertGlossary = db.prepare(
        `INSERT OR IGNORE INTO glossary_terms (id, slug, domain, term_ar, term_en, definition_ar, definition_en, example_ar, example_en, related_calculator_slug, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      STAGE2_GLOSSARY_TERMS.forEach((term, idx) => {
        insertGlossary.run(
          term.id,
          term.slug,
          term.domain,
          term.termAr,
          term.termEn,
          term.definitionAr,
          term.definitionEn,
          term.exampleAr,
          term.exampleEn,
          term.relatedCalculatorSlug ?? null,
          idx + 1,
        );
      });

      const insertFaq = db.prepare(
        `INSERT OR IGNORE INTO faq_items (id, domain, question_ar, question_en, answer_ar, answer_en, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const fq of STAGE2_FAQ_ITEMS) {
        insertFaq.run(
          fq.id,
          fq.domain,
          fq.questionAr,
          fq.questionEn,
          fq.answerAr,
          fq.answerEn,
          fq.sortOrder,
        );
      }

      // Default seeded personalized planner baselines for Karim (usr-1) and Sara (usr-2)
      db.prepare(
        `INSERT OR IGNORE INTO user_groom_plans (user_id, selected_tier_key, target_budget_egp, slot_selections_json, excluded_slots_json, custom_items_json, updated_at)
         VALUES ('usr-1', 'tier_200k', 200000, ?, '[]', ?, ?)`,
      ).run(
        JSON.stringify({ fridge: 'opt-fr-bal', washer: 'opt-ws-bal', cooker: 'opt-ck-bal' }),
        JSON.stringify(['جهاز فلتر مياه 7 مراحل']),
        now,
      );

      db.prepare(
        `INSERT OR IGNORE INTO user_bride_plans (user_id, preset_mode, target_budget_egp, checked_item_ids_json, qty_overrides_json, custom_items_json, updated_at)
         VALUES ('usr-2', 'balanced', 95000, ?, ?, '[]', ?)`,
      ).run(JSON.stringify(['chk-1', 'chk-4', 'chk-8']), JSON.stringify({ 'chk-8': 8 }), now);
    }

    if (needsStage3) {
      // Seed Karim Sherif's (usr-1) starter Budget Plan, Expenses, and Saved Calculator Runs
      const karimExists = db.prepare("SELECT id FROM users WHERE id = 'usr-1'").get();
      if (karimExists) {
        const plan = ensureUserBudgetPlan(db, 'usr-1');
        const catRows = db
          .prepare("SELECT id, slug FROM budget_categories WHERE user_id = 'usr-1'")
          .all() as { id: string; slug: string }[];
        const bySlug = new Map<string, string>(catRows.map((c) => [c.slug, c.id]));

        const finishingOut = runCalculator('finishing-cost', {
          areaSqm: 120,
          tier: 'medium',
          condition: 'red_brick',
          bathroomsCount: 2,
          governorate: 'cairo',
          includeGypsumAndAcPrep: true,
        });
        db.prepare(
          `INSERT OR IGNORE INTO calculator_runs (id, user_id, calculator_slug, inputs_json, outputs_json, primary_value, saved_title, created_at)
           VALUES ('run-karim-fin-1', 'usr-1', 'finishing-cost', ?, ?, ?, 'تشطيب شقة التجمع 120م', ?)`,
        ).run(
          JSON.stringify({ areaSqm: 120, tier: 'medium', condition: 'red_brick', bathroomsCount: 2, governorate: 'cairo', includeGypsumAndAcPrep: true }),
          JSON.stringify(finishingOut),
          finishingOut.primaryMetric.value,
          now,
        );

        const totalOut = runCalculator('total-marriage-budget', { areaSqm: 120, finishingTier: 'medium', governorate: 'cairo' });
        db.prepare(
          `INSERT OR IGNORE INTO calculator_runs (id, user_id, calculator_slug, inputs_json, outputs_json, primary_value, saved_title, created_at)
           VALUES ('run-karim-tot-1', 'usr-1', 'total-marriage-budget', ?, ?, ?, 'خطة الميزانية الكلية 2026', ?)`,
        ).run(
          JSON.stringify({ areaSqm: 120, finishingTier: 'medium', governorate: 'cairo' }),
          JSON.stringify(totalOut),
          totalOut.primaryMetric.value,
          now,
        );

        const dueIn5Days = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        upsertBudgetExpenseFromSource(db, {
          userId: 'usr-1',
          budgetPlanId: plan.id,
          categoryId: bySlug.get('finishing')!,
          title: 'دفعة أولى: تأسيس سباكة وكهرباء وعزل الحمامات',
          vendorOrPayee: 'م. طارق المنياوي — المكتب الهندسي',
          amount: 55000,
          paymentType: 'deposit',
          status: 'paid',
          paidBySide: 'groom',
          paidAt: now.slice(0, 10),
          sourceType: 'finishing_inquiry',
          sourceId: 'fin-seed-karim-1',
          notes: 'مرتبط باختبار الكبس الهيدروليكي',
        });

        upsertBudgetExpenseFromSource(db, {
          userId: 'usr-1',
          budgetPlanId: plan.id,
          categoryId: bySlug.get('wedding')!,
          title: 'عربون قاعة الزفاف (الدفعة الثانية)',
          vendorOrPayee: 'فندق قصر النيل الملكي',
          amount: 25000,
          paymentType: 'deposit',
          status: 'upcoming',
          paidBySide: 'shared',
          dueDate: dueIn5Days,
          sourceType: 'wedding_booking',
          sourceId: 'wb-seed-karim-1',
          notes: 'تنبيه سداد خلال 5 أيام لتثبيت التاريخ',
        });

        upsertBudgetExpenseFromSource(db, {
          userId: 'usr-1',
          budgetPlanId: plan.id,
          categoryId: bySlug.get('gold_shabka')!,
          title: 'تجهيز دبل وتوينز الخطوبة (عيار 21)',
          vendorOrPayee: 'صاغة معتمدون',
          amount: 42000,
          paymentType: 'full',
          status: 'paid',
          paidBySide: 'groom',
          paidAt: now.slice(0, 10),
          sourceType: 'calculator_run',
          sourceId: 'run-seed-gold-karim',
          notes: 'فاتورة مدموغة بالوزن بالجرام',
        });
      }
    }

    if (needsStage4) {
      const karimExists = db.prepare("SELECT id FROM users WHERE id = 'usr-1'").get();
      if (karimExists) {
        // Initialize Karim's 5-year Early Start roadmap + Future Fund starter goals
        const targetDate5y = computeExpectedDateFromMonths(60);
        ensureUserEarlyStartProfile(db, 'usr-1');
        db.prepare(
          `UPDATE early_start_profiles SET
            timeframe_preset = '5y',
            timeframe_months = 60,
            expected_marriage_date = ?,
            target_marriage_budget = 650000,
            initial_capital = 120000,
            monthly_savings_target = 6500,
            emergency_reserve_target = 65000,
            personal_notes = 'خطة البداية المبكرة خلال 5 سنوات: التركيز على مقدم الشقة والتشطيب واحتياطي الطوارئ أولاً.',
            updated_at = ?
           WHERE user_id = 'usr-1'`,
        ).run(targetDate5y, now);

        const existingGoals = db
          .prepare("SELECT id, goal_type FROM savings_goals WHERE user_id = 'usr-1'")
          .all() as { id: string; goal_type: string }[];
        const goalByType = new Map(existingGoals.map((g) => [g.goal_type, g.id]));

        // Add explicit marriage & appliances starter goals so seeded user covers richer buckets
        const marriageGoalId = 'sg-karim-marriage';
        db.prepare(
          `INSERT OR IGNORE INTO savings_goals
             (id, user_id, goal_type, title_ar, title_en, target_amount, current_amount, monthly_contribution, target_date, priority, is_private, created_at, updated_at)
           VALUES (?, 'usr-1', 'marriage', 'صندوق الزواج والأثاث الكلي', 'Marriage & Furniture Target Fund', 150000, 35000, 1500, ?, 4, 1, ?, ?)`,
        ).run(marriageGoalId, targetDate5y, now, now);

        const aptGoalId = goalByType.get('apartment_purchase')!;
        const finGoalId = goalByType.get('finishing')!;
        const emgGoalId = goalByType.get('emergency')!;

        db.prepare("UPDATE savings_goals SET current_amount = 95000 WHERE id = ?").run(aptGoalId);
        db.prepare("UPDATE savings_goals SET current_amount = 55000 WHERE id = ?").run(finGoalId);
        db.prepare("UPDATE savings_goals SET current_amount = 40000 WHERE id = ?").run(emgGoalId);

        // Seed 4 consecutive monthly contributions up to current month for realistic streak + SVG chart
        const baseDt = new Date();
        const insertContrib = db.prepare(
          `INSERT OR IGNORE INTO savings_contributions
             (id, savings_goal_id, user_id, amount, contribution_type, contribution_date, streak_month, note, created_at)
           VALUES (?, ?, 'usr-1', ?, 'deposit', ?, ?, ?, ?)`,
        );

        const seedSeries: { offset: number; goalId: string; amount: number; note: string }[] = [
          { offset: -3, goalId: aptGoalId, amount: 45000, note: 'تحويل افتتاحي لصندوق مقدم الشقة' },
          { offset: -2, goalId: finGoalId, amount: 55000, note: 'ادخار مخصص لتأسيس السباكة والكهرباء' },
          { offset: -1, goalId: emgGoalId, amount: 40000, note: 'تدعيم احتياطي الطوارئ الأُسري' },
          { offset: 0, goalId: aptGoalId, amount: 50000, note: 'إيداع شهري منتظم' },
        ];

        seedSeries.forEach((entry, idx) => {
          const d = new Date(Date.UTC(baseDt.getUTCFullYear(), baseDt.getUTCMonth() + entry.offset, 10));
          const isoDate = d.toISOString().slice(0, 10);
          const streakMonth = isoDate.slice(0, 7);
          insertContrib.run(
            `sc-seed-karim-${idx + 1}`,
            entry.goalId,
            entry.amount,
            isoDate,
            streakMonth,
            entry.note,
            now,
          );
        });

        // Mark first 3 Academy lessons completed & evaluate badges
        const insertLesson = db.prepare(
          `INSERT OR IGNORE INTO early_start_lesson_progress (user_id, lesson_slug, completed_at)
           VALUES ('usr-1', ?, ?)`,
        );
        insertLesson.run('financial-literacy-before-engagement', now);
        insertLesson.run('smart-personal-budgeting-egypt', now);
        insertLesson.run('habit-streaks-and-consistency', now);

        db.prepare(
          `UPDATE early_start_milestones SET completed = 1, completed_at = ? WHERE user_id = 'usr-1' AND sort_order <= 2`,
        ).run(now);

        evaluateAndAwardPrivateBadges(db, 'usr-1');
      }
    }

    if (needsStage5) {
      const karimExists = db.prepare("SELECT id FROM users WHERE id = 'usr-1'").get();
      if (karimExists) {
        const { workspaceId } = ensureUserEngagementAndJourney(db, 'usr-1');

        // Seed lifecycle progression history for Karim
        const insHist = db.prepare(
          `INSERT OR IGNORE INTO user_lifecycle_history (id, user_id, from_stage, to_stage, note, changed_at)
           VALUES (?, 'usr-1', ?, ?, ?, ?)`,
        );
        const dtEarly = new Date(Date.now() - 180 * 86400000).toISOString();
        const dtEng = new Date(Date.now() - 90 * 86400000).toISOString();
        const dtFin = new Date(Date.now() - 30 * 86400000).toISOString();
        insHist.run('lh-seed-1', 'thinking', 'early_saving', 'بداية خطة التمويل الشخصي قبل الخطوبة', dtEarly);
        insHist.run('lh-seed-2', 'early_saving', 'post_engagement', 'إتمام قراءة الفاتحة والشبكة', dtEng);
        insHist.run('lh-seed-3', 'post_engagement', 'finishing_apartment', 'الانتقال لمرحلة تشطيب الشقة مع بقاء خطط الخطوبة', dtFin);

        // Update Engagement checklist progress cleanly
        db.prepare(
          `UPDATE engagement_plans SET
            venue_name = 'نادي الضباط — قاعة الياسمين',
            venue_status = 'booked',
            ring_notes = 'دبلة ذهب أبيض + توينز سوليتير مدموغ بفاتورة',
            family_notes = 'اتفاق العائلتين على ميعاد الفرح والتجهيز المشترك للأجهزة',
            updated_at = ?
           WHERE user_id = 'usr-1'`,
        ).run(now);

        const engItems = (
          db.prepare("SELECT * FROM engagement_items WHERE user_id = 'usr-1' ORDER BY sort_order ASC").all() as Record<
            string,
            unknown
          >[]
        ).map(mapEngagementItemRow);

        if (engItems[0]) {
          db.prepare("UPDATE engagement_items SET status = 'done' WHERE id = ?").run(engItems[0].id);
        }
        if (engItems[1]) {
          db.prepare("UPDATE engagement_items SET status = 'done', actual_cost = 72000 WHERE id = ?").run(engItems[1].id);
        }
        if (engItems[2]) {
          db.prepare("UPDATE engagement_items SET status = 'in_progress' WHERE id = ?").run(engItems[2].id);
        }

        // Mark first 3 starter journey tasks done (budget_baseline, engagement_agreement, apartment_survey) so dependencies unlock cleanly
        const jtRows = db
          .prepare("SELECT id, sort_order FROM journey_tasks WHERE user_id = 'usr-1' ORDER BY sort_order ASC")
          .all() as { id: string; sort_order: number }[];
        jtRows.forEach((r) => {
          if (r.sort_order <= 3) {
            db.prepare("UPDATE journey_tasks SET status = 'done', completed_at = ? WHERE id = ?").run(now, r.id);
          } else if (r.sort_order === 4) {
            db.prepare("UPDATE journey_tasks SET status = 'in_progress' WHERE id = ?").run(r.id);
            db.prepare(
              `INSERT OR IGNORE INTO task_comments (id, task_id, user_id, author_name, body, created_at)
               VALUES (?, ?, 'usr-1', 'كريم عبد العزيز شريف', 'تم إجراء الكبس الهيدروليكي الأولي عند 10 بار وجاري مراجعة لوحة الكهرباء الفرعية.', ?)`,
            ).run('tc-seed-karim-1', r.id, now);
          }
        });

        // Seed 1 pending approval item inside Karim's workspace
        db.prepare(
          `INSERT OR IGNORE INTO workspace_approvals
             (id, workspace_id, requested_by_user_id, title, category, estimated_amount, status, created_at)
           VALUES ('wa-seed-1', ?, 'usr-1', 'اعتماد مواصفات ومقاسات مطبخ كلادينج وألومنيوم', 'kitchen', 48500, 'pending', ?)`,
        ).run(workspaceId, now);

        // Seed 3 Home & Marriage Documents
        const insDoc = db.prepare(
          `INSERT OR IGNORE INTO user_documents
             (id, user_id, workspace_id, doc_type, title, file_name, mime_type, size_bytes, reference_code, notes, is_shared_with_partner, created_at, updated_at)
           VALUES (?, 'usr-1', ?, ?, ?, ?, 'application/pdf', ?, ?, ?, ?, ?, ?)`,
        );
        insDoc.run(
          'doc-seed-1',
          workspaceId,
          'contract',
          'عقد مقاولات التشطيب وجدول الدفعات (مصر الجديدة)',
          'finishing-contract-heliopolis.pdf',
          428000,
          'FIN-2026-441',
          'يشمل ضمان 5 سنوات على السباكة والكهرباء',
          1,
          now,
          now,
        );
        insDoc.run(
          'doc-seed-2',
          workspaceId,
          'floor_plan',
          'الرفع المساحي الهندسي 145 م² + توزيع التكييفات',
          'apartment-145sqm-layout.pdf',
          912000,
          'CAD-145-B',
          'مقاسات الحمامين والمطبخ قبل طلب الأجهزة',
          1,
          now,
          now,
        );
        insDoc.run(
          'doc-seed-3',
          workspaceId,
          'receipt',
          'فاتورة دمغة الشبكة والدبل (الخاص)',
          'shabka-hallmark-invoice.pdf',
          215000,
          'GLD-21K-098',
          'محفوظ بخصوصية لصاحب الحساب فقط',
          0,
          now,
          now,
        );

        // Seed 3 Appliance & Home Warranties
        const insWar = db.prepare(
          `INSERT OR IGNORE INTO user_warranties
             (id, user_id, workspace_id, item_name, category, provider_name, model_serial, start_date, expiry_date, notes, created_at)
           VALUES (?, 'usr-1', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        );
        const startIso = new Date().toISOString().slice(0, 10);
        const exp5y = new Date(Date.now() + 5 * 365 * 86400000).toISOString().slice(0, 10);
        const exp10y = new Date(Date.now() + 10 * 365 * 86400000).toISOString().slice(0, 10);
        insWar.run('war-seed-1', workspaceId, 'ثلاجة إنفرتر 536 لتر ديجيتال', 'appliances', 'Sharp / El-Araby', 'SJ-GV58A-BK', startIso, exp10y, 'ضمان 10 سنوات على الضاغط', now);
        insWar.run('war-seed-2', workspaceId, 'غسالة أتوماتيك 9 كيلو إنفرتر', 'appliances', 'LG Official Warranty', 'F4V5RYP2T', startIso, exp10y, 'ضمان موتور Direct Drive', now);
        insWar.run('war-seed-3', workspaceId, 'تأسيس سباكة بولي بروبلين وكبس هيدروليكي', 'finishing', 'المكتب الهندسي المعتمد', 'PP-R-2026-KL', startIso, exp5y, 'شهادة اختبار ضغط موثقة', now);

        // Seed 2 Scheduled Appointments
        const insApt = db.prepare(
          `INSERT OR IGNORE INTO user_appointments
             (id, user_id, workspace_id, title, appointment_type, provider_name, location_text, scheduled_at, status, notes, created_at, updated_at)
           VALUES (?, 'usr-1', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        );
        const in3Days = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10) + 'T14:00';
        const in9Days = new Date(Date.now() + 9 * 86400000).toISOString().slice(0, 10) + 'T18:30';
        insApt.run('apt-seed-1', workspaceId, 'معاينة واستلام أعمال المحارة والكهرباء', 'finishing_visit', 'م. طارق المنياوي', 'مصر الجديدة — شارع الثورة', in3Days, 'confirmed', 'اصطحاب ميزان ليزر والشيك ليست', now, now);
        insApt.run('apt-seed-2', workspaceId, 'جولة القاعة ومراجعة البوفيه والديكور', 'hall_tour', 'فندق قصر النيل الملكي', 'وسط البلد — كورنيش النيل', in9Days, 'scheduled', 'تنسيق موعد مع إدارة الضيافة', now, now);

        // Seed 4 Notifications
        const insNotif = db.prepare(
          `INSERT OR IGNORE INTO notifications
             (id, user_id, notif_type, title_ar, title_en, body_ar, body_en, link_path, is_read, created_at)
           VALUES (?, 'usr-1', ?, ?, ?, ?, ?, ?, ?, ?)`,
        );
        insNotif.run('ntf-seed-1', 'budget_alert', 'تذكير سداد عربون القاعة', 'Upcoming Hall Deposit Reminder', 'متبقي 5 أيام على موعد الدفعة الثانية لقاعة الزفاف (25,000 ج.م).', '5 days left before second venue deposit installment (25,000 EGP).', '/my/budget', 0, now);
        insNotif.run('ntf-seed-2', 'reminder', 'مهمة مرحلة 9 أشهر: تأسيس السباكة والكهرباء', '9-Month Phase Task In Progress', 'يرجى التأكد من رفع شهادة الكبس الهيدروليكي قبل بند السيراميك.', 'Upload plumbing pressure-test certificate before tiling stage begins.', '/my/journey', 0, now);
        insNotif.run('ntf-seed-3', 'approval', 'طلب اعتماد مشترك: مواصفات المطبخ', 'Pending Shared Kitchen Approval', 'ينتظر مقترح مطبخ الكلادينج مراجعتك في المساحة المشتركة.', 'Kitchen Cladding spec (48,500 EGP) is waiting in Couple Approvals.', '/my/workspace', 0, now);
        insNotif.run('ntf-seed-4', 'milestone', 'انتقال المرحلة إلى تشطيب الشقة', 'Stage Transition Saved', 'تم تحديث مرحلتك إلى تشطيب الشقة مع الحفاظ على سجل الخطوبة والادخار.', 'Lifecycle updated cleanly preserving Engagement and Early Start funds.', '/onboarding', 1, now);
      }
    }

    if (needsStage6) {
      // 1. Insert 8 additional Stage 6 Egyptian market products (idempotent)
      const insProd = db.prepare(
        `INSERT OR IGNORE INTO products
          (id, slug, sku, trousseau_type, category, category_ar, category_en, name_ar, name_en, brand, model,
           price, original_price, stock, image_url, gallery_json, description_ar, description_en,
           specs_ar_json, specs_en_json, dimensions, capacity, energy_rating, warranty_months,
           warranty_terms_ar, warranty_terms_en, origin_country_ar, origin_country_en,
           pros_ar_json, pros_en_json, cons_ar_json, cons_en_json,
           buyer_warnings_ar_json, buyer_warnings_en_json, recommended_for_ar, recommended_for_en,
           price_source, price_updated_at, is_featured, is_ready_package_item, is_demo_data, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?)`,
      );
      for (const p of STAGE6_ADDITIONAL_PRODUCTS) {
        insProd.run(
          p.id,
          p.slug ?? p.id,
          p.sku,
          p.trousseauType,
          p.category,
          p.categoryAr,
          p.categoryEn,
          p.nameAr,
          p.nameEn,
          p.brand,
          p.model ?? null,
          p.price,
          p.originalPrice ?? null,
          p.stock,
          p.imageUrl,
          JSON.stringify(p.galleryUrls ?? []),
          p.descriptionAr,
          p.descriptionEn,
          JSON.stringify(p.specsAr),
          JSON.stringify(p.specsEn),
          p.dimensions ?? null,
          p.capacity ?? null,
          p.energyRating ?? null,
          p.warrantyMonths ?? 12,
          p.warrantyTermsAr ?? null,
          p.warrantyTermsEn ?? null,
          p.originCountryAr ?? null,
          p.originCountryEn ?? null,
          JSON.stringify(p.prosAr ?? []),
          JSON.stringify(p.prosEn ?? []),
          JSON.stringify(p.consAr ?? []),
          JSON.stringify(p.consEn ?? []),
          JSON.stringify(p.buyerWarningsAr ?? []),
          JSON.stringify(p.buyerWarningsEn ?? []),
          p.recommendedForAr ?? null,
          p.recommendedForEn ?? null,
          p.priceSource ?? 'GAWAZ INN Verified Official Distributor Tracker',
          p.priceUpdatedAt ?? now.slice(0, 10),
          p.isFeatured ? 1 : 0,
          now,
          now,
        );
      }

      // 2. Backfill encyclopedia metadata + SEO slugs for existing Stage 1 11 products
      const updMeta = db.prepare(
        `UPDATE products SET
          slug = ?,
          model = ?,
          dimensions = ?,
          capacity = ?,
          energy_rating = ?,
          warranty_months = ?,
          warranty_terms_ar = ?,
          warranty_terms_en = ?,
          origin_country_ar = ?,
          origin_country_en = ?,
          pros_ar_json = ?,
          pros_en_json = ?,
          cons_ar_json = ?,
          cons_en_json = ?,
          buyer_warnings_ar_json = ?,
          buyer_warnings_en_json = ?,
          recommended_for_ar = ?,
          recommended_for_en = ?,
          updated_at = ?
         WHERE id = ?`,
      );
      for (const [productId, meta] of Object.entries(PRODUCT_ENCYCLOPEDIA_EXTENSIONS)) {
        updMeta.run(
          meta.slug,
          meta.model,
          meta.dimensions,
          meta.capacity,
          meta.energyRating,
          meta.warrantyMonths,
          meta.warrantyTermsAr,
          meta.warrantyTermsEn,
          meta.originCountryAr,
          meta.originCountryEn,
          JSON.stringify(meta.prosAr),
          JSON.stringify(meta.prosEn),
          JSON.stringify(meta.consAr),
          JSON.stringify(meta.consEn),
          JSON.stringify(meta.buyerWarningsAr),
          JSON.stringify(meta.buyerWarningsEn),
          meta.recommendedForAr,
          meta.recommendedForEn,
          now,
          productId,
        );
      }

      // 3. Populate price history, merchant comparison offers & alternatives across all products
      const allProds = (
        db.prepare('SELECT * FROM products').all() as Record<string, unknown>[]
      ).map(mapProductEncyclopediaRow);
      const { priceHistory, merchantOffers, alternatives } = buildSeedPriceHistoryAndOffers(allProds);

      const insHist = db.prepare(
        `INSERT OR IGNORE INTO product_price_history (id, product_id, merchant_name, price, source, recorded_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      );
      for (const h of priceHistory) {
        insHist.run(h.id, h.productId, h.merchantName, h.price, h.source, h.recordedAt);
      }

      const insOffer = db.prepare(
        `INSERT OR IGNORE INTO product_merchant_offers
          (id, product_id, merchant_name, warranty_type, price, delivery_sla_ar, delivery_sla_en, in_stock, notes_ar, notes_en, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const o of merchantOffers) {
        insOffer.run(
          o.id,
          o.productId,
          o.merchantName,
          o.warrantyType,
          o.price,
          o.deliverySlaAr,
          o.deliverySlaEn,
          o.inStock ? 1 : 0,
          o.notesAr ?? null,
          o.notesEn ?? null,
          o.updatedAt,
        );
      }

      const insAlt = db.prepare(
        `INSERT OR IGNORE INTO product_alternatives
          (id, product_id, alternative_product_id, relation_type, reason_ar, reason_en)
         VALUES (?, ?, ?, ?, ?, ?)`,
      );
      for (const alt of alternatives) {
        insAlt.run(alt.id, alt.productId, alt.alternativeProductId, alt.relationType, alt.reasonAr, alt.reasonEn);
      }

      // 4. Seed starter Shopping Lists & Price Alerts for Karim
      if (db.prepare("SELECT id FROM users WHERE id = 'usr-1'").get()) {
        ensureStarterShoppingListsForKarim(db);
      }
    }

    // Ensure SEO slugs on base products even if Stage 6 tables were seeded earlier
    const updBaseSlug = db.prepare(
      'UPDATE products SET slug = ?, updated_at = ? WHERE id = ? AND (slug IS NULL OR slug = id)',
    );
    for (const [productId, meta] of Object.entries(PRODUCT_ENCYCLOPEDIA_EXTENSIONS)) {
      updBaseSlug.run(meta.slug, now, productId);
    }

    // Stage 7: Expand Egyptian locations tree + 17 Vendor Categories + 4 Plans + 18 Sample Vendors
    if (needsExtraLocs) {
      const insExtraLoc = db.prepare(
        `INSERT OR IGNORE INTO locations (id, slug, level, parent_id, name_ar, name_en, summary_ar, summary_en, cost_factor, is_featured, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const loc of EXTRA_EGYPTIAN_LOCATIONS) {
        insExtraLoc.run(
          loc.id,
          loc.slug,
          loc.level,
          loc.parentId ?? null,
          loc.nameAr,
          loc.nameEn,
          loc.summaryAr,
          loc.summaryEn,
          loc.costFactor,
          loc.isFeatured ? 1 : 0,
          loc.sortOrder,
        );
      }
    }

    if (needsStage7) {
      // 1. 17 Vendor Categories
      const insVcat = db.prepare(
        `INSERT OR IGNORE INTO vendor_categories
          (id, slug, domain, name_ar, name_en, summary_ar, summary_en, icon_name, buyer_checklist_ar_json, buyer_checklist_en_json, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const cat of VENDOR_CATEGORIES_SEED) {
        insVcat.run(
          cat.id,
          cat.slug,
          cat.domain,
          cat.nameAr,
          cat.nameEn,
          cat.summaryAr,
          cat.summaryEn,
          cat.iconName,
          JSON.stringify(cat.buyerChecklistAr),
          JSON.stringify(cat.buyerChecklistEn),
          cat.sortOrder,
        );
      }

      // 2. 4 Commercial Subscription Plans
      const insPlan = db.prepare(
        `INSERT OR IGNORE INTO subscription_plans
          (id, code, name_ar, name_en, monthly_price_egp, annual_price_egp, max_services, max_promotions, max_portfolio_items, lead_priority_boost, analytics_tier, features_ar_json, features_en_json, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const sp of SUBSCRIPTION_PLANS_SEED) {
        insPlan.run(
          sp.id,
          sp.code,
          sp.nameAr,
          sp.nameEn,
          sp.monthlyPriceEgp,
          sp.annualPriceEgp,
          sp.maxServices,
          sp.maxPromotions,
          sp.maxPortfolioItems,
          sp.leadPriorityBoost,
          sp.analyticsTier,
          JSON.stringify(sp.featuresAr),
          JSON.stringify(sp.featuresEn),
          sp.isActive ? 1 : 0,
          sp.sortOrder,
        );
      }

      // 3. 18 Egyptian Vendors across all 17 Categories (Zero fake ratings: 0 / 0)
      const insVendor = db.prepare(
        `INSERT OR IGNORE INTO vendors
          (id, owner_user_id, slug, business_name_ar, business_name_en, primary_category_slug, extra_category_slugs_json,
           governorate_slug, city_slug, service_areas_json, address_ar, address_en, phone, whatsapp, email, website_url,
           bio_ar, bio_en, cover_image, logo_image, portfolio_images_json, price_tier, starting_price_egp, years_experience,
           verification_status, verification_docs_json, verification_notes, verified_at, verified_by_user_id,
           subscription_plan_id, commercial_status, subscription_started_at, subscription_renews_at,
           rating_avg, reviews_count, profile_views, is_featured_commercial, is_demo_data, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, 1, ?, ?)`,
      );
      for (const v of STAGE7_VENDORS_SEED) {
        insVendor.run(
          v.id,
          v.ownerUserId,
          v.slug,
          v.businessNameAr,
          v.businessNameEn,
          v.primaryCategorySlug,
          JSON.stringify(v.extraCategorySlugs),
          v.governorateSlug,
          v.citySlug ?? null,
          JSON.stringify(v.serviceAreas),
          v.addressAr,
          v.addressEn,
          v.phone,
          v.whatsapp ?? null,
          v.email ?? null,
          v.websiteUrl ?? null,
          v.bioAr,
          v.bioEn,
          v.coverImage,
          v.logoImage ?? null,
          JSON.stringify(v.portfolioImages),
          v.priceTier,
          v.startingPriceEgp,
          v.yearsExperience,
          v.verificationStatus,
          JSON.stringify(v.verificationDocs),
          v.verificationNotes ?? null,
          v.verifiedAt ?? null,
          v.verifiedByUserId ?? null,
          v.subscriptionPlanId,
          v.commercialStatus,
          v.subscriptionStartedAt ?? now,
          v.subscriptionRenewsAt ?? null,
          v.profileViews,
          v.isFeaturedCommercial ? 1 : 0,
          v.createdAt || now,
          v.updatedAt || now,
        );
      }

      // 4. Vendor Services & Seasonal Promotions
      const insVsrv = db.prepare(
        `INSERT OR IGNORE INTO vendor_services
          (id, vendor_id, title_ar, title_en, description_ar, description_en, unit_label_ar, unit_label_en, starting_price_egp, turnaround_days, warranty_months, is_active, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const s of STAGE7_VENDOR_SERVICES_SEED) {
        insVsrv.run(
          s.id,
          s.vendorId,
          s.titleAr,
          s.titleEn,
          s.descriptionAr,
          s.descriptionEn,
          s.unitLabelAr,
          s.unitLabelEn,
          s.startingPriceEgp,
          s.turnaroundDays ?? null,
          s.warrantyMonths,
          s.isActive ? 1 : 0,
          s.sortOrder,
          s.createdAt || now,
        );
      }

      const insVprm = db.prepare(
        `INSERT OR IGNORE INTO vendor_promotions
          (id, vendor_id, title_ar, title_en, description_ar, description_en, discount_percent, promo_code, valid_until, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const p of STAGE7_VENDOR_PROMOTIONS_SEED) {
        insVprm.run(
          p.id,
          p.vendorId,
          p.titleAr,
          p.titleEn,
          p.descriptionAr,
          p.descriptionEn,
          p.discountPercent,
          p.promoCode ?? null,
          p.validUntil,
          p.isActive ? 1 : 0,
          p.createdAt || now,
        );
      }
    }

    if (needsStage8) {
      // ==================== STAGE 8: RFQ ENGINE, SLOT APPOINTMENTS & 8-STAGE VENDOR CRM ====================
      db.prepare(
        `INSERT OR IGNORE INTO rfq_requests
          (id, user_id, title, category_slug, governorate_slug, city_slug, budget_min, budget_max, desired_date,
           scope_details, requirements_json, preferred_contact, target_vendor_id, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'quoted', ?, ?)`,
      ).run(
        'rfq-seed-1',
        'usr-1',
        'تشطيب شقة 135 متر ألترا سوبر لوكس — القاهرة الجديدة',
        'turnkey_finishing',
        'cairo',
        'fifth-settlement',
        320000,
        450000,
        '2026-12-20',
        'تشطيب متكامل على الطوب الأحمر شامل تأسيس السباكة BR الألماني وكهرباء السويدي وعزل الحمامات وسيراميك كليوباترا أو الجوهرة مع نقاشة جوتن.',
        JSON.stringify({ areaSqm: 135, bedrooms: 3, bathrooms: 2, finishLevel: 'ultra_super_lux' }),
        'platform',
        'vnd-el-rowad',
        now,
        now,
      );

      db.prepare(
        `INSERT OR IGNORE INTO rfq_invitations (id, rfq_id, vendor_id, status, invited_at)
         VALUES (?, ?, ?, ?, ?)`,
      ).run('rinv-seed-1', 'rfq-seed-1', 'vnd-el-rowad', 'quoted', now);

      db.prepare(
        `INSERT OR IGNORE INTO rfq_invitations (id, rfq_id, vendor_id, status, invited_at)
         VALUES (?, ?, ?, ?, ?)`,
      ).run('rinv-seed-2', 'rfq-seed-1', 'vnd-zayed-arch', 'invited', now);

      db.prepare(
        `INSERT OR IGNORE INTO rfq_quotes
          (id, rfq_id, vendor_id, quoted_amount_egp, deposit_amount_egp, estimated_duration, warranty_months,
           scope_summary, terms_notes, valid_until, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?)`,
      ).run(
        'rfqq-seed-1',
        'rfq-seed-1',
        'vnd-el-rowad',
        365000,
        50000,
        '65 يوم عمل',
        60,
        'عرض متكامل شامل بند السباكة بضمان BR، أسلاك السويدي 100%، عزل سيكا، جيبسوم بورد للريسبشن ودهانات جوتن فينوماستيك بجدول دفعات من 4 مراحل.',
        'الدفعات مربوطة بمراحل الاستلام الهندسي في العقد الموحد.',
        '2026-12-30',
        now,
        now,
      );

      db.prepare(
        `INSERT OR IGNORE INTO rfq_messages (id, rfq_id, sender_user_id, sender_role, sender_name, vendor_id, body, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        'rfqm-seed-1',
        'rfq-seed-1',
        'usr-1',
        'customer',
        'كريم عبد العزيز شريف',
        'vnd-el-rowad',
        'هل يشمل العرض توريد وتركيب السيراميك أم المصنعية فقط؟',
        now,
      );

      db.prepare(
        `INSERT OR IGNORE INTO rfq_messages (id, rfq_id, sender_user_id, sender_role, sender_name, vendor_id, body, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        'rfqm-seed-2',
        'rfq-seed-1',
        'usr-vendor',
        'vendor',
        'شركة الرواد للتشطيبات (شريك تجريبي)',
        'vnd-el-rowad',
        'العرض يشمل التوريد والتركيب والمون مع تسعير البورسلين بالريسبشن حسب المعاينة الهندسية.',
        now,
      );

      db.prepare(
        `INSERT OR IGNORE INTO appointments
          (id, user_id, vendor_id, service_id, rfq_id, appointment_type, slot_date, slot_time, duration_minutes,
           customer_phone, customer_notes, status, created_at, updated_at)
         VALUES (?, ?, ?, NULL, NULL, 'showroom', '2026-11-28', '14:00', 45, '01012345678', ?, 'requested', ?, ?)`,
      ).run(
        'mapt-seed-1',
        'usr-1',
        'vnd-al-motahida-appliances',
        'استعراض باقة الأجهزة الكهربائية الكاملة مع مقارنة استهلاك الكهرباء A++.',
        now,
        now,
      );

      db.prepare(
        `INSERT OR IGNORE INTO appointments
          (id, user_id, vendor_id, service_id, rfq_id, appointment_type, slot_date, slot_time, duration_minutes,
           customer_phone, customer_notes, vendor_response_note, status, confirmed_at, created_at, updated_at)
         VALUES (?, ?, ?, 'vsrv-rowad-1', 'rfq-seed-1', 'site_visit', '2026-11-25', '11:00', 60, '01012345678', ?, ?, 'confirmed', ?, ?, ?)`,
      ).run(
        'mapt-seed-2',
        'usr-1',
        'vnd-el-rowad',
        'معاينة شقة التجمع الخامس ورفع المقاسات الفعلية قبل التعاقد.',
        'تم تأكيد الموعد — سيحضر م. أحمد فؤاد للمعاينة الهندسية.',
        now,
        now,
        now,
      );

      // Starter Vendor CRM Leads across multiple pipeline stages
      const insLead = db.prepare(
        `INSERT OR IGNORE INTO vendor_leads
          (id, vendor_id, customer_user_id, rfq_id, appointment_id, lead_source, customer_name, customer_phone,
           title, stage, estimated_value_egp, next_follow_up_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      insLead.run(
        'vlead-seed-rfq-rowad',
        'vnd-el-rowad',
        'usr-1',
        'rfq-seed-1',
        null,
        'rfq',
        'كريم عبد العزيز شريف',
        '01012345678',
        'تشطيب شقة 135 متر ألترا سوبر لوكس — القاهرة الجديدة',
        'quotation_sent',
        365000,
        '2026-11-26',
        now,
        now,
      );
      insLead.run(
        'vlead-seed-rfq-zayed',
        'vnd-zayed-arch',
        'usr-1',
        'rfq-seed-1',
        null,
        'rfq',
        'كريم عبد العزيز شريف',
        '01012345678',
        'تشطيب شقة 135 متر ألترا سوبر لوكس — القاهرة الجديدة',
        'new_lead',
        450000,
        '2026-11-27',
        now,
        now,
      );
      insLead.run(
        'vlead-seed-apt-rowad',
        'vnd-el-rowad',
        'usr-1',
        null,
        'mapt-seed-2',
        'appointment',
        'كريم عبد العزيز شريف',
        '01012345678',
        'حجز موعد معاينة موقع — التجمع الخامس',
        'contacted',
        365000,
        '2026-11-25',
        now,
        now,
      );
      insLead.run(
        'vlead-seed-apt-motahida',
        'vnd-al-motahida-appliances',
        'usr-1',
        null,
        'mapt-seed-1',
        'appointment',
        'كريم عبد العزيز شريف',
        '01012345678',
        'حجز موعد معرض الأجهزة الكهربائية — مدينة نصر',
        'new_lead',
        85000,
        '2026-11-28',
        now,
        now,
      );
      insLead.run(
        'vlead-seed-rowad-neg',
        'vnd-el-rowad',
        null,
        null,
        null,
        'manual',
        'أ. عمر طارق الديب',
        '01277889900',
        'باقة تشطيب شقة 160م — مدينتي B8',
        'negotiation',
        420000,
        '2026-11-29',
        now,
        now,
      );

      const insAct = db.prepare(
        `INSERT OR IGNORE INTO lead_activities (id, lead_id, actor_user_id, activity_type, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      );
      insAct.run(
        'lact-seed-1',
        'vlead-seed-rfq-rowad',
        'usr-vendor',
        'quote_sent',
        'تم إرسال عرض سعر متكامل بقيمة 365,000 ج.م لمدة 65 يوم عمل.',
        now,
      );
      insAct.run(
        'lact-seed-2',
        'vlead-seed-apt-rowad',
        'usr-vendor',
        'appointment',
        'تم تأكيد موعد المعاينة الهندسية مع العميل.',
        now,
      );
      insAct.run(
        'lact-seed-3',
        'vlead-seed-rowad-neg',
        'usr-vendor',
        'call',
        'مراجعة جدول الدفعات ونوع الرخام مع العميل تمهيداً للتوقيع.',
        now,
      );
    }

    if (needsStage9) {
      const demoPassHash = hashPassword('DemoPass@2026');
      db.prepare(
        `INSERT OR IGNORE INTO users (
          id, name, name_en, email, phone, password_hash, role, status, city, governorate_slug,
          current_stage, language, is_demo_data, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'expert', 'active', ?, 'cairo', 'maintaining_home', 'ar', 1, ?, ?)`,
      ).run(
        'usr-exp-cand',
        'م. هاني فتحي الدسوقي (خبير قيد المراجعة)',
        'Eng. Hany Fathy (Applicant)',
        'applicant@gawazinn.demo',
        '01000000009',
        demoPassHash,
        'القاهرة الجديدة',
        now,
        now,
      );

      const insStory = db.prepare(
        `INSERT OR IGNORE INTO real_weddings (
          id, user_id, couple_title_ar, couple_title_en, governorate_slug, city_ar, city_en,
          wedding_year, guest_count, total_actual_budget_egp, finishing_cost_egp,
          groom_trousseau_egp, bride_trousseau_egp, wedding_cost_egp, preparation_months,
          summary_ar, summary_en, lessons_learned_ar, lessons_learned_en,
          cost_breakdown_json, photos_json, moderation_status, moderation_notes,
          moderated_by_user_id, moderated_at, is_featured, is_demo_data, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      );

      insStory.run(
        'story-cairo-1',
        'usr-1',
        'قصة زفاف أحمد ونورهان — شقة 135م في مدينة نصر بميزانية واقعية',
        'Ahmed & Nourhan Wedding Case Study — 135m² Apartment in Nasr City',
        'cairo',
        'مدينة نصر — القاهرة',
        'Nasr City, Cairo',
        2026,
        220,
        925000,
        345000,
        245000,
        155000,
        180000,
        18,
        'بدأنا التجهيز قبل الفرح بـ 18 شهراً عبر تقسيم التكاليف إلى 4 مسارات واضحة: التأسيس والسباكة والكهرباء أولاً، ثم باقات الأجهزة، ثم حجز قاعة نهارية موفرة بـ 35% من التكلفة المعتادة.',
        'We planned across 18 months using four structured buckets: finishing rough-in first, appliance bundling before seasonal increases, and a sunlit afternoon venue booking saving ~35%.',
        'الدرس الأهم: لا تشترِ الإكسسوارات قبل إنهاء بند المحارة والسيراميك، واحتفظ بـ 10% احتياطي طوارئ لفروق الأسعار.',
        'Top takeaway: Never purchase finishing fixtures before rough-in inspection, and keep a 10% emergency price-drift buffer.',
        JSON.stringify([
          { categoryAr: 'تشطيب وتجهيز الشقة (أعمال وتأسيس)', categoryEn: 'Apartment Finishing & MEP', amountEgp: 345000 },
          { categoryAr: 'جهاز العريس والأجهزة الكهربائية', categoryEn: "Groom's Appliances & Furniture", amountEgp: 245000 },
          { categoryAr: 'جهاز العروسة والمطبخ', categoryEn: "Bride's Trousseau", amountEgp: 155000 },
          { categoryAr: 'حفل الزفاف والضيافة والتصوير', categoryEn: 'Wedding Venue & Photo', amountEgp: 180000 },
        ]),
        JSON.stringify([
          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
        ]),
        'approved',
        'Approved real case study verified against itemized budget sheet.',
        'usr-mod',
        now,
        1,
        now,
        now,
      );

      insStory.run(
        'story-giza-2',
        null,
        'تجهيز منزل عمر وسلمى في الشيخ زايد خلال 12 شهراً',
        'Omar & Salma Home & Wedding Journey in Sheikh Zayed (12 Months)',
        'giza',
        'الشيخ زايد — الجيزة',
        'Sheikh Zayed, Giza',
        2026,
        180,
        1180000,
        460000,
        310000,
        185000,
        225000,
        12,
        'اعتمدنا طلبات تسعير متعددة RFQ لـ 3 مقاولي تشطيب ومطابخ للوصول إلى أقل عرض موثق بجودة خامات سوبر لوكس وبضمان مكتوب.',
        'Used side-by-side multi-vendor RFQ quotes across 3 finishing and kitchen vendors to lock verified specs and written warranty milestones.',
        'مقارنة 3 عروض سعر وفّرت 48,000 ج.م في بنود المطبخ والألوميتال.',
        'Comparing 3 sealed RFQ offers saved 48,000 EGP across custom cabinetry and aluminum windows.',
        JSON.stringify([
          { categoryAr: 'تشطيب الشقة والمطبخ الألومنيوم', categoryEn: 'Finishing & Kitchens', amountEgp: 460000 },
          { categoryAr: 'جهاز العريس والغرف الرئيسية', categoryEn: "Groom's Furniture & Tech", amountEgp: 310000 },
          { categoryAr: 'مستلزمات العروسة والمفروشات', categoryEn: "Bride's Linens & Homeware", amountEgp: 185000 },
          { categoryAr: 'حفل الزفاف والفستان والتصوير', categoryEn: 'Wedding Celebration', amountEgp: 225000 },
        ]),
        JSON.stringify([
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
        ]),
        'approved',
        'Verified editorial story.',
        'usr-mod',
        now,
        1,
        now,
        now,
      );

      insStory.run(
        'story-alex-3',
        null,
        'زواج يوسف ومي في الإسكندرية — تنظيم اقتصادي ذكي لشقة 95م',
        'Youssef & Mai in Alexandria — Smart Economic Plan for 95m²',
        'alexandria',
        'سموحة — الإسكندرية',
        'Smouha, Alexandria',
        2025,
        120,
        615000,
        220000,
        180000,
        110000,
        105000,
        24,
        'من خلال البداية المبكرة والادخار الشهري المنتظم لمدة عامين تجنبنا القروض الاستهلاكية تماماً وركزنا في الأساسيات طويلة العمر.',
        'Early Start monthly saving across 24 months eliminated consumer loans and kept 95m² finishing focused on durable essentials.',
        'حصر الاحتياجات الفعلية في قائمة العروسة وفّر 30% من المشتريات الزائدة.',
        'Trimming redundant trousseau items using checklist essentials saved ~30%.',
        JSON.stringify([
          { categoryAr: 'تشطيب اقتصادي ذكي 95م', categoryEn: 'Smart 95m² Finishing', amountEgp: 220000 },
          { categoryAr: 'أجهزة وأثاث أساسي', categoryEn: 'Core Appliances & Rooms', amountEgp: 180000 },
          { categoryAr: 'جهاز العروسة الأساسي', categoryEn: 'Essential Bridal Items', amountEgp: 110000 },
          { categoryAr: 'كتب كتاب وحفل عائلي', categoryEn: 'Intimate Reception', amountEgp: 105000 },
        ]),
        JSON.stringify([
          'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=80',
        ]),
        'approved',
        'Approved economic blueprint story.',
        'usr-mod',
        now,
        0,
        now,
        now,
      );

      insStory.run(
        'story-seed-pending',
        'usr-2',
        'قصة خطوبة وتجهيز سارة (قيد مراجعة المشرف)',
        'Sara Pending Wedding Story Draft (In Moderation)',
        'giza',
        'الشيخ زايد',
        'Sheikh Zayed',
        2026,
        140,
        740000,
        290000,
        210000,
        140000,
        100000,
        14,
        'تجربة تنظيم جهاز العروسة والالتزام بالميزانية بدون ديون.',
        'Organizing trousseau within budget before wedding season.',
        'التخطيط المبكر هو الأساس.',
        'Early tracking prevents budget shocks.',
        JSON.stringify([
          { categoryAr: 'تشطيب وتأسيس', categoryEn: 'Finishing', amountEgp: 290000 },
        ]),
        JSON.stringify([
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80',
        ]),
        'pending',
        null,
        null,
        null,
        0,
        now,
        now,
      );

      const insExp = db.prepare(
        `INSERT OR IGNORE INTO expert_profiles (
          id, user_id, slug, display_name_ar, display_name_en, specialty_slug,
          title_ar, title_en, governorate_slug, years_experience, credentials_ar,
          credentials_en, bio_ar, bio_en, avatar_url, verification_status,
          verification_docs_json, verification_notes, verified_by_user_id, verified_at,
          answers_count, helpful_count, is_featured, is_demo_data, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      );

      insExp.run(
        'exp-mahmoud-fin',
        'usr-expert',
        'mahmoud-selim-financial-coach',
        'أ. محمود سليم',
        'Mahmoud Selim',
        'financial_planning',
        'مستشار التخطيط المالي وميزانية الزواج والادخار المبكر',
        'Marriage Financial Planning & Early Start Coach',
        'giza',
        11,
        'ماجستير التخطيط المالي الشخصي — خبير معتمد لدى جواز إن',
        'MSc Personal Financial Planning — Verified GAWAZ INN Advisor',
        'متخصص في بناء خطط الادخار المبكر من 6 أشهر وحتى 10 سنوات وتوزيع ميزانية الشقة والجهاز بدون فوائد مبالغ فيها.',
        'Specializes in 6m–10y Early Start marriage saving blueprints and balanced debt-free apartment budgeting.',
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
        'verified',
        JSON.stringify(['شهادة التخطيط المالي الشخصي', 'بطاقة الهوية الموثقة']),
        'Verified credential documents by Platform Admin.',
        'usr-admin',
        now,
        2,
        1,
        1,
        now,
        now,
      );

      insExp.run(
        'exp-tarek-arch',
        'usr-admin',
        'eng-tarek-finishing-consultant',
        'م. طارق المنياوي',
        'Eng. Tarek El-Minyaoui',
        'finishing_engineering',
        'مهندس استشاري لتشطيب الشقق واستلام بنود التأسيس (22 مرحلة)',
        'Consulting Finishing & MEP Inspection Engineer',
        'cairo',
        14,
        'نقابة المهندسين المصرية — شعبة العمارة وإدارة المشروعات',
        'Egyptian Engineers Syndicate — Architecture & MEP QA',
        'يراجع المقايسات الفنية وموازين الشرب والسباكة والكهرباء ويساعد المقبلين على الزواج في تفادي أخطاء المقاولات الشائعة.',
        'Guides couples through the 22 finishing stages, El-Sherb datum checks, and plumbing/electrical acceptance testing.',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        'verified',
        JSON.stringify(['كارنيه نقابة المهندسين', 'سجل الاستشارات الهندسية']),
        'Verified engineering syndicate registration.',
        'usr-admin',
        now,
        2,
        1,
        1,
        now,
        now,
      );

      insExp.run(
        'exp-salma-trousseau',
        'usr-editor',
        'dr-salma-bridal-advisor',
        'د. سلمى نصر',
        'Dr. Salma Nasr',
        'bridal_trousseau',
        'خبيرة تخطيط جهاز العروسة وإدارة المنزل المصري الحديث',
        'Bridal Trousseau & Household Curation Specialist',
        'cairo',
        9,
        'باحثة في الاقتصاد المنزلي ومحررة موسوعة الجهاز بجواز إن',
        'Home Economics Specialist & GAWAZ INN Lead Editor',
        'تساعد العرائس على بناء قائمة جهاز متوازنة بترتيب الأولويات دون إسراف أو تكرار.',
        'Helps brides assemble balanced 19-category trousseau plans focused on durability instead of overbuying.',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        'verified',
        JSON.stringify(['شهادة التخصص الأكاديمي', 'أوراق الاعتماد الموثقة']),
        'Verified editorial & home economics credentials.',
        'usr-admin',
        now,
        1,
        0,
        1,
        now,
        now,
      );

      insExp.run(
        'exp-seed-pending',
        'usr-exp-cand',
        'eng-hany-fathy-pending',
        'م. هاني فتحي الدسوقي',
        'Eng. Hany Fathy',
        'wedding_direction',
        'مخرج ومدير حفلات زفاف وتنسيق القاعات',
        'Wedding Producer & Venue Logistics Advisor',
        'cairo',
        7,
        'شهادة إدارة الفعاليات الدولية — طلب توثيق قيد الفحص',
        'Certified Event Production — Pending Credential Review',
        'متقدم لاعتماد ملفه كخبير إخراج وتنظيم حفلات الزفاف في القاهرة والجيزة.',
        'Applicant for verified Wedding Production advisor status across Cairo & Giza.',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
        'pending',
        JSON.stringify(['بطاقة العضوية المهنية', 'سابقة أعمال 15 حفل زفاف']),
        null,
        null,
        null,
        0,
        0,
        0,
        now,
        now,
      );

      const insQ = db.prepare(
        `INSERT OR IGNORE INTO community_questions (
          id, user_id, category_slug, title_ar, title_en, body_ar, body_en,
          tags_json, moderation_status, upvotes_count, answers_count, is_resolved,
          is_demo_data, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      );

      insQ.run(
        'cq-seed-1',
        'usr-1',
        'finishing',
        'هل الأفضل كبس مواسير السباكة قبل المحارة أم بعدها؟ وكم مدة الاختبار؟',
        'Should plumbing pressure testing happen before plastering, and how long?',
        'أنا في مرحلة تأسيس السباكة بشقة التجمع 135م، ما الضغط المطلوب لاختبار مواسير البولي بروبلين وهل أطلب ضمان الشركة؟',
        'Starting plumbing rough-in on a 135m² New Cairo flat. What bar pressure and warranty duration should I insist on before closing walls?',
        JSON.stringify(['سباكة', 'تأسيس', 'اختبار ضغط']),
        'approved',
        2,
        2,
        1,
        now,
        now,
      );

      insQ.run(
        'cq-seed-2',
        'usr-2',
        'early_start',
        'بميزانية ادخار 3,000 جنيه شهرياً قبل الفرح بـ 3 سنوات، كيف أوزع المبلغ؟',
        'Saving 3,000 EGP monthly for 3 years ahead — how should I split buckets?',
        'نرغب في التخطيط المبكر بدون ضغط، كيف نوازن بين صندوق الطوارئ وتكاليف التأسيس المبدئية؟',
        'Looking for an Early Start balance between Emergency Reserve and apartment finishing capital over 36 months.',
        JSON.stringify(['البداية المبكرة', 'ادخار', 'ميزانية']),
        'approved',
        1,
        1,
        1,
        now,
        now,
      );

      insQ.run(
        'cq-seed-3',
        'usr-2',
        'bride',
        'ما العدد المثالي لأطقم السرير والمفروشات دون شراء مبالغ فيه؟',
        'Optimal count for bride bed linens & sets without overbuying?',
        'كثير من القوائم تذكر 12 طقماً وأكثر، ما العدد العملي الواقعي للمنزل الجديد؟',
        'Many traditional checklists ask for 12+ sheet sets — what is the truly practical count?',
        JSON.stringify(['جهاز العروسة', 'مفروشات']),
        'approved',
        1,
        1,
        0,
        now,
        now,
      );

      const insAns = db.prepare(
        `INSERT OR IGNORE INTO community_answers (
          id, question_id, user_id, body_ar, body_en, is_expert_answer,
          is_helpful_marked, upvotes_count, moderation_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?)`,
      );

      insAns.run(
        'ca-seed-1',
        'cq-seed-1',
        'usr-admin',
        'لابد من إجراء اختبار كبس المياه قبل التقفيل بالمونة والسيراميك على ضغط لا يقل عن 10 بار لمدة 24 ساعة كاملة مع استلام شهادة ضمان الشركة المصنعة (10 سنوات فما فوق).',
        'Always execute hydraulic pressure testing BEFORE plastering/tiling at 10+ bar for a full 24 hours, followed by the manufacturer 10-year written warranty inspection certificate.',
        1,
        1,
        2,
        now,
        now,
      );

      insAns.run(
        'ca-seed-2',
        'cq-seed-1',
        'usr-2',
        'نفس النصيحة فادتنا جداً عند استلام السباكة في زايد، تصوير مسارات المواسير قبل السيراميك مهم جداً للمستقبل.',
        'Photographing concealed pipe runs with tape measurements before tiling also saved us later.',
        0,
        0,
        1,
        now,
        now,
      );

      insAns.run(
        'ca-seed-3',
        'cq-seed-2',
        'usr-expert',
        'ابدأ بتخصيص 25% لاحتياطي الطوارئ حتى يكتمل مبلغ أمان يعادل 3 أشهر مصروفات، ثم وجّه 45% لتجهيز الشقة الأساسي و30% لصندوق الجهاز والزفاف عبر نظام صندوق مستقبلي مع زيادة سنوية 10% لمواكبة التضخم.',
        'Allocate 25% into Emergency Reserve until hitting a 3-month safety cushion, then direct 45% toward home finishing and 30% into trousseau/wedding goals with a conservative 10% annual step-up.',
        1,
        1,
        2,
        now,
        now,
      );

      insAns.run(
        'ca-seed-4',
        'cq-seed-3',
        'usr-editor',
        'العدد الذهبي العملي: 4 أطقم قطنية يومية عالية الجودة + طقمين للضيوف + لحافين (صيفي وشتوي)، ويمكن استكمال الباقي بعد الزواج حسب الحاجة الفعلية.',
        'Practical sweet spot: 4 high-thread-count everyday cotton sheet sets + 2 guest sets + 2 seasonal comforters. Avoid stocking oversized quantities that crowd storage.',
        1,
        0,
        1,
        now,
        now,
      );

      const insVote = db.prepare(
        `INSERT OR IGNORE INTO community_votes (id, user_id, target_type, target_id, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      );
      insVote.run('cv-seed-1', 'usr-2', 'question', 'cq-seed-1', now);
      insVote.run('cv-seed-2', 'usr-admin', 'question', 'cq-seed-1', now);
      insVote.run('cv-seed-3', 'usr-1', 'question', 'cq-seed-2', now);
      insVote.run('cv-seed-4', 'usr-admin', 'question', 'cq-seed-3', now);
      insVote.run('cv-seed-5', 'usr-1', 'answer', 'ca-seed-1', now);
      insVote.run('cv-seed-6', 'usr-2', 'answer', 'ca-seed-1', now);
      insVote.run('cv-seed-7', 'usr-1', 'answer', 'ca-seed-2', now);
      insVote.run('cv-seed-8', 'usr-1', 'answer', 'ca-seed-3', now);
      insVote.run('cv-seed-9', 'usr-2', 'answer', 'ca-seed-3', now);
      insVote.run('cv-seed-10', 'usr-2', 'answer', 'ca-seed-4', now);

      db.prepare(
        `INSERT OR IGNORE INTO community_reports (
          id, reporter_user_id, target_type, target_id, reason, details, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'open', ?)`,
      ).run(
        'crep-seed-1',
        'usr-1',
        'question',
        'cq-seed-3',
        'off_topic',
        'بلاغ تجريبي لمراجعة المشرف حول التحقق من تطابق القسم مع سؤال الجهاز.',
        now,
      );
    }

    if (needsStage10) {
      const sampleProd = db
        .prepare("SELECT id, name_ar, name_en, price FROM products ORDER BY is_featured DESC, price ASC LIMIT 2")
        .all() as { id: string; name_ar: string; name_en: string; price: number }[];
      const firstProd = sampleProd[0];
      const secondProd = sampleProd[1] || firstProd;

      db.prepare(
        `INSERT OR IGNORE INTO room_moodboards (
          id, user_id, title_ar, title_en, room_type, length_m, width_m, height_m, theme_slug, palette_hex_json, notes, is_shared_with_partner, created_at, updated_at
        ) VALUES (?, 'usr-1', ?, ?, 'living', 5.2, 4.0, 2.9, 'modern_cairo', ?, ?, 0, ?, ?)`,
      ).run(
        'mb-karim-living',
        'غرفة المعيشة الرئيسية — 5.2×4.0م',
        'Main Living Room — 5.2×4.0m',
        JSON.stringify(['#FFFFFF', '#E5E7EB', '#4B5563', '#2A1D20', '#D91B3E']),
        'توزيع مقترح للكنبة L مع وحدة التلفاز ومساحة حركة مريحة.',
        now,
        now,
      );

      const insItem = db.prepare(
        `INSERT OR IGNORE INTO moodboard_items (
          id, moodboard_id, user_id, item_type, product_id, material_slug, label_ar, label_en, width_cm, depth_cm, pos_x_pct, pos_y_pct, estimated_price_egp, color_hex, notes, created_at
        ) VALUES (?, 'mb-karim-living', 'usr-1', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      insItem.run(
        'mbi-karim-1',
        'custom_furniture',
        null,
        null,
        'ركنة مودرن حرف L (3 مقاعد + شيزلونج)',
        'Modern L-Shape Sofa',
        260,
        95,
        30,
        55,
        28500,
        '#2A1D20',
        'قماش كتان رمادي معالج ضد البقع',
        now,
      );
      if (firstProd) {
        insItem.run(
          'mbi-karim-2',
          'product',
          firstProd.id,
          null,
          firstProd.name_ar,
          firstProd.name_en,
          140,
          45,
          75,
          35,
          Number(firstProd.price),
          '#D91B3E',
          'منتج مربوط بأسعار الكتالوج المباشرة',
          now,
        );
      }
      insItem.run(
        'mbi-karim-3',
        'material',
        null,
        'porcelain-flooring-indian',
        'أرضيات بورسلين مطفي 60×120',
        'Matte Porcelain Flooring 60x120',
        200,
        160,
        52,
        75,
        14800,
        '#E5E7EB',
        'تقدير مسطح 20.8م² بالوزر',
        now,
      );

      // Seating tables
      const insTbl = db.prepare(
        `INSERT OR IGNORE INTO seating_tables (id, user_id, table_name, zone, capacity, notes, sort_order, created_at)
         VALUES (?, 'usr-1', ?, ?, ?, ?, ?, ?)`,
      );
      insTbl.run('tbl-karim-vip', 'طاولة VIP العائلة 1', 'vip_front', 6, 'قريبة من المنصة الرئيسية', 1, now);
      insTbl.run('tbl-karim-friends', 'طاولة الأصدقاء 2', 'friends', 8, 'قاعة الشباب', 2, now);
      insTbl.run('tbl-karim-work', 'طاولة الزملاء 3', 'family_center', 8, null, 3, now);

      // Wedding guests
      const insGuest = db.prepare(
        `INSERT OR IGNORE INTO wedding_guests (
          id, user_id, full_name, phone, side, guest_group, invited_count, plus_one_allowed, rsvp_code, rsvp_status, attending_count, meal_preference, dietary_notes, table_id, responded_at, created_at, updated_at
        ) VALUES (?, 'usr-1', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      insGuest.run('wg-karim-1', 'طارق عبد الله وحرمه', '01012223344', 'groom', 'vip', 2, 0, 'GI-KARIM-101', 'confirmed', 2, 'standard', null, 'tbl-karim-vip', now, now, now);
      insGuest.run('wg-karim-2', 'عمرو سامي', '01099887766', 'groom', 'friends', 2, 1, 'GI-KARIM-102', 'pending', 0, 'standard', null, null, null, now, now);
      insGuest.run('wg-karim-3', 'د. نادية شوقي وأسرتها', '01122334455', 'shared', 'family', 3, 0, 'GI-KARIM-103', 'confirmed', 3, 'vegetarian', 'بدون مكسرات', 'tbl-karim-vip', now, now, now);
      insGuest.run('wg-karim-4', 'هند مصطفى', '01234567891', 'bride', 'friends', 2, 0, 'GI-KARIM-104', 'pending', 0, 'standard', null, 'tbl-karim-friends', null, now, now);
      insGuest.run('wg-karim-5', 'يوسف حسن', '01554433221', 'groom', 'colleagues', 1, 0, 'GI-KARIM-105', 'declined', 0, 'standard', 'مسافر يوم الحفل', null, now, now, now);

      // Wedding day timeline
      const insEv = db.prepare(
        `INSERT OR IGNORE INTO wedding_timeline_events (
          id, user_id, start_time, end_time, title_ar, title_en, assignee, location_note, status, sort_order, created_at
        ) VALUES (?, 'usr-1', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      insEv.run('wte-karim-1', '16:00', '17:30', 'الاستعداد والميكب والتجهيز', 'Hair, Makeup & Prep Session', 'العروسة ومساعدة التنسيق', 'الجناح الفندقي 402', 'completed', 1, now);
      insEv.run('wte-karim-2', '18:00', '19:15', 'جلسة التصوير والـ First Look', 'First Look & Couple Portraits', 'المصور والفيديو', 'حديقة الفندق الشرقية', 'ready', 2, now);
      insEv.run('wte-karim-3', '20:00', '20:45', 'الزفة والدخول الرئيسي للقاعة', 'Grand Zaffa & Hall Entrance', 'فريق الزفة والـ DJ', 'البوابة الرئيسية للقاعة', 'planned', 3, now);
      insEv.run('wte-karim-4', '21:30', '22:30', 'العشاء المفتوح واستراحة العائلات', 'Dinner Service & Table Visits', 'مدير الضيافة', 'القاعة الرئيسية', 'planned', 4, now);
      insEv.run('wte-karim-5', '23:15', '23:55', 'تقطيع التورتة والوداع', 'Cake Cutting & Farewell', 'منظم الحفل', 'الستيج الرئيسي', 'planned', 5, now);

      // Gift registry items
      const insGift = db.prepare(
        `INSERT OR IGNORE INTO gift_registry_items (
          id, user_id, product_id, title_ar, title_en, category_label, target_price_egp, priority, reservation_status, reserved_by_name, reserved_at, notes, created_at
        ) VALUES (?, 'usr-1', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      if (secondProd) {
        insGift.run(
          'gift-karim-1',
          secondProd.id,
          secondProd.name_ar,
          secondProd.name_en,
          'أجهزة منزلية',
          Number(secondProd.price),
          'essential',
          'reserved',
          'خالتي منى',
          now,
          'تم التأكيد عبر العائلة',
          now,
        );
      }
      insGift.run(
        'gift-karim-2',
        null,
        'ماكينة إسبرسو أوتوماتيك',
        'Automatic Espresso Maker',
        'ركن القهوة',
        9500,
        'nice_to_have',
        'available',
        null,
        null,
        'لون أسود مطفي أو ستانلس',
        now,
      );
      insGift.run(
        'gift-karim-3',
        null,
        'طقم عشاء بورسلين أبيض 32 قطعة',
        '32-Piece White Porcelain Dinner Set',
        'أدوات السفرة',
        5800,
        'essential',
        'available',
        null,
        null,
        'سهل الترصيص في المطبخ',
        now,
      );
    }

    if (needsStage11) {
      // Seed Stage 11: Married Life & Digital Home File for Karim (usr-1)
      const insAsset = db.prepare(
        `INSERT OR IGNORE INTO home_file_assets (
          id, user_id, room_label, asset_category, title_ar, title_en, code_or_serial, vendor_or_brand, notes, created_at, updated_at
        ) VALUES (?, 'usr-1', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      insAsset.run(
        'hfa-karim-1',
        'الريسبشن والمعيشة | Living Reception',
        'paint_code',
        'دهان الحوائط الرئيسي - أبيض كريمي نصف لامع',
        'Primary Wall Paint — Creamy White Semi-Matte',
        'Jotun 10678 Fenomastic My Home',
        'Jotun Egypt',
        'طبقتان معجون + بطانة + وشين لون للمطابخ والصالة',
        now,
        now,
      );
      insAsset.run(
        'hfa-karim-2',
        'لوحة المدخل | Main Corridor',
        'electrical_panel',
        'خريطة لوحة القواطع الكهربائية (16 خطاً + RCD)',
        'Main Breaker Panel Map (16 Lines + 30mA RCD)',
        'ABB-PNL-16L-2026',
        'El Sewedy Electric + ABB',
        'القاطع رقم 1 و 2 لتكييفات الريسبشن (25A) وقاطع المطبخ 32A',
        now,
        now,
      );
      insAsset.run(
        'hfa-karim-3',
        'الحمام الرئيسي | Master Bathroom',
        'plumbing_diagram',
        'شهادة كبس خطوط التغذية PP-R ومواقع المحابس',
        'PP-R Plumbing Pressure Test & Main Valve Diagram',
        'BR-PPR-2026-10BAR',
        'Banninger / BR Egypt',
        'المحبس العمومي خلف باب الخدمة ومحبس السخان أسفل الوحدة',
        now,
        now,
      );
      insAsset.run(
        'hfa-karim-4',
        'المطبخ | Kitchen',
        'measurement',
        'مقاس قرصة رخام الكوارتز وفتحة البوتاجاز البلت إن',
        'Kitchen Quartz Counter & Built-In Hob Cutout',
        '245cm × 60cm × 2cm',
        'El Khaleej Marble',
        'مقاس البوتاجاز البلت إن الصافي 56×49 سم',
        now,
        now,
      );

      // Maintenance Reminders (1 overdue, 1 due_soon, 2 upcoming relative to today)
      const insRem = db.prepare(
        `INSERT OR IGNORE INTO maintenance_reminders (
          id, user_id, system_category, title_ar, title_en, interval_months, next_due_date, last_completed_at, status, estimated_cost_egp, vendor_category_slug, notes, created_at, updated_at
        ) VALUES (?, 'usr-1', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      const dueOverdue = offsetIsoDate(-12);
      const dueSoon = offsetIsoDate(5);
      const dueUpcoming1 = offsetIsoDate(45);
      const dueUpcoming2 = offsetIsoDate(150);

      insRem.run(
        'mrem-karim-1',
        'ac_service',
        'صيانة وغسيل فلاتر التكييف وفحص الفريون',
        'Seasonal AC Coil Cleaning & Freon Check',
        6,
        dueOverdue,
        offsetIsoDate(-195),
        computeMaintenanceDueStatus(dueOverdue),
        650,
        'home_maintenance',
        'قبل موسم الحر في الريسبشن وغرفة النوم الرئيسية',
        now,
        now,
      );
      insRem.run(
        'mrem-karim-2',
        'appliance_filter',
        'تغيير شمعات فلتر المياه الـ 3 الأولية',
        'Replace Stages 1-3 RO Water Filter Cartridges',
        3,
        dueSoon,
        offsetIsoDate(-85),
        computeMaintenanceDueStatus(dueSoon),
        480,
        'home_maintenance',
        'شمعات 5 ميكرون + كربون نشط + بلوك كربوني',
        now,
        now,
      );
      insRem.run(
        'mrem-karim-3',
        'water_heater',
        'فحص صمام الأمان وعمود المغنيسيوم للسخان',
        'Water Heater Anode Rod & Safety Valve Inspection',
        12,
        dueUpcoming1,
        offsetIsoDate(-320),
        computeMaintenanceDueStatus(dueUpcoming1),
        450,
        'home_maintenance',
        'مراجعة توصيل الغاز / الكهرباء قبل الشتاء',
        now,
        now,
      );
      insRem.run(
        'mrem-karim-4',
        'plumbing_check',
        'فحص محابس الدفن وسيلكون أحواض المطبخ والحمام',
        'Concealed Valve & Sink Silicone Re-Seal Audit',
        6,
        dueUpcoming2,
        offsetIsoDate(-30),
        computeMaintenanceDueStatus(dueUpcoming2),
        350,
        'home_maintenance',
        'متابعة سنوية للوقاية من تسرب المياه للأخشاب',
        now,
        now,
      );

      // Home Inventory Ledger
      const insInv = db.prepare(
        `INSERT OR IGNORE INTO home_inventory_items (
          id, user_id, room_label, item_name, brand_model, purchase_date, purchase_price_egp, warranty_expiry_date, condition, notes, created_at, updated_at
        ) VALUES (?, 'usr-1', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      insInv.run(
        'hinv-karim-1',
        'المطبخ | Kitchen',
        'ثلاجة شارب إنفرتر 536 لتر ديجيتال',
        'Sharp SJ-PC58A-ST Inverter',
        offsetIsoDate(-90),
        36900,
        offsetIsoDate(3560),
        'new',
        'تفعيل ضمان العربي 10 سنوات عند التركيب الرسمي',
        now,
        now,
      );
      insInv.run(
        'hinv-karim-2',
        'الحمام / التجهيز | Utility',
        'غسالة إل جي 9 كيلو Direct Drive',
        'LG F4V3TYP6W 9KG Steam',
        offsetIsoDate(-80),
        24500,
        offsetIsoDate(1745),
        'new',
        'ضمان الموتور المباشر 10 سنوات + الفاتورة الضريبية محفوظة',
        now,
        now,
      );
      insInv.run(
        'hinv-karim-3',
        'الريسبشن | Living Room',
        'تكييف تورنيدو 2.25 حصان إنفرتر بارد/ساخن',
        'Tornado TH-C18YEE Inverter',
        offsetIsoDate(-75),
        29800,
        offsetIsoDate(1750),
        'good',
        'تم تركيب الحوامل مع عزل مواسير النحاس بالبلاك ارمفليكس',
        now,
        now,
      );
      insInv.run(
        'hinv-karim-4',
        'غرفة المعيشة | Living Room',
        'ركنة مودرن زان أحمر وقماش ووتر بروف',
        'Custom Beech Wood 260×185cm',
        offsetIsoDate(-45),
        22000,
        offsetIsoDate(320),
        'good',
        'قماش مقلوب معالج ضد البقع + شلتت فايبر سوفت',
        now,
        now,
      );
    }

    db.exec('COMMIT;');
    return {
      seeded:
        needsStage1 ||
        needsStage2 ||
        needsStage3 ||
        needsStage4 ||
        needsStage5 ||
        needsStage6 ||
        needsBaseProductSlugFix ||
        needsStage7 ||
        needsExtraLocs ||
        needsStage8 ||
        needsStage9 ||
        needsStage10 ||
        needsStage11,
      stage2Seeded: needsStage2,
      stage3Seeded: needsStage3,
      stage4Seeded: needsStage4,
      stage5Seeded: needsStage5,
      stage6Seeded: needsStage6,
      stage7Seeded: needsStage7,
      stage8Seeded: needsStage8,
      stage9Seeded: needsStage9,
      stage10Seeded: needsStage10,
      stage11Seeded: needsStage11,
    };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}
