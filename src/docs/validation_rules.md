# µFifa '26 - Submission Validation Guide

This document outlines the strict validation rules for your predictions CSV file. Ensure your submission complies with all rules before uploading.

## 1. File Format Requirements
- **Format**: The file must be a standard `.csv` file.
- **Max Size**: 5MB
- **Columns**: Your file must perfectly match the columns provided in the downloaded template.
- **Matches**: You must provide a prediction for every single match provided in the template. Do not add extra matches or omit any matches.

## 2. General Field Definitions
- **Predicted Winner**: Must be the exact team name as provided in the `home_team` or `away_team` columns, or "Draw".
- **Scores & Stats**:
  - `predicted_home_score` / `away_score`: Must be positive integers.
  - `predicted_possession_home` / `away`: Must sum to exactly 100.
  - `predicted_shots_home` / `away`: Must be positive integers.
  - `predicted_xg_home` / `away`: Decimals allowed.
  - `predicted_yellow_home` / `away`: Positive integers.
  - `predicted_red_home` / `away`: Positive integers.
- **Extra Time & Penalties**: Leave empty if not applicable. If predicting penalties, provide positive integers.

## 3. Confidence Score Rules
- The `confidence` column supports **BOTH** of the following formats:
  - **Probability format**: A value between `0` and `1` (e.g., `0.25, 0.5, 0.85, 1`).
  - **Percentage format**: A value between `0` and `100` (e.g., `25, 50, 85, 100`).
- The validator automatically interprets and normalizes either format.
- Values outside the `0-100` range or negative numbers will be rejected.

## 4. Goal Scorer Formats
- Multiple goal scorers are fully supported.
- You can separate multiple players using either a **comma (,)** or a **semicolon (;)**.
- Example of valid entries:
  - `Messi`
  - `Messi, Ronaldo`
  - `Messi; Ronaldo`
  - `Messi:2; Ronaldo:1` (optional goal-count syntax)
- Note: Goal-count syntax (`Name:Goals`) is optional but highly recommended. If omitted, the scoring engine may not award exact-goal-count bonus points.

## 5. Submission Deadline Rules
- All predictions are locked as soon as the first match of the Quarter Finals kicks off.
- The platform enforces a strict deadline. Late submissions will be rejected by the server.
- You can overwrite your predictions up until the deadline by simply uploading a new CSV.

## 6. Pre-Submission Checklist
- [ ] Did you download the latest template from the platform?
- [ ] Is your `confidence` score between 0 and 100?
- [ ] Did you ensure possession sums strictly to 100?
- [ ] Have you provided exactly the number of match rows expected?
- [ ] Is your `tournament_champion` filled accurately?
