'use server'

import { createClient } from '@/lib/supabase/server'
import { parseLimitedCsvText, isLimitedCsvText } from '@/lib/csv/parser'
import { validateLimitedCsv } from '@/lib/csv/validator'
import { generateTemplate } from '@/lib/csv/template-generator'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { globalRateLimiter } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function uploadSubmission(formData: FormData) {
  const file = formData.get('file') as File
  const githubLink = formData.get('github_link') as string
  
  if (!file) return { error: 'No file provided' }
  if (!githubLink || githubLink.trim() === '') return { error: 'GitHub repository link is required.' }
  
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
  if (team.submission_locked) return { error: 'Your submission has been locked by an administrator.' }

  // Check global submission deadline + active scoring mode
  const { data: settings } = await supabase
    .from('competition_settings')
    .select('submission_deadline, submissions_open, tier1_only_mode')
    .single()

  if (settings) {
    if (settings.submissions_open === false) {
      return { error: 'Submissions are currently closed by administrators.' }
    }
    if (settings.submission_deadline && new Date() > new Date(settings.submission_deadline)) {
      return { error: 'Submissions are closed. The prediction window ended when the Quarter Finals began.' }
    }
  }

  const text = await file.text()

  // Fetch valid matches
  const { data: matches } = await supabase
    .from('matches')
    .select('match_code, home_team, away_team, stage')
    .in('stage', ['quarter_final', 'semi_final', 'third_place', 'final'])

  // The active competition uses the limited template (exact score + scorer
  // jersey numbers) for everyone. We always parse/validate in that format so it
  // doesn't depend on a per-session read of the mode flag.
  let validationResult
  if (!isLimitedCsvText(text)) {
    return { validationResult: { valid: false, errors: [{ row: 0, column: 'file', message: 'Please use the current template (match, exact score, scorer jersey numbers). Download it with "Get Template".' }], predictions: [] } }
  }
  const { rows, errors: parseErrors } = parseLimitedCsvText(text)
  if (parseErrors.length > 0) {
    return { validationResult: { valid: false, errors: parseErrors.map((e) => ({ row: 0, column: 'file', message: e })), predictions: [] } }
  }
  validationResult = validateLimitedCsv(rows, matches || [])

  if (!validationResult.valid) {
    // Record failed submission attempt. submissions has UNIQUE(team_id), so
    // upsert on team_id rather than insert (avoids duplicate-key errors across
    // repeated upload attempts).
    await supabase.from('submissions').upsert({
      team_id: team.id,
      file_path: 'failed_upload',
      file_name: file.name,
      is_valid: false,
      validation_errors: validationResult.errors,
    }, { onConflict: 'team_id' })
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
    predicted_home_team: p.predicted_home_team,
    predicted_away_team: p.predicted_away_team,
    winner: p.winner,
    home_score: p.home_score,
    away_score: p.away_score,
    extra_time_home: p.extra_time_home,
    extra_time_away: p.extra_time_away,
    penalty_home: p.penalty_home,
    penalty_away: p.penalty_away,
    // Limited mode stores jersey-number sets { home, away }; full mode stores GoalScorer[].
    goal_scorers: p.goal_scorers_jersey ?? p.goal_scorers,
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

  // Bypass the broken RPC on the database by performing the inserts directly
  // We use the admin client because the default authenticated client is blocked 
  // by RLS from deleting predictions, which would cause duplicate key errors.
  const adminClient = createAdminClient()

  // 1. Check if team has been manually locked by an admin
  const { data: teamLockCheck } = await supabase.from('teams').select('submission_locked').eq('id', team.id).single()
  if (teamLockCheck?.submission_locked) {
    return { error: 'Team submission is locked.' }
  }

  // 2. Clear existing predictions so the new file fully replaces them
  await adminClient.from('predictions').delete().eq('team_id', team.id)

  // 3. Insert predictions (only mapping the columns that actually exist in the DB)
  const { error: insertError } = await adminClient.from('predictions').insert(
    predictions.map(p => ({
      team_id: team.id,
      match_id: p.match_id,
      predicted_home_team: p.predicted_home_team,
      predicted_away_team: p.predicted_away_team,
      winner: p.winner,
      home_score: p.home_score,
      away_score: p.away_score,
      goal_scorers: p.goal_scorers
    }))
  )
  
  if (insertError) {
    logger.error({ err: insertError }, 'Direct insert submission error:')
    return { error: 'Failed to save predictions: ' + insertError.message }
  }

  // 4. Upsert submission
  await supabase.from('submissions').upsert({
    team_id: team.id,
    file_path: filePath,
    file_name: file.name,
    is_valid: true,
    validation_errors: null,
    locked_at: new Date().toISOString()
  }, { onConflict: 'team_id' })

  // 5. Ensure leaderboard entry exists
  await supabase.from('leaderboard').insert({ team_id: team.id }).select().maybeSingle()

  // 6. Update github_link in teams table
  await supabase.from('teams').update({ github_link: githubLink.trim() }).eq('id', team.id)

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
    .select('id, team_name, submission_locked, github_link')
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
  try {
    const supabase = await createClient()
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .in('stage', ['quarter_final', 'semi_final', 'third_place', 'final'])
      .order('kickoff_time', { ascending: true })

    if (error) {
      console.error('Supabase error in downloadTemplate:', error)
      throw new Error('Database error')
    }

    const csvContent = generateTemplate(matches || [], true)
    return csvContent
  } catch (err) {
    console.error('downloadTemplate error:', err)
    throw err
  }
}

export async function createTeam(formData: FormData) {
  const teamName = formData.get('team_name') as string
  if (!teamName || teamName.length < 3) return { error: 'Nickname must be at least 3 characters' }

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
      return { error: 'You already have a team or this nickname is taken.' }
    }
    return { error: error.message }
  }

  revalidatePath('/submit')
  return { success: true }
}
