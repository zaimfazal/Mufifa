/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { getComparisonData } from '@/actions/analytics'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { formatScore, formatPercentage } from '@/lib/utils'

export function ComparisonRadar({ teamsList }: { teamsList: { id: string, team_name: string }[] }) {
  const [teamAId, setTeamAId] = useState<string>('')
  const [teamBId, setTeamBId] = useState<string>('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (teamsList.length >= 2 && !teamAId && !teamBId) {
      setTeamAId(teamsList[0].id)
      setTeamBId(teamsList[1].id)
    }
  }, [teamsList])

  useEffect(() => {
    async function fetchComparison() {
      if (!teamAId || !teamBId || teamAId === teamBId) {
        setData(null)
        return
      }
      setLoading(true)
      const result = await getComparisonData(teamAId, teamBId)
      setData(result)
      setLoading(false)
    }
    fetchComparison()
  }, [teamAId, teamBId])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-accent">Model A (Green)</label>
          <Select value={teamAId} onValueChange={(val) => setTeamAId(val || '')}>
            <SelectTrigger className="w-full glass-panel border-accent/50 focus:ring-accent">
              <SelectValue placeholder="Select Team A" />
            </SelectTrigger>
            <SelectContent className="glass-panel border-border/50">
              {teamsList.map(t => (
                <SelectItem key={`a-${t.id}`} value={t.id} disabled={t.id === teamBId}>
                  {t.team_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary">Model B (Blue)</label>
          <Select value={teamBId} onValueChange={(val) => setTeamBId(val || '')}>
            <SelectTrigger className="w-full glass-panel border-secondary/50 focus:ring-secondary">
              <SelectValue placeholder="Select Team B" />
            </SelectTrigger>
            <SelectContent className="glass-panel border-border/50">
              {teamsList.map(t => (
                <SelectItem key={`b-${t.id}`} value={t.id} disabled={t.id === teamAId}>
                  {t.team_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: 'var(--muted-foreground)' }} />
                <Radar name={data.teamA.name} dataKey={data.teamA.name} stroke="#22C55E" fill="#22C55E" fillOpacity={0.3} />
                <Radar name={data.teamB.name} dataKey={data.teamB.name} stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            <Card className="glass-panel border-accent/30 bg-accent/5">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-accent mb-2 truncate">{data.teamA.name}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Total Score</p>
                    <p className="font-mono font-bold text-xl">{formatScore(data.teamA.total)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Accuracy</p>
                    <p className="font-bold text-xl">{formatPercentage(data.teamA.accuracy)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-panel border-secondary/30 bg-secondary/5">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-secondary mb-2 truncate">{data.teamB.name}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Total Score</p>
                    <p className="font-mono font-bold text-xl">{formatScore(data.teamB.total)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Accuracy</p>
                    <p className="font-bold text-xl">{formatPercentage(data.teamB.accuracy)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="h-[400px] flex items-center justify-center glass-panel border-border/50 rounded-xl">
          <p className="text-muted-foreground">Select two different teams to compare their models.</p>
        </div>
      )}
    </div>
  )
}

