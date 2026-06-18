/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAuditLogs } from '@/actions/admin/audit'
import { DataTable } from '@/components/leaderboard/data-table' // Reusing generic table
import { ColumnDef } from '@tanstack/react-table'
import { formatDate } from '@/lib/utils'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Audit Logs | Admin | µFifa '26"
}

export default async function AuditLogsPage() {
  const { rows } = await getAuditLogs(1, 100)

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
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">Track all system events and admin actions.</p>
      </div>

      <div className="glass-panel p-1 rounded-xl">
        <DataTable columns={columns} data={rows} />
      </div>
    </div>
  )
}

