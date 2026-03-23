import { vi } from 'vitest';

// Chainable query builder mock
function createQueryBuilder(resolvedData = null, resolvedError = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: resolvedData, error: resolvedError }),
    then: function (resolve) {
      return resolve({ data: resolvedData, error: resolvedError });
    },
  };
  // Make the builder thenable for awaits without .single()
  builder[Symbol.for('nodejs.util.inspect.custom')] = () => 'QueryBuilder';
  return builder;
}

// Default profile data
export const mockProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  resume_text: 'Experienced software engineer with 5 years...',
  resume_filename: 'resume.pdf',
  job_description: 'Looking for a senior developer...',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

// Default session data
export const mockSession = {
  id: 'session-uuid-1',
  user_id: 'test-user-id',
  interview_type: 'behavioral',
  difficulty: 'medium',
  num_questions: 5,
  follow_up_enabled: true,
  industry: 'Tech',
  role_title: 'Frontend Developer',
  status: 'completed',
  overall_score: 75,
  created_at: '2026-03-01T10:00:00Z',
  completed_at: '2026-03-01T10:30:00Z',
};

// Default question data
export const mockQuestion = {
  id: 'question-uuid-1',
  session_id: 'session-uuid-1',
  question_number: 1,
  question_text: 'Describe a time you solved a difficult bug.',
  user_answer: 'I once tracked down a memory leak...',
  score: 8,
  feedback_strengths: ['Clear explanation', 'Good STAR format'],
  feedback_improvements: ['Add more metrics', 'Quantify impact'],
  feedback_ideal: 'Use STAR method with quantified results.',
  asked_at: '2026-03-01T10:01:00Z',
  answered_at: '2026-03-01T10:05:00Z',
};

// Auth mock
const mockAuthUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' },
};

const mockAuthSession = {
  access_token: 'test-token',
  user: mockAuthUser,
};

let authStateCallback = null;

export const supabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { session: mockAuthSession },
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: mockAuthUser },
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { session: mockAuthSession, user: mockAuthUser },
      error: null,
    }),
    signUp: vi.fn().mockResolvedValue({
      data: { session: null, user: mockAuthUser },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn((callback) => {
      authStateCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    }),
  },
  from: vi.fn((table) => {
    const builder = createQueryBuilder();

    // Override .single() to return table-specific data
    if (table === 'profiles') {
      builder.single.mockResolvedValue({ data: mockProfile, error: null });
      // For await without .single() (e.g., upsert)
      builder.upsert.mockResolvedValue({ data: mockProfile, error: null });
    } else if (table === 'interview_sessions') {
      builder.single.mockResolvedValue({ data: mockSession, error: null });
      builder.select.mockImplementation(() => {
        builder.single.mockResolvedValue({ data: mockSession, error: null });
        // For list queries (no .single())
        builder.eq.mockImplementation(() => {
          return {
            ...builder,
            order: vi.fn().mockResolvedValue({ data: [mockSession], error: null }),
            single: vi.fn().mockResolvedValue({ data: mockSession, error: null }),
          };
        });
        return builder;
      });
      builder.delete.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      });
    } else if (table === 'session_questions') {
      builder.single.mockResolvedValue({ data: mockQuestion, error: null });
      builder.order.mockResolvedValue({ data: [mockQuestion], error: null });
    }

    return builder;
  }),
};

// Helper to simulate auth state change
export function simulateAuthStateChange(event, session) {
  if (authStateCallback) {
    authStateCallback(event, session);
  }
}

// Helper to reset all mocks
export function resetSupabaseMocks() {
  vi.restoreAllMocks();
}
