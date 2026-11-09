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
import { maskNationalId } from '../shared/catalogMeta';
import { hashPassword, hashSensitiveField } from './security';

export function seedDatabase(db: DatabaseSync, secret = 'gawazinn-dev-local-secret-change-in-production'): { seeded: boolean } {
  const userCountRow = db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number };
  if (userCountRow.cnt > 0) {
    return { seeded: false };
  }

  const now = new Date().toISOString();

  db.exec('BEGIN;');
  try {
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

    // 3. Content Categories
    const insertCat = db.prepare(
      `INSERT INTO content_categories (id, slug, domain, parent_id, name_ar, name_en, description_ar, description_en, icon_name, sort_order)
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

    // 4. CMS Articles
    const insertArt = db.prepare(
      `INSERT INTO articles (id, slug, category_id, domain, content_type, title_ar, title_en, excerpt_ar, excerpt_en, body_ar, body_en, featured_image, author_id, author_name, tags_json, faq_json, related_calculators_json, seo_title_ar, seo_title_en, meta_desc_ar, meta_desc_en, status, reading_minutes, view_count, is_featured, published_at, updated_at, created_at)
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

    db.exec('COMMIT;');
    return { seeded: true };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}
