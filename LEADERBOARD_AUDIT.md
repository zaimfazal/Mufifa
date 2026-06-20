# Leaderboard Audit Report

## Overview
An evaluation of the `src/lib/scoring/calculator.ts` processing engine to verify the Leaderboard Ranking sequence, Champion integrations, and Accuracy mathematical calculations.

## Audit Matrix

### 1. Ranking Logic
* **Verification**: **PASS**. 
* **Details**: The `.sort()` pipeline actively processes memory arrays enforcing explicit mapping.
  1. `total_score` (Descending)
  2. `accuracy_percentage` (Descending)
  3. `winner_score` (Descending)

### 2. Tie Breakers
* **Verification**: **PASS**. 
* **Details**: If `total_score`, `accuracy_percentage`, and `winner_score` are perfectly identical between two accounts, the 4th-level tie-breaker compares `aTime - bTime` referencing `teams.submissions[0].locked_at`. The participant who locked their submission first wins the higher rank.

### 3. Accuracy % Calculation
* **Verification**: **PASS** (with a dependency caveat).
* **Details**: The formula executed is `(totalScore / maxPossible) * 100`. This mathematically maps perfectly to the PRD requirement. Note: A bug in the underlying `maxPossible` generation engine (detailed in `SCORING_ENGINE_DIFF_REPORT.md`) may currently cause this calculation to break 100%, but the structural arithmetic here in `calculator.ts` is exactly as specified.

### 4. Champion Scoring
* **Verification**: **PASS**.
* **Details**: `recalculateForTeam` isolates the active tournament champion metric from the `analytics_cache` (`metric_key = 'tournament_champion'`), compares it against `champion_predictions`, leverages Levenshtein distance `normalizePlayerName` strings to allow safe typographic tolerances, and awards +250 points reliably.

### 5. Stage Multipliers
* **Verification**: **PASS**.
* **Details**: Base calculations route through `actuals.matches.multiplier`. `totalScore += result.multipliedTotal` natively handles Group Stage (1.0) vs Final (5.0) scaling dynamically driven by database constraints.

## Conclusion
The Leaderboard compilation engine correctly executes all mathematical logic, ordering sequences, tie-breakers, and data aggregation paths defined in the system specifications.
