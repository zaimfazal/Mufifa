'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatScore } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ScoreBreakdownProps {
  winner: number
  scoreline: number
  scorer: number
  stats: number
  champion: number
  confidence: number
  totalMatches: number
}

export function ScoreBreakdown({ winner, scoreline, scorer, stats, champion, confidence, totalMatches }: ScoreBreakdownProps) {
  // The leaderboard stores earned category scores; these caps reflect the configured tournament-wide maximums dynamically.
  const MAX_VALUES = {
    winner: totalMatches * 20,
    scoreline: totalMatches * 40,
    scorer: totalMatches * 35,
    stats: totalMatches * 45,
    champion: 250,
    confidence: totalMatches * 10
  }
  const categories = [
    { name: 'Outcome', earned: winner, max: MAX_VALUES.winner, color: 'bg-green-500' },
    { name: 'Scoreline', earned: scoreline, max: MAX_VALUES.scoreline, color: 'bg-blue-500' },
    { name: 'Scorers', earned: scorer, max: MAX_VALUES.scorer, color: 'bg-amber-500' },
    { name: 'Stats', earned: stats, max: MAX_VALUES.stats, color: 'bg-purple-500' },
    { name: 'Champion', earned: champion, max: MAX_VALUES.champion, color: 'bg-pink-500' },
  ]

  const chartData = categories.map(c => ({
    name: c.name,
    Score: c.earned
  }))

  // Add confidence separately since it can be negative
  chartData.push({ name: 'Confidence', Score: confidence })

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const percentage = Math.min(100, Math.max(0, (cat.earned / cat.max) * 100)) || 0
          return (
            <Card key={cat.name} className="glass-panel border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{cat.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-2xl font-bold font-mono">{formatScore(cat.earned)}</span>
                  <span className="text-sm text-muted-foreground">/ {formatScore(cat.max)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${cat.color} transition-all`} style={{ width: `${percentage}%` }} />
                </div>
              </CardContent>
            </Card>
          )
        })}
        <Card className="glass-panel border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Confidence Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold font-mono ${confidence > 0 ? 'text-green-500' : confidence < 0 ? 'text-red-500' : ''}`}>
                {confidence > 0 ? '+' : ''}{formatScore(confidence)}
              </span>
              <span className="text-sm text-muted-foreground">pts</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Net points gained or lost from confidence markers.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-border/50">
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={12} width={80} />
              <Tooltip 
                cursor={{ fill: 'var(--accent)', opacity: 0.1 }}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="Score" fill="var(--accent)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
