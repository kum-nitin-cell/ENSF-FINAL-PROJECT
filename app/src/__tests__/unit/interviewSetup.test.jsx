/**
 * Unit Tests for pages/InterviewSetupPage.jsx
 * WBS 1.4.1 — Tests interview setup form: type, difficulty, question count, validation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@test.com' },
  }),
}));

// Track what gets inserted
let lastInsertedData = null;

vi.mock('../../lib/supabase', () => {
  const profileData = {
    resume_text: 'Software engineer with 5 years experience...',
    job_description: 'Looking for a senior developer...',
  };

  return {
    supabase: {
      from: vi.fn((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: profileData, error: null }),
              }),
            }),
          };
        }
        if (table === 'interview_sessions') {
          return {
            insert: vi.fn((data) => {
              lastInsertedData = data;
              return {
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'new-session-id', ...data },
                    error: null,
                  }),
                }),
              };
            }),
          };
        }
        return { select: vi.fn().mockReturnThis() };
      }),
    },
  };
});

import InterviewSetupPage from '../../pages/InterviewSetupPage';

function renderSetup() {
  return render(
    <MemoryRouter>
      <InterviewSetupPage />
    </MemoryRouter>
  );
}

describe('InterviewSetupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastInsertedData = null;
  });

  it('should show loading state initially', () => {
    renderSetup();
    expect(screen.getByText(/loading settings/i)).toBeInTheDocument();
  });

  it('should render the setup form after loading', async () => {
    renderSetup();
    await waitFor(() => {
      expect(screen.getByText('New Interview Setup')).toBeInTheDocument();
    });
  });

  it('should render interview type options', async () => {
    renderSetup();
    await waitFor(() => {
      const select = screen.getByDisplayValue(/Behavioral/i);
      expect(select).toBeInTheDocument();
    });
  });

  it('should render difficulty options', async () => {
    renderSetup();
    await waitFor(() => {
      const select = screen.getByDisplayValue(/Medium/i);
      expect(select).toBeInTheDocument();
    });
  });

  it('should render number of questions slider defaulting to 5', async () => {
    renderSetup();
    await waitFor(() => {
      expect(screen.getByText(/Number of Questions: 5/)).toBeInTheDocument();
    });
  });

  it('should render follow-up questions checkbox (checked by default)', async () => {
    renderSetup();
    await waitFor(() => {
      const checkbox = screen.getByLabelText(/Enable AI Follow-up/i);
      expect(checkbox).toBeChecked();
    });
  });

  it('should have a cancel button that navigates to dashboard', async () => {
    const user = userEvent.setup();
    renderSetup();

    await waitFor(() => {
      expect(screen.getByText('New Interview Setup')).toBeInTheDocument();
    });

    await user.click(screen.getByText(/Cancel/));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should navigate to session page on successful start', async () => {
    const user = userEvent.setup();
    renderSetup();

    await waitFor(() => {
      expect(screen.getByText('Start Interview')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Start Interview'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/session/new-session-id');
    });
  });

  it('should include correct defaults in session creation', async () => {
    const user = userEvent.setup();
    renderSetup();

    await waitFor(() => {
      expect(screen.getByText('Start Interview')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Start Interview'));

    await waitFor(() => {
      expect(lastInsertedData).toBeTruthy();
      expect(lastInsertedData.interview_type).toBe('behavioral');
      expect(lastInsertedData.difficulty).toBe('medium');
      expect(lastInsertedData.num_questions).toBe(5);
      expect(lastInsertedData.follow_up_enabled).toBe(true);
      expect(lastInsertedData.status).toBe('active');
    });
  });
});
