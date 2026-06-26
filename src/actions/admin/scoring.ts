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

export async function updateScoringRules(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()
  const supabase = createAdminClient()
  
  const rulesToUpdate: { id: string; points: number; is_enabled: boolean; updated_at: string }[] = []
  
  // Key format: rule_{uuid}_points  — use slice to capture the full UUID (split breaks on hyphens in some edge cases)
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('rule_') && key.endsWith('_points')) {
      const id = key.slice('rule_'.length, key.length - '_points'.length)
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
    const { error } = await supabase
      .from('scoring_rules')
      .update({ points: rule.points, is_enabled: rule.is_enabled, updated_at: rule.updated_at })
      .eq('id', rule.id)
    if (error) return { error: `Failed to update rule: ${error.message}` }
  }

  await logAuditEvent('update_scoring_rules', 'scoring_rules', null, { updated_count: rulesToUpdate.length })
  
  // Recalculate with new weights
  await recalculateAll()
  
  revalidatePath('/admin/scoring')
  revalidatePath('/leaderboard')
  revalidatePath('/dashboard')

  return { success: true }
}
