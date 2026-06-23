/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from '../supabase/admin'
import { loadScoringRules } from './rules-loader'
import { calculateMatchScore, calculateChampionScore } from './engine'

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
    { data: settings }
  ] = await Promise.all([
    supabase.from('teams').select('id'),
    supabase.from('predictions').select('*'),
    supabase.from('actual_results').select('*, matches(multiplier, home_team, away_team)'),
    supabase.from('champion_predictions').select('*'),
    supabase.from('analytics_cache').select('metric_value').eq('metric_key', 'tournament_champion').maybeSingle(),
    supabase.from('submissions').select('team_id, locked_at'),
    supabase.from('competition_settings').select('tier1_only_mode').maybeSingle()
  ])

  const tier1Only = settings?.tier1_only_mode === true

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
      stats_score: 0,
      champion_score: 0,
      confidence_score: 0
    }

    if (actuals && teamPreds.length > 0) {
      for (const actual of actuals) {
        const pred = teamPreds.find(p => p.match_id === actual.match_id)
        if (pred) {
          const multiplier = (actual.matches as any).multiplier as number
          const result = calculateMatchScore(pred, actual, rules, multiplier, tier1Only)

          totalScore += result.multipliedTotal
          maxPossible += result.maxPossible

          breakdown.winner_score += result.breakdown.outcome
          breakdown.scoreline_score += result.breakdown.scoreline
          breakdown.scorer_score += result.breakdown.scorer
          breakdown.stats_score += result.breakdown.stats
          breakdown.confidence_score += result.breakdown.confidence
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
      await supabase.from('leaderboard').upsert(chunk, { onConflict: 'team_id' })
    }
  }
}

export async function recalculateForMatch(matchId: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    { data: settings }
  ] = await Promise.all([
    supabase.from('predictions').select('*').eq('team_id', teamId),
    supabase.from('actual_results').select('*, matches(multiplier, home_team, away_team)'),
    supabase.from('champion_predictions').select('champion').eq('team_id', teamId).maybeSingle(),
    supabase.from('analytics_cache').select('metric_value').eq('metric_key', 'tournament_champion').maybeSingle(),
    supabase.from('competition_settings').select('tier1_only_mode').maybeSingle()
  ])

  const tier1Only = settings?.tier1_only_mode === true

  let totalScore = 0
  let maxPossible = 0
  const breakdown = {
    winner_score: 0,
    scoreline_score: 0,
    scorer_score: 0,
    stats_score: 0,
    champion_score: 0,
    confidence_score: 0
  }

  if (predictions && actuals) {
    for (const actual of actuals) {
      const pred = predictions.find(p => p.match_id === actual.match_id)
      if (pred) {
        const multiplier = (actual.matches as any).multiplier as number
        const result = calculateMatchScore(pred, actual, rules, multiplier, tier1Only)

        totalScore += result.multipliedTotal
        maxPossible += result.maxPossible

        breakdown.winner_score += result.breakdown.outcome
        breakdown.scoreline_score += result.breakdown.scoreline
        breakdown.scorer_score += result.breakdown.scorer
        breakdown.stats_score += result.breakdown.stats
        breakdown.confidence_score += result.breakdown.confidence
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
}
