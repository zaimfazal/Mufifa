'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from './audit'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from './require-admin'

export async function getUsers(page: number = 1, pageSize: number = 50, search: string = '') {
  await requireAdmin()
  const supabase = createAdminClient()
  
  let query = supabase
    .from('profiles')
    .select(`
      *,
      teams(id, team_name, submission_locked, submissions(id, is_valid))
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('email', `%${search}%`)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await query.range(from, to)

  if (error) {
    console.error('Error fetching users:', error)
    return { rows: [], totalCount: 0 }
  }

  return { rows: data || [], totalCount: count || 0 }
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: !currentStatus })
    .eq('id', userId)

  if (error) {
    console.error(error.message)
    return
  }

  await logAuditEvent('toggle_user_status', 'profiles', userId, { new_status: !currentStatus })
  revalidatePath('/admin/users')
}
