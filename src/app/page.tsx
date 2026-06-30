import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trophy, ChevronRight, CheckCircle2, BrainCircuit, Target, BarChart3, Lock, Cpu, Globe, Users, HelpCircle, Phone, ArrowRight, Download, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getLeaderboard } from '@/actions/leaderboard'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function Home(props: { searchParams?: SearchParams }) {
  const searchParams = props.searchParams ? await props.searchParams : undefined
  if (searchParams?.code && typeof searchParams.code === 'string') {
    redirect(`/auth/callback?code=${searchParams.code}`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Parallelize all independent queries — reduces SSR time from ~3 serial
  // roundtrips (~1-2 s) to a single parallel roundtrip (~300-500 ms).
  const [teamResult, settingsResult, leaderboardResult] = await Promise.all([
    user
      ? supabase.from('teams').select('*').eq('owner_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('competition_settings').select('submission_deadline').maybeSingle(),
    getLeaderboard(1, 5),
  ])

  const team = teamResult.data
  const settings = (settingsResult as any).data
  const { rows: topTeams } = leaderboardResult
  const isClosed = settings?.submission_deadline
    ? new Date() > new Date(settings.submission_deadline)
    : false

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/50 to-background pt-24 pb-32">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="container relative mx-auto px-4 max-w-6xl text-center space-y-8 z-10">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="group flex items-center gap-3 sm:gap-4 bg-background hover:bg-muted/50 pl-6 pr-4 sm:pl-8 sm:pr-5 py-2 sm:py-2.5 rounded-full border border-border shadow-sm transition-all duration-500 cursor-default">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-muted-foreground group-hover:text-foreground transition-colors pt-1">Powered by</span>
              <div className="flex items-center transform group-hover:scale-105 transition-transform duration-500">
                <Image src="/reflections-logo-dark-v2.png" alt="Reflections" width={360} height={80} priority className="hidden dark:block h-7 sm:h-9 w-auto drop-shadow-sm" />
                <Image src="/reflections-logo-light-v2.png" alt="Reflections" width={360} height={80} priority className="block dark:hidden h-7 sm:h-9 w-auto drop-shadow-sm" />
              </div>
            </div>
            <div className="inline-flex items-center rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm cursor-default">
              <Trophy className="mr-2 h-4 w-4 text-primary" /> Reflect on the Data. Predict the Future.
            </div>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 drop-shadow-sm pb-2">
            WC Reflected <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6cbd45] to-[#a3e681]">2026 ML Challenge</span>
          </h1>

          <p className="mx-auto max-w-3xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Welcome to a competition where data scientists, machine learning enthusiasts, AI engineers, and football analysts compete to build the most accurate predictive model for the biggest sporting event in the world.
          </p>

          <p className="mx-auto max-w-2xl font-medium text-foreground">
            Participants will develop machine learning models capable of predicting match outcomes and tournament events. The most accurate models rise to the top of the leaderboard.
          </p>

          <div className="pt-8">
            <h3 className="text-xl font-bold mb-6 flex items-center justify-center gap-2">
              <Activity className="w-5 h-5 text-primary animate-pulse" />
              {isClosed
                ? "Submissions Closed: The tournament is officially underway."
                : settings?.submission_deadline
                  ? `Submission Deadline: ${new Date(settings.submission_deadline).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`
                  : "Submission Closes on July 3rd, 2026 11:59 PM IST"}
            </h3>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                team ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto px-8 text-base h-12 shadow-lg hover:shadow-primary/25 transition-all">
                      Go to Dashboard <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/submit">
                    <Button size="lg" className="w-full sm:w-auto px-8 text-base h-12 shadow-lg hover:shadow-primary/25 transition-all">
                      Register for Competition <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                )
              ) : (
                <>
                  <Link href="/login">
                    <Button size="lg" className="w-full sm:w-auto px-8 text-base h-12 shadow-lg hover:shadow-primary/25 transition-all">
                      Login Now
                    </Button>
                  </Link>
                  <Link href="/leaderboard">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 text-base h-12">
                      View Leaderboard
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. About The Competition */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">About The Competition</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Organized as part of the <span className="font-semibold text-foreground">μLearn Foundation</span>. Unlike traditional fantasy leagues, this competition evaluates the performance of machine learning models using a structured scoring framework designed to reward both accuracy and statistical insight.
            </p>
            <div className="bg-background border border-border rounded-xl p-6 mt-8 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-left shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-muted p-3 rounded-full shrink-0">
                  <BrainCircuit className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 text-foreground">Earn μLearn Karma Points</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    This challenge is part of μLearn. Participants who submit their ML notebook, methodology, and final predictions in the μLearn Discord community will receive μLearn Karma Points. If you are not part of the μLearn community, please register through <a href="https://mulearn.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">mulearn.org</a>.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto">
                <Button asChild className="w-full shadow-sm">
                  <Link href="https://mulearn.org/" target="_blank" rel="noopener noreferrer">
                    Register on μLearn
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full shadow-sm bg-transparent border-primary/30 hover:bg-primary/10">
                  <Link href="https://discord.gg/gtech-mulearn-771670169691881483" target="_blank" rel="noopener noreferrer">
                    Join Discord
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <Card className="bg-muted/30 border-primary/10 shadow-sm">
            <CardContent className="p-8 lg:p-12">
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Target className="text-primary w-6 h-6" /> Forecast the following:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Exact final score', 'Goal scorers (by jersey number)'].map((item) => (
                  <div key={item} className="flex items-center gap-2 bg-background border border-border p-3 rounded-lg shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="py-24 bg-muted/30 border-y border-border overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">Your journey from data gathering to leaderboard supremacy.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-5">
            {[
              { step: '1', title: 'Build Your Model', desc: 'Use Random Forest, XGBoost, Neural Networks, or Custom AI. No restrictions on architecture.', icon: Cpu },
              { step: '2', title: 'Generate Predictions', desc: 'Predict the exact score and goal scorers for every knockout match from the Round of 16 to the Final.', icon: BrainCircuit },
              { step: '3', title: 'Submit Predictions', desc: 'Upload the official CSV. You can re-upload to update your predictions any time before the deadline.', icon: Lock },
              { step: '4', title: 'Tournament Begins', desc: 'Organizers enter actual results. The engine evaluates predictions automatically.', icon: Globe },
              { step: '5', title: 'Climb Leaderboard', desc: 'Scores recalculate after every match. Track ranking, accuracy, and analytics.', icon: Trophy },
            ].map((item) => (
              <Card key={item.step} className="relative bg-background border-border shadow-sm hover:shadow-md transition-shadow group">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg">Step {item.step} — {item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. What Must Be Predicted */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight">What Must Be Predicted?</h2>
            <p className="mt-4 text-lg text-muted-foreground">Two things per match, across all 16 knockout matches from the Round of 16 onward.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">Exact Final Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Predict the precise full-time scoreline for each match (e.g. 2 : 1).
                  Points are awarded only when both numbers are exactly right.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">Goal Scorers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  List the jersey numbers of the players who score, per team. Points are awarded
                  when your set of scorers exactly matches the real scorers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Scoring System & 6. Stage Multipliers */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold tracking-tight">Scoring System</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Each match is scored on two things: the exact final score and the exact set of goal scorers. Later-stage matches receive higher multipliers, meaning knockout-stage predictions become increasingly valuable.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {['Exact Scoreline', 'Exact Scorer Set'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-medium text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="shadow-md border-primary/20">
              <CardHeader className="bg-muted/50 rounded-t-xl border-b border-border">
                <CardTitle>Stage Multipliers</CardTitle>
                <CardDescription>The World Cup Final carries the highest weight.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[60%] pl-6">Tournament Stage</TableHead>
                      <TableHead className="text-right pr-6">Multiplier</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { stage: 'Round of 16', mult: '1.0x' },
                      { stage: 'Quarter Final', mult: '2.0x' },
                      { stage: 'Semi Final', mult: '3.0x' },
                      { stage: 'Third Place', mult: '2.5x' },
                      { stage: 'Final', mult: '5.0x', highlight: true },
                    ].map((row) => (
                      <TableRow key={row.stage} className={row.highlight ? "bg-primary/5 hover:bg-primary/10" : ""}>
                        <TableCell className={`pl-6 ${row.highlight ? 'font-bold text-primary' : 'font-medium'}`}>{row.stage}</TableCell>
                        <TableCell className={`text-right pr-6 ${row.highlight ? 'font-bold text-primary' : 'text-muted-foreground'}`}>{row.mult}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. Leaderboard & Analytics */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight">Leaderboard & Analytics</h2>
            <p className="mt-4 text-lg text-muted-foreground">Real-time insights provided throughout the tournament.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-border hover:border-primary/30 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Globe className="w-6 h-6 text-primary" /> Top 5 Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topTeams.length > 0 ? (
                    topTeams.map((team, index) => (
                      <div key={team.id} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg w-6 text-muted-foreground">#{index + 1}</span>
                          <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">{team.team_name}</span>
                        </div>
                        <div className="font-mono font-bold text-primary">{team.total_score} pts</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground text-sm italic">Leaderboard will update after matches begin.</div>
                  )}
                  <div className="pt-2">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/leaderboard">View Full Leaderboard</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-primary/30 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <BarChart3 className="w-6 h-6 text-primary" /> Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                  {['Winner Accuracy', 'Score Accuracy', 'Scorer Accuracy', 'Confidence Calibration', 'Most Accurate Participant', 'Hardest Match To Predict', 'Easiest Match To Predict'].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 8 & 9. Rules & Participants */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-6">Competition Rules</h2>
                <div className="space-y-6">
                  <div className="bg-background border border-border p-6 rounded-xl shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-primary" /> Submission Rules
                    </h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                      <li>One prediction set per participant.</li>
                      <li>Submission deadline is before the knockout stage begins.</li>
                      <li>You can re-upload to update your predictions any time before the deadline.</li>
                      <li>Invalid submissions will be rejected.</li>
                    </ul>
                  </div>
                  <div className="bg-background border border-border p-6 rounded-xl shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" /> Fair Play
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Participants may use any legal and ethical data sources. The use of ML, DL, statistical models, and AI systems is encouraged.
                    </p>
                    <p className="text-sm font-medium text-destructive">
                      Any attempt to manipulate platform data, rankings, or submissions may result in immediate disqualification.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Who Should Participate?</h2>
              <p className="text-muted-foreground mb-8">
                Whether you&apos;re building your first predictive model or operating a sophisticated ML pipeline, this challenge provides a unique opportunity to test your skills on a global sporting event.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {['Data Scientists', 'ML Engineers', 'AI Enthusiasts', 'Football Analysts', 'Students', 'Researchers', 'Sports Analytics Pros'].map((role) => (
                  <div key={role} className="flex items-center gap-3 bg-background border border-border p-4 rounded-lg">
                    <Users className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-semibold text-sm">{role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            <details className="group bg-muted/30 border border-border rounded-xl p-6 open:bg-background open:shadow-sm transition-all cursor-pointer">
              <summary className="font-semibold text-lg flex items-center justify-between outline-none">
                Can I use any ML framework?
                <ChevronRight className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-4 text-muted-foreground text-sm pt-4 border-t border-border">
                <p className="mb-2"><strong>Yes.</strong> You are free to use any framework including:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Scikit-Learn</li>
                  <li>TensorFlow</li>
                  <li>PyTorch</li>
                  <li>XGBoost & CatBoost</li>
                  <li>LightGBM</li>
                  <li>Custom Models</li>
                </ul>
              </div>
            </details>

            <details className="group bg-muted/30 border border-border rounded-xl p-6 open:bg-background open:shadow-sm transition-all cursor-pointer">
              <summary className="font-semibold text-lg flex items-center justify-between outline-none">
                Can I update predictions after submission?
                <ChevronRight className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-4 text-muted-foreground text-sm pt-4 border-t border-border">
                <p><strong>Yes.</strong> You can re-upload to update your predictions any time before the deadline. After the deadline they are locked.</p>
              </div>
            </details>

            <details className="group bg-muted/30 border border-border rounded-xl p-6 open:bg-background open:shadow-sm transition-all cursor-pointer">
              <summary className="font-semibold text-lg flex items-center justify-between outline-none">
                How many submissions are allowed?
                <ChevronRight className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-4 text-muted-foreground text-sm pt-4 border-t border-border">
                <p>One prediction set per participant, which you can re-upload to update any time before the deadline.</p>
              </div>
            </details>

            <details className="group bg-muted/30 border border-border rounded-xl p-6 open:bg-background open:shadow-sm transition-all cursor-pointer">
              <summary className="font-semibold text-lg flex items-center justify-between outline-none">
                Is the leaderboard public?
                <ChevronRight className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-4 text-muted-foreground text-sm pt-4 border-t border-border">
                <p><strong>Yes.</strong> The leaderboard is publicly visible throughout the tournament.</p>
              </div>
            </details>

            <details className="group bg-muted/30 border border-border rounded-xl p-6 open:bg-background open:shadow-sm transition-all cursor-pointer">
              <summary className="font-semibold text-lg flex items-center justify-between outline-none">
                How are winners selected?
                <ChevronRight className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-4 text-muted-foreground text-sm pt-4 border-t border-border">
                <p>Participants are ranked based on total accuracy points accumulated during the FIFA World Cup. The highest-scoring participant at tournament completion wins.</p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* 11 & 12. Contact & Final CTA */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-5xl text-center space-y-12">

          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl font-extrabold tracking-tight">Ready to build the most accurate prediction model?</h2>
            <p className="text-xl opacity-90 leading-relaxed">
              Compete against fellow machine learning enthusiasts, test your forecasting skills, and prove that your model can predict the future of football.
            </p>
            <p className="text-2xl font-bold tracking-widest uppercase pt-4 opacity-80">
              Build. Predict. Compete.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            {!user && (
              <Link href="/login">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 h-14 text-base font-bold shadow-lg">
                  Login Now
                </Button>
              </Link>
            )}
            <Link href="/submit">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-14 text-base bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Download className="mr-2 w-5 h-5" /> Download Template
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-14 text-base bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Trophy className="mr-2 w-5 h-5" /> View Leaderboard
              </Button>
            </Link>
          </div>

          <div className="border-t border-primary-foreground/20 mt-16 pt-16 flex flex-col items-center space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <HelpCircle className="w-5 h-5" /> Contact & Support
            </h3>
            <p className="opacity-90">For competition-related enquiries, technical support, or submission assistance:</p>
            <a href="https://chat.whatsapp.com/HrExspFw2lWHtkUqidQiHZ?s=cl&p=a&ilr=0&amv=1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg> Join WhatsApp Group
            </a>
            <p className="text-sm font-medium opacity-70 mt-4">Organized as part of the μLearn Organisation</p>

            <div className="pt-12 flex flex-col items-center space-y-6">
              <p className="text-sm font-bold opacity-80 uppercase tracking-widest text-primary-foreground">In Partnership With</p>
              <div className="flex items-center gap-8 bg-background p-6 rounded-2xl border border-border shadow-sm">
                {/* MuLearn Logo */}
                <div className="flex items-center justify-center bg-white rounded-lg p-2 h-20 w-[140px] overflow-hidden relative">
                  <Image src="/mulearn-logo.png" alt="MuLearn" fill sizes="140px" className="object-contain p-2" />
                </div>
                <div className="h-12 w-px bg-border"></div>
                {/* Provided Partner Logo */}
                <div className="flex items-center justify-center bg-white rounded-lg p-2 h-20 w-[140px] overflow-hidden relative">
                  <Image src="/partner-logo.jpeg" alt="Partner" fill sizes="140px" className="object-contain p-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
