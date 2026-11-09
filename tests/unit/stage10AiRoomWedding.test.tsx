// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../../src/context/AppContext';
import { AiAssistantView } from '../../src/components/assistant/AiAssistantView';
import { RoomDesignerView } from '../../src/components/tools/RoomDesignerView';
import { WeddingDayOpsView } from '../../src/components/wedding/WeddingDayOpsView';
import { PublicRsvpView } from '../../src/components/wedding/PublicRsvpView';
import {
  AI_STARTER_PROMPTS,
  MEAL_PREFERENCE_META,
  ROOM_THEME_META,
  ROOM_TYPE_META,
  TABLE_ZONE_META,
  computeMoodboardMetrics,
} from '../../shared/stage10Data';
import {
  addMoodboardItemSchema,
  aiAskSchema,
  createGiftRegistryItemSchema,
  createRoomMoodboardSchema,
  createSeatingTableSchema,
  createTimelineEventSchema,
  createWeddingGuestSchema,
  publicReserveGiftSchema,
  publicRsvpSubmitSchema,
} from '../../shared/schemas';

describe('Stage 10 Grounded AI, 2D Room Designer, Wedding Day Ops & Public RSVP', () => {
  it('defines complete bilingual dictionaries and accurate moodboard metrics', () => {
    expect(Object.keys(ROOM_TYPE_META)).toHaveLength(7);
    expect(Object.keys(ROOM_THEME_META)).toHaveLength(5);
    expect(Object.keys(TABLE_ZONE_META)).toHaveLength(4);
    expect(Object.keys(MEAL_PREFERENCE_META)).toHaveLength(4);
    expect(AI_STARTER_PROMPTS.length).toBeGreaterThanOrEqual(4);

    for (const prompt of AI_STARTER_PROMPTS) {
      expect(prompt.labelAr.trim().length).toBeGreaterThan(3);
      expect(prompt.queryEn.trim().length).toBeGreaterThan(5);
    }

    const metrics = computeMoodboardMetrics(5.0, 4.0, [
      { widthCm: 200, depthCm: 100, estimatedPriceEgp: 35000 },
      { widthCm: 100, depthCm: 100, estimatedPriceEgp: 15000 },
    ]);
    expect(metrics.floorAreaSqm).toBe(20);
    expect(metrics.occupiedAreaPercent).toBe(15); // (2 + 1) / 20 = 15%
    expect(metrics.totalEstimatedCostEgp).toBe(50000);
  });

  it('validates Stage 10 Zod schemas strictly', () => {
    expect(aiAskSchema.safeParse({ query: 'a' }).success).toBe(false);
    expect(aiAskSchema.safeParse({ query: 'احسب تشطيب شقة 120 متر' }).success).toBe(true);

    expect(
      createRoomMoodboardSchema.safeParse({
        titleAr: 'غرفة النوم الرئيسية',
        roomType: 'bedroom',
        lengthM: 4.5,
        widthM: 4.0,
        themeSlug: 'warm_beige',
      }).success,
    ).toBe(true);

    expect(
      addMoodboardItemSchema.safeParse({
        itemType: 'custom_furniture',
        labelAr: 'سرير مودرن 180 سم',
        widthCm: 200,
        depthCm: 180,
        estimatedPriceEgp: 22000,
      }).success,
    ).toBe(true);

    expect(
      createSeatingTableSchema.safeParse({
        tableName: 'طاولة الأهل 1',
        zone: 'family_center',
        capacity: 8,
      }).success,
    ).toBe(true);

    expect(
      createWeddingGuestSchema.safeParse({
        fullName: 'م. عمر الشاذلي',
        side: 'groom',
        guestGroup: 'friends',
        invitedCount: 2,
      }).success,
    ).toBe(true);

    expect(
      publicRsvpSubmitSchema.safeParse({
        rsvpStatus: 'confirmed',
        attendingCount: 2,
        mealPreference: 'vegetarian',
      }).success,
    ).toBe(true);

    expect(publicReserveGiftSchema.safeParse({ giftId: 'gift-karim-2' }).success).toBe(true);

    expect(
      createTimelineEventSchema.safeParse({
        startTime: '20:00',
        endTime: '20:45',
        titleAr: 'الزفة ودخول العروسين',
        assignee: 'منظم القاعة',
      }).success,
    ).toBe(true);

    expect(
      createGiftRegistryItemSchema.safeParse({
        titleAr: 'ماكينة قهوة إسبريسو',
        categoryLabel: 'أجهزة مطبخ',
        targetPriceEgp: 8500,
        priority: 'nice_to_have',
      }).success,
    ).toBe(true);
  });

  it('renders /assistant, /room-designer, auth-guarded /wedding-day, and /rsvp/:code views cleanly', () => {
    render(
      <MemoryRouter initialEntries={['/assistant']}>
        <AppProvider>
          <Routes>
            <Route path="/assistant" element={<AiAssistantView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('ai-assistant-heading')).toBeInTheDocument();
    expect(screen.getByTestId('ai-grounding-badge')).toBeInTheDocument();
    expect(screen.getByTestId('ai-query-input')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/room-designer']}>
        <AppProvider>
          <Routes>
            <Route path="/room-designer" element={<RoomDesignerView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('room-designer-heading')).toBeInTheDocument();
    expect(screen.getByTestId('room-signin-btn')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/wedding-day']}>
        <AppProvider>
          <Routes>
            <Route path="/wedding-day" element={<WeddingDayOpsView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('wedding-day-heading')).toBeInTheDocument();
    expect(screen.getByTestId('wedding-day-signin-btn')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/rsvp/GI-KARIM-102']}>
        <AppProvider>
          <Routes>
            <Route path="/rsvp/:code" element={<PublicRsvpView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(document.body.textContent?.length).toBeGreaterThan(10);
    cleanup();
  });
});

