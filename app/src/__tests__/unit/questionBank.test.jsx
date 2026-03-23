/**
 * Unit Tests for pages/QuestionBankPage.jsx
 * WBS 1.4.1 — Tests question bank rendering, search, filtering, and practice flow.
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
    user: { id: 'test-user-id' },
  }),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'practice-session-id' },
            error: null,
          }),
        }),
      })),
    })),
  },
}));

import QuestionBankPage from '../../pages/QuestionBankPage';

function renderQuestionBank() {
  return render(
    <MemoryRouter>
      <QuestionBankPage />
    </MemoryRouter>
  );
}

describe('QuestionBankPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page title', () => {
    renderQuestionBank();
    expect(screen.getByText('Practice Question Bank')).toBeInTheDocument();
  });

  it('should render all 6 mock questions', () => {
    renderQuestionBank();
    expect(screen.getByText('Describe a time you solved a difficult bug.')).toBeInTheDocument();
    expect(screen.getByText('How does React Virtual DOM work?')).toBeInTheDocument();
    expect(screen.getByText('Tell me about yourself.')).toBeInTheDocument();
    expect(screen.getByText('Design a URL shortener system.')).toBeInTheDocument();
    expect(screen.getByText('What is your greatest weakness?')).toBeInTheDocument();
    expect(screen.getByText(/Explain the difference between a process and a thread/)).toBeInTheDocument();
  });

  it('should render search input', () => {
    renderQuestionBank();
    expect(screen.getByPlaceholderText(/Search for a question topic/i)).toBeInTheDocument();
  });

  it('should filter questions by search text', async () => {
    const user = userEvent.setup();
    renderQuestionBank();

    await user.type(screen.getByPlaceholderText(/Search/i), 'React');

    expect(screen.getByText('How does React Virtual DOM work?')).toBeInTheDocument();
    expect(screen.queryByText('Tell me about yourself.')).not.toBeInTheDocument();
  });

  it('should filter questions by category', async () => {
    const user = userEvent.setup();
    renderQuestionBank();

    await user.selectOptions(screen.getByDisplayValue('All Categories'), 'Technical');

    expect(screen.getByText('How does React Virtual DOM work?')).toBeInTheDocument();
    expect(screen.getByText(/Explain the difference/)).toBeInTheDocument();
    expect(screen.queryByText('Tell me about yourself.')).not.toBeInTheDocument();
  });

  it('should show System Design questions when filtered', async () => {
    const user = userEvent.setup();
    renderQuestionBank();

    await user.selectOptions(screen.getByDisplayValue('All Categories'), 'System Design');

    expect(screen.getByText('Design a URL shortener system.')).toBeInTheDocument();
    expect(screen.queryByText('Tell me about yourself.')).not.toBeInTheDocument();
  });

  it('should show empty state when search has no matches', async () => {
    const user = userEvent.setup();
    renderQuestionBank();

    await user.type(screen.getByPlaceholderText(/Search/i), 'xyznonexistent');

    expect(screen.getByText(/No questions matched/i)).toBeInTheDocument();
  });

  it('should render Practice button for each question', () => {
    renderQuestionBank();
    const practiceButtons = screen.getAllByText('Practice');
    expect(practiceButtons).toHaveLength(6);
  });

  it('should display category and difficulty badges', () => {
    renderQuestionBank();
    // 'Behavioral' appears as badges (3) + as filter option in <select> (1) = 4
    expect(screen.getAllByText('Behavioral').length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText('Technical').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('System Design').length).toBeGreaterThanOrEqual(1);
  });
});
