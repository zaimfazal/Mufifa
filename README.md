# µFifa '26 - ML Prediction Challenge

A Kaggle-style machine learning prediction platform for the FIFA World Cup 2026. Build predictive models to forecast match outcomes, exact scores, and goal scorers across all knockout-stage matches.

**Live:** https://mufifa-gules.vercel.app

---

## What This Is

µFifa '26 is a competitive platform where data scientists, ML engineers, and football analysts develop machine learning models to predict FIFA World Cup 2026 outcomes. Participants upload predictions (exact final scores and goal scorers) for all 16 knockout-stage matches, and the platform automatically evaluates accuracy against real tournament results. Rankings update in real-time after each match, with later stages carrying higher multipliers (Final = 5.0x).

Organized as part of the **MuLearn Hackathon ecosystem** and powered by **Reflections** — this is a pure prediction evaluation platform, not an ML training service.

---

## Stack

- **Language(s):** TypeScript (95.7%), PostgreSQL (2.8%)
- **Framework:** Next.js 16 (App Router) + React 19
- **Database:** Supabase (PostgreSQL) with server-side auth
- **UI:** Tailwind CSS v4, shadcn/ui, Base UI components
- **Key Libraries:**
  - `@tanstack/react-table` — leaderboard & analytics tables
  - `recharts` — score visualization & tournament analytics
  - `react-hook-form` + `zod` — prediction form validation
  - `@supabase/ssr` — authentication & real-time DB sync
  - `@sentry/nextjs` — error tracking & monitoring
  - `@upstash/redis` + `@upstash/ratelimit` — rate limiting & caching

---

## How It's Organized

```
src/
  app/                    Next.js App Router
    (auth)/               Auth-protected routes
      login/              OAuth login (Supabase)
      reset-password/     External redirect to MuLearn
    (public)/             Public pages
      leaderboard/        Real-time ranking table
      dashboard/          Per-participant score breakdown
    submit/               CSV upload & validation portal
      submission-client.tsx   Client-side form logic
      submission-server.ts    Server action for upload
    page.tsx              Hero, competition info, FAQ
    globals.css           Tailwind + custom theme
    layout.tsx            RootLayout with Navbar/Footer
  
  components/
    ui/                   shadcn/ui components (buttons, tables, cards)
    layout/               Navbar, Footer, ThemeProvider
  
  actions/                Server actions (Next.js 13+)
    leaderboard.ts        Fetch top N teams
    submission.ts         Handle CSV upload & validation
  
  lib/
    supabase/
      server.ts           SSR-safe Supabase client
      client.ts           Client-side Supabase client
    validation.ts         CSV schema validation

supabase/
  migrations/             Database schema & stored procedures
  functions/              Edge functions (scoring recalculation)

public/                   Static assets (logos, brand images)
Docs/                     Product documentation & PRD
```

**How it fits together:** On page load, Next.js SSR fetches user auth via Supabase, then parallelizes three queries (team data, competition settings, top-5 leaderboard) to minimize TTFB. When a participant uploads CSV, the server validates each row against the prediction schema (match_id, exact_score, goal_scorers), then stores to PostgreSQL. As tournament matches complete, admin runs recalculation via stored procedures, which re-score all submissions and reorder the leaderboard instantly. The UI reflects updated rankings via real-time subscriptions to the `teams` table.

---

## How to Run It

### Prerequisites
- Node.js 18+
- `pnpm` (preferred) or `npm`
- Supabase project (free tier available)
- Environment variables (see `.env.example`)

### Local Development

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials, Sentry DSN, etc.

# Run dev server
pnpm dev

# Open browser to http://localhost:3000
```

### Build & Deploy

```bash
# Build production bundle
pnpm build

# Start production server locally
pnpm start

# Or deploy to Vercel
vercel deploy
```

### Tests

```bash
# Unit tests (Vitest)
pnpm test

# Run tests in Node environment
pnpm test:node

