/**
 * Unit Tests for pages/AuthPage.jsx
 * WBS 1.4.1 — Tests authentication UI: login form, signup form, validation, forgot password.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock auth context
const mockSignIn = vi.fn().mockResolvedValue({ error: null });
const mockSignUp = vi.fn().mockResolvedValue({ error: null });
const mockResetPassword = vi.fn().mockResolvedValue({ error: null });

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    signIn: mockSignIn,
    signUp: mockSignUp,
    resetPassword: mockResetPassword,
  }),
}));

import AuthPage from '../../pages/AuthPage';

function renderAuthPage() {
  return render(
    <MemoryRouter initialEntries={['/auth']}>
      <AuthPage />
    </MemoryRouter>
  );
}

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ────────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render the app title', () => {
      renderAuthPage();
      expect(screen.getByText('AI Mock Interview App')).toBeInTheDocument();
    });

    it('should render login and signup tabs', () => {
      renderAuthPage();
      // Both "Log In" text: tab button + submit button
      expect(screen.getAllByText('Log In').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    });

    it('should render email and password fields on login tab', () => {
      renderAuthPage();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should render the submit button', () => {
      renderAuthPage();
      // There are two 'Log In' elements: the tab button and the submit button
      const allLogIn = screen.getAllByText('Log In');
      expect(allLogIn.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Login Flow ───────────────────────────────────────────────────────────

  describe('Login Flow', () => {
    it('should call signIn with email and password on form submit', async () => {
      const user = userEvent.setup();
      renderAuthPage();

      await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      // Click the submit button (type="submit"), not the tab
      const submitBtns = screen.getAllByText('Log In');
      const submitBtn = submitBtns.find(btn => btn.closest('button[type="submit"]')) || submitBtns[submitBtns.length - 1];
      await user.click(submitBtn);

      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should display error message on login failure', async () => {
      mockSignIn.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } });
      const user = userEvent.setup();
      renderAuthPage();

      await user.type(screen.getByLabelText('Email Address'), 'bad@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrong');
      const submitBtns = screen.getAllByText('Log In');
      const submitBtn = submitBtns.find(btn => btn.closest('button[type="submit"]')) || submitBtns[submitBtns.length - 1];
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });
  });

  // ── Signup Flow ──────────────────────────────────────────────────────────

  describe('Signup Flow', () => {
    it('should switch to signup form when Sign Up tab is clicked', async () => {
      const user = userEvent.setup();
      renderAuthPage();

      // Click the tab (type="button"), not submit
      const signUpBtns = screen.getAllByText('Sign Up');
      const tabBtn = signUpBtns.find(btn => btn.closest('button[type="button"]')) || signUpBtns[0];
      await user.click(tabBtn);

      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      renderAuthPage();

      // Switch to signup tab
      const signUpBtns = screen.getAllByText('Sign Up');
      const tabBtn = signUpBtns.find(btn => btn.closest('button[type="button"]')) || signUpBtns[0];
      await user.click(tabBtn);

      await user.type(screen.getByLabelText('Full Name'), 'Test');
      await user.type(screen.getByLabelText('Email Address'), 'test@test.com');
      await user.type(screen.getByLabelText('Password'), 'password1');
      await user.type(screen.getByLabelText('Confirm Password'), 'password2');

      // Check the terms checkbox
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Click the submit button (last "Sign Up" button)
      const allSignUpBtns = screen.getAllByText('Sign Up');
      const submitBtn = allSignUpBtns.find(btn => btn.closest('button[type="submit"]')) || allSignUpBtns[allSignUpBtns.length - 1];
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should call signUp with correct data when form is valid', async () => {
      const user = userEvent.setup();
      renderAuthPage();

      const signUpBtns = screen.getAllByText('Sign Up');
      const tabBtn = signUpBtns.find(btn => btn.closest('button[type="button"]')) || signUpBtns[0];
      await user.click(tabBtn);

      await user.type(screen.getByLabelText('Full Name'), 'Jane Doe');
      await user.type(screen.getByLabelText('Email Address'), 'jane@test.com');
      await user.type(screen.getByLabelText('Password'), 'pass1234');
      await user.type(screen.getByLabelText('Confirm Password'), 'pass1234');

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      const allSignUpBtns = screen.getAllByText('Sign Up');
      const submitBtn = allSignUpBtns.find(btn => btn.closest('button[type="submit"]')) || allSignUpBtns[allSignUpBtns.length - 1];
      await user.click(submitBtn);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'jane@test.com',
          password: 'pass1234',
          options: { data: { full_name: 'Jane Doe' } },
        });
      });
    });
  });

  // ── Forgot Password ─────────────────────────────────────────────────────

  describe('Forgot Password', () => {
    it('should show forgot password form when link is clicked', async () => {
      const user = userEvent.setup();
      renderAuthPage();

      await user.click(screen.getByText('Forgot password?'));

      expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();
    });

    it('should call resetPassword with email', async () => {
      const user = userEvent.setup();
      renderAuthPage();

      await user.click(screen.getByText('Forgot password?'));
      await user.type(screen.getByLabelText('Email Address'), 'reset@test.com');
      await user.click(screen.getByRole('button', { name: 'Send Reset Link' }));

      expect(mockResetPassword).toHaveBeenCalledWith('reset@test.com');
    });

    it('should show success message after password reset', async () => {
      const user = userEvent.setup();
      renderAuthPage();

      await user.click(screen.getByText('Forgot password?'));
      await user.type(screen.getByLabelText('Email Address'), 'reset@test.com');
      await user.click(screen.getByRole('button', { name: 'Send Reset Link' }));

      await waitFor(() => {
        expect(
          screen.getByText(/you will receive a password reset email/i)
        ).toBeInTheDocument();
      });
    });
  });
});
