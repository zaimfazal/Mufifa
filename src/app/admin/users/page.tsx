/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic'
import { getUsers } from '@/actions/admin/users'
// Button removed
import { Metadata } from 'next'
import { UsersClient } from './users-client'

export const metadata: Metadata = {
  title: "Manage Users | Admin | µFifa '26"
}

export default async function UsersPage() {
  const { rows } = await getUsers(1, 100)

  // Map to flat structure for table
  const formattedData = rows.map((u: any) => {
    const team = Array.isArray(u.teams) ? u.teams[0] : u.teams
    const submissions = team?.submissions
    const submission = Array.isArray(submissions) ? submissions[0] : submissions
    
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      is_active: u.is_active,
      created_at: u.created_at,
      team_name: team?.team_name || 'No Team',
      submission_locked: team?.submission_locked || false,
      has_submission: !!submission
    }
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground">View participants, nicknames, and submission statuses.</p>
        </div>
      </div>

      <UsersClient formattedData={formattedData} />
    </div>
  )
}

