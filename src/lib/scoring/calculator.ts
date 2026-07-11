/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from '../supabase/admin'
import { loadScoringRules } from './rules-loader'
import { calculateMatchScore, calculateChampionScore } from './engine'
import { normalizeTeamName } from '../teams'
export function getDynamicPrediction(teamPreds: any[], actual: any) {
  const actualStage = (actual.matches as any).stage
  const actualHome = (actual.matches as any).home_team
  const actualAway = (actual.matches as any).away_team

  let match = teamPreds.find(p => {
    if ((p.matches as any).stage !== actualStage) return false
    
    const pHome = normalizeTeamName(p.predicted_home_team)
    const pAway = normalizeTeamName(p.predicted_away_team)
    const aHome = normalizeTeamName(actualHome)
    const aAway = normalizeTeamName(actualAway)
    
    if (!pHome || !pAway || pHome === 'tbd' || pAway === 'tbd') return false

    return (pHome === aHome && pAway === aAway) || (pHome === aAway && pAway === aHome)
  })

  if (!match) {
    match = teamPreds.find(p => p.match_id === actual.match_id)
    if (!match) return null
  }

  const pHome = normalizeTeamName(match.predicted_home_team)
  const aHome = normalizeTeamName(actualHome)

  if (pHome && pHome !== 'tbd' && pHome !== aHome) {
    const flippedPred = { ...match }
    flippedPred.predicted_home_team = match.predicted_away_team
    flippedPred.predicted_away_team = match.predicted_home_team
    flippedPred.home_score = match.away_score
    flippedPred.away_score = match.home_score
    flippedPred.extra_time_home = match.extra_time_away
    flippedPred.extra_time_away = match.extra_time_home
    flippedPred.penalty_home = match.penalty_away
    flippedPred.penalty_away = match.penalty_home
    flippedPred.possession_home = match.possession_away
    flippedPred.possession_away = match.possession_home
    flippedPred.shots_home = match.shots_away
    flippedPred.shots_away = match.shots_home
    flippedPred.xg_home = match.xg_away
    flippedPred.xg_away = match.xg_home
    flippedPred.yellow_home = match.yellow_away
    flippedPred.yellow_away = match.yellow_home
    flippedPred.red_home = match.red_away
    flippedPred.red_away = match.red_home

    if (match.winner === 'home') flippedPred.winner = 'away'
    else if (match.winner === 'away') flippedPred.winner = 'home'

    if (match.goal_scorers && !Array.isArray(match.goal_scorers)) {
      flippedPred.goal_scorers = {
        home: match.goal_scorers.away || [],
        away: match.goal_scorers.home || []
      }
    }
    return flippedPred
  }

  return match
}

