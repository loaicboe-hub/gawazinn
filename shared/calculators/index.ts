import type { CalculatorOutput, CalculatorSummary } from '../types';
import { FINANCE_PLANNING_CALCULATORS } from './financePlanningCalcs';
import {
  DEFAULT_BUDGET_CATEGORIES,
  toCalculatorSummary,
  type CalculatorDefinition,
} from './helpers';
import { HOME_FINISHING_CALCULATORS } from './homeFinishingCalcs';
import { TROUSSEAU_CELEBRATION_CALCULATORS } from './trousseauCelebrationCalcs';

export const ALL_CALCULATORS: CalculatorDefinition[] = [
  ...HOME_FINISHING_CALCULATORS,
  ...TROUSSEAU_CELEBRATION_CALCULATORS,
  ...FINANCE_PLANNING_CALCULATORS,
].sort((a, b) => a.order - b.order);

export const CALCULATOR_MAP: Map<string, CalculatorDefinition> = new Map(
  ALL_CALCULATORS.map((def) => [def.slug, def]),
);

export function listCalculatorSummaries(): CalculatorSummary[] {
  return ALL_CALCULATORS.map(toCalculatorSummary);
}

export function getCalculatorSummary(slug: string): CalculatorSummary | undefined {
  const def = CALCULATOR_MAP.get(slug);
  return def ? toCalculatorSummary(def) : undefined;
}

export function runCalculator(
  slug: string,
  rawInputs: Record<string, number | string | boolean> = {},
): CalculatorOutput {
  const def = CALCULATOR_MAP.get(slug);
  if (!def) {
    throw new Error(`Unknown calculator slug: ${slug}`);
  }
  const mergedInputs: Record<string, number | string | boolean> = {
    ...def.defaultInputs,
    ...rawInputs,
  };
  return def.compute(mergedInputs);
}

export { DEFAULT_BUDGET_CATEGORIES };

