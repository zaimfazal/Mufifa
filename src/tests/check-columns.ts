import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data, error } = await supabase.from('predictions').select('*').limit(1)
  if (error) console.error(error)
  else {
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]))
    } else {
      console.log('No data, but query succeeded')
    }
  }
}

check()
