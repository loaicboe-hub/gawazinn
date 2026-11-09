import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

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
  const { language, articles, locations } = useApp();
  const { pathname } = useLocation();

  useEffect(() => {
    const isPrivate = pathname.startsWith('/portal') || pathname.startsWith('/my') || pathname.startsWith('/admin');
    const cleanPath = pathname === '/' ? '' : pathname;
    const canonicalUrl = `${BASE_ORIGIN}${cleanPath}`;

    let titleAr = 'جواز إن | GAWAZ INN — من أول الشقة.. لحد ليلة العمر';
    let titleEn = 'GAWAZ INN — Marriage, Home & Wedding Planning Ecosystem in Egypt';
    let descAr =
      'المنصة الوطنية المتكاملة لتجهيز عش الزوجية في مصر: تشطيب الشقة، جهاز العريس، جهاز العروسة، تنظيم الفرح، وحلول التخطيط والموسوعة.';
    let descEn =
      "Egypt's unified marriage & home planning ecosystem: apartment finishing, groom & bride trousseau, wedding planning, local guides & budgeting.";

    const articleMatch = pathname.match(/^\/guides\/([^/]+)$/);
    const locMatch = pathname.match(/^\/locations\/([^/]+)$/);

    if (pathname === '/finishing') {
      titleAr = 'تشطيب الشقة والباقات الهندسية | جواز إن';
      titleEn = 'Apartment Finishing Packages & Cost Guide | GAWAZ INN';
    } else if (pathname === '/groom') {
      titleAr = 'جهاز العريس والأجهزة والأثاث | جواز إن';
      titleEn = "Groom's Essentials, Appliances & Furniture | GAWAZ INN";
    } else if (pathname === '/bride') {
      titleAr = 'جهاز العروسة وقائمة التجهيز | جواز إن';
      titleEn = "Bride's Trousseau & Cookware Checklist | GAWAZ INN";
    } else if (pathname === '/wedding') {
      titleAr = 'فرحي — قاعات وخدمات الزفاف | جواز إن';
      titleEn = 'Farahi — Wedding Venues & Services Planner | GAWAZ INN';
    } else if (pathname === '/installments') {
      titleAr = 'حلول التقسيط والتمويل | جواز إن';
      titleEn = 'Installment & Financing Solutions | GAWAZ INN';
    } else if (pathname === '/social-support') {
      titleAr = 'مبادرة جواز إن للدعم المجتمعي | جواز إن';
      titleEn = 'GAWAZ INN Community Support Initiative';
    } else if (pathname.startsWith('/encyclopedia')) {
      titleAr = 'موسوعة جواز إن للتشطيب والزواج | جواز إن';
      titleEn = 'GAWAZ INN Marriage & Home Encyclopedia';
    } else if (pathname === '/discover') {
      titleAr = 'دليل المحافظات والمناطق في مصر | جواز إن';
      titleEn = 'Discover Finishing & Wedding Services Across Egypt | GAWAZ INN';
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

    scriptEl.textContent = JSON.stringify([ldOrg, ldBreadcrumbs]);
  }, [pathname, language, articles, locations]);

  return null;
};

