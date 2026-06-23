'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from './audit'
import { recalculateForMatch } from '@/lib/scoring/calculator'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from './require-admin'
import { parseJerseyNumbers } from '@/lib/csv/parser'

export async function enterResult(matchId: string, formData: FormData) {
  const adminUser = await requireAdmin()
  const supabase = createAdminClient()

  // Null-safe numeric parse: missing/blank fields (e.g. in limited mode) become null
  // rather than NaN so they don't corrupt the row.
  const numOrNull = (key: string, float = false): number | null => {
    const raw = formData.get(key)
    if (raw === null || String(raw).trim() === '') return null
    const n = float ? parseFloat(String(raw)) : parseInt(String(raw), 10)
    return Number.isNaN(n) ? null : n
  }

  const winner = (formData.get('winner') as string) || null
  const homeScore = numOrNull('home_score')
  const awayScore = numOrNull('away_score')

  const penaltyHome = numOrNull('penalty_home')
  const penaltyAway = numOrNull('penalty_away')

  // Goal scorers: limited mode posts jersey-number sets (scorers_home/away);
  // full mode posts the name-based "Player A:2;Player B:1" string.
  const scorersHomeRaw = formData.get('scorers_home')
  const scorersAwayRaw = formData.get('scorers_away')
  let goalScorers: unknown
  if (scorersHomeRaw !== null || scorersAwayRaw !== null) {
    goalScorers = {
      home: parseJerseyNumbers(String(scorersHomeRaw ?? '')).numbers,
      away: parseJerseyNumbers(String(scorersAwayRaw ?? '')).numbers,
    }
  } else {
    const goalScorersRaw = formData.get('goal_scorers') as string
    const list: { name: string; goals: number }[] = []
    if (goalScorersRaw) {
      for (const p of goalScorersRaw.split(';').filter(s => s.trim() !== '')) {
        const [name, goals] = p.split(':')
        list.push({ name: name.trim(), goals: parseInt(goals.trim()) })
      }
    }
    goalScorers = list
  }

  const firstGoalScorerRaw = formData.get('first_goal_scorer') as string
  const firstGoalScorer = firstGoalScorerRaw ? firstGoalScorerRaw.trim() : null

  const { error } = await supabase.from('actual_results').upsert({
    match_id: matchId,
    winner,
    home_score: homeScore,
    away_score: awayScore,
    possession_home: numOrNull('possession_home', true),
    possession_away: numOrNull('possession_away', true),
    shots_home: numOrNull('shots_home'),
    shots_away: numOrNull('shots_away'),
    xg_home: numOrNull('xg_home', true),
    xg_away: numOrNull('xg_away', true),
    yellow_home: numOrNull('yellow_home'),
    yellow_away: numOrNull('yellow_away'),
    red_home: numOrNull('red_home'),
    red_away: numOrNull('red_away'),
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
