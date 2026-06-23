import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { ScoreBreakdown } from '@/components/dashboard/score-breakdown'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { MatchPredictionsTable } from '@/components/dashboard/match-predictions-table'
import { Badge } from '@/components/ui/badge'
import { EditTeamName } from '@/components/dashboard/edit-team-name'
import { getDashboardPredictions } from '@/actions/dashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Dashboard | µFifa '26",
  description: 'View your nickname statistics and predictions',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!team) {
    redirect('/submit')
  }

  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('team_id', team.id)
    .single()

  const { data: recentLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('actor_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const predictions = await getDashboardPredictions(team.id)
  
  const { count: totalMatches } = await supabase.from('matches').select('*', { count: 'exact', head: true })

  const { data: settings } = await supabase.from('competition_settings').select('submission_deadline, tier1_only_mode').single()
  const tier1Only = settings?.tier1_only_mode === true
  const isClosed = settings?.submission_deadline ? new Date() > new Date(settings.submission_deadline) : false

  const { count: teamPredictionCount } = await supabase
    .from('predictions')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', team.id)
  const hasSubmitted = (teamPredictionCount || 0) > 0

  const submissionState: 'pending' | 'submitted' | 'closed' | 'locked' =
    team.submission_locked ? 'locked' :
    isClosed ? 'closed' :
    hasSubmitted ? 'submitted' :
    'pending'

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <EditTeamName initialName={team.team_name} />
          <p className="text-muted-foreground mt-1 text-lg">
            Dashboard overview and prediction statistics.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant={isClosed ? "destructive" : "default"} className={isClosed ? "" : "bg-primary text-primary-foreground hover:bg-primary/80"}>
              Submission Window: {isClosed ? 'CLOSED' : 'OPEN'}
            </Badge>
            {settings?.submission_deadline && !isClosed && (
              <span className="text-xs text-muted-foreground">
                Closes: {new Date(settings.submission_deadline).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            )}
          </div>
        </div>
        <div className="text-right glass-panel px-6 py-3 rounded-2xl border-accent/20 border">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Global Rank</p>
          <p className="text-4xl font-black font-mono text-foreground neon-text-green">
            {leaderboard?.rank ? `#${leaderboard.rank}` : 'TBD'}
          </p>
        </div>
      </div>

      <StatsCards
        totalScore={leaderboard?.total_score || 0}
        accuracy={leaderboard?.accuracy_percentage || 0}
        submissionState={submissionState}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Score Analysis</h2>
          <ScoreBreakdown 
            winner={leaderboard?.winner_score || 0}
            scoreline={leaderboard?.scoreline_score || 0}
            scorer={leaderboard?.scorer_score || 0}
            stats={leaderboard?.stats_score || 0}
            champion={leaderboard?.champion_score || 0}
            confidence={leaderboard?.confidence_score || 0}
            totalMatches={totalMatches || 0}
            tier1Only={tier1Only}
          />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
          <RecentActivity logs={recentLogs || []} />
        </div>
      </div>

      <div className="space-y-6 pt-8 border-t border-border/50">
        <h2 className="text-2xl font-bold tracking-tight">Match Predictions</h2>
        <MatchPredictionsTable data={predictions} />
      </div>
    </div>
  )
}
