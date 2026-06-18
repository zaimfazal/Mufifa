'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useRealtimeResults() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('actual-results-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'actual_results',
        },
        (payload) => {
          console.log('Realtime update received on actual_results:', payload)
          toast.success('A match result was just updated! Leaderboard is refreshing...', {
            description: 'The scoring engine has recalculated the scores.',
          })
          router.refresh() // Invalidate the router cache and re-fetch server components
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])
}
