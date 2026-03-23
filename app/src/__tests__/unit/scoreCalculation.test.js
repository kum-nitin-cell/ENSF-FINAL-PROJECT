/**
 * Unit Tests for Score Calculation Logic
 * WBS 1.4.1 — Tests the overall score calculation from InterviewSessionPage.
 * Extracted for isolated testing of the core business logic.
 */
import { describe, it, expect } from 'vitest';

/**
 * Replicates the score calculation from InterviewSessionPage.jsx:89
 *   let totalScore = 0, count = 0;
 *   qs.forEach(q => { if (q.score !== null) { totalScore += q.score; count++; } });
 *   const overall = count > 0 ? Math.round((totalScore / count) * 10) : 0;
 *
 * Scores are 1-10 from AI, multiplied by 10 to get percentage (0-100).
 */
function calculateOverallScore(questions) {
  let totalScore = 0;
  let count = 0;
  questions.forEach((q) => {
    if (q.score !== null && q.score !== undefined) {
      totalScore += q.score;
      count++;
    }
  });
  return count > 0 ? Math.round((totalScore / count) * 10) : 0;
}

/**
 * Replicates the "best category" logic from DashboardPage.jsx:44-60.
 */
function findBestCategory(sessions) {
  const categoryScores = {};
  const completed = sessions.filter((s) => s.status === 'completed');

  completed.forEach((s) => {
    if (!categoryScores[s.interview_type]) {
      categoryScores[s.interview_type] = { sum: 0, count: 0 };
    }
    categoryScores[s.interview_type].sum += s.overall_score || 0;
    categoryScores[s.interview_type].count += 1;
  });

  let highestAvg = 0;
  let bestCat = 'N/A';
  Object.keys(categoryScores).forEach((type) => {
    const catAvg = categoryScores[type].sum / categoryScores[type].count;
    if (catAvg > highestAvg) {
      highestAvg = catAvg;
      bestCat = type;
    }
  });

  return bestCat;
}

/**
 * Replicates the deduplication logic from SessionSummaryPage.jsx:45-50.
 */
function aggregateTopFeedback(questions) {
  const allStrengths = questions.flatMap((q) => q.feedback_strengths || []);
  const allImprovements = questions.flatMap((q) => q.feedback_improvements || []);
  return {
    topStrengths: [...new Set(allStrengths)].slice(0, 3),
    topImprovements: [...new Set(allImprovements)].slice(0, 3),
  };
}

describe('Score Calculation', () => {
  // ── Overall Score ────────────────────────────────────────────────────────

  describe('calculateOverallScore', () => {
    it('should return 0 for empty questions array', () => {
      expect(calculateOverallScore([])).toBe(0);
    });

    it('should return 0 when all scores are null', () => {
      const questions = [{ score: null }, { score: null }];
      expect(calculateOverallScore(questions)).toBe(0);
    });

    it('should calculate percentage from average score', () => {
      // Average of [7, 8, 9] = 8 → 8 * 10 = 80%
      const questions = [{ score: 7 }, { score: 8 }, { score: 9 }];
      expect(calculateOverallScore(questions)).toBe(80);
    });

    it('should handle single question', () => {
      const questions = [{ score: 5 }];
      expect(calculateOverallScore(questions)).toBe(50);
    });

    it('should handle perfect scores', () => {
      const questions = [{ score: 10 }, { score: 10 }];
      expect(calculateOverallScore(questions)).toBe(100);
    });

    it('should handle minimum scores', () => {
      const questions = [{ score: 1 }, { score: 1 }];
      expect(calculateOverallScore(questions)).toBe(10);
    });

    it('should skip null scores in mixed array', () => {
      // Only scores 6 and 8 count → avg 7 → 70
      const questions = [{ score: 6 }, { score: null }, { score: 8 }];
      expect(calculateOverallScore(questions)).toBe(70);
    });

    it('should round to nearest integer', () => {
      // Average of [7, 8] = 7.5 → 7.5 * 10 = 75
      const questions = [{ score: 7 }, { score: 8 }];
      expect(calculateOverallScore(questions)).toBe(75);
    });

    it('should round correctly for repeating decimals', () => {
      // Average of [7, 7, 8] = 7.333... → 73.33... → rounds to 73
      const questions = [{ score: 7 }, { score: 7 }, { score: 8 }];
      expect(calculateOverallScore(questions)).toBe(73);
    });
  });

  // ── Best Category ────────────────────────────────────────────────────────

  describe('findBestCategory', () => {
    it('should return N/A for empty sessions', () => {
      expect(findBestCategory([])).toBe('N/A');
    });

    it('should return the single category when only one exists', () => {
      const sessions = [
        { interview_type: 'behavioral', overall_score: 70, status: 'completed' },
      ];
      expect(findBestCategory(sessions)).toBe('behavioral');
    });

    it('should return the category with highest average', () => {
      const sessions = [
        { interview_type: 'behavioral', overall_score: 60, status: 'completed' },
        { interview_type: 'behavioral', overall_score: 70, status: 'completed' },
        { interview_type: 'technical', overall_score: 90, status: 'completed' },
      ];
      // behavioral avg = 65, technical avg = 90
      expect(findBestCategory(sessions)).toBe('technical');
    });

    it('should ignore non-completed sessions', () => {
      const sessions = [
        { interview_type: 'behavioral', overall_score: 90, status: 'active' },
        { interview_type: 'technical', overall_score: 50, status: 'completed' },
      ];
      expect(findBestCategory(sessions)).toBe('technical');
    });
  });

  // ── Feedback Aggregation ─────────────────────────────────────────────────

  describe('aggregateTopFeedback', () => {
    it('should return empty arrays for no questions', () => {
      const { topStrengths, topImprovements } = aggregateTopFeedback([]);
      expect(topStrengths).toEqual([]);
      expect(topImprovements).toEqual([]);
    });

    it('should deduplicate feedback items', () => {
      const questions = [
        { feedback_strengths: ['Clear', 'Structured'], feedback_improvements: ['Metrics'] },
        { feedback_strengths: ['Clear', 'Detailed'], feedback_improvements: ['Metrics', 'Examples'] },
      ];
      const { topStrengths, topImprovements } = aggregateTopFeedback(questions);
      expect(topStrengths).toEqual(['Clear', 'Structured', 'Detailed']);
      expect(topImprovements).toEqual(['Metrics', 'Examples']);
    });

    it('should limit to top 3 items', () => {
      const questions = [
        {
          feedback_strengths: ['A', 'B', 'C', 'D', 'E'],
          feedback_improvements: ['1', '2', '3', '4'],
        },
      ];
      const { topStrengths, topImprovements } = aggregateTopFeedback(questions);
      expect(topStrengths).toHaveLength(3);
      expect(topImprovements).toHaveLength(3);
    });

    it('should handle questions with no feedback', () => {
      const questions = [
        { feedback_strengths: null, feedback_improvements: undefined },
        { feedback_strengths: ['Good'], feedback_improvements: [] },
      ];
      const { topStrengths, topImprovements } = aggregateTopFeedback(questions);
      expect(topStrengths).toEqual(['Good']);
      expect(topImprovements).toEqual([]);
    });
  });
});
