// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../../src/context/AppContext';
import { LifecycleOnboardingView } from '../../src/components/workspace/LifecycleOnboardingView';
import { EngagementPlannerView } from '../../src/components/workspace/EngagementPlannerView';
import { JourneyPlannerView } from '../../src/components/workspace/JourneyPlannerView';
import { MyGawazInnHubView } from '../../src/components/workspace/MyGawazInnHubView';
import {
  DEFAULT_WORKSPACE_PERMISSIONS,
  JOURNEY_PHASES_CATALOG,
  LIFECYCLE_STAGES_CATALOG,
  MY_GAWAZ_INN_MODULES,
  STARTER_ENGAGEMENT_ITEMS,
  STARTER_JOURNEY_TASKS,
} from '../../shared/journeyWorkspaceData';

describe('Stage 5 Domain Catalogs (11 Stages, 10 Journey Phases, 17 Hub Modules) & UI', () => {
  it('defines all 11 non-destructive lifecycle stages, 10 journey phases & valid starter dependency DAG', () => {
    expect(LIFECYCLE_STAGES_CATALOG.map((s) => s.stage)).toEqual([
      'thinking',
      'early_saving',
      'post_engagement',
      'apartment_search',
      'finishing_apartment',
      'furnishing_groom',
      'preparing_bride',
      'planning_wedding',
      'wedding_soon',
      'newlywed',
      'maintaining_home',
    ]);
    for (const s of LIFECYCLE_STAGES_CATALOG) {
      expect(s.recommendedPrimaryRoute.startsWith('/')).toBe(true);
      expect(s.keyFocusAr.length).toBeGreaterThanOrEqual(2);
      expect(s.keyFocusEn.length).toBeGreaterThanOrEqual(2);
    }

    expect(JOURNEY_PHASES_CATALOG.map((p) => p.key)).toEqual([
      'early_start',
      'engagement',
      '12m',
      '9m',
      '6m',
      '3m',
      '1m',
      'final_week',
      'wedding_day',
      'post_wedding',
    ]);

    const taskKeys = new Set(STARTER_JOURNEY_TASKS.map((t) => t.key));
    expect(STARTER_JOURNEY_TASKS.length).toBe(12);
    for (const task of STARTER_JOURNEY_TASKS) {
      if (task.dependsOnKey) {
        expect(taskKeys.has(task.dependsOnKey)).toBe(true);
      }
    }

    expect(STARTER_ENGAGEMENT_ITEMS.length).toBeGreaterThanOrEqual(6);
    expect(DEFAULT_WORKSPACE_PERMISSIONS.tasksRead).toBe(true);
    expect(DEFAULT_WORKSPACE_PERMISSIONS.budgetWrite).toBe(false);
  });

  it('registers all 17 Module J My Gawaz Inn Command Center submodules uniquely', () => {
    expect(MY_GAWAZ_INN_MODULES.map((m) => m.key)).toEqual([
      'profile',
      'journey',
      'budget',
      'savings',
      'checklists',
      'shopping',
      'favorites',
      'comparisons',
      'quotations',
      'bookings',
      'appointments',
      'documents',
      'invoices',
      'warranties',
      'notifications',
      'workspace',
      'settings',
    ]);
    for (const m of MY_GAWAZ_INN_MODULES) {
      expect(m.titleAr.length).toBeGreaterThan(2);
      expect(m.titleEn.length).toBeGreaterThan(2);
    }
  });

  it('renders Stage 5 views cleanly for unauthenticated guests with explicit sign-in prompts', () => {
    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <AppProvider>
          <Routes>
            <Route path="/onboarding" element={<LifecycleOnboardingView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('onboarding-signin-btn')).toBeInTheDocument();
    expect(screen.getByTestId('stage-card-maintaining_home')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/engagement']}>
        <AppProvider>
          <Routes>
            <Route path="/engagement" element={<EngagementPlannerView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('engagement-signin-btn')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/journey']}>
        <AppProvider>
          <Routes>
            <Route path="/journey" element={<JourneyPlannerView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('journey-signin-btn')).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/my/workspace']}>
        <AppProvider>
          <Routes>
            <Route path="/my/workspace" element={<MyGawazInnHubView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('hub-signin-btn')).toBeInTheDocument();
    cleanup();
  });
});

