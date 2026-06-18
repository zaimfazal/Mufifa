/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Not authorized')

  return user
}

export async function logAuditEvent(action: string, entityType: string, entityId: string | null, payload: any = {}) {
  const supabase = createAdminClient()
  let actorId = null

  try {
    const user = await requireAdmin()
    actorId = user.id
  } catch (e) {
    // allow system-triggered events to pass without user
  }

  await supabase.from('audit_logs').insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    payload,
    created_at: new Date().toISOString()
  })
}

export async function getAuditLogs(page: number = 1, pageSize: number = 50) {
  await requireAdmin()
  const supabase = createAdminClient()
  
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await supabase
    .from('audit_logs')
    .select(`*, profiles(email)`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching logs:', error)
    return { rows: [], totalCount: 0 }
  }

  return { rows: data || [], totalCount: count || 0 }
}

