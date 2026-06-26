'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from './audit'
import { recalculateAll } from '@/lib/scoring/calculator'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from './require-admin'

export async function getStageMultipliers() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('stage_multipliers')
    .select('*')
    .order('multiplier', { ascending: true })

  if (error) {
    console.error('Error fetching stage multipliers:', error.message)
    return []
  }
  return data || []
}

export async function updateStageMultipliers(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()
  const supabase = createAdminClient()

  const updates: { stage: string; multiplier: number }[] = []

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('stage_') && key.endsWith('_multiplier')) {
      // key format: stage_{stage_name}_multiplier
      const stage = key.slice('stage_'.length, key.length - '_multiplier'.length)
      const multiplier = parseFloat(value as string)
      if (!isNaN(multiplier) && multiplier > 0) {
        updates.push({ stage, multiplier })
      }
    }
  }

  for (const { stage, multiplier } of updates) {
    // Update the stage_multipliers table
    const { error: smError } = await supabase
      .from('stage_multipliers')
      .update({ multiplier, updated_at: new Date().toISOString() })
      .eq('stage', stage)

    if (smError) return { error: `Failed to update ${stage}: ${smError.message}` }

    // Keep matches.multiplier in sync so the existing calculator query stays unchanged
    await supabase
      .from('matches')
      .update({ multiplier })
      // stage column is a postgres enum; cast to text for comparison
      .filter('stage', 'eq', stage)
  }

  await logAuditEvent('update_stage_multipliers', 'stage_multipliers', null, {
    updated: updates.map(u => `${u.stage}=${u.multiplier}`).join(', ')
  })

  // Recalculate all scores with the new multipliers
  await recalculateAll()

  revalidatePath('/admin')
  revalidatePath('/leaderboard')
  revalidatePath('/dashboard')

  return { success: true }
}
