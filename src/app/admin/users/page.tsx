/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUsers } from '@/actions/admin/users'
import { Button } from '@/components/ui/button'
import { Metadata } from 'next'
import { UsersClient } from './users-client'

export const metadata: Metadata = {
  title: "Manage Users | Admin | µFifa '26"
}

export default async function UsersPage() {
  const { rows } = await getUsers(1, 100)

  // Map to flat structure for table
  const formattedData = rows.map((u: any) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    is_active: u.is_active,
    created_at: u.created_at,
    team_name: u.teams?.[0]?.team_name || 'No Team',
    submission_locked: u.teams?.[0]?.submission_locked || false,
    has_submission: !!u.teams?.[0]?.submissions?.[0]
  }))

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground">View participants, teams, and submission statuses.</p>
        </div>
        <Button variant="outline">Export CSV</Button>
      </div>

      <UsersClient formattedData={formattedData} />
    </div>
  )
}

