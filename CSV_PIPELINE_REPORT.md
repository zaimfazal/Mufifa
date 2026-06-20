# CSV Pipeline Report

## Overview
A complete verification of the file-processing pipeline from client-upload to the Postgres transactional layer. The pipeline governs the integrity of the core competition mechanic.

## Stage 1: Pre-flight Verification
* **Upload Mechanism**: Uses Next.js Server Actions with native `FormData`.
* **File Validations**: Rigid restrictions exist enforcing maximum file weight (5MB) and strictly enforcing MIME-type headers targeting `text/csv`.
* **Protection Constraints**: Validates session presence `supabase.auth.getUser()`, team association, and specifically blocks ingress if `team.submission_locked` evaluates true. Rate limits (5 req/min) successfully intercept DDOS payloads.

## Stage 2: Parsing & Extrapolation
* **Engine**: The system utilizes `papaparse` optimized for strict row parsing.
* **Typing Definition**: Transforms raw tabular data dynamically mapping to `predictionRowSchema` (`zod` types).

## Stage 3: Rule-based Deduplication & Integrity Validation
The core engine `src/lib/csv/validator.ts` executes a sophisticated series of structural checks:

| Validation Target | Verification Result | Detail |
|-------------------|---------------------|--------|
| Duplicate Matches | PASS | Intercepted via `seenMatches.has(match_id)`. |
| Missing Matches | PASS | `validMatchIds.filter()` identifies omissions throwing an explicit row 0 error. |
| Champion Matching | PASS | Enforces string mapping to dynamically extrapolated `validTeams` arrays. |
| Team Validation | PASS | `validateTeamName()` mandates winner string matches `home`, `away`, or `draw`. |
| Goal Scorer Struct| PASS | `validatePlayerNames()` intercepts formatting syntax (`Name:Count`). Regex strictly enforces `^[A-Za-z .'-]+$`. |
| Confidence Values | PASS | Strict regex intercepts invalid values outside of `0-100`. |
| Possession Values | PASS | Float parser guarantees Home + Away strictly equals `100.0`. |

## Stage 4: Transaction & Storage
* **Bucket Handling**: Cleanly uploaded to `prediction-files/{team_id}/predictions.csv`.
* **Database Persisting**: Executes Postgres transactional function `submit_predictions()` ensuring atomic failure recovery if inserting 100+ predictions fails.

## Conclusion
The CSV Pipeline handles data ingestion immutably. The core structural checks effectively sanitize the input to prevent scoring-engine panics downstream.
