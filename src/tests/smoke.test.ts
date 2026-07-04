import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { parseCsvText } from '../lib/csv/parser'
import { validateCsv } from '../lib/csv/validator'
import { generateTemplate } from '../lib/csv/template-generator'
import { config } from 'dotenv'
config({ path: '.env.local' })

describe('CSV Upload Smoke Test', () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'
  const supabase = createClient(supabaseUrl, supabaseKey)

  it('SMOKE-001: Verifies full upload pipeline with specific values', { timeout: 30000 }, async () => {
    // 1. Fetch valid matches
    const { data: matches } = await supabase.from('matches').select('*').in('stage', ['quarter_final', 'semi_final', 'third_place', 'final'])
    if (!matches || matches.length === 0) {
      console.warn('SKIP: No matches in DB, skipping full pipeline')
      return
    }
    
    // 2. Generate template
    const templateStr = generateTemplate(matches)
    
    // 3. Fake fill template
    const { rows, errors: parseErrors } = parseCsvText(templateStr)
    expect(parseErrors).toHaveLength(0)

    const filledRows = rows.map(r => ({
      ...r,
      predicted_winner: r.home_team,
      predicted_home_score: '2',
      predicted_away_score: '1',
      predicted_possession_home: '50',
      predicted_possession_away: '50',
      predicted_shots_home: '10',
      predicted_shots_away: '8',
      predicted_xg_home: '1.5',
      predicted_xg_away: '0.8',
      predicted_yellow_home: '1',
      predicted_yellow_away: '2',
      predicted_red_home: '0',
      predicted_red_away: '0',
      predicted_extra_time_home: '',
      predicted_extra_time_away: '',
      predicted_penalty_home: '',
      predicted_penalty_away: '',
      predicted_first_goal_scorer: 'Messi',
      tournament_champion: r.home_team,
      
      // THE TEST VALUES
      confidence: '0.75',
      predicted_goal_scorers: 'Messi,Ronaldo',
      __requiresChampion: true
    }))

    // 4. Validate
    const validMatchRefs = matches.map((m: { match_code: string; home_team: string; away_team: string; id: string }) => ({
      match_code: m.match_code,
      home_team: m.home_team,
      away_team: m.away_team
    }))
    
    const validationResult = validateCsv(filledRows as unknown as import("../types/predictions").CsvRow[], validMatchRefs)
    expect(validationResult.valid).toBe(true)
    expect(validationResult.errors).toHaveLength(0)

    // 5. Parser normalizes correctly
    const p1 = validationResult.predictions[0]
    expect(p1.confidence).toBe(75)
    expect(p1.goal_scorers).toHaveLength(2)
    expect(p1.goal_scorers![0]).toEqual({ name: 'Messi', goals: 1 })
    expect(p1.goal_scorers![1]).toEqual({ name: 'Ronaldo', goals: 1 })

    // 6. Test DB
    const { data: teams } = await supabase.from('teams').select('id').limit(1)
    if (teams && teams.length > 0) {
      const teamId = teams[0].id
      
      // Unlock team for test
      await supabase.from('teams').update({ submission_locked: false }).eq('id', teamId)
      
      const matchMap = new Map(matches.map(m => [m.match_code, m.id]))
      const rpcPredictions = validationResult.predictions.map(p => ({
        match_id: matchMap.get(p.match_id)!,
        predicted_home_team: p.predicted_home_team,
        predicted_away_team: p.predicted_away_team,
        winner: p.winner,
        home_score: p.home_score,
        away_score: p.away_score,
        goal_scorers: p.goal_scorers_jersey ?? p.goal_scorers
      }))

      const { data: dbPreds, error: insertErr } = await supabase.from('predictions').insert(
        rpcPredictions.map(p => ({
          ...p,
          team_id: teamId
        }))
      ).select()
      
      expect(insertErr).toBeNull()

      expect(dbPreds![0].goal_scorers).toHaveLength(2)
      
      const { data: board } = await supabase.from('leaderboard').select('*').eq('team_id', teamId).single()
      expect(board).toBeDefined()
    } else {
      console.warn('SKIP: No test team found in DB to test RPC')
    }
  })
})
