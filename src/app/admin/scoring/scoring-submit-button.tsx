'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle2 } from 'lucide-react'
import { updateScoringRules } from '@/actions/admin/scoring'
import { toast } from 'sonner'

interface Props {
  formRef: React.RefObject<HTMLFormElement | null>
}

export function ScoringSubmitButton({ formRef }: Props) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!formRef.current) return
    const formData = new FormData(formRef.current)
    setLoading(true)
    try {
      const result = await updateScoringRules(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Scoring rules saved and leaderboard recalculated!')
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to save scoring rules')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="bg-accent text-accent-foreground hover:bg-accent/90 neon-border-green"
    >
      {loading ? (
        <>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Saving & Recalculating…
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Save & Recalculate Leaderboard
        </>
      )}
    </Button>
  )
}
