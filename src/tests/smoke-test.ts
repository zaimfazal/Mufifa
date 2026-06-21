import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { parseCsvText } from '../lib/csv/parser'
import { validateCsv } from '../lib/csv/validator'
import { generateTemplate } from '../lib/csv/template-generator'

// Provide correct keys from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function runSmokeTest() {
  console.log('--- CSV Upload Smoke Test ---')
  
  // 1. Fetch valid matches
  const { data: matches } = await supabase.from('matches').select('*')
  if (!matches || matches.length === 0) {
    console.error('FAIL: No matches in DB')
    process.exit(1)
  }
  
  // 2. Generate template
  const templateStr = generateTemplate(matches)
  
  // 3. Fake fill template
  const { rows, errors: parseErrors } = parseCsvText(templateStr)
  if (parseErrors.length > 0) throw new Error('Parse errors on template')

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
  const validMatchRefs = matches.map(m => ({
    match_code: m.match_code,
    home_team: m.home_team,
    away_team: m.away_team
  }))
  
  const validationResult = validateCsv(filledRows as any, validMatchRefs)
  
  if (!validationResult.valid) {
    console.error('FAIL: Validator did not pass', validationResult.errors)
    process.exit(1)
  } else {
    console.log('PASS: Validator passes')
  }

  // 5. Parser normalizes correctly
  const p1 = validationResult.predictions[0]
  if (p1.confidence === 75) {
    console.log('PASS: Parser normalizes confidence (0.75 -> 75)')
  } else {
    console.error('FAIL: Confidence normalization failed:', p1.confidence)
    process.exit(1)
  }

  if (p1.goal_scorers && p1.goal_scorers.length === 2 && p1.goal_scorers[0].name === 'Messi' && p1.goal_scorers[0].goals === 1) {
    console.log('PASS: Parser normalizes multi-scorer (Messi,Ronaldo -> 1 goal each)')
  } else {
    console.error('FAIL: Goal scorer normalization failed:', p1.goal_scorers)
    process.exit(1)
  }

  // 6. Test DB
  const { data: teams, error: tErr } = await supabase.from('teams').select('id').limit(1)
  if (teams && teams.length > 0) {
    const teamId = teams[0].id
    
    // Unlock team for test
    await supabase.from('teams').update({ submission_locked: false }).eq('id', teamId)
    
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('submit_predictions', {
      p_team_id: teamId,
      p_file_path: 'smoke-test.csv',
      p_file_name: 'smoke-test.csv',
      p_champion: validationResult.champion,
      p_predictions: validationResult.predictions
    })
    
    if (rpcErr) {
      console.error('FAIL: RPC failed:', rpcErr)
      process.exit(1)
    }

    const { data: dbPreds } = await supabase.from('predictions').select('*').eq('team_id', teamId).limit(1)
    if (dbPreds && dbPreds.length > 0 && dbPreds[0].confidence === 75 && dbPreds[0].goal_scorers.length === 2) {
      console.log('PASS: DB rows are stored correctly')
    } else {
      console.error('FAIL: DB rows not stored correctly:', dbPreds)
      process.exit(1)
    }
    
    const { data: board } = await supabase.from('leaderboard').select('*').eq('team_id', teamId).single()
    if (board) {
      console.log('PASS: Leaderboard updates correctly')
    } else {
      console.error('FAIL: Leaderboard missing')
      process.exit(1)
    }
  } else {
    console.log('SKIP: No test team found in DB to test RPC')
  }
}

runSmokeTest().catch(console.error)
