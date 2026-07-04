/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { calculateChampionScore, calculateMatchScore, calculateMaxPossibleScore } from '../lib/scoring/engine'
import { ScoringRule } from '@/types/scoring'

const rules: Record<string, ScoringRule> = {
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

describe('Scoring Engine Extended (QA Tests)', () => {
  it('ENGINE-001: Champion score correctly allocates points', () => {
    expect(calculateChampionScore('France', 'France', rules)).toBe(250)
    expect(calculateChampionScore('Brazil', 'France', rules)).toBe(0)
  })

  it('ENGINE-002: Max possible score calculation', () => {
    // All 9 rules: 5+5+20+10+10+15+100+100+50 = 315
    expect(calculateMaxPossibleScore(rules, 1.0)).toBe(315)
    expect(calculateMaxPossibleScore(rules, 2.0)).toBe(630)
    expect(calculateMaxPossibleScore(rules, 5.0)).toBe(1575)
  })

  it('ENGINE-003: Full match scoring with all predictions correct', () => {
    const pred = {
      winner: 'home', home_score: 2, away_score: 1,
      goal_scorers: { home: [10, 7], away: [9] }
    } as any
    const actual = {
      winner: 'home', home_score: 2, away_score: 1,
      goal_scorers: { home: [7, 10], away: [9] },
      matches: { home_team: 'France', away_team: 'Brazil' }
    } as any
    const result = calculateMatchScore(pred, actual, rules, 1.0)
    expect(result.multipliedTotal).toBe(315) // all correct
    expect(result.breakdown.outcome).toBe(30)
    expect(result.breakdown.scoreline).toBe(35)
    expect(result.breakdown.scorer).toBe(250)
  })
})
