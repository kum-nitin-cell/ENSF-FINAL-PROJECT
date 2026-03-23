/**
 * Unit Tests for pages/HistoryPage.jsx
 * WBS 1.4.1 — Tests history display, delete functionality, and empty state.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

const mockSessions = [
  {
    id: 'session-1',
    interview_type: 'behavioral',
    difficulty: 'medium',
    overall_score: 75,
    status: 'completed',
    created_at: '2026-03-15T10:00:00Z',
    num_questions: 5,
  },
  {
    id: 'session-2',
    interview_type: 'technical',
    difficulty: 'hard',
    overall_score: null,
    status: 'active',
    created_at: '2026-03-16T14:00:00Z',
    num_questions: 3,
  },
];

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@test.com' },
  }),
}));

const deleteMock = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ data: null, error: null }),
});

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockSessions, error: null }),
        }),
      }),
      delete: deleteMock,
    })),
  },
}));

import HistoryPage from '../../pages/HistoryPage';

function renderHistory() {
  return render(
    <MemoryRouter>
      <HistoryPage />
    </MemoryRouter>
  );
}

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
  });

  it('should show loading state initially', () => {
    renderHistory();
    expect(screen.getByText(/loading history/i)).toBeInTheDocument();
  });

  it('should display the page title', async () => {
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText('Interview History')).toBeInTheDocument();
    });
  });

  it('should render session rows in a table', async () => {
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText('behavioral')).toBeInTheDocument();
      expect(screen.getByText('technical')).toBeInTheDocument();
    });
  });

  it('should display score as percentage for completed sessions', async () => {
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  it('should display dash for active session score', async () => {
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  it('should show Summary link for completed sessions', async () => {
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText('Summary')).toBeInTheDocument();
    });
  });

  it('should show Resume link for active sessions', async () => {
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText('Resume')).toBeInTheDocument();
    });
  });

  it('should render Delete button for each session', async () => {
    renderHistory();
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons).toHaveLength(2);
    });
  });

  it('should confirm before deleting a session', async () => {
    const user = userEvent.setup();
    renderHistory();

    await waitFor(() => {
      expect(screen.getAllByText('Delete')).toHaveLength(2);
    });

    await user.click(screen.getAllByText('Delete')[0]);
    expect(window.confirm).toHaveBeenCalled();
  });

  it('should have a New Interview link', async () => {
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText('New Interview')).toBeInTheDocument();
    });
  });
});
