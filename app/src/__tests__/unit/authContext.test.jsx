/**
 * Unit Tests for contexts/AuthContext.jsx
 * WBS 1.4.1 — Tests authentication context: sign-in, sign-up, sign-out, reset password.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock Supabase before importing AuthContext
vi.mock('../../lib/supabase', () => {
  const mockAuthUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: { full_name: 'Test User' },
  };
  const mockSession = { access_token: 'test-token', user: mockAuthUser };

  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { session: mockSession, user: mockAuthUser },
          error: null,
        }),
        signUp: vi.fn().mockResolvedValue({
          data: { session: null, user: mockAuthUser },
          error: null,
        }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: vi.fn((cb) => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
      },
    },
  };
});

import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// Helper component that exposes auth context values
function AuthConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="user-email">{auth.user?.email || 'none'}</span>
      <span data-testid="loading">{String(auth.loading)}</span>
      <button onClick={() => auth.signIn({ email: 'a@b.com', password: '123456' })}>
        Sign In
      </button>
      <button onClick={() => auth.signUp({ email: 'a@b.com', password: '123456' })}>
        Sign Up
      </button>
      <button onClick={() => auth.signOut()}>Sign Out</button>
      <button onClick={() => auth.resetPassword('a@b.com')}>Reset</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide user data after session loads', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  it('should set loading to false after session check', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('should call supabase.auth.signInWithPassword on signIn', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    await user.click(screen.getByText('Sign In'));
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: '123456',
    });
  });

  it('should call supabase.auth.signUp on signUp', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    await user.click(screen.getByText('Sign Up'));
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: '123456',
    });
  });

  it('should call supabase.auth.signOut on signOut', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    await user.click(screen.getByText('Sign Out'));
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('should call supabase.auth.resetPasswordForEmail on resetPassword', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    await user.click(screen.getByText('Reset'));
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('a@b.com');
  });

  it('should subscribe to auth state changes', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
  });

  it('should show no user when session is null', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('none');
    });
  });
});
