import { describe, it, expect } from 'vitest'
import { validateCsv } from '../lib/csv/validator'
import { parseGoalScorers } from '../lib/csv/parser'
import { normalizePlayerName } from '../lib/csv/name-normalizer'

describe('CSV Pipeline (QA Tests)', () => {
  it('CSV-001: parseGoalScorers accurately splits semicolon delineated lists', () => {
    const parsed = parseGoalScorers('Messi:2;Ronaldo:1')
    expect(parsed).toHaveLength(2)
    expect(parsed?.[0].name).toBe('Messi')
    expect(parsed?.[0].goals).toBe(2)
  })

  it('CSV-002: normalizePlayerName normalizes special characters', () => {
    expect(normalizePlayerName('Kylian Mbappé', ['Kylian Mbappe'])).toBe('Kylian Mbappe')
  })

  it('CSV-003: validateCsv validates match counts and schema bounds', () => {
    const validMatches = [{ match_code: 'M1', home_team: 'France', away_team: 'Brazil' }]
    const rows = [
      {
        match_id: 'M1', home_team: 'France', away_team: 'Brazil', predicted_winner: 'France',
        predicted_home_score: '2', predicted_away_score: '1', predicted_possession_home: '50', predicted_possession_away: '50',
        predicted_shots_home: '10', predicted_shots_away: '8', predicted_xg_home: '1.5', predicted_xg_away: '0.8',
        predicted_yellow_home: '1', predicted_yellow_away: '2', predicted_red_home: '0', predicted_red_away: '0',
        predicted_extra_time_home: '', predicted_extra_time_away: '', predicted_penalty_home: '', predicted_penalty_away: '',
        predicted_goal_scorers: 'Mbappe:2', predicted_first_goal_scorer: 'Mbappe',
        confidence: '90', tournament_champion: 'France', __requiresChampion: true
      }
    ] as any

    const result = validateCsv(rows, validMatches)
    expect(result.valid).toBe(true)
    expect(result.champion).toBe('France')
    expect(result.predictions).toHaveLength(1)
  })

  it('CSV-004: validateCsv denies invalid possession sums', () => {
    const validMatches = [{ match_code: 'M1', home_team: 'France', away_team: 'Brazil' }]
    const rows = [
      {
        match_id: 'M1', home_team: 'France', away_team: 'Brazil', predicted_winner: 'France',
        predicted_home_score: '2', predicted_away_score: '1', 
        predicted_possession_home: '60', predicted_possession_away: '50', // 110 != 100
        predicted_shots_home: '10', predicted_shots_away: '8', predicted_xg_home: '1.5', predicted_xg_away: '0.8',
        predicted_yellow_home: '1', predicted_yellow_away: '2', predicted_red_home: '0', predicted_red_away: '0',
        predicted_extra_time_home: '', predicted_extra_time_away: '', predicted_penalty_home: '', predicted_penalty_away: '',
        predicted_goal_scorers: 'Mbappe:2', predicted_first_goal_scorer: 'Mbappe',
        confidence: '90', tournament_champion: 'France', __requiresChampion: true
      }
    ] as any

    const result = validateCsv(rows, validMatches)
    expect(result.valid).toBe(false)
    expect(result.errors[0].message).toContain('Possession must sum strictly to 100')
  })
})
