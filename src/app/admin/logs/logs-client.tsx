'use client'

import { DataTable } from '@/components/leaderboard/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { formatDate } from '@/lib/utils'

/* eslint-disable @typescript-eslint/no-explicit-any */
export function LogsClient({ rows }: { rows: any[] }) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'created_at',
      header: 'Timestamp',
      cell: ({ row }) => <div className="text-muted-foreground whitespace-nowrap">{formatDate(row.getValue('created_at'))}</div>
    },
    {
      accessorKey: 'profiles.email',
      header: 'Actor',
      cell: ({ row }) => <div className="text-foreground">{row.original.profiles?.email || 'System'}</div>
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => <div className="font-mono text-accent">{row.getValue('action')}</div>
    },
    {
      accessorKey: 'entity_type',
      header: 'Entity Type',
      cell: ({ row }) => <div className="text-secondary">{row.getValue('entity_type')}</div>
    },
    {
      accessorKey: 'payload',
      header: 'Details',
      cell: ({ row }) => (
        <pre className="text-xs text-muted-foreground max-w-[200px] truncate">
          {JSON.stringify(row.getValue('payload'))}
        </pre>
      )
    }
  ]

  return (
    <div className="glass-panel p-1 rounded-xl">
      <DataTable columns={columns} data={rows} />
    </div>
  )
}
