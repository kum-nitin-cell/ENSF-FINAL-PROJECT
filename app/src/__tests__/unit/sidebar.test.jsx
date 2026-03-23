/**
 * Unit Tests for components/Sidebar.jsx
 * WBS 1.4.1 — Tests sidebar navigation links and logout functionality.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

const mockSignOut = vi.fn().mockResolvedValue(undefined);
const mockNavigate = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signOut: mockSignOut,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import Sidebar from '../../components/Sidebar';

function renderSidebar(route = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Sidebar />
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the brand name', () => {
    renderSidebar();
    expect(screen.getByText('AI Interviewer')).toBeInTheDocument();
  });

  it('should render all navigation links', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('New Interview')).toBeInTheDocument();
    expect(screen.getByText('Question Bank')).toBeInTheDocument();
    expect(screen.getByText('Analytics & History')).toBeInTheDocument();
    expect(screen.getByText('Resume & Context')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should render logout button', () => {
    renderSidebar();
    expect(screen.getByText('Log Out')).toBeInTheDocument();
  });

  it('should call signOut and navigate on logout click', async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(screen.getByText('Log Out'));

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('should highlight active link for current route', () => {
    renderSidebar('/dashboard');
    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink.className).toContain('active');
  });

  it('navigation links should have correct href paths', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('New Interview').closest('a')).toHaveAttribute('href', '/setup');
    expect(screen.getByText('Question Bank').closest('a')).toHaveAttribute('href', '/practice');
    expect(screen.getByText('Analytics & History').closest('a')).toHaveAttribute('href', '/history');
    expect(screen.getByText('Resume & Context').closest('a')).toHaveAttribute('href', '/profile');
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/settings');
  });
});
