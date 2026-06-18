/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { recalculateAll, recalculateForMatch } from '@/lib/scoring/calculator'

// Check if current user is admin
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()


  if (profile?.role !== 'admin') {
    throw new Error('Not authorized')
  }

  return user
}

export async function adminRecalculateAll() {
  try {
    await requireAdmin()
    await recalculateAll()
    revalidatePath('/leaderboard')
    revalidatePath('/dashboard')
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function adminUpdateMatchResult(formData: FormData) {
  try {
    const adminUser = await requireAdmin()
    const supabase = createAdminClient()

    const matchId = formData.get('match_id') as string
    const homeScore = parseInt(formData.get('home_score') as string)
    const awayScore = parseInt(formData.get('away_score') as string)
    
    // Simplification for brevity:
    // A complete implementation would parse penalties, extra time, etc. from the form
    
    let winner = 'draw'
    if (homeScore > awayScore) winner = 'home'
    if (awayScore > homeScore) winner = 'away'

    // Update actual_results
    const { error: resultError } = await supabase
      .from('actual_results')
      .upsert({
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
        winner,
        updated_by: adminUser.id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'match_id' })

    if (resultError) throw new Error(resultError.message)

    // Update match status
    await supabase.from('matches').update({ status: 'completed' }).eq('id', matchId)

    // Trigger recalculation for this match
    await recalculateForMatch(matchId)

    revalidatePath('/admin')
    revalidatePath('/leaderboard')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getAdminData() {
  await requireAdmin()
  const supabase = createAdminClient()

  const { count: teamCount } = await supabase.from('teams').select('*', { count: 'exact', head: true })
  const { count: submissionCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true })
  const { data: matches } = await supabase.from('matches').select('*, actual_results(*)').order('kickoff_time')
  const { data: rules } = await supabase.from('scoring_rules').select('*').order('rule_name')

  return {
    stats: {
      teams: teamCount || 0,
      submissions: submissionCount || 0,
    },
    matches: matches || [],
    rules: rules || []
  }
}

