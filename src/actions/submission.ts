'use server'

import { createClient } from '@/lib/supabase/server'
import { parseCsvText } from '@/lib/csv/parser'
import { validateCsv } from '@/lib/csv/validator'
import { generateTemplate } from '@/lib/csv/template-generator'
import { revalidatePath } from 'next/cache'
import { globalRateLimiter } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function uploadSubmission(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }
  
  if (file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
    return { error: 'Invalid file type. Only CSV files are allowed.' }
  }
  
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File size exceeds 5MB limit.' }
  }
  
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Rate limiting: max 5 requests per 1 minute per user
  const { success } = await globalRateLimiter.check(`upload_${user.id}`, 5, 60 * 1000)
  if (!success) {
    return { error: 'Too many upload attempts. Please try again later.' }
  }

  // Get user's team
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!team) return { error: 'No team found. Please create a team first.' }
  if (team.submission_locked) return { error: 'Your submission is already locked.' }

  const text = await file.text()
  
  // Parse
  const { rows, errors: parseErrors } = parseCsvText(text)
  if (parseErrors.length > 0) {
    return { validationResult: { valid: false, errors: parseErrors.map((e) => ({ row: 0, column: 'file', message: e })), predictions: [], champion: '' } }
  }

  // Fetch valid matches
  const { data: matches } = await supabase
    .from('matches')
    .select('match_code, home_team, away_team')

  // Validate
  const validationResult = validateCsv(rows, matches || [])

  if (!validationResult.valid) {
    // Record failed submission attempt
    await supabase.from('submissions').insert({
      team_id: team.id,
      file_path: 'failed_upload',
      file_name: file.name,
      is_valid: false,
      validation_errors: validationResult.errors,
    })
    return { validationResult }
  }

  // Upload to storage
  const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filePath = `${team.id}/${Date.now()}_${safeFilename}`
  const { error: uploadError } = await supabase.storage
    .from('prediction-files')
    .upload(filePath, file)

  if (uploadError) {
    logger.error({ err: uploadError }, 'Unhandled upload submission error:')
    return { error: 'Failed to upload file to storage' }
  }

  // Transaction-like insert for predictions
  // Note: Supabase JS client doesn't have true transactions unless via RPC,
  // but we can insert sequentially and rollback if needed, or use a Postgres function.
  // We'll insert predictions one by one or batch.
  
  // First fetch real match UUIDs
  const { data: allMatches } = await supabase.from('matches').select('id, match_code')
  const matchMap = new Map((allMatches || []).map(m => [m.match_code, m.id]))

  const predictions = validationResult.predictions.map(p => ({
    match_id: matchMap.get(p.match_id)!,
    winner: p.winner,
    home_score: p.home_score,
    away_score: p.away_score,
    extra_time_home: p.extra_time_home,
    extra_time_away: p.extra_time_away,
    penalty_home: p.penalty_home,
    penalty_away: p.penalty_away,
    goal_scorers: p.goal_scorers,
    first_goal_scorer: p.first_goal_scorer,
    possession_home: p.possession_home,
    possession_away: p.possession_away,
    shots_home: p.shots_home,
    shots_away: p.shots_away,
    xg_home: p.xg_home,
    xg_away: p.xg_away,
    yellow_home: p.yellow_home,
    yellow_away: p.yellow_away,
    red_home: p.red_home,
    red_away: p.red_away,
    confidence: p.confidence
  }))

  const { error: rpcError } = await supabase.rpc('submit_predictions', {
    p_team_id: team.id,
    p_file_path: filePath,
    p_file_name: file.name,
    p_champion: validationResult.champion || null,
    p_predictions: predictions
  })

  if (rpcError) {
    logger.error({ err: rpcError }, 'RPC submission error:')
    return { error: 'Failed to save predictions: ' + rpcError.message }
  }

  // Log audit
  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'upload_submission',
    entity_type: 'team',
    entity_id: team.id
  })

  revalidatePath('/dashboard')
  revalidatePath('/submit')

  return { success: true }
}

export async function getMySubmission() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: team } = await supabase
    .from('teams')
    .select('id, team_name, submission_locked')
    .eq('owner_id', user.id)
    .single()

  if (!team) return null

  const { data: submission } = await supabase
    .from('submissions')
    .select('*')
    .eq('team_id', team.id)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single()

  const { count } = await supabase
    .from('predictions')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', team.id)

  return {
    team,
    submission,
    predictionCount: count || 0
  }
}

export async function downloadTemplate() {
  const supabase = await createClient()
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_time', { ascending: true })

  const csvContent = generateTemplate(matches || [])
  return csvContent
}

export async function createTeam(formData: FormData) {
  const teamName = formData.get('team_name') as string
  if (!teamName || teamName.length < 3) return { error: 'Team name must be at least 3 characters' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Rate limiting: max 3 requests per 5 minutes per user
  const { success } = await globalRateLimiter.check(`createTeam_${user.id}`, 3, 5 * 60 * 1000)
  if (!success) {
    return { error: 'Too many team creation attempts. Please try again later.' }
  }

  const { error } = await supabase.from('teams').insert({
    owner_id: user.id,
    team_name: teamName
  })

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { error: 'You already have a team or this team name is taken.' }
    }
    return { error: error.message }
  }

  revalidatePath('/submit')
  return { success: true }
}
