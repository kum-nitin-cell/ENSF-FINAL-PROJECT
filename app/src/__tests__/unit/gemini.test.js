/**
 * Unit Tests for lib/gemini.js
 * WBS 1.4.1 — Tests AI model selection, text/JSON generation, and mock fallback.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We test the REAL module logic by controlling env/localStorage
describe('Gemini AI Module', () => {
  const STORAGE_KEY = 'gemini_model';

  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── Model Selection ──────────────────────────────────────────────────────

  describe('Model Selection', () => {
    it('should return default model when nothing is saved', async () => {
      const { getSelectedModel } = await import('../../lib/gemini.js');
      expect(getSelectedModel()).toBe('gemini-2.5-flash-lite');
    });

    it('should return saved model from localStorage', async () => {
      localStorage.setItem(STORAGE_KEY, 'gemini-2.5-flash');
      const { getSelectedModel } = await import('../../lib/gemini.js');
      expect(getSelectedModel()).toBe('gemini-2.5-flash');
    });

    it('should fall back to default for invalid saved model', async () => {
      localStorage.setItem(STORAGE_KEY, 'nonexistent-model');
      const { getSelectedModel } = await import('../../lib/gemini.js');
      expect(getSelectedModel()).toBe('gemini-2.5-flash-lite');
    });

    it('should persist model choice to localStorage', async () => {
      const { setSelectedModel } = await import('../../lib/gemini.js');
      setSelectedModel('gemini-2.5-flash');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('gemini-2.5-flash');
    });
  });

  // ── Available Models ─────────────────────────────────────────────────────

  describe('Available Models', () => {
    it('should export the expected model catalog', async () => {
      const { AVAILABLE_MODELS } = await import('../../lib/gemini.js');
      expect(Object.keys(AVAILABLE_MODELS)).toEqual([
        'gemini-2.5-flash-lite',
        'gemini-2.5-flash',
      ]);
    });

    it('each model should have label and description', async () => {
      const { AVAILABLE_MODELS } = await import('../../lib/gemini.js');
      for (const model of Object.values(AVAILABLE_MODELS)) {
        expect(model).toHaveProperty('label');
        expect(model).toHaveProperty('description');
        expect(typeof model.label).toBe('string');
        expect(typeof model.description).toBe('string');
      }
    });
  });

  // ── Mock Fallback (no API key) ───────────────────────────────────────────

  describe('Mock Fallback', () => {
    it('generateText should return a string when using mock model', async () => {
      // Force no API key by reimporting with cleared env
      const origKey = import.meta.env.VITE_GEMINI_API_KEY;
      import.meta.env.VITE_GEMINI_API_KEY = '';
      vi.resetModules();

      const { generateText } = await import('../../lib/gemini.js');
      const result = await generateText('Generate a behavioral question');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);

      import.meta.env.VITE_GEMINI_API_KEY = origKey;
    });

    it('generateJSON should return valid JSON with evaluation fields when using mock model', async () => {
      const origKey = import.meta.env.VITE_GEMINI_API_KEY;
      import.meta.env.VITE_GEMINI_API_KEY = '';
      vi.resetModules();

      const { generateJSON } = await import('../../lib/gemini.js');
      const result = await generateJSON('Evaluate answer. Q: test. A: test. Return JSON only: {score:1-10, strengths:[], improvements:[], idealOutline:""}');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('improvements');

      import.meta.env.VITE_GEMINI_API_KEY = origKey;
    });
  });

  // ── Export Verification ──────────────────────────────────────────────────

  describe('Module Exports', () => {
    it('should export all expected functions', async () => {
      const gemini = await import('../../lib/gemini.js');
      expect(typeof gemini.generateText).toBe('function');
      expect(typeof gemini.generateJSON).toBe('function');
      expect(typeof gemini.robustGenerateContent).toBe('function');
      expect(typeof gemini.getGeminiModel).toBe('function');
      expect(typeof gemini.getGeminiFlashModel).toBe('function');
      expect(typeof gemini.getSelectedModel).toBe('function');
      expect(typeof gemini.setSelectedModel).toBe('function');
    });
  });
});
