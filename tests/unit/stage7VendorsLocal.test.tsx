// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../../src/context/AppContext';
import { VendorDirectoryView } from '../../src/components/vendors/VendorDirectoryView';
import { VendorProfileView } from '../../src/components/vendors/VendorProfileView';
import { VendorPortalView } from '../../src/components/vendors/VendorPortalView';
import { LocalDiscoveryView } from '../../src/components/discovery/LocalDiscoveryView';
import {
  EXTRA_EGYPTIAN_LOCATIONS,
  STAGE7_VENDORS_SEED,
  SUBSCRIPTION_PLANS_SEED,
  VENDOR_CATEGORIES_SEED,
} from '../../shared/vendorMarketplaceData';

describe('Stage 7 Vendor Marketplace, Local SEO & Governance', () => {
  it('provides all 17 categories across 5 domains, 12 extra Egyptian locations & 18 honest zero-rating vendors', () => {
    expect(VENDOR_CATEGORIES_SEED.length).toBe(17);
    const domains = new Set(VENDOR_CATEGORIES_SEED.map((c) => c.domain));
    expect(domains).toEqual(new Set(['finishing', 'groom', 'bride', 'wedding', 'post_marriage']));

    for (const cat of VENDOR_CATEGORIES_SEED) {
      expect(cat.buyerChecklistAr.length).toBeGreaterThanOrEqual(3);
      expect(cat.buyerChecklistEn.length).toBeGreaterThanOrEqual(3);
    }

    expect(EXTRA_EGYPTIAN_LOCATIONS.length).toBe(12);
    expect(SUBSCRIPTION_PLANS_SEED.map((p) => p.code)).toEqual([
      'free',
      'basic',
      'professional',
      'premium',
    ]);

    expect(STAGE7_VENDORS_SEED.length).toBe(18);
    const coveredCats = new Set(STAGE7_VENDORS_SEED.map((v) => v.primaryCategorySlug));
    for (const cat of VENDOR_CATEGORIES_SEED) {
      expect(coveredCats.has(cat.slug), `Category ${cat.slug} has no seed vendor`).toBe(true);
    }

    // Strict integrity: all seed vendors start with zero fake reviews/ratings
    for (const v of STAGE7_VENDORS_SEED) {
      expect(v.ratingAvg).toBe(0);
      expect(v.reviewsCount).toBe(0);
    }

    // Verify governance test case: Pro commercial vendor starts unverified ('registered')
    const zayedArch = STAGE7_VENDORS_SEED.find((v) => v.id === 'vnd-zayed-arch');
    expect(zayedArch?.subscriptionPlanCode).toBe('professional');
    expect(zayedArch?.verificationStatus).toBe('registered');
  });

  it('renders /vendors, /vendors/:slug, /locations/:govSlug/:catSlug & guest /vendor cleanly with honest ratings', () => {
    render(
      <MemoryRouter initialEntries={['/vendors?category=turnkey_finishing']}>
        <AppProvider>
          <Routes>
            <Route path="/vendors" element={<VendorDirectoryView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('vendors-directory-grid')).toBeInTheDocument();
    expect(screen.getByTestId('vendor-category-checklist-card')).toBeInTheDocument();
    expect(screen.getByTestId('vendor-card-el-rowad-contracting')).toBeInTheDocument();
    expect(screen.getAllByTestId('honest-rating-empty').length).toBeGreaterThanOrEqual(1);
    cleanup();

    render(
      <MemoryRouter initialEntries={['/vendors/el-rowad-contracting']}>
        <AppProvider>
          <Routes>
            <Route path="/vendors/:slug" element={<VendorProfileView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('vendor-profile-heading')).toBeInTheDocument();
    expect(screen.getByTestId('vendor-reviews-section')).toBeInTheDocument();
    expect(screen.getAllByTestId('honest-rating-empty').length).toBeGreaterThanOrEqual(1);
    cleanup();

    render(
      <MemoryRouter initialEntries={['/locations/cairo/turnkey_finishing']}>
        <AppProvider>
          <Routes>
            <Route path="/locations/:govSlug/:catSlug" element={<LocalDiscoveryView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('local-guide-heading')).toBeInTheDocument();
    expect(screen.getByTestId('local-category-checklist')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/vendor']}>
        <AppProvider>
          <Routes>
            <Route path="/vendor" element={<VendorPortalView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('vendor-portal-unauth')).toBeInTheDocument();
    expect(screen.getByTestId('vendor-portal-signin-btn')).toBeInTheDocument();
    cleanup();
  });
});

