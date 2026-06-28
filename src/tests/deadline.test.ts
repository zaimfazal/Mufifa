import { describe, it, expect, vi, beforeEach } from 'vitest'

// We mock the supabase client to simulate deadline states
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}))

// A minimal mock of what uploadSubmission might do internally
async function checkDeadlineLogic(settingsRow: { submission_deadline?: string | null }) {
  if (settingsRow?.submission_deadline) {
    if (new Date() > new Date(settingsRow.submission_deadline)) {
      return { error: 'Submissions are closed. The prediction window ended when the Round of 32 began.' }
    }
  }
  return { success: true }
}

describe('Submission Deadline Enforcement', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('allows submissions when no deadline is set', async () => {
    const result = await checkDeadlineLogic({ submission_deadline: null })
    expect(result.success).toBe(true)
  })

  it('allows submissions before the deadline', async () => {
    // Current time: 2026-06-20T10:00:00Z
    vi.setSystemTime(new Date('2026-06-20T10:00:00Z'))
    // Deadline: 2026-06-28T16:00:00Z
    const settings = { submission_deadline: '2026-06-28T16:00:00Z' }
    
    const result = await checkDeadlineLogic(settings)
    expect(result.success).toBe(true)
  })

  it('rejects submissions exactly one second after the deadline', async () => {
    // Current time: 2026-06-28T16:00:01Z
    vi.setSystemTime(new Date('2026-06-28T16:00:01Z'))
    // Deadline: 2026-06-28T16:00:00Z
    const settings = { submission_deadline: '2026-06-28T16:00:00Z' }
    
    const result = await checkDeadlineLogic(settings)
    expect(result.error).toBe('Submissions are closed. The prediction window ended when the Round of 16 began.')
  })

  it('rejects submissions well after the deadline', async () => {
    // Current time: 2026-07-10T10:00:00Z
    vi.setSystemTime(new Date('2026-07-10T10:00:00Z'))
    // Deadline: 2026-06-28T16:00:00Z
    const settings = { submission_deadline: '2026-06-28T16:00:00Z' }
    
    const result = await checkDeadlineLogic(settings)
    expect(result.error).toBe('Submissions are closed. The prediction window ended when the Round of 16 began.')
  })
})
