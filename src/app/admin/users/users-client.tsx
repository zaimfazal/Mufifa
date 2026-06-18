/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { DataTable } from '@/components/leaderboard/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { toggleUserStatus } from '@/actions/admin/users'

export function UsersClient({ formattedData }: { formattedData: any[] }) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div className="font-medium">{row.getValue('email')}</div>
    },
    {
      accessorKey: 'team_name',
      header: 'Team',
      cell: ({ row }) => <div className="text-secondary">{row.getValue('team_name')}</div>
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant={row.getValue('role') === 'admin' ? 'destructive' : 'secondary'}>
          {row.getValue('role')}
        </Badge>
      )
    },
    {
      accessorKey: 'status',
      header: 'Submission',
      cell: ({ row }) => {
        const locked = row.original.submission_locked
        const hasSub = row.original.has_submission
        if (locked) return <Badge className="bg-green-500 hover:bg-green-600 text-white">Locked</Badge>
        if (hasSub) return <Badge variant="outline">Uploaded</Badge>
        return <Badge variant="secondary" className="text-muted-foreground">Pending</Badge>
      }
    },
    {
      accessorKey: 'created_at',
      header: 'Registered',
      cell: ({ row }) => <div className="text-muted-foreground text-sm">{formatDate(row.getValue('created_at'))}</div>
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original
        const toggleAction = toggleUserStatus.bind(null, user.id, user.is_active)
        
        return (
          <form action={toggleAction}>
            <Button 
              variant={user.is_active ? 'outline' : 'default'} 
              size="sm" 
              className={!user.is_active ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
              disabled={user.role === 'admin'}
            >
              {user.is_active ? 'Disable' : 'Enable'}
            </Button>
          </form>
        )
      }
    }
  ]

  return (
    <div className="glass-panel p-1 rounded-xl">
      <DataTable columns={columns} data={formattedData} />
    </div>
  )
}

