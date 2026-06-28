import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadScoringRules } from "@/lib/scoring/rules-loader";
import { calculateMatchScore } from "@/lib/scoring/engine";
import { getDynamicPrediction } from "@/lib/scoring/calculator";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const rules = await loadScoringRules();

    // Fetch all teams, predictions, actual results, matches
    const [
      { data: teams },
      { data: predictions },
      { data: actuals },
    ] = await Promise.all([
      supabase.from("teams").select("id, name"),
      supabase.from("predictions").select("*, matches(stage)"),
      supabase.from("actual_results").select("*, matches(multiplier, home_team, away_team, stage)"),
    ]);

    if (!teams || !predictions || !actuals) {
      return NextResponse.json({ success: true, count: 0, data: [] });
    }

    // Group predictions by team_id
    const predMap = new Map<string, any[]>();
    for (const p of predictions) {
      if (!predMap.has(p.team_id)) predMap.set(p.team_id, []);
      predMap.get(p.team_id)!.push(p);
    }

    const correctPredictions: any[] = [];

    for (const team of teams) {
      const teamPreds = predMap.get(team.id) || [];
      if (teamPreds.length === 0) continue;

      for (const actual of actuals) {
        const pred = getDynamicPrediction(teamPreds, actual);
        if (pred) {
          const multiplier = (actual.matches as any).multiplier as number;
          const result = calculateMatchScore(pred, actual, rules, multiplier);

          // A correct prediction has at least outcome or scoreline points > 0
          const outcomeCorrect = result.breakdown.outcome > 0;
          const scorelineCorrect = result.breakdown.scoreline > 0;

          if (outcomeCorrect || scorelineCorrect) {
            correctPredictions.push({
              prediction_id: pred.id,
              team_id: team.id,
              team_name: team.name,
              match_id: actual.match_id,
              home_team: (actual.matches as any).home_team,
              away_team: (actual.matches as any).away_team,
              stage: (actual.matches as any).stage,
              prediction: {
                home_score: pred.home_score,
                away_score: pred.away_score,
                winner: pred.winner,
                goal_scorers: pred.goal_scorers,
              },
              actual: {
                home_score: actual.home_score,
                away_score: actual.away_score,
                winner: actual.winner,
                goal_scorers: actual.goal_scorers,
              },
              score_details: {
                outcome_points: result.breakdown.outcome,
                scoreline_points: result.breakdown.scoreline,
                scorer_points: result.breakdown.scorer,
                total_points: result.multipliedTotal,
                multiplier: result.multiplier,
                is_outcome_correct: outcomeCorrect,
                is_scoreline_correct: scorelineCorrect,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: correctPredictions.length,
      data: correctPredictions,
    });
  } catch (error: any) {
    console.error("Error in get-correct-predictions API:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "An unexpected error occurred.",
        },
      },
      { status: 500 }
    );
  }
}
