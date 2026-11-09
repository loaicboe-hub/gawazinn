// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../../src/context/AppContext';
import { NewlywedsGuideView } from '../../src/components/postMarriage/NewlywedsGuideView';
import { HomeCareDirectoryView } from '../../src/components/postMarriage/HomeCareDirectoryView';
import { DigitalHomeFileView } from '../../src/components/postMarriage/DigitalHomeFileView';
import {
  HOME_ASSET_CATEGORY_META,
  HOME_ITEM_CONDITION_META,
  MAINTENANCE_SYSTEM_META,
  NEWLYWED_TRACKS_META,
  addMonthsIsoDate,
  computeMaintenanceDueStatus,
  isWarrantyExpiringWithinDays,
} from '../../shared/stage11Data';
import {
  createHomeAssetSchema,
  createHomeInventorySchema,
  createMaintenanceReminderSchema,
} from '../../shared/schemas';

describe('Stage 11 Married Life, Home Care Directory & Digital Home File', () => {
  it('provides complete bilingual metadata and accurate date/cycle math helpers', () => {
    expect(Object.keys(HOME_ASSET_CATEGORY_META)).toHaveLength(7);
    expect(Object.keys(MAINTENANCE_SYSTEM_META)).toHaveLength(8);
    expect(Object.keys(HOME_ITEM_CONDITION_META)).toHaveLength(4);
    expect(NEWLYWED_TRACKS_META).toHaveLength(6);

    for (const track of NEWLYWED_TRACKS_META) {
      expect(track.stepsAr.length).toBeGreaterThanOrEqual(3);
      expect(track.stepsEn.length).toBe(track.stepsAr.length);
    }

    // Month-end clamping (Jan 31 + 1 month = Feb 28 on non-leap year)
    expect(addMonthsIsoDate('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonthsIsoDate('2026-10-15', 6)).toBe('2027-04-15');

    // Maintenance due status
    expect(computeMaintenanceDueStatus('2026-05-01', '2026-05-10')).toBe('overdue');
    expect(computeMaintenanceDueStatus('2026-05-18', '2026-05-10')).toBe('due_soon');
    expect(computeMaintenanceDueStatus('2026-06-20', '2026-05-10')).toBe('upcoming');

    // Warranty expiry helper
    expect(isWarrantyExpiringWithinDays('2026-05-01', 90, '2026-05-10')).toBe(false);
    expect(isWarrantyExpiringWithinDays('2026-07-01', 90, '2026-05-10')).toBe(true);
    expect(isWarrantyExpiringWithinDays('2027-05-10', 90, '2026-05-10')).toBe(false);
  });

  it('validates Stage 11 Zod schemas strictly', () => {
    expect(
      createHomeAssetSchema.safeParse({
        roomLabel: 'R',
        assetCategory: 'paint_code',
        titleAr: 'دهان',
      }).success,
    ).toBe(false);

    expect(
      createHomeAssetSchema.safeParse({
        roomLabel: 'غرفة النوم',
        assetCategory: 'paint_code',
        titleAr: 'كود دهان الغرفة الرئيسية',
        codeOrSerial: 'Jotun 10678',
      }).success,
    ).toBe(true);

    expect(
      createMaintenanceReminderSchema.safeParse({
        systemCategory: 'ac_service',
        titleAr: 'صيانة تكييف الريسبشن',
        intervalMonths: 6,
        estimatedCostEgp: 650,
      }).success,
    ).toBe(true);

    expect(
      createHomeInventorySchema.safeParse({
        roomLabel: 'المطبخ',
        itemName: 'بوتاجاز لاجيرمانيا 90 سم',
        brandModel: 'La Germania AMN95',
        purchasePriceEgp: 21500,
        condition: 'new',
      }).success,
    ).toBe(true);
  });

  it('renders /newlyweds-guide, /home-care, and auth-guarded /my/home-file cleanly', () => {
    localStorage.clear();
    render(
      <MemoryRouter initialEntries={['/newlyweds-guide']}>
        <AppProvider>
          <Routes>
            <Route path="/newlyweds-guide" element={<NewlywedsGuideView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('newlyweds-guide-heading')).toBeInTheDocument();
    const firstStep = screen.getByTestId('track-step-m-1').querySelector('input')!;
    expect(firstStep.checked).toBe(false);
    fireEvent.click(firstStep);
    expect(firstStep.checked).toBe(true);
    expect(screen.getByTestId('newlyweds-progress-text').textContent).toContain('1 /');
    cleanup();

    render(
      <MemoryRouter initialEntries={['/home-care']}>
        <AppProvider>
          <Routes>
            <Route path="/home-care" element={<HomeCareDirectoryView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('home-care-heading')).toBeInTheDocument();
    expect(screen.getByTestId('homecare-checklist-moving_logistics')).toBeInTheDocument();
    expect(screen.getByTestId('homecare-checklist-home_maintenance')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/my/home-file']}>
        <AppProvider>
          <Routes>
            <Route path="/my/home-file" element={<DigitalHomeFileView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('home-file-heading')).toBeInTheDocument();
    expect(screen.getByTestId('home-file-signin-btn')).toBeInTheDocument();
    cleanup();
  });
});

