/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { calculateMatchScore, calculateChampionScore } from '../lib/scoring/engine'
import { ScoringRule } from '@/types/scoring'

// Mock rules aligned with the new 9-rule scoring engine
const mockRules: Record<string, ScoringRule> = {
  home_team_correct: { rule_key: 'home_team_correct', rule_name: 'Home Team', points: 5, is_enabled: true },
  away_team_correct: { rule_key: 'away_team_correct', rule_name: 'Away Team', points: 5, is_enabled: true },
  predicted_winner_correct: { rule_key: 'predicted_winner_correct', rule_name: 'Winner', points: 20, is_enabled: true },
  home_goals_correct: { rule_key: 'home_goals_correct', rule_name: 'Home Goals', points: 10, is_enabled: true },
  away_goals_correct: { rule_key: 'away_goals_correct', rule_name: 'Away Goals', points: 10, is_enabled: true },
  goal_difference_correct: { rule_key: 'goal_difference_correct', rule_name: 'Goal Diff', points: 15, is_enabled: true },
  scorer_match_home: { rule_key: 'scorer_match_home', rule_name: 'Scorer Home', points: 100, is_enabled: true },
  scorer_match_away: { rule_key: 'scorer_match_away', rule_name: 'Scorer Away', points: 100, is_enabled: true },
  all_correct_bonus: { rule_key: 'all_correct_bonus', rule_name: 'All Correct', points: 50, is_enabled: true },
  tournament_champion: { rule_key: 'tournament_champion', rule_name: 'Champion', points: 250, is_enabled: true },
}

// outcome = home_team_correct(5) + away_team_correct(5) + predicted_winner_correct(20) = 30
// scoreline = home_goals_correct(10) + away_goals_correct(10) + goal_difference_correct(15) = 35
// scorer = scorer_match_home(100) + scorer_match_away(100) + all_correct_bonus(50) = 250
// max per match = 30 + 35 + 250 = 315

