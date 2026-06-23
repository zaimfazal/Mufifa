/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from '@/lib/supabase/admin'
import { ResultEntryForm } from '@/components/admin/result-entry-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Enter Results | Admin | µFifa '26"
}

export default async function ResultsPage() {
  const supabase = createAdminClient()

  // Fetch all matches that are live or completed (or scheduled if we want to allow early entry)
  // Let's just fetch all matches and sort by kickoff
  const { data: matches } = await supabase
    .from('matches')
    .select('*, actual_results(*)')
    .order('kickoff_time', { ascending: false })

  const { data: settings } = await supabase
    .from('competition_settings')
    .select('tier1_only_mode')
    .single()
  const limited = settings?.tier1_only_mode === true

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Match Results</h1>
        <p className="text-muted-foreground">Enter official match outcomes. Submitting a result automatically recalculates scores.</p>
      </div>

      <div className="space-y-4">
        {matches?.map((match: any) => {
          const hasResult = match.actual_results && match.actual_results.length > 0
          const actualResult = hasResult ? match.actual_results[0] : null
          
          return (
            <Card key={match.id} className="glass-panel border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20 border-b border-border/50">
                <div>
                  <CardTitle className="text-lg">
                    {match.home_team} vs {match.away_team}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-mono">{match.match_code} • {new Date(match.kickoff_time).toLocaleDateString()}</p>
                </div>
                <div>
                  {hasResult ? (
                    <Badge className="bg-green-500 hover:bg-green-600">Result Entered</Badge>
                  ) : (
                    <Badge variant="outline" className={match.status === 'live' ? 'border-yellow-500 text-yellow-500' : ''}>
                      {match.status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ResultEntryForm match={match} existingResult={actualResult} limited={limited} />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

