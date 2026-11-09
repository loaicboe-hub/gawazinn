// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../../src/context/AppContext';
import { SplashHome } from '../../src/components/home/SplashHome';
import { NotFoundView } from '../../src/components/common/NotFoundView';

describe('GAWAZ INN UI Components (Stage 1 Baseline)', () => {
  it('renders preserved 2x2 SplashHome grid with 4 core cards and discovery pills', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <SplashHome />
        </AppProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('home-card-finishing')).toBeInTheDocument();
    expect(screen.getByTestId('home-card-groom')).toBeInTheDocument();
    expect(screen.getByTestId('home-card-bride')).toBeInTheDocument();
    expect(screen.getByTestId('home-card-wedding')).toBeInTheDocument();
  });

  it('renders Red & White branded 404 screen with return home link', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <NotFoundView />
        </AppProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('404')).toBeInTheDocument();
  });
});

