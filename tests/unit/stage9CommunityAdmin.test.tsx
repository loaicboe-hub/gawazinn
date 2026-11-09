// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../../src/context/AppContext';
import { RealWeddingsView } from '../../src/components/community/RealWeddingsView';
import { CommunityForumView } from '../../src/components/community/CommunityForumView';
import { ExpertsDirectoryView } from '../../src/components/community/ExpertsDirectoryView';
import { AdminDashboardView } from '../../src/components/admin/AdminDashboardView';
import {
  COMMUNITY_CATEGORY_META,
  COMMUNITY_REPORT_REASON_META,
  EXPERT_SPECIALTY_META,
} from '../../shared/communityData';
import {
  adminVerifyExpertSchema,
  applyExpertProfileSchema,
  communityVoteSchema,
  createCommunityAnswerSchema,
  createCommunityQuestionSchema,
  createCommunityReportSchema,
  createWeddingStorySchema,
  moderateStorySchema,
  resolveCommunityReportSchema,
} from '../../shared/schemas';

describe('Stage 9 Real Weddings, Community Q&A, Experts Directory & Admin OS', () => {
  it('defines complete bilingual metadata dictionaries for Community, Experts & Moderation', () => {
    expect(Object.keys(COMMUNITY_CATEGORY_META)).toHaveLength(7);
    expect(Object.keys(EXPERT_SPECIALTY_META)).toHaveLength(5);
    expect(Object.keys(COMMUNITY_REPORT_REASON_META)).toHaveLength(5);
    for (const meta of [
      ...Object.values(COMMUNITY_CATEGORY_META),
      ...Object.values(EXPERT_SPECIALTY_META),
      ...Object.values(COMMUNITY_REPORT_REASON_META),
    ]) {
      expect(meta.ar.trim().length).toBeGreaterThan(2);
      expect(meta.en.trim().length).toBeGreaterThan(2);
    }
  });

  it('validates Stage 9 Zod schemas strictly', () => {
    expect(
      createWeddingStorySchema.safeParse({
        coupleTitleAr: 'ab',
        governorateSlug: 'cairo',
        cityAr: 'ق',
        weddingYear: 2026,
        summaryAr: 'short',
        lessonsLearnedAr: 'short',
      }).success,
    ).toBe(false);

    expect(
      createWeddingStorySchema.safeParse({
        coupleTitleAr: 'قصة زفاف أحمد ونورهان التجمع 2026',
        governorateSlug: 'cairo',
        cityAr: 'القاهرة الجديدة',
        weddingYear: 2026,
        guestCount: 200,
        finishingCostEgp: 320000,
        groomTrousseauEgp: 220000,
        brideTrousseauEgp: 140000,
        weddingCostEgp: 150000,
        preparationMonths: 14,
        summaryAr: 'تجربة تجهيز منظمة اعتمدنا فيها حاسبات جواز إن ومقارنة عروض الأسعار.',
        lessonsLearnedAr: 'الالتزام بنسبة 10% طوارئ لتفادي فروق الخامات.',
      }).success,
    ).toBe(true);

    expect(moderateStorySchema.safeParse({ moderationStatus: 'approved' }).success).toBe(true);
    expect(
      createCommunityQuestionSchema.safeParse({
        categorySlug: 'finishing',
        titleAr: 'ما هو أفضل عزل مائي للحمامات قبل السيراميك؟',
        bodyAr: 'أقوم بتأسيس حمامين في شقة 140م وأريد المقارنة بين العزل الأسمنتي والبيتوميني.',
        tags: ['عزل', 'سباكة'],
      }).success,
    ).toBe(true);
    expect(createCommunityAnswerSchema.safeParse({ bodyAr: 'نصيحة مفيدة عن العزل الأسمنتي الكيميائي.' }).success).toBe(
      true,
    );
    expect(communityVoteSchema.safeParse({ targetType: 'question', targetId: 'cq-seed-1' }).success).toBe(true);
    expect(
      createCommunityReportSchema.safeParse({
        targetType: 'answer',
        targetId: 'ca-seed-2',
        reason: 'spam',
      }).success,
    ).toBe(true);
    expect(resolveCommunityReportSchema.safeParse({ action: 'resolve_hide' }).success).toBe(true);
    expect(
      applyExpertProfileSchema.safeParse({
        displayNameAr: 'م. عمر الشناوي',
        displayNameEn: 'Eng. Omar El-Shenawy',
        specialtySlug: 'finishing_engineering',
        titleAr: 'مهندس تشطيبات واستشاري MEP',
        titleEn: 'Finishing & MEP Consultant',
        governorateSlug: 'cairo',
        yearsExperience: 9,
        credentialsAr: 'نقابة المهندسين المصرية — شعبة عمارة',
        credentialsEn: 'Egyptian Engineers Syndicate',
        bioAr: 'خبرة 9 سنوات في تشطيب الشقق السكنية بالقاهرة الجديدة واستلام الأعمال.',
        bioEn: '9 years of apartment finishing and snagging supervision in New Cairo.',
        verificationDocs: ['Syndicate Card #44112'],
      }).success,
    ).toBe(true);
    expect(adminVerifyExpertSchema.safeParse({ verificationStatus: 'verified' }).success).toBe(true);
  });

  it('renders /real-weddings, /community, /experts, and RBAC-guarded /admin views cleanly', () => {
    render(
      <MemoryRouter initialEntries={['/real-weddings']}>
        <AppProvider>
          <Routes>
            <Route path="/real-weddings" element={<RealWeddingsView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('real-weddings-heading')).toBeInTheDocument();
    expect(screen.getByTestId('story-open-form-btn')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/community']}>
        <AppProvider>
          <Routes>
            <Route path="/community" element={<CommunityForumView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('community-heading')).toBeInTheDocument();
    expect(screen.getByTestId('community-signin-btn')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/experts']}>
        <AppProvider>
          <Routes>
            <Route path="/experts" element={<ExpertsDirectoryView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('experts-directory-heading')).toBeInTheDocument();
    expect(screen.getByTestId('expert-open-apply-btn')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AppProvider>
          <Routes>
            <Route path="/admin" element={<AdminDashboardView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('admin-denied')).toBeInTheDocument();
    cleanup();
  });
});

