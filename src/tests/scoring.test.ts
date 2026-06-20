/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { calculateOutcomeScore, calculateScorelineScore, calculateConfidenceScore, calculateMatchScore } from '../lib/scoring/engine'
import { ScoringRule } from '@/types/scoring'

const mockRules: Record<string, ScoringRule> = {
  correct_winner: { rule_key: 'correct_winner', rule_name: 'Winner', points: 20, is_enabled: true },
  correct_draw: { rule_key: 'correct_draw', rule_name: 'Draw', points: 20, is_enabled: true },
  exact_scoreline: { rule_key: 'exact_scoreline', rule_name: 'Exact Score', points: 40, is_enabled: true },
  correct_goal_difference: { rule_key: 'correct_goal_difference', rule_name: 'Goal Diff', points: 15, is_enabled: true },
  one_team_score_correct: { rule_key: 'one_team_score_correct', rule_name: 'One Team', points: 10, is_enabled: true },
  confidence_bonus: { rule_key: 'confidence_bonus', rule_name: 'Conf Bonus', points: 10, is_enabled: true },
  confidence_penalty: { rule_key: 'confidence_penalty', rule_name: 'Conf Penalty', points: -10, is_enabled: true }
}

describe('Scoring Engine (Acceptance Tests)', () => {
  it('SCORE-001: Correct winner predicted', () => {
    const pred = { winner: 'home' } as any
    const actual = { winner: 'home' } as any
    const result = calculateOutcomeScore(pred, actual, mockRules)
    expect(result.points).toBe(20)
  })

  it('SCORE-002: Exact scoreline predicted', () => {
    const pred = { home_score: 3, away_score: 1, extra_time_home: null, extra_time_away: null } as any
    const actual = { home_score: 3, away_score: 1, extra_time_home: null, extra_time_away: null } as any
    const result = calculateScorelineScore(pred, actual, mockRules)
    expect(result).toBe(40)
  })

  it('SCORE-003: Correct goal difference predicted', () => {
    const pred = { home_score: 2, away_score: 0, extra_time_home: null, extra_time_away: null } as any
    const actual = { home_score: 3, away_score: 1, extra_time_home: null, extra_time_away: null } as any
    const result = calculateScorelineScore(pred, actual, mockRules)
    expect(result).toBe(15) // +2 diff
  })

  it('SCORE-013: Correct winner prediction with confidence >80%', () => {
    const pred = { winner: 'home', confidence: 90 } as any
    const actual = { winner: 'home' } as any
    const result = calculateConfidenceScore(pred, actual, mockRules)
    expect(result).toBe(10)
  })

  it('SCORE-014: Incorrect winner prediction with confidence >80%', () => {
    const pred = { winner: 'home', confidence: 90 } as any
    const actual = { winner: 'away' } as any
    const result = calculateConfidenceScore(pred, actual, mockRules)
    expect(result).toBe(-10)
  })

  it('SCORE-015: Stage multiplier applied', () => {
    const pred = { winner: 'home', home_score: 1, away_score: 0, extra_time_home: null, extra_time_away: null, confidence: 50 } as any
    const actual = { winner: 'home', home_score: 1, away_score: 0, extra_time_home: null, extra_time_away: null, penalty_home: null, penalty_away: null } as any
    const result = calculateMatchScore(pred, actual, mockRules, 2.0)
    // 20 (winner) + 40 (exact) = 60 * 2.0 = 120
    expect(result.multipliedTotal).toBe(120)
  })
})
