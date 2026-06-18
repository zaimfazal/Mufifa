/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getTournamentAnalytics() {
  const supabase = await createClient()

  // In a full production scenario, these would ideally be materialized views or pre-aggregated 
  // via triggers into the `analytics_cache` table to avoid heavy scans on every page load.
  // We'll perform direct queries here for simplicity given the dataset size.

  const { count: totalTeams } = await supabase.from('teams').select('*', { count: 'exact', head: true })
  
  // Get all leaderboard entries
  const { data: leaderboard } = await supabase.from('leaderboard').select('*')
  
  // Calculate average accuracy
  let avgAccuracy = 0
  let bestTeam = null
  
  if (leaderboard && leaderboard.length > 0) {
    const totalAccuracy = leaderboard.reduce((sum, entry: any) => sum + (Number(entry.accuracy_percentage) || 0), 0)
    avgAccuracy = totalAccuracy / leaderboard.length
    
    // Best team is the one with highest score
    const topEntry: any = [...leaderboard].sort((a: any, b: any) => Number(b.total_score) - Number(a.total_score))[0]
    
    if (topEntry) {
      const { data: teamData } = await supabase.from('teams').select('team_name').eq('id', topEntry.team_id).single()
      bestTeam = teamData?.team_name
    }
  }

  // Champion Distribution
  const { data: champPreds } = await supabase.from('champion_predictions').select('champion')
  const championDist: Record<string, number> = {}
  
  if (champPreds) {
    champPreds.forEach((pred: any) => {
      const champ = pred.champion
      championDist[champ] = (championDist[champ] || 0) + 1
    })
  }

  // Convert to array for Recharts
  const championChartData = Object.entries(championDist)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Top 10 predicted champions

  // Accuracy Distribution Histogram Data
  const bins = [
    { name: '0-10%', count: 0 },
    { name: '10-20%', count: 0 },
    { name: '20-30%', count: 0 },
    { name: '30-40%', count: 0 },
    { name: '40-50%', count: 0 },
    { name: '50-60%', count: 0 },
    { name: '60-70%', count: 0 },
    { name: '70-80%', count: 0 },
    { name: '80-90%', count: 0 },
    { name: '90-100%', count: 0 }
  ]

  if (leaderboard) {
    leaderboard.forEach((entry: any) => {
      const acc = Number(entry.accuracy_percentage) || 0
      const index = Math.min(Math.floor(acc / 10), 9) // cap at 9 for 100%
      bins[index].count++
    })
  }

  return {
    totalTeams: totalTeams || 0,
    avgAccuracy,
    bestTeam,
    championChartData,
    accuracyDistribution: bins
  }
}

export async function getComparisonData(teamAId: string, teamBId: string) {
  const supabase = await createClient()

  if (!teamAId || !teamBId) return null

  const { data: teams } = await supabase
    .from('leaderboard')
    .select('*, teams(team_name)')
    .in('team_id', [teamAId, teamBId])

  if (!teams || teams.length !== 2) return null

  const t1: any = teams[0]
  const t2: any = teams[1]

  // Structure for radar chart
  const categories = [
    { key: 'winner_score', label: 'Outcome' },
    { key: 'scoreline_score', label: 'Scoreline' },
    { key: 'scorer_score', label: 'Scorers' },
    { key: 'stats_score', label: 'Match Stats' },
    { key: 'champion_score', label: 'Champion' },
    { key: 'confidence_score', label: 'Confidence' }
  ]

  // @ts-expect-error - Supabase type nested relation
  const nameA = t1.id === teamAId ? t1.teams.team_name : t2.teams.team_name
  // @ts-expect-error - type check limit
  const nameB = t1.id === teamBId ? t1.teams.team_name : t2.teams.team_name

  const dataA = t1.id === teamAId ? t1 : t2
  const dataB = t1.id === teamBId ? t1 : t2

  const radarData = categories.map(cat => ({
    category: cat.label,
    [nameA]: Number(dataA[cat.key as keyof typeof dataA]) || 0,
    [nameB]: Number(dataB[cat.key as keyof typeof dataB]) || 0,
  }))

  return {
    teamA: { name: nameA, total: dataA.total_score, accuracy: dataA.accuracy_percentage },
    teamB: { name: nameB, total: dataB.total_score, accuracy: dataB.accuracy_percentage },
    radarData
  }
}

export async function getAllTeamsForSelect() {
  const supabase = await createClient()
  const { data } = await supabase.from('teams').select('id, team_name').order('team_name')
  return data || []
}



