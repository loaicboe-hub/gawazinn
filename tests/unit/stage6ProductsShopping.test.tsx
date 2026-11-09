// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../../src/context/AppContext';
import { ProductsEncyclopediaView } from '../../src/components/products/ProductsEncyclopediaView';
import { ProductCompareView } from '../../src/components/products/ProductCompareView';
import { ProductDetailPageView } from '../../src/components/products/ProductDetailPageView';
import { ShoppingListsView } from '../../src/components/products/ShoppingListsView';
import { initialBrideProducts, initialGroomProducts } from '../../shared/catalogSeedData';
import {
  PRODUCT_ENCYCLOPEDIA_EXTENSIONS,
  STAGE6_ADDITIONAL_PRODUCTS,
  buildSeedPriceHistoryAndOffers,
  compareProductsAnalysis,
} from '../../shared/productEncyclopediaData';

const initialProducts = [...initialGroomProducts, ...initialBrideProducts];

describe('Stage 6 Product Encyclopedia, Comparison Matrix & Shopping Baskets', () => {
  it('enriches all 11 base products, adds 8 encyclopedia products with real specs & builds honest gray-market caveats', () => {
    for (const base of initialProducts) {
      const ext = PRODUCT_ENCYCLOPEDIA_EXTENSIONS[base.id];
      expect(ext, `Missing Stage 6 extension for ${base.id}`).toBeDefined();
      expect(ext.warrantyMonths).toBeGreaterThanOrEqual(6);
      expect(ext.prosAr.length).toBeGreaterThanOrEqual(2);
      expect(ext.consAr.length).toBeGreaterThanOrEqual(2);
      expect(ext.buyerWarningsAr.length).toBeGreaterThanOrEqual(1);
    }

    expect(STAGE6_ADDITIONAL_PRODUCTS.length).toBe(8);
    const allProducts = [
      ...initialProducts.map((p) => ({ ...p, ...PRODUCT_ENCYCLOPEDIA_EXTENSIONS[p.id] })),
      ...STAGE6_ADDITIONAL_PRODUCTS,
    ];
    expect(allProducts.length).toBe(19);

    for (const p of STAGE6_ADDITIONAL_PRODUCTS) {
      expect(p.slug).toBeTruthy();
      expect(p.imageUrl.startsWith('https://images.unsplash.com/')).toBe(true);
      expect(p.prosEn && p.prosEn.length).toBeGreaterThanOrEqual(2);
      expect(p.consEn && p.consEn.length).toBeGreaterThanOrEqual(2);
      expect(p.buyerWarningsEn && p.buyerWarningsEn.length).toBeGreaterThanOrEqual(1);
    }

    const { priceHistory, merchantOffers, alternatives } = buildSeedPriceHistoryAndOffers(allProducts);
    expect(priceHistory.filter((pt) => pt.productId === 'groom-p1').length).toBeGreaterThanOrEqual(3);

    const sharpOffers = merchantOffers.filter((o) => o.productId === 'groom-p1');
    expect(sharpOffers.some((o) => o.warrantyType === 'official_agent')).toBe(true);
    expect(sharpOffers.some((o) => o.warrantyType === 'gray_market_importer')).toBe(true);

    expect(alternatives.some((a) => a.productId === 'groom-p1' && a.alternativeProductId === 'groom-p7')).toBe(true);
    expect(alternatives.some((a) => a.productId === 'groom-p1' && a.alternativeProductId === 'groom-p8')).toBe(true);
  });

  it('computes accurate side-by-side comparison highlights and unified spec keys', () => {
    const allProducts = [
      ...initialProducts.map((p) => ({ ...p, ...PRODUCT_ENCYCLOPEDIA_EXTENSIONS[p.id] })),
      ...STAGE6_ADDITIONAL_PRODUCTS,
    ];
    const trio = allProducts.filter((p) => ['groom-p1', 'groom-p7', 'groom-p8'].includes(p.id));
    expect(trio.length).toBe(3);

    const comparison = compareProductsAnalysis(trio, {});
    expect(comparison.highlights.lowestPriceProductId).toBe('groom-p7'); // 23,900 < 36,500 < 54,900
    expect(comparison.highlights.bestEnergyProductId).toBe('groom-p8'); // A++ > A+
    expect(comparison.highlights.bestWarrantyValueProductId).toBe('groom-p7'); // lowest EGP per warranty yr
    expect(comparison.unifiedSpecKeysAr.length).toBeGreaterThan(0);
    expect(comparison.unifiedSpecKeysEn.length).toBeGreaterThan(0);
  });

  it('renders Stage 6 views cleanly for guests with explicit auth prompts on private shopping baskets', () => {
    render(
      <MemoryRouter initialEntries={['/products']}>
        <AppProvider>
          <Routes>
            <Route path="/products" element={<ProductsEncyclopediaView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('product-encyclopedia-grid')).toBeInTheDocument();
    expect(screen.getByTestId('product-type-filter-groom')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/products/compare?ids=groom-p1,groom-p7']}>
        <AppProvider>
          <Routes>
            <Route path="/products/compare" element={<ProductCompareView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('product-compare-matrix')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/products/groom-p1']}>
        <AppProvider>
          <Routes>
            <Route path="/products/:idOrSlug" element={<ProductDetailPageView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('price-history-chart')).toBeInTheDocument();
    expect(screen.getByTestId('merchant-offers-table')).toBeInTheDocument();
    expect(screen.getByTestId('price-alert-form')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/my/shopping-lists']}>
        <AppProvider>
          <Routes>
            <Route path="/my/shopping-lists" element={<ShoppingListsView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('shopping-signin-btn')).toBeInTheDocument();
    cleanup();
  });
});
