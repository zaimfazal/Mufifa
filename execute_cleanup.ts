import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  console.log('--- Starting Pre-Launch Cleanup ---')
  
  const tables = [
    { name: 'audit_logs', pk: 'id' },
    { name: 'analytics_cache', pk: 'key' },
    { name: 'actual_results', pk: 'match_id' },
    { name: 'leaderboard', pk: 'team_id' },
    { name: 'submissions', pk: 'id' },
    { name: 'champion_predictions', pk: 'team_id' },
    { name: 'predictions', pk: 'id' },
    { name: 'teams', pk: 'id' }
  ]

  for (const t of tables) {
    console.log(`Deleting all rows from ${t.name}...`)
    // Supabase REST requires a filter to delete all rows. We use not.is.null on the primary key.
    const { error } = await supabase.from(t.name).delete().not(t.pk, 'is', null)
    if (error) {
      console.error(`Error deleting from ${t.name}:`, error)
    }
  }

  console.log('\n--- Verifying Row Counts ---')
  for (const t of tables) {
    const { count, error } = await supabase.from(t.name).select('*', { count: 'exact', head: true })
    if (error) {
      console.error(`Error counting ${t.name}:`, error)
    } else {
      console.log(`${t.name}: ${count} rows`)
    }
  }
}

main().catch(console.error)
