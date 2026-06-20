# Final Leaderboard Audit Report

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
* **Verification**: **PASS**.
* **Details**: The formula executed is `(totalScore / maxPossible) * 100`. Now that `calculateMaxPossibleScore` correctly binds dynamically to the actual goal scorers count, this math scales perfectly without artificially exceeding 100%.

### 4. Recalculation Loop
* **Verification**: **PASS**.
* **Details**: `recalculateAll()` loops through all teams via Postgres RPC / edge-function execution, computing aggregates individually and then writing them back via `.upsert` to the leaderboard table.

## Conclusion
The leaderboard aggregates, ranks, and tie-breaks with complete mathematical accuracy and respects the spec exactly.
