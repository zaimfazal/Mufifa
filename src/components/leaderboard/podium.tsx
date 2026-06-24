/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatScore, formatPercentage } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

interface PodiumProps {
  topTeams: any[]
}

export function Podium({ topTeams }: PodiumProps) {
  if (!topTeams || topTeams.length < 1) return null

  const first = topTeams.find(t => t.rank === 1)
  const second = topTeams.find(t => t.rank === 2)
  const third = topTeams.find(t => t.rank === 3)

  return (
    <div className="flex flex-col md:flex-row items-end justify-center gap-4 py-12 min-h-[300px]">
      {/* 2nd Place */}
      {second && (
        <Card className="w-full md:w-64 glass-panel border-gray-400/50 shadow-[0_0_15px_rgba(156,163,175,0.2)] md:order-1 order-2 transform md:translate-y-8">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gray-400/20 flex items-center justify-center mb-4 border border-gray-400/50">
              <span className="text-xl font-black text-gray-300">2</span>
            </div>
            <h3 className="font-bold text-lg text-foreground truncate w-full">{second.team_name}</h3>
            <p className="text-2xl font-mono text-gray-300 font-bold mt-2">{formatScore(second.total_score)}</p>
            <p className="text-sm text-muted-foreground">{formatPercentage(second.accuracy)} Acc</p>
          </CardContent>
        </Card>
      )}

      {/* 1st Place */}
      {first && (
        <Card className="w-full md:w-72 glass-panel border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)] md:order-2 order-1 z-10">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <Trophy className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)] mb-3" />
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4 border border-yellow-500/50 neon-box-green" style={{ boxShadow: '0 0 10px rgba(234,179,8,0.5)' }}>
              <span className="text-3xl font-black text-yellow-500">1</span>
            </div>
            <h3 className="font-bold text-xl text-foreground truncate w-full">{first.team_name}</h3>
            <p className="text-3xl font-mono text-yellow-500 font-black mt-2">{formatScore(first.total_score)}</p>
            <p className="text-sm text-muted-foreground">{formatPercentage(first.accuracy)} Acc</p>
          </CardContent>
        </Card>
      )}

      {/* 3rd Place */}
      {third && (
        <Card className="w-full md:w-64 glass-panel border-amber-700/50 shadow-[0_0_15px_rgba(180,83,9,0.2)] md:order-3 order-3 transform md:translate-y-12">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-700/20 flex items-center justify-center mb-4 border border-amber-700/50">
              <span className="text-xl font-black text-amber-600">3</span>
            </div>
            <h3 className="font-bold text-lg text-foreground truncate w-full">{third.team_name}</h3>
            <p className="text-2xl font-mono text-amber-600 font-bold mt-2">{formatScore(third.total_score)}</p>
            <p className="text-sm text-muted-foreground">{formatPercentage(third.accuracy)} Acc</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

