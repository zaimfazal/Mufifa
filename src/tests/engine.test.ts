/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { calculatePenaltyScore, calculateStatsScore, calculateChampionScore, calculateScorerScore } from '../lib/scoring/engine'

describe('Scoring Engine Extended (QA Tests)', () => {
  const rules = {
    penalty_winner: { points: 10 },
    penalty_score: { points: 15 },
    possession_accuracy: { points: 5 },
    shots_accuracy: { points: 5 },
    xg_accuracy: { points: 5 },
    yellow_cards_accuracy: { points: 5 },
    red_cards_exact: { points: 5 },
    champion_prediction: { points: 50 },
    correct_scorer: { points: 5 },
    correct_goal_count: { points: 5 },
    exact_scorer_list: { points: 10 },
    first_goal_scorer: { points: 5 }
  } as any

  it('ENGINE-001: Penality score correctly allocates points', () => {
    const pred = { penalty_home: 5, penalty_away: 4, home_score: 1, away_score: 1 } as any
    const actual = { penalty_home: 5, penalty_away: 4, home_score: 1, away_score: 1 } as any
    expect(calculatePenaltyScore(pred, actual, rules)).toBe(25) // Winner + Score
  })

  it('ENGINE-002: Champion score correctly allocates points', () => {
    expect(calculateChampionScore('France', 'France', rules)).toBe(50)
    expect(calculateChampionScore('Brazil', 'France', rules)).toBe(0)
  })

  it('ENGINE-003: Stats score within tolerance', () => {
    const pred = {
      possession_home: 52, possession_away: 48,
      shots_home: 10, shots_away: 10,
      xg_home: 1.5, xg_away: 1.0,
      yellow_home: 2, yellow_away: 2,
      red_home: 0, red_away: 0
    } as any
    const actual = {
      possession_home: 50, possession_away: 50,
      shots_home: 11, shots_away: 9,
      xg_home: 1.6, xg_away: 1.1,
      yellow_home: 2, yellow_away: 2,
      red_home: 0, red_away: 0
    } as any
    expect(calculateStatsScore(pred, actual, rules)).toBe(25) // All within tolerance
  })
})
