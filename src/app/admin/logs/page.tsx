/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAuditLogs } from '@/actions/admin/audit'
import { Metadata } from 'next'
import { LogsClient } from './logs-client'

export const metadata: Metadata = {
  title: "Audit Logs | Admin | µFifa '26"
}

export default async function AuditLogsPage() {
  const { rows } = await getAuditLogs(1, 100)

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">Track all system events and admin actions.</p>
      </div>

      <LogsClient rows={rows} />
    </div>
  )
}
