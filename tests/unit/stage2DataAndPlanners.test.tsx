// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../../src/context/AppContext';
import { FinishingEncyclopediaView } from '../../src/components/finishing/FinishingEncyclopediaView';
import { GroomEncyclopediaView } from '../../src/components/groom/GroomEncyclopediaView';
import { BrideEncyclopediaView } from '../../src/components/bride/BrideEncyclopediaView';
import { GlossaryFaqView } from '../../src/components/encyclopedia/GlossaryFaqView';
import {
  FINISHING_CONTRACTORS_DIRECTORY,
  FINISHING_ENCYCLOPEDIA_CATEGORIES,
  FINISHING_MATERIALS_DB,
  STAGE2_BEFORE_AFTER_PROJECTS,
} from '../../shared/finishingEncyclopediaData';
import {
  BRIDE_CHECKLIST_TEMPLATES,
  BRIDE_ENCYCLOPEDIA_CATEGORIES,
  GROOM_CONFIGURABLE_PACKAGES,
  GROOM_SUBCATEGORIES,
  analyzeBrideTrousseauPlan,
  calculateConfigurableGroomPackage,
} from '../../shared/trousseauEncyclopediaData';
import { STAGE2_FAQ_ITEMS, STAGE2_GLOSSARY_TERMS } from '../../shared/knowledgeGlossaryData';
import { SEED_ARTICLES, SEED_CATEGORIES } from '../../shared/cmsSeedData';

describe('Stage 2 Encyclopedia Datasets Integrity & Planner Logic', () => {
  it('enforces exact dataset counts and honest zero-review policy on contractors', () => {
    expect(FINISHING_ENCYCLOPEDIA_CATEGORIES.length).toBe(22);
    expect(FINISHING_MATERIALS_DB.length).toBe(10);
    expect(FINISHING_MATERIALS_DB.every((m) => Boolean(m.priceUpdatedAt && m.priceSource))).toBe(true);
    expect(STAGE2_BEFORE_AFTER_PROJECTS.length).toBe(4);

    expect(FINISHING_CONTRACTORS_DIRECTORY.length).toBe(6);
    expect(
      FINISHING_CONTRACTORS_DIRECTORY.every((c) => c.reviewsCount === 0 && c.isSampleListing === true),
    ).toBe(true);

    expect(SEED_CATEGORIES.length).toBe(13);
    expect(SEED_ARTICLES.length).toBe(12);

    expect(GROOM_SUBCATEGORIES.length).toBe(26);
    expect(GROOM_SUBCATEGORIES.filter((s) => s.groupKey === 'appliances').length).toBe(11);
    expect(GROOM_SUBCATEGORIES.filter((s) => s.groupKey === 'furniture').length).toBe(8);
    expect(GROOM_SUBCATEGORIES.filter((s) => s.groupKey === 'household').length).toBe(7);
    expect(GROOM_CONFIGURABLE_PACKAGES.length).toBe(4);

    expect(BRIDE_ENCYCLOPEDIA_CATEGORIES.length).toBe(19);
    expect(BRIDE_CHECKLIST_TEMPLATES.length).toBe(24);
    expect(STAGE2_GLOSSARY_TERMS.length).toBe(28);
    expect(STAGE2_FAQ_ITEMS.length).toBe(12);
  });

  it('computes groom configurable package totals, slot swaps, and optional slot exclusions accurately', () => {
    const pkg200k = GROOM_CONFIGURABLE_PACKAGES.find((p) => p.tierKey === 'tier_200k')!;
    const baseCalc = calculateConfigurableGroomPackage(pkg200k);
    expect(baseCalc.selectedCount).toBe(pkg200k.slots.length);
    expect(baseCalc.totalEgp).toBeGreaterThan(150000);

    // Swap main fridge from balanced (36,500) to premium (54,000) -> +17,500 delta
    const swappedCalc = calculateConfigurableGroomPackage(pkg200k, { fridge: 'opt-fr-pre' });
    expect(swappedCalc.totalEgp - baseCalc.totalEgp).toBe(54000 - 36500);

    // Exclude optional AC slot -> subtracts AC option price
    const acSlot = pkg200k.slots.find((s) => s.slotKey === 'ac')!;
    const acDefaultPrice = acSlot.options.find((o) => o.optionId === acSlot.defaultOptionId)!.priceEgp;
    const excludedCalc = calculateConfigurableGroomPackage(pkg200k, {}, ['ac']);
    expect(excludedCalc.selectedCount).toBe(pkg200k.slots.length - 1);
    expect(baseCalc.totalEgp - excludedCalc.totalEgp).toBe(acDefaultPrice);

    // Attempting to exclude a required slot ('fridge') must be ignored cleanly
    const forcedReqCalc = calculateConfigurableGroomPackage(pkg200k, {}, ['fridge']);
    expect(forcedReqCalc.selectedCount).toBe(pkg200k.slots.length);
    expect(forcedReqCalc.totalEgp).toBe(baseCalc.totalEgp);
  });

  it('analyzes bridal trousseau presets, qty overrides, custom items, and missing essentials accurately', () => {
    const compact = analyzeBrideTrousseauPlan({
      presetMode: 'compact',
      checkedItemIds: ['chk-1', 'chk-4'],
    });
    const extended = analyzeBrideTrousseauPlan({
      presetMode: 'extended',
      checkedItemIds: ['chk-1', 'chk-4'],
    });

    expect(compact.activeTemplateItems.length).toBeLessThan(extended.activeTemplateItems.length);
    expect(compact.estimatedTemplateTotalEgp).toBeLessThan(extended.estimatedTemplateTotalEgp);
    expect(compact.missingEssentialItems.length).toBeGreaterThan(0);
    expect(compact.missingEssentialItems.every((m) => m.priority === 'essential')).toBe(true);

    // Quantity override + custom item inclusion
    const withOverrides = analyzeBrideTrousseauPlan({
      presetMode: 'balanced',
      checkedItemIds: ['chk-1', 'chk-4', 'chk-8'],
      qtyOverrides: { 'chk-8': 12 },
      customItems: [
        {
          id: 'c-1',
          categoryId: 'b-cat-05',
          labelAr: 'ماكينة قهوة إسبريسو',
          labelEn: 'Espresso Machine',
          qty: 1,
          estimatedUnitPriceEgp: 7500,
          checked: true,
        },
      ],
    });
    expect(withOverrides.completedEstimatedSpendEgp).toBeGreaterThan(compact.completedEstimatedSpendEgp);
    expect(withOverrides.categoryCoverage.length).toBe(19);
  });

  it('renders Stage 2 FinishingEncyclopediaView, GroomEncyclopediaView, BrideEncyclopediaView & GlossaryFaqView cleanly', () => {
    render(
      <MemoryRouter initialEntries={['/finishing/encyclopedia']}>
        <AppProvider>
          <FinishingEncyclopediaView />
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('finishing-steps-count')).toBeInTheDocument();

    render(
      <MemoryRouter initialEntries={['/groom/encyclopedia']}>
        <AppProvider>
          <GroomEncyclopediaView />
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('groom-encyclopedia-grid')).toBeInTheDocument();

    render(
      <MemoryRouter initialEntries={['/bride/encyclopedia']}>
        <AppProvider>
          <BrideEncyclopediaView />
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('bride-categories-count')).toBeInTheDocument();

    render(
      <MemoryRouter initialEntries={['/glossary']}>
        <AppProvider>
          <GlossaryFaqView />
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('glossary-grid')).toBeInTheDocument();
  });
});

