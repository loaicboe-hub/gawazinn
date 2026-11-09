// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../../src/context/AppContext';
import { RfqCenterView } from '../../src/components/rfq/RfqCenterView';
import { VendorProfileView } from '../../src/components/vendors/VendorProfileView';
import { VendorPortalView } from '../../src/components/vendors/VendorPortalView';
import { VENDOR_CRM_STAGES, mapCategoryToBudgetBucket } from '../../server/rfqCrmService';
import { DEFAULT_BUDGET_CATEGORIES } from '../../shared/calculators';
import { VENDOR_CATEGORIES_SEED } from '../../shared/vendorMarketplaceData';
import {
  createMarketplaceAppointmentSchema,
  createRfqRequestSchema,
  createVendorLeadSchema,
  decideRfqQuoteSchema,
  submitRfqQuoteSchema,
} from '../../shared/schemas';

describe('Stage 8 Multi-Vendor RFQ, Slot Appointments & 8-Stage Vendor CRM', () => {
  it('defines all 8 canonical CRM stages & maps every 17 vendor categories into valid Wedding Budget buckets', () => {
    expect(VENDOR_CRM_STAGES).toEqual([
      'new_lead',
      'contacted',
      'quotation_sent',
      'negotiation',
      'accepted',
      'in_progress',
      'completed',
      'lost',
    ]);

    const validBudgetSlugs = new Set(DEFAULT_BUDGET_CATEGORIES.map((c) => c.slug));
    for (const cat of VENDOR_CATEGORIES_SEED) {
      const mapped = mapCategoryToBudgetBucket(cat.slug);
      expect(
        validBudgetSlugs.has(mapped.budgetSlug),
        `Category ${cat.slug} mapped to unknown budget bucket ${mapped.budgetSlug}`,
      ).toBe(true);
    }
  });

  it('enforces Stage 8 Zod input validation schemas cleanly', () => {
    expect(
      createRfqRequestSchema.safeParse({
        title: 'AB',
        categorySlug: 'turnkey_finishing',
        governorateSlug: 'cairo',
        scopeDetails: 'short',
      }).success,
    ).toBe(false);

    expect(
      createRfqRequestSchema.safeParse({
        title: 'تشطيب شقة 120 متر التجمع الخامس',
        categorySlug: 'turnkey_finishing',
        governorateSlug: 'cairo',
        budgetMin: 200000,
        budgetMax: 350000,
        scopeDetails: 'تشطيب كامل على الطوب الأحمر شامل الكهرباء والسباكة والدهانات.',
        preferredContact: 'platform',
      }).success,
    ).toBe(true);

    expect(
      submitRfqQuoteSchema.safeParse({
        quotedAmountEgp: 250000,
        depositAmountEgp: 35000,
        estimatedDuration: '60 يوم',
        warrantyMonths: 36,
        scopeSummary: 'عرض شامل التوريد والتركيب وضمان هندسي معتمد لمدة 3 سنوات.',
        validUntil: '2026-12-30',
      }).success,
    ).toBe(true);

    expect(
      decideRfqQuoteSchema.safeParse({
        decision: 'accept',
        linkToBudget: true,
      }).success,
    ).toBe(true);

    expect(
      createMarketplaceAppointmentSchema.safeParse({
        vendorId: 'vnd-el-rowad',
        appointmentType: 'site_visit',
        slotDate: '2026-12-10',
        slotTime: '14:00',
        customerPhone: '01012345678',
      }).success,
    ).toBe(true);

    expect(
      createVendorLeadSchema.safeParse({
        customerName: 'كريم شريف',
        title: 'تشطيب شقة المعادي',
        stage: 'negotiation',
        estimatedValueEgp: 300000,
      }).success,
    ).toBe(true);
  });

  it('renders /rfq guest prompt and VendorProfileView RFQ + slot booking controls cleanly', () => {
    render(
      <MemoryRouter initialEntries={['/rfq']}>
        <AppProvider>
          <Routes>
            <Route path="/rfq" element={<RfqCenterView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('rfq-signin-btn')).toBeInTheDocument();
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
    expect(screen.getByTestId('vendor-request-rfq-btn')).toBeInTheDocument();
    expect(screen.getByTestId('vendor-slot-booking-card')).toBeInTheDocument();
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
    cleanup();
  });
});

