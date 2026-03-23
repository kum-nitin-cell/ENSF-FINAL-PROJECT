/**
 * Unit Tests for components/ProtectedRoute.jsx
 * WBS 1.4.1 — Tests route guard: redirects unauthenticated, passes through authenticated.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import React from 'react';

// Mock the auth context
const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

import ProtectedRoute from '../../components/ProtectedRoute';

function renderWithRouter(initialEntry = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div data-testid="protected-content">Secret Page</div>
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<div data-testid="auth-page">Auth Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1', email: 'test@test.com' } });

    renderWithRouter();

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Secret Page')).toBeInTheDocument();
  });

  it('should redirect to /auth when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null });

    renderWithRouter();

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('auth-page')).toBeInTheDocument();
  });

  it('should not render protected content for unauthenticated user', () => {
    mockUseAuth.mockReturnValue({ user: null });

    renderWithRouter();

    expect(screen.queryByText('Secret Page')).not.toBeInTheDocument();
  });
});
