'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from './audit'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from './require-admin'

export async function getMatches(stage?: string, status?: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  let query = supabase.from('matches').select('*').order('kickoff_time')
  
  if (stage) query = query.eq('stage', stage)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return { rows: [] }
  return { rows: data || [] }
}

export async function createMatch(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  
  const matchCode = formData.get('match_code') as string
  const stage = formData.get('stage') as string
  const homeTeam = formData.get('home_team') as string
  const awayTeam = formData.get('away_team') as string
  const kickoffTime = formData.get('kickoff_time') as string
  const multiplier = parseFloat(formData.get('multiplier') as string)

  const { error } = await supabase.from('matches').insert({
    match_code: matchCode,
    stage,
    home_team: homeTeam,
    away_team: awayTeam,
    kickoff_time: new Date(kickoffTime).toISOString(),
    multiplier,
    status: 'scheduled'
  })

  if (error) return { error: error.message }

  await logAuditEvent('create_match', 'matches', null, { match_code: matchCode })
  revalidatePath('/admin/matches')
  return { success: true }
}

export async function updateMatch(matchId: string, formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  
  const stage = formData.get('stage') as string
  const homeTeam = formData.get('home_team') as string
  const awayTeam = formData.get('away_team') as string
  const kickoffTime = formData.get('kickoff_time') as string
  const status = formData.get('status') as string
  const multiplier = parseFloat(formData.get('multiplier') as string)

  const { error } = await supabase.from('matches').update({
    stage,
    home_team: homeTeam,
    away_team: awayTeam,
    kickoff_time: new Date(kickoffTime).toISOString(),
    status,
    multiplier,
    updated_at: new Date().toISOString()
  }).eq('id', matchId)

  if (error) return { error: error.message }

  await logAuditEvent('update_match', 'matches', matchId, { status })
  revalidatePath('/admin/matches')
  return { success: true }
}

export async function deleteMatch(matchId: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId)

  if (error) return { error: error.message }

  await logAuditEvent('delete_match', 'matches', matchId)
  revalidatePath('/admin/matches')
  return { success: true }
}