export async function recalculateAll() {
  const supabase = createAdminClient()
  const rules = await loadScoringRules()

  const [
    { data: teams },
    { data: predictions },
    { data: actuals },
    { data: champPreds },
    { data: champActual },
    { data: submissions },
  ] = await Promise.all([
    supabase.from('teams').select('id'),
    supabase.from('predictions').select('*, matches(stage)'),
    supabase.from('actual_results').select('*, matches(multiplier, home_team, away_team, stage)'),
    supabase.from('champion_predictions').select('*'),
    supabase.from('analytics_cache').select('metric_value').eq('metric_key', 'tournament_champion').maybeSingle(),
    supabase.from('submissions').select('team_id, locked_at'),
  ])

  if (!teams || teams.length === 0) return

  const predMap = new Map<string, any[]>()
  if (predictions) {
    for (const p of predictions) {
      if (!predMap.has(p.team_id)) predMap.set(p.team_id, [])
      predMap.get(p.team_id)!.push(p)
    }
  }

  const champMap = new Map<string, string>()
  if (champPreds) {
    for (const c of champPreds) {
      champMap.set(c.team_id, c.champion)
    }
  }

  const lockedMap = new Map<string, string>()
  if (submissions) {
    for (const s of submissions) {
      lockedMap.set(s.team_id, s.locked_at)
    }
  }

  const leaderboardEntries: any[] = []
  const actualChampVal = champActual?.metric_value as string | undefined

  for (const team of teams) {
    const teamPreds = predMap.get(team.id) || []
    
    let totalScore = 0
    let maxPossible = 0
    const breakdown = {
      winner_score: 0,
      scoreline_score: 0,
      scorer_score: 0,
      champion_score: 0
    }

    if (actuals && teamPreds.length > 0) {
      for (const actual of actuals) {
        const pred = getDynamicPrediction(teamPreds, actual)
        if (pred) {
          const multiplier = (actual.matches as any).multiplier as number
          const result = calculateMatchScore(pred, actual, rules, multiplier)

          totalScore += result.multipliedTotal
          maxPossible += result.maxPossible

          breakdown.winner_score += result.breakdown.outcome
          breakdown.scoreline_score += result.breakdown.scoreline
          breakdown.scorer_score += result.breakdown.scorer
        }
      }
    }

    const teamChamp = champMap.get(team.id)
    if (teamChamp && actualChampVal) {
      const cScore = calculateChampionScore(teamChamp, actualChampVal, rules)
      totalScore += cScore
      breakdown.champion_score += cScore
    }

    const accuracy = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0
    console.log(`Team: ${team.id}, Score: ${totalScore}, Max: ${maxPossible}`)

    leaderboardEntries.push({
      team_id: team.id,
      total_score: totalScore,
      accuracy_percentage: accuracy,
      ...breakdown,
      locked_at: lockedMap.get(team.id) || new Date().toISOString()
    })
  }

  leaderboardEntries.sort((a, b) => {
    if (b.total_score !== a.total_score) return Number(b.total_score) - Number(a.total_score)
    if (b.accuracy_percentage !== a.accuracy_percentage) return Number(b.accuracy_percentage) - Number(a.accuracy_percentage)
    if (b.winner_score !== a.winner_score) return Number(b.winner_score) - Number(a.winner_score)
    
    const aTime = new Date(a.locked_at).getTime()
    const bTime = new Date(b.locked_at).getTime()
    return aTime - bTime
  })

  const upsertPayload = leaderboardEntries.map((entry, index) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { locked_at, ...dbEntry } = entry
    return {
      ...dbEntry,
      rank: index + 1,
      updated_at: new Date().toISOString()
    }
  })

  if (upsertPayload.length > 0) {
    const CHUNK_SIZE = 500
    for (let i = 0; i < upsertPayload.length; i += CHUNK_SIZE) {
      const chunk = upsertPayload.slice(i, i + CHUNK_SIZE)
      const { error } = await supabase.from('leaderboard').upsert(chunk, { onConflict: 'team_id' })
      if (error) {
        console.error('UPSERT ERROR in recalculateAll:', error)
        throw new Error(`Failed to update leaderboard: ${error.message}`)
      }
    }
  }
}

export async function recalculateForMatch(matchId?: string) {
  void matchId
  await recalculateAll()
}

export async function recalculateForTeam(teamId: string, rulesMap?: any) {
  const supabase = createAdminClient()
  const rules = rulesMap || await loadScoringRules()

  const [
    { data: predictions },
    { data: actuals },
    { data: champPred },
    { data: champActual },
  ] = await Promise.all([
    supabase.from('predictions').select('*, matches(stage)').eq('team_id', teamId),
    supabase.from('actual_results').select('*, matches(multiplier, home_team, away_team, stage)'),
    supabase.from('champion_predictions').select('champion').eq('team_id', teamId).maybeSingle(),
    supabase.from('analytics_cache').select('metric_value').eq('metric_key', 'tournament_champion').maybeSingle(),
  ])

  let totalScore = 0
  let maxPossible = 0
  const breakdown = {
    winner_score: 0,
    scoreline_score: 0,
    scorer_score: 0,
    champion_score: 0
  }

  if (predictions && actuals) {
    for (const actual of actuals) {
      const pred = getDynamicPrediction(predictions, actual)
      if (pred) {
        const multiplier = (actual.matches as any).multiplier as number
        const result = calculateMatchScore(pred, actual, rules, multiplier)

        totalScore += result.multipliedTotal
        maxPossible += result.maxPossible

        breakdown.winner_score += result.breakdown.outcome
        breakdown.scoreline_score += result.breakdown.scoreline
        breakdown.scorer_score += result.breakdown.scorer
      }
    }
  }

  if (champPred && champActual && champActual.metric_value) {
    const cScore = calculateChampionScore(champPred.champion, champActual.metric_value as string, rules)
    totalScore += cScore
    breakdown.champion_score += cScore
  }

  const accuracy = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0
  
  await supabase
    .from('leaderboard')
    .upsert({
      team_id: teamId,
      total_score: totalScore,
      accuracy_percentage: accuracy,
      ...breakdown,
      updated_at: new Date().toISOString()
    }, { onConflict: 'team_id' })
    .throwOnError()
}
