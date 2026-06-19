'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from './audit'
import { recalculateAll } from '@/lib/scoring/calculator'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from './require-admin'

export async function getScoringRules() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('scoring_rules').select('*').order('id')
  
  if (error) {
    console.error('Error fetching scoring rules:', error)
    return []
  }
  return data || []
}

export async function updateScoringRules(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  
  const rulesToUpdate = []
  
  // Extract all inputs matching pattern rule_[id]_points
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('rule_') && key.endsWith('_points')) {
      const id = key.split('_')[1]
      const points = parseInt(value as string)
      const isEnabled = formData.get(`rule_${id}_enabled`) === 'on'
      
      rulesToUpdate.push({
        id,
        points,
        is_enabled: isEnabled,
        updated_at: new Date().toISOString()
      })
    }
  }

  for (const rule of rulesToUpdate) {
    await supabase
      .from('scoring_rules')
      .update({ points: rule.points, is_enabled: rule.is_enabled, updated_at: rule.updated_at })
      .eq('id', rule.id)
  }

  await logAuditEvent('update_scoring_rules', 'scoring_rules', null, { updated_count: rulesToUpdate.length })
  
  // Recalculate
  await recalculateAll()
  
  revalidatePath('/admin/scoring')
  revalidatePath('/leaderboard')
}
