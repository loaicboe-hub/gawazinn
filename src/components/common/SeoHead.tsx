import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getCalculatorSummary } from '../../../shared/calculators';

const BASE_ORIGIN = 'https://gawazinn.vercel.app';

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string, hreflang?: string): void {
  const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export const SeoHead: React.FC = () => {
  const { language, articles, locations, products, vendors, vendorCategories } = useApp();
  const { pathname } = useLocation();

  useEffect(() => {
    const isPrivate =
      pathname.startsWith('/portal') ||
      pathname.startsWith('/my') ||
      pathname.startsWith('/rfq') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/wedding-day') ||
      pathname.startsWith('/rsvp') ||
      pathname === '/vendor' ||
      pathname.startsWith('/vendor/');
    const cleanPath = pathname === '/' ? '' : pathname;
    const canonicalUrl = `${BASE_ORIGIN}${cleanPath}`;

    let titleAr = 'جواز إن | GAWAZ INN — من أول الشقة.. لحد ليلة العمر';
    let titleEn = 'GAWAZ INN — Marriage, Home & Wedding Planning Ecosystem in Egypt';
    let descAr =
      'المنصة الوطنية المتكاملة لتجهيز عش الزوجية في مصر: تشطيب الشقة، جهاز العريس، جهاز العروسة، تنظيم الفرح، وحلول التخطيط والموسوعة.';
    let descEn =
      "Egypt's unified marriage & home planning ecosystem: apartment finishing, groom & bride trousseau, wedding planning, local guides & budgeting.";

    const articleMatch = pathname.match(/^\/guides\/([^/]+)$/);
    const locCatMatch = pathname.match(/^\/locations\/([^/]+)\/([^/]+)$/);
    const locMatch = pathname.match(/^\/locations\/([^/]+)$/);
    const calcMatch = pathname.match(/^\/calculators\/([^/]+)$/);
    const productMatch = pathname.match(/^\/products\/([^/]+)$/);
    const vendorMatch = pathname.match(/^\/vendors\/([^/]+)$/);

    if (pathname === '/finishing') {
      titleAr = 'تشطيب الشقة والباقات الهندسية | جواز إن';
      titleEn = 'Apartment Finishing Packages & Cost Guide | GAWAZ INN';
    } else if (pathname === '/finishing/encyclopedia') {
      titleAr = 'موسوعة تشطيب الشقق — 22 مرحلة هندسية | جواز إن';
      titleEn = '22-Step Apartment Finishing Encyclopedia | GAWAZ INN';
      descAr = 'الدليل الهندسي الشامل لتشطيب الشقق في مصر على 22 بنداً من الرفع المساحي وحتى التسليم النهائي.';
      descEn = 'Step-by-step Egyptian apartment finishing guide across all 22 stages, inspections & materials.';
    } else if (pathname === '/finishing/materials') {
      titleAr = 'دليل ومواصفات وأسعار خامات التشطيب في مصر | جواز إن';
      titleEn = 'Finishing Materials Encyclopedia & EGP Cost Guide | GAWAZ INN';
      descAr = 'مقارنة البورسلين والسيراميك ومواسير السباكة وأسلاك السويدي والدهانات والعزل في السوق المصري.';
      descEn = 'Compare Egyptian finishing materials: porcelain vs. ceramic, PP-R pipes, copper wiring, paints & waterproofing.';
    } else if (pathname === '/finishing/contractors') {
      titleAr = 'دليل المقاولين والمهندسين المعتمدين | جواز إن';
      titleEn = 'Verified Finishing Contractors & Engineers Directory | GAWAZ INN';
    } else if (pathname === '/groom') {
      titleAr = 'جهاز العريس والأجهزة والأثاث | جواز إن';
      titleEn = "Groom's Essentials, Appliances & Furniture | GAWAZ INN";
    } else if (pathname === '/groom/encyclopedia') {
      titleAr = 'موسوعة جهاز العريس — 26 دليلاً للأجهزة والأثاث | جواز إن';
      titleEn = "Groom's 26-Category Appliances & Furniture Encyclopedia | GAWAZ INN";
    } else if (pathname === '/bride') {
      titleAr = 'جهاز العروسة وقائمة التجهيز | جواز إن';
      titleEn = "Bride's Trousseau & Cookware Checklist | GAWAZ INN";
    } else if (pathname === '/bride/encyclopedia') {
      titleAr = 'موسوعة جهاز العروسة — 19 قسماً وتوزيع الميزانية | جواز إن';
      titleEn = "Bride's 19-Category Zero-Waste Trousseau Encyclopedia | GAWAZ INN";
    } else if (pathname === '/wedding') {
      titleAr = 'فرحي — قاعات وخدمات الزفاف | جواز إن';
      titleEn = 'Farahi — Wedding Venues & Services Planner | GAWAZ INN';
    } else if (pathname === '/installments') {
      titleAr = 'حلول التقسيط والتمويل | جواز إن';
      titleEn = 'Installment & Financing Solutions | GAWAZ INN';
    } else if (pathname === '/social-support') {
      titleAr = 'مبادرة جواز إن للدعم المجتمعي | جواز إن';
      titleEn = 'GAWAZ INN Community Support Initiative';
    } else if (pathname === '/glossary') {
      titleAr = 'قاموس مصطلحات التشطيب والزواج | جواز إن';
      titleEn = 'Egyptian Marriage & Home Glossary | GAWAZ INN';
    } else if (pathname === '/faqs') {
      titleAr = 'الأسئلة الشائعة حول التشطيب والتجهيز والفرح | جواز إن';
      titleEn = 'Frequently Asked Questions — Home Finishing & Marriage | GAWAZ INN';
    } else if (pathname.startsWith('/encyclopedia')) {
      titleAr = 'موسوعة جواز إن للتشطيب والزواج | جواز إن';
      titleEn = 'GAWAZ INN Marriage & Home Encyclopedia';
    } else if (pathname === '/discover') {
      titleAr = 'دليل المحافظات والمناطق في مصر | جواز إن';
      titleEn = 'Discover Finishing & Wedding Services Across Egypt | GAWAZ INN';
    } else if (pathname === '/calculators') {
      titleAr = 'محرك الحاسبات الذكية للزواج وتشطيب الشقة (20 حاسبة) | جواز إن';
      titleEn = '20 Smart Marriage, Apartment Finishing & Budget Calculators | GAWAZ INN';
      descAr =
        'احسب بدقة تكلفة تشطيب الشقة، كميات السيراميك والدهان، المطبخ، جهاز العريس والعروسة، الشبكة، الفرح، القسط والادخار.';
      descEn =
        'Calculate Egyptian apartment finishing, tile & paint quantities, kitchen per-meter cost, groom & bride trousseau, wedding, and savings.';
    } else if (calcMatch) {
      const slug = decodeURIComponent(calcMatch[1]);
      const calc = getCalculatorSummary(slug);
      if (calc) {
        titleAr = `${calc.nameAr} | حاسبات جواز إن الذكية`;
        titleEn = `${calc.nameEn} | GAWAZ INN Smart Calculators`;
        descAr = calc.shortDescAr.slice(0, 158);
        descEn = calc.shortDescEn.slice(0, 158);
      }
    } else if (pathname.startsWith('/my/budget')) {
      titleAr = 'مدير ميزانية الزواج والمصروفات | جواز إن';
      titleEn = 'Personal Wedding & Home Budget Manager | GAWAZ INN';
    } else if (pathname === '/early-start') {
      titleAr = 'جواز إن البداية المبكرة — خطط واستعد قبل الزواج حتى 10 سنوات';
      titleEn = 'GAWAZ INN Early Start — Prepare for Marriage 6m to 10y Ahead';
      descAr =
        'ابدأ التخطيط المالي الشخصي وصندوق مستقبلك قبل الخطوبة بمرونة من 6 أشهر إلى 10 سنوات مع محاكي ماذا لو وأكاديمية الوعي المالي.';
      descEn =
        'Start financial & marriage preparation 6 months to 10 years ahead with What-If scenarios, 7 savings buckets, and Early Start Academy.';
    } else if (pathname === '/early-start/academy') {
      titleAr = 'أكاديمية البداية المبكرة للوعي المالي والاستعداد للبيت | جواز إن';
      titleEn = 'Early Start Academy — Financial Literacy & Housing Readiness | GAWAZ INN';
    } else if (pathname.startsWith('/my/future-fund')) {
      titleAr = 'صندوق مستقبلي الشخصي | جواز إن';
      titleEn = 'My Future Fund — Private Savings Goals | GAWAZ INN';
    } else if (pathname === '/onboarding') {
      titleAr = 'مسارك في جواز إن — 11 مرحلة من التفكير حتى البيت | جواز إن';
      titleEn = '11-Stage Marriage & Home Lifecycle Onboarding | GAWAZ INN';
      descAr =
        'حدد مرحلتك الحالية من 11 مرحلة دون فقدان أي بيانات سابقة: من البداية المبكرة للخطوبة وتشطيب الشقة والزفاف وما بعد الزواج.';
      descEn =
        'Pick your current marriage preparation stage across 11 adaptive milestones with zero loss of prior savings or plans.';
    } else if (pathname === '/engagement' || pathname.startsWith('/my/engagement')) {
      titleAr = 'مخطط الخطوبة والشبكة وتنسيق العائلتين | جواز إن';
      titleEn = 'Engagement Readiness Planner: Shabka, Guests & Venue | GAWAZ INN';
    } else if (pathname === '/journey' || pathname.startsWith('/my/journey')) {
      titleAr = 'مخطط رحلة الزواج والجدول الزمني التفاعلي | جواز إن';
      titleEn = 'Interactive 10-Phase Wedding Journey Planner & Calendar | GAWAZ INN';
    } else if (pathname.startsWith('/my/workspace')) {
      titleAr = 'مركز قيادة جواز إن ومساحة الزوجين المشتركة | جواز إن';
      titleEn = 'My Gawaz Inn 17-Module Hub & Shared Couple Workspace | GAWAZ INN';
    } else if (pathname === '/products') {
      titleAr = 'موسوعة المنتجات والأسعار والمواصفات الفنية | جواز إن';
      titleEn = 'Egyptian Home & Marriage Product Encyclopedia & Price History | GAWAZ INN';
      descAr =
        'قارن مواصفات الأجهزة والأثاث والمطبخ في مصر، اقرأ تحذيرات المشتري، وتابع تاريخ الأسعار وضمان الوكيل مقابل السوق الموازي.';
      descEn =
        'Compare Egyptian appliances, furniture & kitchenware specs, historical EGP pricing, and official agent vs. gray-market warranties.';
    } else if (pathname === '/products/compare') {
      titleAr = 'مصفوفة مقارنة المنتجات والأسعار جنباً إلى جنب | جواز إن';
      titleEn = 'Side-by-Side Product & Specification Comparison Matrix | GAWAZ INN';
    } else if (productMatch && productMatch[1] !== 'compare') {
      const slugOrId = decodeURIComponent(productMatch[1]);
      const prod = products.find((p) => p.slug === slugOrId || p.id === slugOrId);
      if (prod) {
        titleAr = `${prod.nameAr} — السعر والمواصفات وتاريخ السعر | جواز إن`;
        titleEn = `${prod.nameEn} — Specs, Merchant Offers & Price History | GAWAZ INN`;
        descAr = prod.descriptionAr.slice(0, 158);
        descEn = prod.descriptionEn.slice(0, 158);
      }
    } else if (pathname.startsWith('/my/shopping-lists')) {
      titleAr = 'سلال المشتريات وتنبيهات الأسعار | جواز إن';
      titleEn = 'Multi-List Shopping Baskets & Price Alerts | GAWAZ INN';
    } else if (pathname.startsWith('/portal')) {
      titleAr = 'بوابة طلباتي ومتابعاتي | جواز إن';
      titleEn = 'My Unified Requests Portal | GAWAZ INN';
    } else if (pathname.startsWith('/admin')) {
      titleAr = 'لوحة الإدارة المركزية | جواز إن';
      titleEn = 'Admin OS Dashboard | GAWAZ INN';
    } else if (articleMatch) {
      const slug = decodeURIComponent(articleMatch[1]);
      const art = articles.find((a) => a.slug === slug);
      if (art) {
        titleAr = `${art.titleAr} | موسوعة جواز إن`;
        titleEn = `${art.titleEn} | GAWAZ INN Guide`;
        descAr = art.excerptAr.slice(0, 158);
        descEn = art.excerptEn.slice(0, 158);
      }
    } else if (pathname === '/vendors') {
      titleAr = 'دليل الشركاء والموردين الموثقين (17 تصنيفاً) | جواز إن';
      titleEn = 'Vetted Vendors & Partners Directory (17 Categories) | GAWAZ INN';
      descAr =
        'تصفح مقاولي التشطيب، معارض الأثاث والأجهزة، الأتيليهات، قاعات الزفاف، وخدمات ما بعد الزواج في مصر مع شارات توثيق مستقلة وتقييمات حقيقية فقط.';
      descEn =
        'Browse finishing contractors, furniture & appliance showrooms, bridal ateliers, wedding venues, and home-care partners across Egypt with audit-only badges.';
    } else if (pathname === '/real-weddings') {
      titleAr = 'قصص زفاف حقيقية وميزانيات التجهيز في مصر | جواز إن';
      titleEn = 'Real Egyptian Wedding Stories & Actual Budget Breakdowns | GAWAZ INN';
      descAr =
        'استعرض تجارب حقيقية للأزواج وتكاليف التشطيب والجهاز والفرح في المحافظات مع الدروس المستفادة ومراجعة المشرفين.';
      descEn =
        'Explore real moderated Egyptian couple case studies with itemized finishing, trousseau & wedding budgets.';
    } else if (pathname === '/community') {
      titleAr = 'مجتمع جواز إن للأسئلة والأجوبة واستشارات الخبراء | جواز إن';
      titleEn = 'GAWAZ INN Q&A Community & Verified Advisor Threads | GAWAZ INN';
      descAr =
        'اطرح سؤالك حول التشطيب أو الجهاز أو الفرح أو الادخار المبكر واحصل على إجابات من أزواج مجربين وخبراء معتمدين.';
      descEn =
        'Ask questions about Egyptian apartment finishing, trousseau, wedding contracts & savings—with verified expert replies.';
    } else if (pathname === '/experts') {
      titleAr = 'دليل الخبراء والمستشارين المعتمدين | جواز إن';
      titleEn = 'Verified Experts & Marriage Planning Advisors Directory | GAWAZ INN';
      descAr =
        'مهندسو تشطيب، مخططو ميزانيات، ومستشارو زواج مفحوصو المؤهلات إدارياً في مصر.';
      descEn =
        'Admin-verified Egyptian finishing engineers, marriage financial coaches, and bridal trousseau specialists.';
    } else if (pathname === '/assistant') {
      titleAr = 'مستشار جواز إن الذكي الموثق من قاعدة البيانات | جواز إن';
      titleEn = 'Grounded AI Marriage & Home Planning Advisor | GAWAZ INN';
      descAr =
        'اسأل عن أسعار المنتجات الحقيقية، تكاليف تشطيب الشقق في مصر، وحسابات التجهيز والزفاف بمصادر موثقة من المنصة.';
      descEn =
        'Ask grounded questions backed by live Egyptian product prices, finishing calculators, and vetted vendor records.';
    } else if (pathname === '/room-designer') {
      titleAr = 'مصمم الغرف 2D ولوحات الإلهام بالأسعار الحقيقية | جواز إن';
      titleEn = '2D Smart Room Designer & Priced Moodboards | GAWAZ INN';
      descAr =
        'ارسم أبعاد غرف شقتك، رتب الأثاث والأجهزة والخامات على شبكة 2D، واحسب إجمالي التكلفة الحقيقية من الكتالوج.';
      descEn =
        'Plan apartment room dimensions, place furniture & appliances on a 2D canvas, and pin live catalog prices.';
    } else if (pathname === '/wedding-day') {
      titleAr = 'إدارة يوم الفرح والضيوف والطاولات والهدايا | جواز إن';
      titleEn = 'Wedding Day Operations: Guests, Seating, Timeline & Gift Registry | GAWAZ INN';
    } else if (pathname.startsWith('/rsvp/')) {
      titleAr = 'تأكيد حضور الفرح وقائمة الهدايا | جواز إن';
      titleEn = 'Wedding Invitation RSVP & Gift Registry | GAWAZ INN';
    } else if (vendorMatch) {
      const slugOrId = decodeURIComponent(vendorMatch[1]);
      const vnd = vendors.find((v) => v.slug === slugOrId || v.id === slugOrId);
      if (vnd) {
        titleAr = `${vnd.businessNameAr} | دليل شركاء جواز إن`;
        titleEn = `${vnd.businessNameEn} | GAWAZ INN Vendors`;
        descAr = vnd.bioAr.slice(0, 158);
        descEn = vnd.bioEn.slice(0, 158);
      }
    } else if (pathname === '/vendor' || pathname.startsWith('/vendor/')) {
      titleAr = 'بوابة الشركاء وإدارة الخدمات والباقات | جواز إن';
      titleEn = 'Vendor Partner Portal — Services, Promos & Subscriptions | GAWAZ INN';
    } else if (pathname === '/rfq' || pathname.startsWith('/rfq/')) {
      titleAr = 'مركز طلبات التسعير والمواعيد (RFQ) | جواز إن';
      titleEn = 'Multi-Vendor RFQ Center & Slot Appointments | GAWAZ INN';
      descAr =
        'اطلب عروض أسعار من عدة شركاء في تخصصك وقارنها بوضوح مع سرية تامة وربط مباشر بميزانية الزواج.';
      descEn =
        'Submit multi-vendor RFQs, compare sealed quotations side-by-side, book slot appointments, and sync winning quotes into your Wedding Budget Manager.';
    } else if (locCatMatch) {
      const govSlug = decodeURIComponent(locCatMatch[1]);
      const catSlug = decodeURIComponent(locCatMatch[2]);
      const loc = locations.find((l) => l.slug === govSlug);
      const cat = vendorCategories.find((c) => c.slug === catSlug);
      if (loc && cat) {
        titleAr = `${cat.nameAr} في ${loc.nameAr} — دليل جواز إن المحلي`;
        titleEn = `${cat.nameEn} in ${loc.nameEn} — GAWAZ INN Local Guide`;
        descAr = `${cat.summaryAr} — استعرض الشركاء الموثقين وقائمة التحقق قبل التعاقد ومؤشر الأسعار في ${loc.nameAr}.`.slice(
          0,
          158,
        );
        descEn = `${cat.summaryEn} — Compare vetted partners, pre-contract checklists, and EGP benchmarks in ${loc.nameEn}.`.slice(
          0,
          158,
        );
      }
    } else if (locMatch) {
      const slug = decodeURIComponent(locMatch[1]);
      const loc = locations.find((l) => l.slug === slug);
      if (loc) {
        titleAr = `تجهيز الزواج وتشطيب الشقق في ${loc.nameAr} | جواز إن`;
        titleEn = `Apartment Finishing & Wedding Guide in ${loc.nameEn} | GAWAZ INN`;
        descAr = loc.summaryAr.slice(0, 158);
        descEn = loc.summaryEn.slice(0, 158);
      }
    }

    const activeTitle = language === 'ar' ? titleAr : titleEn;
    const activeDesc = language === 'ar' ? descAr : descEn;

    document.title = activeTitle;
    upsertMeta('name', 'description', activeDesc);
    upsertMeta('name', 'robots', isPrivate ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('property', 'og:title', activeTitle);
    upsertMeta('property', 'og:description', activeDesc);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:type', articleMatch ? 'article' : 'website');
    upsertMeta('property', 'og:locale', language === 'ar' ? 'ar_EG' : 'en_US');

    upsertLink('canonical', canonicalUrl);
    upsertLink('alternate', canonicalUrl, 'ar-EG');
    upsertLink('alternate', canonicalUrl, 'en');
    upsertLink('alternate', canonicalUrl, 'x-default');

    // JSON-LD Structured Data
    const schemaId = 'gawazinn-jsonld';
    let scriptEl = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = schemaId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const ldOrg = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'GAWAZ INN | جواز إن',
      url: BASE_ORIGIN,
      description: activeDesc,
      areaServed: { '@type': 'Country', name: 'Egypt' },
    };

    const ldBreadcrumbs = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: language === 'ar' ? 'الرئيسية' : 'Home', item: BASE_ORIGIN },
        ...(cleanPath
          ? [{ '@type': 'ListItem', position: 2, name: activeTitle, item: canonicalUrl }]
          : []),
      ],
    };

    const ldProduct =
      productMatch && productMatch[1] !== 'compare'
        ? (() => {
            const slugOrId = decodeURIComponent(productMatch[1]);
            const prod = products.find((p) => p.slug === slugOrId || p.id === slugOrId);
            if (!prod) return null;
            return {
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: language === 'ar' ? prod.nameAr : prod.nameEn,
              description: language === 'ar' ? prod.descriptionAr : prod.descriptionEn,
              sku: prod.sku,
              brand: { '@type': 'Brand', name: prod.brand },
              offers: {
                '@type': 'Offer',
                priceCurrency: 'EGP',
                price: prod.price,
                availability:
                  prod.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              },
            };
          })()
        : null;

    const ldVendor = vendorMatch
      ? (() => {
          const slugOrId = decodeURIComponent(vendorMatch[1]);
          const vnd = vendors.find((v) => v.slug === slugOrId || v.id === slugOrId);
          if (!vnd) return null;
          return {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: language === 'ar' ? vnd.businessNameAr : vnd.businessNameEn,
            description: language === 'ar' ? vnd.bioAr : vnd.bioEn,
            address: {
              '@type': 'PostalAddress',
              streetAddress: language === 'ar' ? vnd.addressAr : vnd.addressEn,
              addressCountry: 'EG',
            },
            telephone: vnd.phone,
            priceRange: `From ${vnd.startingPriceEgp.toLocaleString()} EGP`,
            ...(vnd.reviewsCount > 0
              ? {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: Number(vnd.ratingAvg.toFixed(1)),
                    reviewCount: vnd.reviewsCount,
                  },
                }
              : {}),
          };
        })()
      : null;

    scriptEl.textContent = JSON.stringify([
      ldOrg,
      ldBreadcrumbs,
      ...(ldProduct ? [ldProduct] : []),
      ...(ldVendor ? [ldVendor] : []),
    ]);
  }, [pathname, language, articles, locations, products, vendors, vendorCategories]);

  return null;
};

