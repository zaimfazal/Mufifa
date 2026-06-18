/* eslint-disable @typescript-eslint/no-explicit-any */
import { getScoringRules, updateScoringRules } from '@/actions/admin/scoring'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Scoring Rules | Admin | µFifa '26"
}

export default async function ScoringRulesPage() {
  const rules = await getScoringRules()

  // Group rules roughly by prefix or keyword for UI organization
  const groups: Record<string, any[]> = {
    'Match Outcome': [],
    'Scoreline': [],
    'Scorers': [],
    'Statistics': [],
    'Penalties': [],
    'Other': []
  }

  rules.forEach(rule => {
    if (rule.rule_key.includes('winner') || rule.rule_key.includes('draw')) groups['Match Outcome'].push(rule)
    else if (rule.rule_key.includes('score')) groups['Scoreline'].push(rule)
    else if (rule.rule_key.includes('scorer') || rule.rule_key.includes('goal_count')) groups['Scorers'].push(rule)
    else if (rule.rule_key.includes('accuracy') || rule.rule_key.includes('red_cards')) groups['Statistics'].push(rule)
    else if (rule.rule_key.includes('penalty')) groups['Penalties'].push(rule)
    else groups['Other'].push(rule)
  })

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scoring Engine Configuration</h1>
        <p className="text-muted-foreground">Adjust the point weights for the prediction model evaluation. Saving will trigger a full global recalculation.</p>
      </div>

      <form action={updateScoringRules} className="space-y-8">
        <div className="flex justify-end sticky top-0 z-10 bg-background/80 p-4 backdrop-blur border-b border-border/50 -mx-8 px-8">
          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 neon-border-green">
            Save & Recalculate Leaderboard
          </Button>
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
                  {groupRules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
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
    </div>
  )
}

