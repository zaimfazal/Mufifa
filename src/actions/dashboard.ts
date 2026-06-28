/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTeamName(formData: FormData) {
  const teamName = formData.get('team_name') as string
  if (!teamName || teamName.length < 3) return { error: 'Nickname must be at least 3 characters' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('teams').update({ team_name: teamName }).eq('owner_id', user.id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'This nickname is already taken.' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

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
    const actual = Array.isArray(match.actual_results) ? match.actual_results[0] : match.actual_results
    
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
    }
  })
}

