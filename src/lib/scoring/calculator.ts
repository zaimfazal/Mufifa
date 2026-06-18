/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from '../supabase/admin'
import { loadScoringRules } from './rules-loader'
import { calculateMatchScore, calculateChampionScore } from './engine'

export async function recalculateAll() {
  const supabase = createAdminClient()
  const rules = await loadScoringRules()

  const { data: teams } = await supabase.from('teams').select('id')
  if (!teams) return

  for (const team of teams) {
    await recalculateForTeam(team.id, rules)
  }

  // Rank assignment
  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')
    .order('total_score', { ascending: false })
    .order('accuracy_percentage', { ascending: false })
    .order('winner_score', { ascending: false })

  if (leaderboard) {
    const updates = leaderboard.map((entry, index) => ({
      id: entry.id,
      team_id: entry.team_id,
      rank: index + 1
    }))
    
    // Batch upsert ranks
    await supabase.from('leaderboard').upsert(updates)
  }
}

export async function recalculateForMatch(matchId: string) {
  const supabase = createAdminClient()
  
  // Recompute scores only for this match? 
  // Wait, total_score is an aggregate. Safer to just recalculate everything for teams that predicted this match.
  const { data: predictions } = await supabase
    .from('predictions')
    .select('team_id')
    .eq('match_id', matchId)

  if (!predictions) return

  const rules = await loadScoringRules()
  
  // Get unique teams
  const teamIds = [...new Set(predictions.map(p => p.team_id))]

  for (const teamId of teamIds) {
    await recalculateForTeam(teamId, rules)
  }

  // Update ranks
  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')
    .order('total_score', { ascending: false })
    .order('accuracy_percentage', { ascending: false })
    .order('winner_score', { ascending: false })

  if (leaderboard) {
    const updates = leaderboard.map((entry, index) => ({
      id: entry.id,
      team_id: entry.team_id,
      rank: index + 1
    }))
    await supabase.from('leaderboard').upsert(updates)
  }
}

export async function recalculateForTeam(teamId: string, rulesMap?: any) {
  const supabase = createAdminClient()
  const rules = rulesMap || await loadScoringRules()

  // Load predictions
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('team_id', teamId)

  // Load actuals with match details (multiplier)
  const { data: actuals } = await supabase
    .from('actual_results')
    .select('*, matches(multiplier)')

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
        // any type cast for foreign table relation
        const multiplier = (actual.matches as any).multiplier as number
        
        const result = calculateMatchScore(pred, actual, rules, multiplier)
        
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

  // Champion
  const { data: champPred } = await supabase
    .from('champion_predictions')
    .select('champion')
    .eq('team_id', teamId)
    .single()

  // Get actual champion from somewhere (e.g. metric cache or config)
  const { data: champActual } = await supabase
    .from('analytics_cache')
    .select('metric_value')
    .eq('metric_key', 'tournament_champion')
    .single()

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

