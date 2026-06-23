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
  exact_scorers: { rule_key: 'exact_scorers', rule_name: 'Exact Scorers', points: 25, is_enabled: true },
  possession_accuracy: { rule_key: 'possession_accuracy', rule_name: 'Possession', points: 10, is_enabled: true },
  shots_accuracy: { rule_key: 'shots_accuracy', rule_name: 'Shots', points: 10, is_enabled: true },
  xg_accuracy: { rule_key: 'xg_accuracy', rule_name: 'xG', points: 10, is_enabled: true },
  yellow_cards_accuracy: { rule_key: 'yellow_cards_accuracy', rule_name: 'Yellow', points: 5, is_enabled: true },
  red_cards_exact: { rule_key: 'red_cards_exact', rule_name: 'Red', points: 10, is_enabled: true },
  confidence_bonus: { rule_key: 'confidence_bonus', rule_name: 'Conf Bonus', points: 10, is_enabled: true },
  confidence_penalty: { rule_key: 'confidence_penalty', rule_name: 'Conf Penalty', points: -10, is_enabled: true }
}

describe('Scoring Engine (Acceptance Tests)', () => {
  it('SCORE-001: Correct winner predicted', () => {
    const pred = { winner: 'home' } as never
    const actual = { winner: 'home' } as never
    const result = calculateOutcomeScore(pred, actual, mockRules)
    expect(result.points).toBe(20)
  })

  it('SCORE-002: Exact scoreline predicted', () => {
    const pred = { home_score: 3, away_score: 1, extra_time_home: null, extra_time_away: null } as never
    const actual = { home_score: 3, away_score: 1, extra_time_home: null, extra_time_away: null } as never
    const result = calculateScorelineScore(pred, actual, mockRules)
    expect(result).toBe(40)
  })

  it('SCORE-003: Correct goal difference predicted', () => {
    const pred = { home_score: 2, away_score: 0, extra_time_home: null, extra_time_away: null } as never
    const actual = { home_score: 3, away_score: 1, extra_time_home: null, extra_time_away: null } as never
    const result = calculateScorelineScore(pred, actual, mockRules)
    expect(result).toBe(15) // +2 diff
  })

  it('SCORE-013: Correct winner prediction with confidence >80%', () => {
    const pred = { winner: 'home', confidence: 90 } as never
    const actual = { winner: 'home' } as never
    const result = calculateConfidenceScore(pred, actual, mockRules)
    expect(result).toBe(10)
  })

  it('SCORE-014: Incorrect winner prediction with confidence >80%', () => {
    const pred = { winner: 'home', confidence: 90 } as never
    const actual = { winner: 'away' } as never
    const result = calculateConfidenceScore(pred, actual, mockRules)
    expect(result).toBe(-10)
  })

  it('SCORE-015: Stage multiplier applied', () => {
    // All stat fields explicitly null (as real DB rows are when unfilled),
    // so only outcome + scoreline contribute.
    const pred = {
      winner: 'home', home_score: 1, away_score: 0, extra_time_home: null, extra_time_away: null, confidence: 50,
      possession_home: null, possession_away: null, shots_home: null, shots_away: null,
      xg_home: null, xg_away: null, yellow_home: null, yellow_away: null, red_home: null, red_away: null
    } as never
    const actual = {
      winner: 'home', home_score: 1, away_score: 0, extra_time_home: null, extra_time_away: null, penalty_home: null, penalty_away: null,
      possession_home: null, possession_away: null, shots_home: null, shots_away: null,
      xg_home: null, xg_away: null, yellow_home: null, yellow_away: null, red_home: null, red_away: null
    } as never
    const result = calculateMatchScore(pred, actual, mockRules, 2.0)
    // 20 (winner) + 40 (exact) = 60 * 2.0 = 120
    expect(result.multipliedTotal).toBe(120)
  })

  describe('Limited scoring mode (exact score + jersey scorer sets)', () => {
    // goal_scorers stored as per-team jersey-number sets { home: [], away: [] }
    const base = {
      winner: 'home', extra_time_home: null, extra_time_away: null,
      possession_home: 55, possession_away: 45, confidence: 90, penalty_home: null, penalty_away: null
    }

    it('awards exact score + exact scorers when both match', () => {
      const pred = { ...base, home_score: 2, away_score: 1, goal_scorers: { home: [10, 7], away: [9] } } as never
      const actual = { ...base, home_score: 2, away_score: 1, goal_scorers: { home: [7, 10], away: [9] } } as never
      const result = calculateMatchScore(pred, actual, mockRules, 1.0, true)
      // 40 exact scoreline + 25 exact scorers = 65; order-independent set match
      expect(result.breakdown.scoreline).toBe(40)
      expect(result.breakdown.scorer).toBe(25)
      expect(result.breakdown.stats).toBe(0)   // stats not scored in limited mode
      expect(result.breakdown.outcome).toBe(0) // winner not scored in limited mode
      expect(result.multipliedTotal).toBe(65)
    })

    it('wrong scorer set forfeits all scorer points (all-or-nothing)', () => {
      const pred = { ...base, home_score: 2, away_score: 1, goal_scorers: { home: [10, 7], away: [9] } } as never
      const actual = { ...base, home_score: 2, away_score: 1, goal_scorers: { home: [10, 8], away: [9] } } as never
      const result = calculateMatchScore(pred, actual, mockRules, 1.0, true)
      expect(result.breakdown.scoreline).toBe(40) // score still right
      expect(result.breakdown.scorer).toBe(0)     // one number off => 0
    })

    it('wrong score forfeits the scoreline points but scorers are judged independently', () => {
      // Score differs (2:0 vs 2:1) but the scorer sets are identical here.
      const pred = { ...base, home_score: 2, away_score: 0, goal_scorers: { home: [10, 7], away: [] } } as never
      const actual = { ...base, home_score: 2, away_score: 1, goal_scorers: { home: [10, 7], away: [] } } as never
      const result = calculateMatchScore(pred, actual, mockRules, 1.0, true)
      expect(result.breakdown.scoreline).toBe(0)  // score wrong
      expect(result.breakdown.scorer).toBe(25)    // scorer sets match => still awarded
    })

    it('a correctly predicted 0-0 earns the scorer points (empty set counts)', () => {
      const pred = { ...base, home_score: 0, away_score: 0, goal_scorers: { home: [], away: [] } } as never
      const actual = { ...base, home_score: 0, away_score: 0, goal_scorers: { home: [], away: [] } } as never
      const result = calculateMatchScore(pred, actual, mockRules, 1.0, true)
      expect(result.breakdown.scoreline).toBe(40)
      expect(result.breakdown.scorer).toBe(25)
      expect(result.multipliedTotal).toBe(65)
    })

    it('applies the stage multiplier', () => {
      const pred = { ...base, home_score: 1, away_score: 0, goal_scorers: { home: [11], away: [] } } as never
      const actual = { ...base, home_score: 1, away_score: 0, goal_scorers: { home: [11], away: [] } } as never
      const result = calculateMatchScore(pred, actual, mockRules, 5.0, true)
      // (40 + 25) * 5 = 325
      expect(result.multipliedTotal).toBe(325)
    })

    it('max possible in limited mode is exact-score + exact-scorers', () => {
      const pred = { ...base, home_score: 1, away_score: 0, goal_scorers: { home: [11], away: [] } } as never
      const actual = { ...base, home_score: 1, away_score: 0, goal_scorers: { home: [11], away: [] } } as never
      const result = calculateMatchScore(pred, actual, mockRules, 1.0, true)
      expect(result.maxPossible).toBe(65) // 40 + 25
    })
  })
})
