export const dynamic = 'force-dynamic'
import { getMatches } from '@/actions/admin/matches'
import { MatchForm } from '@/components/admin/match-form'
import { Metadata } from 'next'
import { MatchesClient } from './matches-client'

export const metadata: Metadata = {
  title: "Matches | Admin | µFifa '26"
}

export default async function MatchesPage() {
  const { rows } = await getMatches()

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tournament Matches</h1>
          <p className="text-muted-foreground">Manage schedule and multipliers.</p>
        </div>
        <MatchForm mode="create" />
      </div>

      <MatchesClient rows={rows} />
    </div>
  )
}
