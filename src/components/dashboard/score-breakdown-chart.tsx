/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatScore } from '@/lib/utils'

interface ScoreBreakdownProps {
  winner: number
  scoreline: number
  scorer: number
  stats: number
  champion: number
  confidence: number
}

const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#A855F7', '#EF4444', '#EC4899']

export function ScoreBreakdownChart({
  winner,
  scoreline,
  scorer,
  stats,
  champion,
  confidence
}: ScoreBreakdownProps) {
  const data = [
    { name: 'Match Outcome', value: winner },
    { name: 'Scoreline', value: scoreline },
    { name: 'Goal Scorers', value: scorer },
    { name: 'Match Stats', value: stats },
    { name: 'Champion', value: champion },
    { name: 'Confidence', value: Math.max(0, confidence) }, // Recharts doesn't handle negative well in pie
  ].filter(item => item.value > 0)

  if (data.length === 0) {
    return (
      <Card className="glass-panel border-border/50 h-full">
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
          <CardDescription>Visual breakdown of your earned points</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No points earned yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-panel border-border/50 h-full flex flex-col">
      <CardHeader>
        <CardTitle>Score Breakdown</CardTitle>
        <CardDescription>Visual breakdown of your earned points</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [`${formatScore(value)} pts`, 'Score']}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

