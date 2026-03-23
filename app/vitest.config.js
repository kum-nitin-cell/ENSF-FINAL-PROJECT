import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.js'],
    include: ['src/__tests__/unit/**/*.test.{js,jsx}'],
    env: {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      VITE_GEMINI_API_KEY: '',
    },
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
});