# Coverage
pnpm test:coverage
```

### Lint

```bash
pnpm lint
```

---

## Key Features

### For Participants
- **OAuth Login** — Sign in via Supabase auth (email/password or social)
- **Team Registration** — Create a unique nickname before submitting
- **CSV Upload & Validation** — Download template, fill predictions, re-upload anytime before deadline
- **Prediction Breakdown** — View your score per match, per stage, confidence calibration
- **Public Leaderboard** — Real-time rankings, top 5 featured on homepage
- **Analytics Dashboard** — Winner accuracy, score accuracy, scorer accuracy, most/least predicted matches
- **GitHub Link** — Optional field to showcase your methodology repository

### For Organizers
- **Submission Management** — Lock/unlock submission period, bulk-approve/reject uploads
- **Scoring Configuration** — Define stage multipliers (Round of 16=1.0x, Final=5.0x)
- **Match & Result Data** — Manage tournament fixtures and actual outcomes
- **Recalculation Engine** — Automatic or manual recalc triggers after match completion
- **Rate Limiting** — Upstash-backed guards on upload endpoints

### Tournament Scope
- **Knockout Stages:** Round of 16, Quarter Finals, Semi Finals, Third Place, Final
- **Per-Match Prediction:** Exact final score + exact goal scorers (by jersey number)
- **Points:** Only exact matches award points; multipliers increase by stage
- **Fair Play:** Any legal data source + ML/DL encouraged; platform data manipulation = disqualification

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Sentry (error tracking)
NEXT_PUBLIC_SENTRY_AUTH_TOKEN=your-sentry-token
SENTRY_ORG=mufifa
SENTRY_PROJECT=mufifa-app

# Upstash (rate limiting & Redis)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=your-token

# OAuth (if using third-party providers)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...

# Competition Settings
NEXT_PUBLIC_SUBMISSION_DEADLINE=2026-06-01T18:00:00Z
```

---

## Database Schema (Supabase)

### Key Tables
- **`users`** — Supabase-managed auth users
- **`teams`** — Participant nicknames, owner_id, total_score, github_link
- **`submissions`** — CSV uploads, validation status, locked flag
- **`predictions`** — Individual rows per team + match (score, scorers, confidence)
- **`matches`** — Tournament fixtures (match_id, stage, teams, date)
- **`actual_results`** — Organizer-entered actual scores & scorers
- **`competition_settings`** — Global config (deadline, tier1_only_mode, multipliers)

### Recalculation
Stored procedure `recalculate_leaderboard()` runs after results are added:
1. Iterates all predictions
2. Compares with actual_results
3. Awards points (1 = exact score, 1 = exact scorers) × stage multiplier
4. Updates `teams.total_score` and sort order

---

## Deployment

**Current:** Vercel (via GitHub Actions)  
**Database:** Supabase Postgres  
**Monitoring:** Sentry + Vercel Analytics  
**CDN:** Vercel Edge Network

### GitHub Actions
Pre-configured workflows in `.github/workflows/` for:
- PR preview deployments
- Main branch production deploy
- Automated linting & type checks

---

## Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -am 'Add feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## Support & Contact

For competition-related inquiries, technical issues, or submission assistance:
- **Phone:** +91 9496392272
- **Discord:** [Join MuLearn Community](https://discord.gg/gtech-mulearn-771670169691881483)
- **Website:** https://mulearn.org

---

## License

This project is proprietary and part of the MuLearn Hackathon. Contact for licensing details.

---

## In Partnership With

- **MuLearn** — Educational & community platform
- **Reflections** — Data insights & analytics partner

---

## FAQ

**Can I use any ML framework?**  
Yes. Scikit-Learn, TensorFlow, PyTorch, XGBoost, LightGBM, and custom models are all supported. You build locally; we only evaluate your prediction CSV.

**Can I update predictions after submission?**  
Yes. You can re-upload your CSV anytime before the deadline. After the deadline, submissions are locked.

**Is the leaderboard public?**  
Yes. Rankings are publicly visible throughout the tournament.

**How are winners selected?**  
Participants are ranked by total accuracy points. The highest score at tournament completion wins.

---

**Ready to compete?** 🏆  
[Register Now](https://mufifa-gules.vercel.app) → [Download Template](https://mufifa-gules.vercel.app/submit) → [View Leaderboard](https://mufifa-gules.vercel.app/leaderboard)

---

**Build. Predict. Compete.**
