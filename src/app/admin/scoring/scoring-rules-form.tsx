/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScoringSubmitButton } from './scoring-submit-button'

interface Rule {
  id: string
  rule_key: string
  rule_name: string
  points: number
  is_enabled: boolean
}

interface Props {
  rules: Rule[]
}

export function ScoringRulesForm({ rules }: Props) {
  const formRef = useRef<HTMLFormElement>(null)

  const groups: Record<string, Rule[]> = {
    'Match Outcome': [],
    'Scoreline': [],
    'Scorers & Bonus': [],
    'Other': [],
  }

  // champion_prediction is excluded — it is not part of the current submission
  // flow (limited CSV template has no tournament_champion column) so it must
  // not appear in the UI or be awarded any points.
  const activeRules = rules.filter(r => r.rule_key !== 'champion_prediction')

  activeRules.forEach(rule => {
    const k = rule.rule_key
    if (
      k === 'home_team_correct' ||
      k === 'away_team_correct' ||
      k === 'predicted_winner_correct' ||
      k.includes('winner') ||
      k.includes('draw')
    ) {
      groups['Match Outcome'].push(rule)
    } else if (
      k === 'home_goals_correct' ||
      k === 'away_goals_correct' ||
      k === 'goal_difference_correct' ||
      k.includes('score') ||
      k.includes('goal_diff')
    ) {
      groups['Scoreline'].push(rule)
    } else if (k.includes('scorer') || k === 'all_correct_bonus') {
      groups['Scorers & Bonus'].push(rule)
    } else {
      groups['Other'].push(rule)
    }
  })

  return (
    <form ref={formRef} className="space-y-8">
      <div className="flex justify-end sticky top-0 z-10 bg-background/80 p-4 backdrop-blur border-b border-border/50 -mx-8 px-8">
        <ScoringSubmitButton formRef={formRef} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {Object.entries(groups).map(([groupName, groupRules]) => {
          if (groupRules.length === 0) return null
          return (
            <Card key={groupName} className="glass-panel border-border/50">
              <CardHeader>
                <CardTitle>{groupName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupRules.map((rule: any) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{rule.rule_name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{rule.rule_key}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-xs text-muted-foreground">Pts</label>
                        <Input
                          type="number"
                          name={`rule_${rule.id}_points`}
                          defaultValue={rule.points}
                          className="w-20 bg-background"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-xs text-muted-foreground">On</label>
                        <Switch
                          name={`rule_${rule.id}_enabled`}
                          defaultChecked={rule.is_enabled}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </form>
  )
}
