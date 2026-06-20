# Pre-Launch Database Reset Guide

Before launching your tournament, you must execute the raw SQL script `RESET_DATABASE.sql` directly against your production Supabase database. This completely purges all mock data, testing submissions, and phantom `auth` users while perfectly preserving your administrative capabilities and tournament matches.

## Execution Steps

1. **Log in to Supabase Dashboard:**
   Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard) and select your production project.

2. **Open the SQL Editor:**
   From the left-hand navigation menu, click on **SQL Editor**.

3. **Create a New Query:**
   Click **+ New query**.

4. **Copy and Paste the Script:**
   Open the `RESET_DATABASE.sql` file generated in your repository. Copy all of the contents (from `BEGIN;` to `COMMIT;`) and paste it into the Supabase SQL Editor.

5. **Execute:**
   Press the **Run** button (or `CMD/CTRL + Enter`). 

6. **Verify Clean Slate:**
   - Go to the **Table Editor** -> `predictions` (Should be 0 rows).
   - Go to **Authentication** -> **Users** (All participant emails should be gone, only your Admin email should remain).

Your database is now fully sanitized and ready for public registrations!
