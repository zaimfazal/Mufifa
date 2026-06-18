/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAdminData, adminRecalculateAll } from '@/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, FileSpreadsheet, RefreshCw, Settings, ShieldAlert } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { RecalculateButton } from './recalculate-button'

export default async function AdminPage() {
  let data
  try {
    data = await getAdminData()
  } catch (e) {
    return (
      <div className="container mx-auto py-20 text-center">
        <ShieldAlert className="w-16 h-16 mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Unauthorized</h1>
        <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
      </div>
    )
  }

  const { stats, matches, rules } = data

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
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Registered Teams</CardTitle>
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
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle>Matches</CardTitle>
            <CardDescription>Manage match results to trigger scoring updates</CardDescription>
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
          </CardContent>>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle>Scoring Rules</CardTitle>
            <CardDescription>Engine weights and points</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rules.slice(0, 5).map((rule: any) => (
              <div key={rule.id} className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
                <div className="text-sm font-medium">{rule.rule_name}</div>
                <div className="font-mono text-accent">+{rule.points}</div>
              </div>
            ))}
            <Link href="/admin/scoring" className="w-full block">
              <Button variant="outline" className="w-full">Edit Scoring Weights</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

