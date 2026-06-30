'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ColumnHeaderHint, DASHBOARD_SCORE_HINTS } from '@/components/leaderboard/column-header-hint'
import { formatScore } from '@/lib/utils'
import type { StageScorePoint } from '@/actions/dashboard'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface ScoreBreakdownProps {
  winner: number
  scoreline: number
  scorer: number
  maxOutcome: number
  maxScoreline: number
  maxScorer: number
  stageScores: StageScorePoint[]
}

export function ScoreBreakdown({
  winner,
  scoreline,
  scorer,
  maxOutcome,
  maxScoreline,
  maxScorer,
  stageScores,
}: ScoreBreakdownProps) {
  const categories = [
    {
      name: 'Outcome',
      hint: DASHBOARD_SCORE_HINTS.outcome,
      earned: winner,
      max: maxOutcome,
      color: 'bg-green-500',
    },
    {
      name: 'Scoreline',
      hint: DASHBOARD_SCORE_HINTS.scoreline,
      earned: scoreline,
      max: maxScoreline,
      color: 'bg-blue-500',
    },
    {
      name: 'Scorers',
      hint: DASHBOARD_SCORE_HINTS.scorers,
      earned: scorer,
      max: maxScorer,
      color: 'bg-amber-500',
    },
  ]

  return (
    <TooltipProvider delay={200}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const percentage =
              cat.max > 0 ? Math.min(100, Math.max(0, (cat.earned / cat.max) * 100)) : 0
            return (
              <Card key={cat.name} className="glass-panel border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
                    <ColumnHeaderHint label={cat.name} hint={cat.hint} />
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
            <CardTitle>Scores by Round</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {stageScores.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageScores} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                  <XAxis
                    dataKey="stage"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <RechartsTooltip
                    cursor={{ fill: 'var(--accent)', opacity: 0.1 }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value: number) => [formatScore(value), 'Points']}
                  />
                  <Bar dataKey="score" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">No scored matches yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
