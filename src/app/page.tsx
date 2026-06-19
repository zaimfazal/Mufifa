import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trophy, ChevronRight, CheckCircle2, BrainCircuit, Target, BarChart3, Lock, Cpu, Globe, Users, HelpCircle, Phone, ArrowRight, Download, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function Home(props: { searchParams?: SearchParams }) {
  const searchParams = props.searchParams ? await props.searchParams : undefined
  if (searchParams?.code && typeof searchParams.code === 'string') {
    redirect(`/auth/callback?code=${searchParams.code}`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/50 to-background pt-24 pb-32">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="container relative mx-auto px-4 max-w-6xl text-center space-y-8 z-10">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-sm transition-colors hover:bg-primary/20 cursor-default">
            <Trophy className="mr-2 h-4 w-4" /> Build. Predict. Compete. Win.
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 drop-shadow-sm pb-2">
            FIFA World Cup 2026 <br/>
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">ML Prediction Challenge</span>
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
              Competition Starts Soon: Predict the future of football.
            </h3>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto px-8 text-base h-12 shadow-lg hover:shadow-primary/25 transition-all">
                    Go to Dashboard <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto px-8 text-base h-12 shadow-lg hover:shadow-primary/25 transition-all">
                      Register Now
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
              Organized as part of the <span className="font-semibold text-foreground">MuLearn Hackathon ecosystem</span>. Unlike traditional fantasy leagues, this competition evaluates the performance of machine learning models using a structured scoring framework designed to reward both accuracy and statistical insight.
            </p>
          </div>

          <Card className="bg-muted/30 border-primary/10 shadow-sm">
            <CardContent className="p-8 lg:p-12">
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Target className="text-primary w-6 h-6" /> Forecast the following:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Match winners', 'Final scores', 'Goal scorers', 'First goal scorer', 'Possession stats', 'Expected goals (xG)', 'Shots on target', 'Yellow cards', 'Red cards', 'Penalty shootouts', 'World Cup Champion'].map((item) => (
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
              { step: '2', title: 'Generate Predictions', desc: 'Predict all matches from Group Stage to Final before the tournament begins.', icon: BrainCircuit },
              { step: '3', title: 'Submit Predictions', desc: 'Upload the official CSV. Only ONE final submission allowed. Permanently locked.', icon: Lock },
              { step: '4', title: 'Tournament Begins', desc: 'Organizers enter actual results. The engine evaluates predictions automatically.', icon: Globe },
              { step: '5', title: 'Climb Leaderboard', desc: 'Scores recalculate after every match. Track ranking, accuracy, and analytics.', icon: Trophy },
            ].map((item, i) => (
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
            <p className="mt-4 text-lg text-muted-foreground">Comprehensive coverage of 104 matches.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">Match Outcome</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Winner</li>
                  <li>Final Score</li>
                  <li>Extra Time Result</li>
                  <li>Penalty Shootout Result</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">Goal Scoring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Goal Scorers</li>
                  <li>Goals Per Scorer</li>
                  <li>First Goal Scorer</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">Match Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Possession %</li>
                  <li>Shots On Target</li>
                  <li>Expected Goals (xG)</li>
                  <li>Yellow & Red Cards</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-primary/50 bg-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BrainCircuit className="w-24 h-24" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl text-primary">Confidence Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Provide a confidence score representing how confident the model is in each prediction.</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" /> Tournament Champion
                </CardTitle>
                <CardDescription className="text-base">Predict the team that will ultimately win the FIFA World Cup 2026.</CardDescription>
              </CardHeader>
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
                The platform uses a weighted evaluation framework. Additional bonuses are awarded for highly confident and accurate predictions. Later-stage matches receive higher multipliers, meaning knockout-stage predictions become increasingly valuable.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {['Match Winner', 'Exact Scoreline', 'Goal Difference', 'Goal Scorers', 'Goal Counts', 'Match Statistics', 'Penalty Outcomes', 'Champion Prediction'].map((item) => (
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
                      { stage: 'Group Stage', mult: '1.0x' },
                      { stage: 'Round of 32', mult: '1.2x' },
                      { stage: 'Round of 16', mult: '1.5x' },
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
                  <Globe className="w-6 h-6 text-primary" /> Public Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {['Team Rankings', 'Total Points', 'Accuracy Percentage', 'Champion Prediction Status'].map((item) => (
                    <li key={item} className="flex items-center gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
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
                      <li>One submission per participant/team.</li>
                      <li>Submission deadline is before the first match begins.</li>
                      <li>No edits after submission. No resubmissions.</li>
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
                Whether you're building your first predictive model or operating a sophisticated ML pipeline, this challenge provides a unique opportunity to test your skills on a global sporting event.
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
                <p><strong>No.</strong> All submissions are permanently locked once accepted.</p>
              </div>
            </details>

            <details className="group bg-muted/30 border border-border rounded-xl p-6 open:bg-background open:shadow-sm transition-all cursor-pointer">
              <summary className="font-semibold text-lg flex items-center justify-between outline-none">
                How many submissions are allowed?
                <ChevronRight className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-4 text-muted-foreground text-sm pt-4 border-t border-border">
                <p><strong>One submission</strong> per participant/team.</p>
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
            <Link href="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 h-14 text-base font-bold shadow-lg">
                Register Now
              </Button>
            </Link>
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
            <Badge variant="secondary" className="px-4 py-1.5 text-base flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20">
              <Phone className="w-4 h-4" /> +91 9496392272
            </Badge>
            <p className="text-sm font-medium opacity-70 mt-4">Organized as part of the MuLearn Hackathon ecosystem.</p>
          </div>
        </div>
      </section>

    </div>
  )
}
