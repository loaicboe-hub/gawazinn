// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../../src/context/AppContext';
import { CalculatorsHubView } from '../../src/components/calculators/CalculatorsHubView';
import { CalculatorDetailView } from '../../src/components/calculators/CalculatorDetailView';
import { BudgetManagerView } from '../../src/components/budget/BudgetManagerView';
import {
  ALL_CALCULATORS,
  getCalculatorSummary,
  listCalculatorSummaries,
  runCalculator,
} from '../../shared/calculators';
import { SEED_ARTICLES } from '../../shared/cmsSeedData';
import { STAGE2_GLOSSARY_TERMS } from '../../shared/knowledgeGlossaryData';

describe('Stage 3 Unified 20 Smart Calculators Engine & Budget Views', () => {
  it('registers exactly 20 calculators with unique orders #1..#20 and matches all Encyclopedia & Glossary links', () => {
    const summaries = listCalculatorSummaries();
    expect(summaries.length).toBe(20);
    expect(ALL_CALCULATORS.length).toBe(20);

    const orders = summaries.map((c) => c.order);
    expect(orders).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));

    const slugs = new Set(summaries.map((c) => c.slug));
    expect(slugs.size).toBe(20);

    for (const art of SEED_ARTICLES) {
      for (const calcSlug of art.relatedCalculators) {
        expect(getCalculatorSummary(calcSlug)).toBeDefined();
      }
    }

    for (const term of STAGE2_GLOSSARY_TERMS) {
      if (term.relatedCalculatorSlug) {
        expect(getCalculatorSummary(term.relatedCalculatorSlug)).toBeDefined();
      }
    }
  });

  it('computes finite non-negative outputs, breakdown bars, and transparent formulas for every calculator', () => {
    for (const calc of listCalculatorSummaries()) {
      const output = runCalculator(calc.slug, calc.defaultInputs);
      expect(Number.isFinite(output.primaryMetric.value)).toBe(true);
      expect(output.primaryMetric.value).toBeGreaterThan(0);
      expect(output.breakdown.length).toBeGreaterThanOrEqual(2);
      expect(output.secondaryMetrics.length).toBeGreaterThanOrEqual(1);
      expect(output.formulaSummaryAr.length).toBeGreaterThan(5);
      expect(output.formulaSummaryEn.length).toBeGreaterThan(5);
      expect(output.assumptionsAr.length).toBeGreaterThanOrEqual(1);
      expect(output.assumptionsEn.length).toBeGreaterThanOrEqual(1);
      expect(output.suggestedBudgetCategorySlug.length).toBeGreaterThan(0);
    }
  });

  it('calculates finishing, paint, flooring, installment DTI warnings, long-term projections, and emergency reserves accurately', () => {
    // 1. Finishing governorate & tier multipliers
    const cairoStd = runCalculator('finishing-cost', {
      areaSqm: 120,
      tier: 'medium',
      governorate: 'cairo',
      bathroomsCount: 2,
      includeKitchenPrep: true,
    });
    const deltaStd = runCalculator('finishing-cost', {
      areaSqm: 120,
      tier: 'medium',
      governorate: 'dakahlia',
      bathroomsCount: 2,
      includeKitchenPrep: true,
    });
    const cairoUltra = runCalculator('finishing-cost', {
      areaSqm: 120,
      tier: 'ultra_luxury',
      governorate: 'cairo',
      bathroomsCount: 2,
      includeKitchenPrep: true,
    });
    expect(cairoStd.primaryMetric.value).toBeGreaterThan(deltaStd.primaryMetric.value);
    expect(cairoUltra.primaryMetric.value).toBeGreaterThan(cairoStd.primaryMetric.value);

    // 2. Flooring quantities (10% wastage + carton math)
    const floor = runCalculator('flooring-quantities', {
      floorAreaSqm: 100,
      skirtingMeters: 40,
      wastePercent: 10,
      boxCoverageSqm: 1.44,
    });
    expect(floor.primaryMetric.value).toBeGreaterThanOrEqual(75);
    expect(floor.breakdown.some((b) => b.amount > 0)).toBe(true);

    // 3. Paint quantities
    const paint = runCalculator('paint-quantities', {
      floorAreaSqm: 120,
      ceilingHeightM: 2.9,
      coatsCount: 2,
    });
    expect(paint.primaryMetric.value).toBeGreaterThanOrEqual(5);

    // 4. Installment DTI warning (>35% triggers high burden warning)
    const riskyLoan = runCalculator('installment-plan', {
      totalAmountEgp: 350000,
      downPaymentEgp: 20000,
      months: 12,
      annualRatePercent: 22,
      monthlyIncomeEgp: 20000,
    });
    expect(riskyLoan.warningsEn.some((w) => w.includes('35%'))).toBe(true);

    // 5. Long-term projections across 1-10 years with no fabricated investment returns
    const proj8yr = runCalculator('long-term-projections', {
      todayEstimatedCostEgp: 600000,
      initialCapitalEgp: 80000,
      monthlyContributionEgp: 5000,
      horizonYears: 8,
      assumedCostInflationPercent: 12,
      annualContributionStepUpPercent: 10,
    });
    expect(proj8yr.primaryMetric.value).toBeGreaterThan(600000);
    expect(
      proj8yr.assumptionsEn.some((a) => a.toLowerCase().includes('zero') || a.toLowerCase().includes('no guaranteed')),
    ).toBe(true);

    // 6. Emergency reserve
    const reserve = runCalculator('emergency-reserve', {
      plannedFinishingEgp: 500000,
      plannedWeddingTrousseauEgp: 400000,
      householdMonthlyExpenseEgp: 15000,
      reserveMonthsOfLiving: 4,
    });
    expect(reserve.primaryMetric.value).toBeGreaterThanOrEqual(120000);
  });

  it('renders CalculatorsHubView, CalculatorDetailView, and BudgetManagerView cleanly', () => {
    render(
      <MemoryRouter initialEntries={['/calculators']}>
        <AppProvider>
          <CalculatorsHubView />
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('calculators-grid')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/calculators/finishing-cost']}>
        <AppProvider>
          <Routes>
            <Route path="/calculators/:slug" element={<CalculatorDetailView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('calc-primary-result')).toBeInTheDocument();
    expect(screen.getByTestId('calc-save-to-budget-btn')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/my/budget']}>
        <AppProvider>
          <BudgetManagerView />
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('budget-signin-btn')).toBeInTheDocument();
  });
});
