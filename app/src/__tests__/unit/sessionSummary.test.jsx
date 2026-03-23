/**
 * Unit Tests for pages/SessionSummaryPage.jsx
 * WBS 1.4.1 — Tests summary rendering, score display, feedback aggregation, transcript.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import React from 'react';

const mockSessionData = {
  id: 'session-1',
  interview_type: 'behavioral',
  difficulty: 'medium',
  overall_score: 75,
  status: 'completed',
  created_at: '2026-03-15T10:00:00Z',
};

const mockQuestions = [
  {
    id: 'q1',
    question_text: 'Tell me about a leadership experience.',
    user_answer: 'I led a team of 5 engineers...',
    score: 8,
    feedback_strengths: ['Clear', 'Structured'],
    feedback_improvements: ['Add metrics'],
    feedback_ideal: 'Use STAR method with quantified results.',
    question_number: 1,
  },
  {
    id: 'q2',
    question_text: 'Describe a conflict at work.',
    user_answer: 'I had a disagreement with a colleague...',
    score: 7,
    feedback_strengths: ['Honest', 'Clear'],
    feedback_improvements: ['Add resolution impact', 'Add metrics'],
    feedback_ideal: 'Focus on resolution and relationship building.',
    question_number: 2,
  },
];

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn((table) => {
      if (table === 'interview_sessions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockSessionData, error: null }),
            }),
          }),
        };
      }
      if (table === 'session_questions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockQuestions, error: null }),
            }),
          }),
        };
      }
      return { select: vi.fn().mockReturnThis() };
    }),
  },
}));

import SessionSummaryPage from '../../pages/SessionSummaryPage';

function renderSummary() {
  return render(
    <MemoryRouter initialEntries={['/summary/session-1']}>
      <Routes>
        <Route path="/summary/:id" element={<SessionSummaryPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/setup" element={<div>Setup</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('SessionSummaryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    renderSummary();
    expect(screen.getByText(/loading summary/i)).toBeInTheDocument();
  });

  it('should display overall score as percentage', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  it('should display interview type and difficulty', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/Behavioral.*medium/i)).toBeInTheDocument();
    });
  });

  it('should show deduplicated top strengths', async () => {
    renderSummary();
    await waitFor(() => {
      // 'Clear' appears in both, should be deduplicated
      expect(screen.getByText('Key Strengths')).toBeInTheDocument();
      const clearItems = screen.getAllByText('Clear');
      expect(clearItems).toHaveLength(1); // deduplicated
      expect(screen.getByText('Structured')).toBeInTheDocument();
      expect(screen.getByText('Honest')).toBeInTheDocument();
    });
  });

  it('should show deduplicated improvement areas', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Areas for Improvement')).toBeInTheDocument();
      // 'Add metrics' appears in both, should be deduplicated
      const metricsItems = screen.getAllByText('Add metrics');
      expect(metricsItems).toHaveLength(1);
    });
  });

  it('should display full transcript with all Q&A', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Full Transcript & Feedback')).toBeInTheDocument();
      expect(screen.getByText(/Tell me about a leadership experience/)).toBeInTheDocument();
      expect(screen.getByText(/Describe a conflict at work/)).toBeInTheDocument();
    });
  });

  it('should display per-question scores', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Score: 8/10')).toBeInTheDocument();
      expect(screen.getByText('Score: 7/10')).toBeInTheDocument();
    });
  });

  it('should display ideal approach feedback', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/Use STAR method/)).toBeInTheDocument();
      expect(screen.getByText(/Focus on resolution/)).toBeInTheDocument();
    });
  });

  it('should have navigation links', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/Back to Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText('Start Another Interview')).toBeInTheDocument();
    });
  });
});
