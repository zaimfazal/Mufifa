/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic'
import { getAdminData } from '@/actions/admin'
import { getStageMultipliers } from '@/actions/admin/stage-multipliers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, FileSpreadsheet, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { RecalculateButton } from './recalculate-button'
import { StageMultipliersCard } from '@/components/admin/stage-multipliers-card'

export default async function AdminPage() {
  let data
  let stageMultipliers: any[] = []
  try {
    ;[data, stageMultipliers] = await Promise.all([getAdminData(), getStageMultipliers()])
  } catch {
    return (
      <div className="container mx-auto py-20 text-center">
        <ShieldAlert className="w-16 h-16 mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Unauthorized</h1>
        <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
      </div>
    )
  }

  const { stats, matches } = data

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-destructive to-orange-500">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Manage tournament data and scoring engine.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Registered Nicknames</CardTitle>
            <Users className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{stats.teams}</div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Submissions</CardTitle>
            <FileSpreadsheet className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{stats.submissions}</div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive uppercase">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <RecalculateButton />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Matches overview */}
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle>Matches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {matches.slice(0, 5).map((match: any) => (
              <div key={match.id} className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
                <div>
                  <div className="font-semibold">{match.home_team} vs {match.away_team}</div>
                  <div className="text-xs text-muted-foreground">{new Date(match.kickoff_time).toLocaleDateString()}</div>
                </div>
                <Badge variant={match.status === 'completed' ? 'default' : 'outline'}>
                  {match.status}
                </Badge>
              </div>
            ))}
            <Link href="/admin/matches" className="w-full block">
              <Button variant="outline" className="w-full">View All Matches</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Stage Multipliers — editable inline */}
        <StageMultipliersCard multipliers={stageMultipliers} />
      </div>
    </div>
  )
}
