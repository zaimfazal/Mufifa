export const dynamic = 'force-dynamic'
import { getScoringRules } from '@/actions/admin/scoring'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Metadata } from 'next'
import { ScoringRulesForm } from './scoring-rules-form'

export const metadata: Metadata = {
  title: "Scoring Rules | Admin | µFifa '26"
}

export default async function ScoringRulesPage() {
  const rules = await getScoringRules()

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scoring Engine Configuration</h1>
        <p className="text-muted-foreground">
          Adjust the point weights for the prediction model evaluation. Saving will trigger a full
          global recalculation.
        </p>
      </div>

      {rules.length === 0 ? (
        <Card className="glass-panel border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">No Rules Found</CardTitle>
            <CardDescription>
              Run migration <code>016_new_scoring_rules.sql</code> in the Supabase SQL Editor to
              populate the scoring rules table.
            </CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      ) : (
        <ScoringRulesForm rules={rules} />
      )}
    </div>
  )
}
