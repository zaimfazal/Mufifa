'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from './audit'
import { recalculateForMatch } from '@/lib/scoring/calculator'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from './require-admin'

export async function enterResult(matchId: string, formData: FormData) {
  const adminUser = await requireAdmin()
  const supabase = createAdminClient()
  
  // Extract all data from formData
  const winner = formData.get('winner') as string
  const homeScore = parseInt(formData.get('home_score') as string)
  const awayScore = parseInt(formData.get('away_score') as string)
  const possessionHome = parseFloat(formData.get('possession_home') as string)
  const possessionAway = parseFloat(formData.get('possession_away') as string)
  const shotsHome = parseInt(formData.get('shots_home') as string)
  const shotsAway = parseInt(formData.get('shots_away') as string)
  const xgHome = parseFloat(formData.get('xg_home') as string)
  const xgAway = parseFloat(formData.get('xg_away') as string)
  const yellowHome = parseInt(formData.get('yellow_home') as string)
  const yellowAway = parseInt(formData.get('yellow_away') as string)
  const redHome = parseInt(formData.get('red_home') as string)
  const redAway = parseInt(formData.get('red_away') as string)
  
  const penaltyHomeRaw = formData.get('penalty_home')
  const penaltyHome = penaltyHomeRaw ? parseInt(penaltyHomeRaw as string) : null
  const penaltyAwayRaw = formData.get('penalty_away')
  const penaltyAway = penaltyAwayRaw ? parseInt(penaltyAwayRaw as string) : null

  // Process Goal Scorers
  const goalScorersRaw = formData.get('goal_scorers') as string
  let goalScorers: { name: string; goals: number }[] = []
  if (goalScorersRaw) {
    // Format: Player A:2;Player B:1
    const parts = goalScorersRaw.split(';').filter(p => p.trim() !== '')
    goalScorers = parts.map(p => {
      const [name, goals] = p.split(':')
      return { name: name.trim(), goals: parseInt(goals.trim()) }
    })
  }

  const firstGoalScorerRaw = formData.get('first_goal_scorer') as string
  const firstGoalScorer = firstGoalScorerRaw ? firstGoalScorerRaw.trim() : null

  const { error } = await supabase.from('actual_results').upsert({
    match_id: matchId,
    winner,
    home_score: homeScore,
    away_score: awayScore,
    possession_home: possessionHome,
    possession_away: possessionAway,
    shots_home: shotsHome,
    shots_away: shotsAway,
    xg_home: xgHome,
    xg_away: xgAway,
    yellow_home: yellowHome,
    yellow_away: yellowAway,
    red_home: redHome,
    red_away: redAway,
    penalty_home: penaltyHome,
    penalty_away: penaltyAway,
    goal_scorers: goalScorers,
    first_goal_scorer: firstGoalScorer,
    updated_by: adminUser.id,
    updated_at: new Date().toISOString()
  }, { onConflict: 'match_id' })

  if (error) return { error: error.message }

  // Update Match Status to completed
  await supabase.from('matches').update({ status: 'completed' }).eq('id', matchId)

  // Trigger Recalculation
  await recalculateForMatch(matchId)

  await logAuditEvent('enter_match_result', 'actual_results', matchId)
  
  revalidatePath('/admin/results')
  revalidatePath('/admin/matches')
  revalidatePath('/leaderboard')
  revalidatePath('/dashboard')

  return { success: true }
}
