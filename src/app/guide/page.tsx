import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guide - µFifa \'26',
  description: 'How to participate and data sources for µFifa \'26',
}

export default function GuidePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-extrabold mb-8 tracking-tight text-foreground neon-text-green">Guide & Resources</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center text-foreground">
            <span className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center mr-3 text-sm">1</span>
            How to participate?
          </h2>
          <div className="grid gap-4">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Step 1: Register and login</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Go to the platform here: <a href="https://wcreflected.mulearn.org" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Click here</a>. Login with your MuFifa mail and password. If not registered, register here: <a href="https://mufifa.mulearn.org/register" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Click here</a>.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Step 2: Read the validation guide</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  On the Top Navigation Bar, click Submit. Read the validation guide to understand submission criteria before you upload anything.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Step 3: How to fill your prediction template</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-2">Download the official CSV template from the Submit page. Run your model locally, then fill it in as follows:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>One row per match, covering all 16 knockout matches from Round of 16 onward</li>
                  <li>Predict the match outcome</li>
                  <li>Predict the exact final score for each match (e.g. 2 : 1). Points awarded only when both numbers are exactly right</li>
                  <li>List the jersey numbers of the goal scorers per team. Points awarded when your set of scorers exactly matches the real scorers</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Step 4: Upload and lock</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Upload your completed CSV in the Submit portal. The system validates the file. Once validated, it locks permanently. Submission is final.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Step 5: Submit proof</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Take a screenshot of your successful submission. Post it in task-dropbox channel with your nickname, tagged <strong>#mufifa2026-predict</strong> to get μLearn Karma Points and μPoints from Mufifa. (You need to be registered on μLearn and μFIFA to claim those points and receive swag.)
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center text-foreground">
            <span className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center mr-3 text-sm">2</span>
            Data Sources (Event & Match Level)
          </h2>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <ul className="space-y-3">
                <li>
                  <a href="https://github.com/statsbomb/open-data" target="_blank" rel="noopener noreferrer" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                    <span className="w-2 h-2 rounded-full bg-accent mr-3"></span>
                    StatsBomb Open Data
                  </a>
                </li>
                <li>
                  <a href="https://www.kaggle.com/datasets/martj42/international-football-results-from-1872-to-2017" target="_blank" rel="noopener noreferrer" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                    <span className="w-2 h-2 rounded-full bg-accent mr-3"></span>
                    International Football Results from 1872 to 2017
                  </a>
                </li>
                <li>
                  <a href="https://www.kaggle.com/datasets/rauffauzanrambe/fifa-world-cup-2026-player-performance-dataset" target="_blank" rel="noopener noreferrer" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                    <span className="w-2 h-2 rounded-full bg-accent mr-3"></span>
                    FIFA World Cup 2026 Player Performance Dataset
                  </a>
                </li>
                <li>
                  <a href="https://towardsdatascience.com/i-built-11-models-to-predict-the-2026-world-cup-they-crown-four-different-champions/" target="_blank" rel="noopener noreferrer" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                    <span className="w-2 h-2 rounded-full bg-accent mr-3"></span>
                    I Built 11 Models to Predict the 2026 World Cup
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
