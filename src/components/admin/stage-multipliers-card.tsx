'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle2, Zap } from 'lucide-react'
import { updateStageMultipliers } from '@/actions/admin/stage-multipliers'
import { toast } from 'sonner'

interface StageMultiplier {
  id: string
  stage: string
  stage_label: string
  multiplier: number
}

const STAGE_ORDER = ['round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final']

interface Props {
  multipliers: StageMultiplier[]
}

export function StageMultipliersCard({ multipliers }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)

  const sorted = [...multipliers].sort(
    (a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage)
  )

  const handleSave = async () => {
    if (!formRef.current) return
    const formData = new FormData(formRef.current)
    setLoading(true)
    try {
      const result = await updateStageMultipliers(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Stage multipliers saved and scores recalculated!')
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to save multipliers')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-panel border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              Stage Weightage
            </CardTitle>
            <CardDescription>Point multiplier applied to each tournament stage</CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={loading}
            className="bg-accent text-accent-foreground hover:bg-accent/90 neon-border-green"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1.5" />
                Save & Recalculate
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form ref={formRef} className="space-y-3">
          {sorted.map(sm => (
            <div
              key={sm.id}
              className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="text-xs font-mono border-accent/40 text-accent bg-accent/5 whitespace-nowrap"
                >
                  {sm.stage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="10"
                  name={`stage_${sm.stage}_multiplier`}
                  defaultValue={sm.multiplier}
                  className="w-20 bg-background text-right font-mono"
                />
                <span className="text-muted-foreground text-sm font-mono">×</span>
              </div>
            </div>
          ))}
        </form>
      </CardContent>
    </Card>
  )
}
