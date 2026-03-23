import { vi } from 'vitest';

// ── Mock AI responses ────────────────────────────────────────────────────────

export const mockQuestionResponse = 'Tell me about a time you led a cross-functional team to deliver a project under tight deadlines.';

export const mockEvaluationResponse = {
  score: 7,
  strengths: ['Clear communication', 'Good use of STAR format'],
  improvements: ['Include specific metrics', 'Mention timeline details'],
  idealOutline: 'Use the STAR method: describe the Situation, Task, Action, and Result with quantified impact.',
};

export const mockFollowUpResponse = 'Can you elaborate on how you handled disagreements within the team during that project?';

// ── Mocked exports matching lib/gemini.js ────────────────────────────────────

export const AVAILABLE_MODELS = {
  'gemini-2.5-flash-lite': { label: 'Gemini 2.5 Flash-Lite', description: 'Fast & free — great default' },
  'gemini-2.5-flash': { label: 'Gemini 2.5 Flash', description: 'Smarter flash model (free tier)' },
};

export const getSelectedModel = vi.fn(() => 'gemini-2.5-flash-lite');
export const setSelectedModel = vi.fn();

export const generateText = vi.fn(async (prompt) => {
  if (prompt.toLowerCase().includes('follow') || prompt.toLowerCase().includes('next')) {
    return mockFollowUpResponse;
  }
  return mockQuestionResponse;
});

export const generateJSON = vi.fn(async () => {
  return { ...mockEvaluationResponse };
});

export const robustGenerateContent = vi.fn(async () => {
  return mockQuestionResponse;
});

export const getGeminiModel = vi.fn(() => ({
  generateContent: vi.fn(async () => ({
    response: { text: () => mockQuestionResponse },
  })),
}));

export const getGeminiFlashModel = vi.fn(() => getGeminiModel());
