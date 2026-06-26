'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatScore } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ScoreBreakdownProps {
  winner: number      // outcome column: home_team + away_team + predicted_winner
  scoreline: number   // scoreline column: home_goals + away_goals + goal_diff
  scorer: number      // scorer column: scorer_home + scorer_away + all_correct_bonus
  stats: number       // retained for API compatibility, always 0 in new system
  champion: number
  confidence: number  // retained for API compatibility, always 0 in new system
  totalMatches: number
  tier1Only?: boolean
}

export function ScoreBreakdown({
  winner,
  scoreline,
  scorer,
  champion,
  totalMatches,
}: ScoreBreakdownProps) {
  // Maximum points per match (assuming multiplier = 1 for display purposes):
  //   outcome   = 5 (home) + 5 (away) + 20 (winner)  = 30
  //   scoreline = 10 (home_goals) + 10 (away_goals) + 15 (goal_diff) = 35
  //   scorer    = 30 (home) + 30 (away) + 250 (all_bonus) = 310
  //   champion  = 250 (tournament-level, not per-match)
  const MAX_VALUES = {
    winner: totalMatches * 30,
    scoreline: totalMatches * 35,
    scorer: totalMatches * 310,
    champion: 250,
  }

  const categories = [
    { name: 'Outcome',   earned: winner,   max: MAX_VALUES.winner,    color: 'bg-green-500' },
    { name: 'Scoreline', earned: scoreline, max: MAX_VALUES.scoreline, color: 'bg-blue-500' },
    { name: 'Scorers',   earned: scorer,    max: MAX_VALUES.scorer,    color: 'bg-amber-500' },
    { name: 'Champion',  earned: champion,  max: MAX_VALUES.champion,  color: 'bg-pink-500' },
  ]

  const chartData = categories.map(c => ({ name: c.name, Score: c.earned }))

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {categories.map(cat => {
          const percentage = Math.min(100, Math.max(0, (cat.earned / cat.max) * 100)) || 0
          return (
            <Card key={cat.name} className="glass-panel border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
                  {cat.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-2xl font-bold font-mono">{formatScore(cat.earned)}</span>
                  <span className="text-sm text-muted-foreground">/ {formatScore(cat.max)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color} transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="glass-panel border-border/50">
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis
                dataKey="name"
                type="category"
                stroke="var(--muted-foreground)"
                fontSize={12}
                width={80}
              />
              <Tooltip
                cursor={{ fill: 'var(--accent)', opacity: 0.1 }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar dataKey="Score" fill="var(--accent)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
