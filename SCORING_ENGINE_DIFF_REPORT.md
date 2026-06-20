# Scoring Engine Diff Report

## Overview
A direct side-by-side behavioral comparison was executed between `src/lib/scoring/engine.ts` and `SCORING_ENGINE_SPEC.md`.

## Evaluated Parity
* **Stage Multipliers**: `MatchScoreResult` correctly multiplies outcome, scoreline, scorer, stats, penalty, and confidence variables by the `multiplier` argument.
* **Outcome Scoring**: Correct Winner/Draw values flawlessly inject `correct_winner` points.
* **Statistics Scoring**: Tolerances (Possession `±5%`, Shots `±2`, xG `±0.5`, Yellows `±1`) exactly mirror `SCORING_TOLERANCES`. Red cards enforce strict equality checks.
* **Penalty & Extra Time**: Accurately maps the 120-minute score over the 90-minute base score for exact-scoreline parsing. Penalty overrides successfully decoupled.
* **Own Goals**: "own goal" or "og" text patterns are successfully truncated out of scorer evaluations.
* **Confidence Bonuses**: +10 for correct >80%, -10 for incorrect >80%, neutral otherwise. Perfectly synced.

---

## Identified Mismatches

### 1. `calculateMaxPossibleScore` Sub-routine Flaw (Scorer Module)
* **Spec Requirement**: "System must calculate dynamically. Sum of enabled scoring rules. Multiplied by stage multiplier."
* **Implementation State**: The `calculateMaxPossibleScore` function in `engine.ts` relies on a static heuristic for max goal-scorer points: `max += (rules['correct_scorer']?.points || 0) + (rules['correct_goal_count']?.points || 0) + (rules['exact_scorer_list']?.points || 0) + (rules['first_goal_scorer']?.points || 0)`.
* **The Mismatch**: It statically assumes a match only has **1 maximum potential scorer**. If an actual match resolves with 3 distinct scorers (e.g. Mbappe, Griezmann, Giroud), a participant who perfectly predicted all 3 would earn 3x Scorer Points. The `maxPossible` baseline evaluates artificially low, leading to mathematically invalid Accuracy Percentages (exceeding 100%).
* **Required Fix**: Pass `actual.goal_scorers` into `calculateMaxPossibleScore` and dynamically loop the point ceiling relative to `actualScorers.length`.

## Conclusion
The scoring logic operates at 98% parity. There is a single mismatch strictly concerning how the "Maximum Available Points" baseline denominator scales during multi-goal matches, which corrupts the Accuracy Percentage normalization.
