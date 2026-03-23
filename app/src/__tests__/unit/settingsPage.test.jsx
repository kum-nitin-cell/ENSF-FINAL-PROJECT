/**
 * Unit Tests for pages/SettingsPage.jsx
 * WBS 1.4.1 — Tests settings rendering, model selection, and save functionality.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@test.com' },
  }),
}));

vi.mock('../../lib/gemini', () => ({
  AVAILABLE_MODELS: {
    'gemini-2.5-flash-lite': { label: 'Gemini 2.5 Flash-Lite', description: 'Fast & free — great default' },
    'gemini-2.5-flash': { label: 'Gemini 2.5 Flash', description: 'Smarter flash model (free tier)' },
  },
  getSelectedModel: vi.fn(() => 'gemini-2.5-flash-lite'),
  setSelectedModel: vi.fn(),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { full_name: 'Test User' },
            error: null,
          }),
        }),
      }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

import SettingsPage from '../../pages/SettingsPage';
import { setSelectedModel } from '../../lib/gemini';
import { supabase } from '../../lib/supabase';

function renderSettings() {
  return render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    renderSettings();
    expect(screen.getByText(/loading settings/i)).toBeInTheDocument();
  });

  it('should display the page title', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('should display AI model section', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('AI Model')).toBeInTheDocument();
    });
  });

  it('should display available models', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('Gemini 2.5 Flash-Lite')).toBeInTheDocument();
      expect(screen.getByText('Gemini 2.5 Flash')).toBeInTheDocument();
    });
  });

  it('should display model descriptions', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText(/Fast & free/)).toBeInTheDocument();
      expect(screen.getByText(/Smarter flash model/)).toBeInTheDocument();
    });
  });

  it('should display Default badge for flash-lite', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });

  it('should display account section with display name', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });
  });

  it('should display email (read-only)', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByDisplayValue('test@test.com')).toBeInTheDocument();
    });
  });

  it('should call setSelectedModel and upsert on save', async () => {
    const user = userEvent.setup();
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('Save Settings')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Save Settings'));

    expect(setSelectedModel).toHaveBeenCalledWith('gemini-2.5-flash-lite');
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });
});
