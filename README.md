# µFifa '26 — ML Prediction Challenge Platform 🏆

Welcome to the **µFifa '26** repository! This is a comprehensive, enterprise-grade web application built to host machine learning prediction challenges for football tournaments. It allows participants to download templates, run their ML models locally, upload their predictions via CSV, and compete on a global real-time leaderboard.

![Dashboard Preview](https://mufifa-gules.vercel.app/favicon.ico)

## 🌟 Key Features

*   **Robust CSV Pipeline:** Drag-and-drop CSV uploads parsed with PapaParse and strictly validated against complex tournament constraints (score formats, possession constraints, missing matches, and fuzzy name matching) using Zod.
*   **Deterministic Scoring Engine:** A purely functional scoring engine that calculates points across 19 separate rules (Outcome, Scoreline, Scorers, Stats, Penalties, Confidence, and Champions).
*   **Real-Time Global Leaderboard:** Automatically updates rankings and breaks ties based on a hierarchy of scoring categories without requiring page refreshes.
*   **Comprehensive Admin Dashboard:** Protected routes allowing tournament organizers to create matches, enter live real-world results, adjust rule point values, and globally recalculate all participant scores.
*   **Analytics & Visualizations:** Rich, interactive charts built with Recharts, featuring global accuracy distributions, champion pick breakdowns, and 1v1 team comparison radar charts.
*   **Secure by Design:** Strict Row-Level Security (RLS) in PostgreSQL ensures participants only access their own submissions, while Supabase Storage acts as a secure audit trail for original CSV files.

## 🛠 Tech Stack

*   **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Server Components)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
*   **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Supabase Auth, Storage)
*   **Validation:** [Zod](https://zod.dev/)
*   **Data Parsing:** [PapaParse](https://www.papaparse.com/)
*   **Visualizations:** [Recharts](https://recharts.org/)
*   **Tables:** [TanStack Table v8](https://tanstack.com/table/v8)

---

## 🚀 Local Development Setup

To run this application locally, you will need **Node.js 20+** and the **Supabase CLI** installed.

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/Mufifa.git
cd Mufifa
npm install
```

### 2. Start the Local Database
We use Supabase's local development environment to spin up Postgres and run our migrations.
```bash
npx supabase start
```
*Note: This command will automatically apply all the SQL migrations found in the `supabase/migrations` folder and seed the default scoring rules.*

### 3. Environment Variables
Copy the template environment file:
```bash
cp .env.example .env.local
```
Fill in the `.env.local` file with the API credentials provided in your terminal after running `supabase start`. Ensure you also set an `ADMIN_EMAIL` to auto-grant admin privileges to your first account!

### 4. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment

This application is fully optimized for **Vercel** deployment.

1. Create a new project in Supabase cloud.
2. Link your Vercel project to your GitHub repository.
3. Push your database migrations to your production Supabase project:
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_ID
   npx supabase db push
   ```
4. Copy your Supabase URL, Anon Key, and Service Role Key into your Vercel Environment Variables.
5. Hit **Deploy**.

---

## 🔒 Post-Deployment Security

By default, Supabase's test SMTP server only allows 3 emails per hour. For hackathons or testing environments without a custom SMTP provider, it is highly recommended to **disable Email Confirmations** in your Supabase Auth settings so participants can register seamlessly without hitting rate limits.

---

*Built with precision for the ultimate football prediction challenge.*
