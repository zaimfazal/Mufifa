'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from './audit'
import { recalculateAll } from '@/lib/scoring/calculator'
import { DEFAULT_SCORING_RULES } from '@/lib/scoring/rules-loader'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from './require-admin'

export async function ensureDefaultScoringRules() {
  const supabase = createAdminClient()
  const { data: existing, error } = await supabase
    .from('scoring_rules')
    .select('rule_key')

  if (error) {
    console.error('Error checking scoring rules:', error)
    return { error: error.message }
  }

  const existingKeys = new Set((existing || []).map(rule => rule.rule_key))
  const missingRules = Object.values(DEFAULT_SCORING_RULES)
    .filter(rule => !existingKeys.has(rule.rule_key))
    .map(rule => ({
      rule_key: rule.rule_key,
      rule_name: rule.rule_name,
      points: rule.points,
      is_enabled: rule.is_enabled,
    }))

  if (missingRules.length === 0) return { inserted: 0 }

  const { error: insertError } = await supabase
    .from('scoring_rules')
    .insert(missingRules)

  if (insertError) {
    console.error('Error inserting default scoring rules:', insertError)
    return { error: insertError.message }
  }

  return { inserted: missingRules.length }
}

export async function getScoringRules() {
  await requireAdmin()
  await ensureDefaultScoringRules()
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('scoring_rules').select('*').order('id')
  
  if (error) {
    console.error('Error fetching scoring rules:', error)
    return []
  }
  const rules = data || []
  const hasChampionPrediction = rules.some(rule => rule.rule_key === 'champion_prediction')

  return hasChampionPrediction
    ? rules.filter(rule => rule.rule_key !== 'tournament_champion')
    : rules
}

export async function updateScoringRules(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()
  const ensured = await ensureDefaultScoringRules()
  if (ensured.error) return { error: `Failed to ensure scoring rules: ${ensured.error}` }

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
