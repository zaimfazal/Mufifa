import { describe, expect, it } from 'vitest'
import { calculateMatchScore } from '../lib/scoring/engine'
import type { ScoringRule } from '@/types/scoring'

const rule = (rule_key: string, points: number): ScoringRule => ({
  rule_key, rule_name: rule_key, points, is_enabled: true,
})

const rules = Object.fromEntries([
  rule('home_team_correct', 5), rule('away_team_correct', 5),
  rule('predicted_winner_correct', 20), rule('home_goals_correct', 10),
  rule('away_goals_correct', 10), rule('goal_difference_correct', 15),
  rule('scorer_match_home', 30), rule('scorer_match_away', 30),
  rule('all_correct_bonus', 250),
].map(item => [item.rule_key, item]))

describe('legacy official results without a stored winner', () => {
  it('derives the winner from a complete scoreline', () => {
    const prediction = { winner: 'home', home_score: 2, away_score: 1,
      goal_scorers: { home: [7, 10], away: [9] } }
    const actual = { winner: null, home_score: 2, away_score: 1,
      goal_scorers: { home: [10, 7], away: [9] } }

    const result = calculateMatchScore(prediction as never, actual as never, rules, 1)
    expect(result.multipliedTotal).toBe(375)
    expect(result.breakdown.outcome).toBe(30)
  })
})
