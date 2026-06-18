/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getLeaderboard(page: number = 1, pageSize: number = 50, search: string = '') {
  const supabase = await createClient()

  let query = supabase
    .from('leaderboard')
    .select(`
      *,
      teams!inner (team_name)
    `, { count: 'exact' })
    .order('rank', { ascending: true })

  if (search) {
    query = query.ilike('teams.team_name', `%${search}%`)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await query.range(from, to)

  if (error) {
    console.error('Error fetching leaderboard:', error)
    return { rows: [], totalCount: 0 }
  }

  const rows = (data || []).map((entry: any) => ({
    id: entry.id,
    rank: entry.rank,
    team_name: entry.teams?.team_name || 'Unknown Team',
    total_score: entry.total_score,
    accuracy: entry.accuracy_percentage,
    winner_score: entry.winner_score,
    scoreline_score: entry.scoreline_score,
    scorer_score: entry.scorer_score,
    stats_score: entry.stats_score,
    champion_score: entry.champion_score,
    confidence_score: entry.confidence_score
  }))

  return { rows, totalCount: count || 0 }
}

export async function getMyRank() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!team) return null

  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('team_id', team.id)
    .single()

  return leaderboard
}

