/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { DataTable } from '@/components/leaderboard/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { toggleUserStatus, deleteUser, getUserPredictionsCsv } from '@/actions/admin/users'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

export function UsersClient({ formattedData }: { formattedData: any[] }) {
  const [filter, setFilter] = useState('all')

  const handleExportCsv = () => {
    const headers = ['Email', 'Nickname', 'Role', 'Status', 'Registered']
    const rows = formattedData.map(u => [
      u.email,
      u.team_name,
      u.role,
      u.submission_locked ? 'Locked' : u.has_submission ? 'Uploaded' : 'Pending',
      formatDate(u.created_at)
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `users_export_${new Date().toISOString().slice(0,10)}.csv`
    link.click()
  }

  const handleViewCsv = async (teamName: string, userId: string) => {
    // teamId in our flattened data is not directly available, but we can 
    // fetch it since userId is the team owner. Actually wait, teamId is not exposed.
    // Let's change getUserPredictionsCsv to take team_owner (user ID) instead!
    // But since the action already takes teamId... I will just pass user id and we can modify the action to take user id.
    const csvData = await getUserPredictionsCsv(userId)
    if (!csvData) {
      toast.error("No predictions found for this user.")
      return
    }
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${teamName}_predictions.csv`
    link.click()
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div className="font-medium">{row.getValue('email')}</div>
    },
    {
      accessorKey: 'team_name',
      header: 'Nickname',
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
        const deleteAction = deleteUser.bind(null, user.id)
        
        return (
          <div className="flex gap-2 items-center">
            {user.has_submission && (
              <Button variant="outline" size="sm" onClick={() => handleViewCsv(user.team_name, user.id)}>
                <Download className="w-4 h-4 mr-1" /> CSV
              </Button>
            )}
            <form action={toggleAction}>
              <Button 
                variant={user.is_active ? 'outline' : 'default'} 
                size="sm" 
                className={!user.is_active ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
                disabled={user.role === 'admin'}
              >
                {user.is_active ? 'Disable' : 'Enable'}
              </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              disabled={user.role === 'admin'}
              onClick={async () => {
                if (confirm('Are you sure you want to delete this user?')) {
                  await deleteAction()
                }
              }}
            >
              Delete
            </Button>
          </div>
        )
      }
    }
  ]

  const filteredData = formattedData.filter(u => {
    if (filter === 'completed') return u.has_submission
    if (filter === 'pending') return !u.has_submission
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border/50">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Filter Status:</span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="completed">Submission Completed</SelectItem>
              <SelectItem value="pending">Submission Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={handleExportCsv}>
          <Download className="w-4 h-4 mr-2" />
          Export All CSV
        </Button>
      </div>

      <div className="glass-panel p-1 rounded-xl">
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  )
}

