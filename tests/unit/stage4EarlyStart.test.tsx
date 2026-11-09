// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../../src/context/AppContext';
import { EarlyStartDashboardView } from '../../src/components/earlyStart/EarlyStartDashboardView';
import {
  computeSavingsStreak,
  EARLY_START_ACADEMY_LESSONS,
  EARLY_START_TIMEFRAME_PRESETS,
  PRIVATE_BADGE_DEFINITIONS,
  SAVINGS_GOAL_TYPES,
  simulateWhatIfScenarios,
} from '../../shared/earlyStartData';

describe('Stage 4 Early Start & My Future Fund Domain Logic + UI', () => {
  it('supports all 8 flexible preparation timeframes (6m..10y), 7 goal categories, and 10 Academy modules', () => {
    expect(EARLY_START_TIMEFRAME_PRESETS.map((p) => p.key)).toEqual([
      '10y',
      '7y',
      '5y',
      '3y',
      '2y',
      '1y',
      '6m',
      'custom',
    ]);
    expect(EARLY_START_TIMEFRAME_PRESETS.find((p) => p.key === '10y')?.months).toBe(120);
    expect(EARLY_START_TIMEFRAME_PRESETS.find((p) => p.key === '6m')?.months).toBe(6);

    expect(SAVINGS_GOAL_TYPES.map((g) => g.type)).toEqual([
      'marriage',
      'apartment_purchase',
      'finishing',
      'furniture',
      'appliances',
      'wedding',
      'emergency',
    ]);

    expect(EARLY_START_ACADEMY_LESSONS.length).toBe(10);
    const uniqueSlugs = new Set(EARLY_START_ACADEMY_LESSONS.map((l) => l.slug));
    expect(uniqueSlugs.size).toBe(10);
    for (const lesson of EARLY_START_ACADEMY_LESSONS) {
      expect(lesson.keyPointsAr.length).toBeGreaterThanOrEqual(2);
      expect(lesson.keyPointsEn.length).toBeGreaterThanOrEqual(2);
      expect(lesson.practicalActionAr.length).toBeGreaterThan(5);
      expect(lesson.practicalActionEn.length).toBeGreaterThan(5);
    }

    expect(PRIVATE_BADGE_DEFINITIONS.length).toBe(7);
  });

  it('computes consecutive monthly savings streaks accurately including year boundaries and gaps', () => {
    expect(computeSavingsStreak([])).toBe(0);
    expect(computeSavingsStreak(['2026-03'])).toBe(1);
    expect(computeSavingsStreak(['2025-11', '2025-12', '2026-01', '2026-02'])).toBe(4);
    expect(computeSavingsStreak(['2025-09', '2026-01', '2026-02'])).toBe(2);
    expect(computeSavingsStreak(['2026-01', '2026-01', '2026-02'])).toBe(2);
  });

  it('simulates transparent What-If savings scenarios side by side without return hype', () => {
    const res = simulateWhatIfScenarios({
      initialCapitalEgp: 50000,
      baseMonthlyEgp: 4500,
      horizonMonths: 36,
      annualStepUpPercent: 10,
      todayTargetCostEgp: 600000,
      assumedAnnualCostEscalationPercent: 8,
    });

    expect(res.scenarios.length).toBe(5);
    const byKey = new Map(res.scenarios.map((s) => [s.key, s]));

    const s1000 = byKey.get('save_1000')!;
    const s3000 = byKey.get('save_3000')!;
    const sCustom = byKey.get('custom_stepup')!;
    const sDelay = byKey.get('delay_12m')!;
    const sStress = byKey.get('cost_plus_15')!;

    expect(s1000.projectedCashEgp).toBe(50000 + 36 * 1000);
    expect(s3000.projectedCashEgp).toBe(50000 + 36 * 3000);
    expect(sCustom.projectedCashEgp).toBeGreaterThan(s3000.projectedCashEgp);
    expect(sDelay.projectedCashEgp).toBeGreaterThan(sCustom.projectedCashEgp);
    expect(sStress.projectedGoalCostEgp).toBeGreaterThan(sCustom.projectedGoalCostEgp);
    expect(res.transparentDisclaimerEn.toLowerCase()).toContain('not a bank');
  });

  it('renders EarlyStartDashboardView and Academy cleanly in jsdom for guests', () => {
    render(
      <MemoryRouter initialEntries={['/early-start']}>
        <AppProvider>
          <Routes>
            <Route path="/early-start" element={<EarlyStartDashboardView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('early-start-hero-signin')).toBeInTheDocument();
    expect(screen.getByTestId('early-start-tab-simulator')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/early-start/academy']}>
        <AppProvider>
          <Routes>
            <Route
              path="/early-start/academy"
              element={<EarlyStartDashboardView initialTab="academy" />}
            />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('academy-lessons-list')).toBeInTheDocument();
    cleanup();
  });
});

