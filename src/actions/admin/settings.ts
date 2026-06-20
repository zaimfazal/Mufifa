'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from './audit'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from './require-admin'

export async function getCompetitionSettings() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('competition_settings').select('*').single()
  
  if (error) {
    console.error('Error fetching settings:', error)
    return { submission_deadline: null, registrations_open: true }
  }
  return data
}

export async function updateCompetitionSettings(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  
  const rawDeadline = formData.get('submission_deadline') as string
  const submissionDeadline = rawDeadline ? new Date(rawDeadline).toISOString() : null
  
  const registrationsOpen = formData.get('registrations_open') === 'on'

  const { error } = await supabase
    .from('competition_settings')
    .update({ 
      submission_deadline: submissionDeadline,
      registrations_open: registrationsOpen,
      updated_at: new Date().toISOString()
    })
    .eq('id', true)

  if (error) throw new Error(error.message)

  await logAuditEvent('update_settings', 'competition_settings', null, { submissionDeadline, registrationsOpen })
  
  revalidatePath('/admin/settings')
  revalidatePath('/dashboard')
  revalidatePath('/')
}
