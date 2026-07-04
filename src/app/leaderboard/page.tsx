import { getLeaderboard } from '@/actions/leaderboard'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'
import { Podium } from '@/components/leaderboard/podium'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Leaderboard | µFifa '26",
  description: "Global leaderboard for the ML Prediction Challenge",
}

export default async function LeaderboardPage() {
  const { rows } = await getLeaderboard(1, 100)

  const hasLiveScores = rows.some(row => Number(row.total_score) !== 0)
  const placeholderPodium = [
    { rank: 1, team_name: 'First', total_score: 0, accuracy: 0 },
    { rank: 2, team_name: 'Second', total_score: 0, accuracy: 0 },
    { rank: 3, team_name: 'Third', total_score: 0, accuracy: 0 },
  ]
  const top3 = hasLiveScores ? rows.slice(0, 3) : placeholderPodium
  
  return (
    <div className="container mx-auto py-10 px-4 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
          Global Leaderboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Real-time ranking of all prediction models based on accuracy against actual match outcomes.
        </p>
      </div>

      {!hasLiveScores && (
        <div className="mx-auto max-w-4xl rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-center text-sm font-semibold text-red-500 sm:text-base">
          The leaderboard will update after the Quarter Finals starts. Submit your predictions, be ready, and come back to see who is on top!
        </div>
      )}

      <Podium topTeams={top3} />

      {rows.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">All Rankings</h2>
            <LeaderboardTable data={rows} />
          </div>
      )}
    </div>
  )
}
