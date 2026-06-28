'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from './audit'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from './require-admin'
import { recalculateAll } from '@/lib/scoring/calculator'

export async function getCompetitionSettings() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('competition_settings').select('*').single()
  
  if (error) {
    console.error('Error fetching settings:', error)
    return { submission_deadline: null, submissions_open: true }
  }
  return data
}

export async function updateCompetitionSettings(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  
  const rawDeadline = formData.get('submission_deadline_iso') as string
  const submissionDeadline = rawDeadline ? rawDeadline : null
  
  const submissionsOpen = formData.get('submissions_open') === 'on'
  const tier1OnlyMode = formData.get('tier1_only_mode') === 'on'

  // Detect a change to the scoring mode so we only trigger a (heavy) full
  // recalculation when it actually flips.
  const { data: current } = await supabase
    .from('competition_settings')
    .select('tier1_only_mode')
    .maybeSingle()
  const modeChanged = (current?.tier1_only_mode === true) !== tier1OnlyMode

  const { error } = await supabase
    .from('competition_settings')
    .update({
      submission_deadline: submissionDeadline,
      submissions_open: submissionsOpen,
      tier1_only_mode: tier1OnlyMode,
      updated_at: new Date().toISOString()
    })
    .eq('id', true)

  if (error) throw new Error(error.message)

  await logAuditEvent('update_settings', 'competition_settings', null, { submissionDeadline, submissionsOpen, tier1OnlyMode })

  // Scoring mode change alters every score, so recompute the leaderboard.
  if (modeChanged) {
    await recalculateAll()
    revalidatePath('/leaderboard')
  }

  revalidatePath('/admin/settings')
  revalidatePath('/dashboard')
  revalidatePath('/')
}
