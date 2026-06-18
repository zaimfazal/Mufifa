/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { DataTable } from '@/components/leaderboard/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { MatchForm } from '@/components/admin/match-form'
import { formatDate } from '@/lib/utils'

export function MatchesClient({ rows }: { rows: any[] }) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'match_code',
      header: 'Code',
      cell: ({ row }) => <div className="font-mono">{row.getValue('match_code')}</div>
    },
    {
      accessorKey: 'stage',
      header: 'Stage',
      cell: ({ row }) => <div className="text-secondary capitalize">{(row.getValue('stage') as string)?.replace(/_/g, ' ')}</div>
    },
    {
      id: 'teams',
      header: 'Teams',
      cell: ({ row }) => <div className="font-semibold">{row.original.home_team} vs {row.original.away_team}</div>
    },
    {
      accessorKey: 'kickoff_time',
      header: 'Kickoff',
      cell: ({ row }) => <div className="text-muted-foreground">{formatDate(row.getValue('kickoff_time'))}</div>
    },
    {
      accessorKey: 'multiplier',
      header: 'Multiplier',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('multiplier')}x</div>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const color = status === 'completed' ? 'bg-green-500' : 
                      status === 'live' ? 'bg-yellow-500' : 
                      status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
        return <Badge className={`${color} text-white`}>{status}</Badge>
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <MatchForm match={row.original} mode="edit" />
        )
      }
    }
  ]

  return (
    <div className="glass-panel p-1 rounded-xl">
      <DataTable columns={columns} data={rows} />
    </div>
  )
}