describe('Scoring Engine (Acceptance Tests)', () => {
  it('SCORE-001: Correct winner awards outcome points', () => {
    const pred = { winner: 'home', home_score: 2, away_score: 0, goal_scorers: null } as any
    const actual = { winner: 'home', home_score: 1, away_score: 0, goal_scorers: null, matches: { home_team: 'France', away_team: 'Brazil' } } as any
    const result = calculateMatchScore(pred, actual, mockRules, 1.0)
    // outcome: 5 + 5 + 20 = 30
    expect(result.breakdown.outcome).toBe(30)
  })

  it('SCORE-002: Wrong winner gets only team points', () => {
    const pred = { winner: 'away', home_score: 1, away_score: 0, goal_scorers: null } as any
    const actual = { winner: 'home', home_score: 1, away_score: 0, goal_scorers: null, matches: { home_team: 'France', away_team: 'Brazil' } } as any
    const result = calculateMatchScore(pred, actual, mockRules, 1.0)
    // outcome: 5 + 5 + 0 = 10 (winner wrong)
    expect(result.breakdown.outcome).toBe(10)
  })

  it('SCORE-003: Exact scoreline awards scoreline points', () => {
    const pred = { winner: 'home', home_score: 3, away_score: 1, goal_scorers: null } as any
    const actual = { winner: 'home', home_score: 3, away_score: 1, goal_scorers: null, matches: { home_team: 'France', away_team: 'Brazil' } } as any
    const result = calculateMatchScore(pred, actual, mockRules, 1.0)
    // scoreline: 10 + 10 + 15 = 35 (exact score + correct diff since winner correct)
    expect(result.breakdown.scoreline).toBe(35)
  })

  it('SCORE-004: Wrong score but correct goal difference', () => {
    const pred = { winner: 'home', home_score: 2, away_score: 0, goal_scorers: null } as any
    const actual = { winner: 'home', home_score: 3, away_score: 1, goal_scorers: null, matches: { home_team: 'France', away_team: 'Brazil' } } as any
    const result = calculateMatchScore(pred, actual, mockRules, 1.0)
    // scoreline: 0 + 0 + 15 = 15 (scores wrong, but diff correct & winner correct)
    expect(result.breakdown.scoreline).toBe(15)
  })

  it('SCORE-005: Stage multiplier applied', () => {
    const pred = { winner: 'home', home_score: 1, away_score: 0, goal_scorers: null } as any
    const actual = { winner: 'home', home_score: 1, away_score: 0, goal_scorers: null, matches: { home_team: 'France', away_team: 'Brazil' } } as any
    const result = calculateMatchScore(pred, actual, mockRules, 2.0)
    // unmultiplied: outcome(30) + scoreline(35) + scorer(0, no scorers) = 65
    // multiplied: 315 * 2 = 630
    expect(result.multipliedTotal).toBe(630)
  })

  it('SCORE-006: Champion prediction correct', () => {
    expect(calculateChampionScore('France', 'France', mockRules)).toBe(250)
  })

  it('SCORE-007: Champion prediction incorrect', () => {
    expect(calculateChampionScore('Brazil', 'France', mockRules)).toBe(0)
  })

  describe('Jersey scorer matching', () => {
    it('awards full scorer points when jersey sets match exactly', () => {
      const pred = { winner: 'home', home_score: 2, away_score: 1, goal_scorers: { home: [10, 7], away: [9] } } as any
      const actual = { winner: 'home', home_score: 2, away_score: 1, goal_scorers: { home: [7, 10], away: [9] }, matches: { home_team: 'France', away_team: 'Brazil' } } as any
      const result = calculateMatchScore(pred, actual, mockRules, 1.0)
      // scorer: 100 + 100 + 50 (all correct bonus) = 250
      expect(result.breakdown.scorer).toBe(250)
    })

    it('awards fractional scorer points for partial match', () => {
      const pred = { winner: 'home', home_score: 2, away_score: 1, goal_scorers: { home: [10, 7], away: [9] } } as any
      const actual = { winner: 'home', home_score: 2, away_score: 1, goal_scorers: { home: [10, 8], away: [9] }, matches: { home_team: 'France', away_team: 'Brazil' } } as any
      const result = calculateMatchScore(pred, actual, mockRules, 1.0)
      // home: 1/2 correct (10 matches, 7 doesn't) = 50 pts; away: 1/1 correct = 100 pts; no all_correct_bonus
      expect(result.breakdown.scorer).toBe(150)
    })

    it('awards home scorer points when home score is correct even if away score is wrong', () => {
      const pred = { winner: 'home', home_score: 2, away_score: 0, goal_scorers: { home: [10, 7], away: [] } } as any
      const actual = { winner: 'home', home_score: 2, away_score: 1, goal_scorers: { home: [10, 7], away: [] }, matches: { home_team: 'France', away_team: 'Brazil' } } as any
      const result = calculateMatchScore(pred, actual, mockRules, 1.0)
      // home score is correct and home scorers match, so home scorer points are awarded independently
      expect(result.breakdown.scorer).toBe(100)
    })

    it('awards away scorer points when away score is correct even if home score is wrong', () => {
      const pred = { winner: 'away', home_score: 0, away_score: 2, goal_scorers: { home: [], away: [9, 11] } } as any
      const actual = { winner: 'away', home_score: 1, away_score: 2, goal_scorers: { home: [], away: [9, 11] }, matches: { home_team: 'France', away_team: 'Brazil' } } as any
      const result = calculateMatchScore(pred, actual, mockRules, 1.0)
      expect(result.breakdown.scorer).toBe(100)
    })

    it('0-0 with no scorers earns full scorer points', () => {
      const pred = { winner: 'draw', home_score: 0, away_score: 0, goal_scorers: { home: [], away: [] } } as any
      const actual = { winner: 'draw', home_score: 0, away_score: 0, goal_scorers: { home: [], away: [] }, matches: { home_team: 'France', away_team: 'Brazil' } } as any
      const result = calculateMatchScore(pred, actual, mockRules, 1.0)
      // scorer: 100 + 100 + 50 = 250
      expect(result.breakdown.scorer).toBe(250)
      expect(result.multipliedTotal).toBe(315) // 30 + 35 + 250
    })

    it('applies stage multiplier to scorer points', () => {
      const pred = { winner: 'home', home_score: 1, away_score: 0, goal_scorers: { home: [11], away: [] } } as any
      const actual = { winner: 'home', home_score: 1, away_score: 0, goal_scorers: { home: [11], away: [] }, matches: { home_team: 'France', away_team: 'Brazil' } } as any
      const result = calculateMatchScore(pred, actual, mockRules, 5.0)
      // (30 + 35 + 250) * 5 = 1575
      expect(result.multipliedTotal).toBe(1575)
    })

    it('max possible score equals all rules combined times multiplier', () => {
      const pred = { winner: 'home', home_score: 1, away_score: 0, goal_scorers: { home: [11], away: [] } } as any
      const actual = { winner: 'home', home_score: 1, away_score: 0, goal_scorers: { home: [11], away: [] }, matches: { home_team: 'France', away_team: 'Brazil' } } as any
      const result = calculateMatchScore(pred, actual, mockRules, 1.0)
      expect(result.maxPossible).toBe(315)
    })
  })
})
