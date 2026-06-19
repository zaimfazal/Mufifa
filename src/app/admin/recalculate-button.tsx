'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { adminRecalculateAll } from '@/actions/admin'
import { toast } from 'sonner'

export function RecalculateButton() {
  const [loading, setLoading] = useState(false)

  const handleRecalculate = async () => {
    try {
      setLoading(true)
      await adminRecalculateAll()
      toast.success("Scores successfully recalculated for all users")
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to recalculate scores"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="destructive" 
      className="w-full" 
      onClick={handleRecalculate}
      disabled={loading}
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Recalculating...' : 'Recalculate All Scores'}
    </Button>
  )
}
