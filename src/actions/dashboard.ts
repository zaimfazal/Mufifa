/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardPredictions(teamId: string) {
  const supabase = await createClient()

  const { data: predictions } = await supabase
    .from('predictions')
    .select('*, matches(*, actual_results(*))')
    .eq('team_id', teamId)
    .order('matches(kickoff_time)', { ascending: true })

  if (!predictions) return []

  return predictions.map((p: any) => {
    const match = p.matches
    const actual = match.actual_results?.[0]
    
    return {
      id: p.id,
      match_id: match.id,
      match_code: match.match_code,
      home_team: match.home_team,
      away_team: match.away_team,
      kickoff_time: match.kickoff_time,
      status: match.status,
      predicted_winner: p.winner,
      predicted_home_score: p.home_score,
      predicted_away_score: p.away_score,
      actual_winner: actual?.winner || null,
      actual_home_score: actual?.home_score ?? null,
      actual_away_score: actual?.away_score ?? null,
      // For a real app, we'd also pull the computed score for this specific match.
      // But since score is aggregated in the leaderboard, we might just display "Pending" or simulate it here.
    }
  })
}

