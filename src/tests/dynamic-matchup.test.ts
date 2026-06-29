import { describe, expect, it } from 'vitest'
import { getDynamicPrediction } from '../lib/scoring/calculator'

const prediction = (home: string, away: string, overrides = {}) => ({
  match_id: 'slot-1', predicted_home_team: home, predicted_away_team: away,
  home_score: 2, away_score: 1, winner: 'home',
  goal_scorers: { home: [7, 10], away: [9] },
  matches: { stage: 'round_of_16' }, ...overrides,
})
const actual = {
  match_id: 'slot-1', matches: {
    stage: 'round_of_16', home_team: 'Argentina', away_team: 'Brazil',
  },
}

describe('dynamic matchup identity', () => {
  it('requires both teams within the same stage', () => {
    expect(getDynamicPrediction([prediction('Argentina', 'Morocco')], actual)).toBeNull()
  })

  it('accepts the complete pair in reverse order and flips side-specific data', () => {
    const result = getDynamicPrediction([prediction('Brazil', 'Argentina')], actual)
    expect(result.home_score).toBe(1)
    expect(result.away_score).toBe(2)
    expect(result.winner).toBe('away')
    expect(result.goal_scorers).toEqual({ home: [9], away: [7, 10] })
  })

  it('does not compare a matching pair from another stage', () => {
    const otherStage = prediction('Argentina', 'Brazil', { matches: { stage: 'final' } })
    expect(getDynamicPrediction([otherStage], actual)).toBeNull()
  })
})
