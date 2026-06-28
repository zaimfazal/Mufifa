'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from './audit'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from './require-admin'

export async function getUsers(page: number = 1, pageSize: number = 50, search: string = '') {
  await requireAdmin()
  const supabase = createAdminClient()
  
  let query = supabase
    .from('profiles')
    .select(`
      *,
      teams(id, team_name, submission_locked, submissions(id, is_valid))
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('email', `%${search}%`)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await query.range(from, to)

  if (error) {
    console.error('Error fetching users:', error)
    return { rows: [], totalCount: 0 }
  }

  return { rows: data || [], totalCount: count || 0 }
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: !currentStatus })
    .eq('id', userId)

  if (error) {
    console.error(error.message)
    return
  }

  await logAuditEvent('toggle_user_status', 'profiles', userId, { new_status: !currentStatus })
  revalidatePath('/admin/users')
}

export async function deleteUser(userId: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  
  const { error } = await supabase.auth.admin.deleteUser(userId)
  
  if (error) {
    console.error(error.message)
    return { error: error.message }
  }

  await logAuditEvent('delete_user', 'profiles', userId, {})
  revalidatePath('/admin/users')
  return { success: true }
}

export async function getUserPredictionsCsv(userId: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  
  const { data: team } = await supabase.from('teams').select('id').eq('owner_id', userId).single()
  if (!team) return null

  const { data: matches } = await supabase
    .from('matches')
    .select('id, match_code, home_team, away_team')
    .order('kickoff_time', { ascending: true })

  if (!matches) return null

  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('team_id', team.id)
    
  if (!predictions || predictions.length === 0) return null

  // Generate CSV manually to match template format
  const rows = ['Match Code,Home Team,Away Team,Home Score,Away Score,Home Scorers,Away Scorers']
  
  for (const match of matches) {
    const pred = predictions.find(p => p.match_id === match.id)
    if (pred) {
      const homeScorers = pred.goal_scorers?.home?.join(',') || ''
      const awayScorers = pred.goal_scorers?.away?.join(',') || ''
      rows.push(`${match.match_code},${match.home_team},${match.away_team},${pred.home_score ?? ''},${pred.away_score ?? ''},"${homeScorers}","${awayScorers}"`)
    } else {
      rows.push(`${match.match_code},${match.home_team},${match.away_team},,,,`)
    }
  }

  return rows.join('\n')
}
