# SCORING_ENGINE_SPEC.md

# FIFA World Cup 2026 ML Prediction Challenge

## Scoring Engine Specification

Version: 1.0

---

# Purpose

This document defines the complete scoring logic for evaluating participant predictions against actual FIFA World Cup match results.

The scoring engine is the source of truth for leaderboard rankings.

All scoring calculations must follow this specification exactly.

---

# Design Principles

The scoring system must:

* Reward accuracy
* Reward near-accurate predictions
* Reward difficult predictions
* Encourage calibrated confidence
* Be transparent
* Be configurable

All point values must be loaded from the database.

Default values are defined below.

---

# Scoring Architecture

Final Match Score

=

Outcome Score

*

Scoreline Score

*

Scorer Score

*

Statistics Score

*

Penalty Score

*

Confidence Score

All multiplied by Match Stage Multiplier.

Tournament Champion score is added separately.

---

# Stage Multipliers

Applied after match score calculation.

| Stage         | Multiplier |
| ------------- | ---------- |
| Group Stage   | 1.0        |
| Round of 32   | 1.2        |
| Quarter Final | 2.0        |
| Semi Final    | 3.0        |
| Third Place   | 2.5        |
| Final         | 5.0        |

Formula:

Final Match Score

=

Base Match Score × Stage Multiplier

---

# Outcome Scoring

## Correct Winner

Condition:

Predicted winner equals actual winner.

Default Points:

20

---

## Correct Draw Prediction

Condition:

Predicted draw and actual draw after regulation time.

Default Points:

20

---

# Scoreline Scoring

## Exact Scoreline

Example:

Prediction:

Brazil 3-1 Spain

Actual:

Brazil 3-1 Spain

Points:

40

---

## Correct Goal Difference

Example:

Prediction:

Brazil 2-0 Spain

Actual:

Brazil 3-1 Spain

Goal Difference:

Both = +2

Points:

15

---

## One Team Goal Count Correct

Example:

Prediction:

Brazil 3-1 Spain

Actual:

Brazil 3-2 Spain

Brazil score predicted correctly.

Points:

10

Award once per match.

Maximum:

10

---

# Scorer Scoring

Goal scorers stored as:

Mbappe:2;Dembele:1

Meaning:

Mbappe scored 2 goals.

Dembele scored 1 goal.

---

## Correct Scorer

For each correctly predicted scorer.

Default:

10 points

Example:

Actual:

Mbappe
Dembele

Prediction:

Mbappe
Rodrygo

Points:

10

---

## Correct Goal Count By Scorer

Condition:

Scorer predicted AND goal count predicted correctly.

Example:

Prediction:

Mbappe:2

Actual:

Mbappe:2

Points:

10

Per scorer.

---

## Exact Scorer List

Condition:

All scorers predicted correctly.

No missing scorers.

No extra scorers.

Points:

25

---

# First Goal Scorer

Condition:

Predicted first goal scorer equals actual first goal scorer.

Default:

15 points

---

# Statistics Scoring

Statistics use tolerance ranges.

---

## Possession Accuracy

Tolerance:

±5%

Example:

Actual:

58%

Prediction:

61%

Difference:

3%

Points:

10

---

## Shots On Target Accuracy

Tolerance:

±2

Points:

10

---

## Expected Goals (xG)

Tolerance:

±0.5

Points:

10

---

## Yellow Cards

Tolerance:

±1

Points:

5

---

## Red Cards

Exact Match Required.

Points:

10

---

# Penalty Shootout Scoring

Only applies if penalties occur.

---

## Correct Shootout Winner

Points:

20

---

## Exact Penalty Score

Example:

Prediction:

4-2

Actual:

4-2

Points:

30

---

# Confidence Scoring

Purpose:

Reward calibrated predictions.

---

## Confidence Bonus

Condition:

Winner prediction correct

AND

Confidence > 80%

Points:

+10

---

## Confidence Penalty

Condition:

Winner prediction incorrect

AND

Confidence > 80%

Points:

-10

---

## Confidence Neutral Zone

Confidence ≤ 80%

No bonus

No penalty

---

# Own Goal Handling

Own goals do not count as player scorer predictions.

Own goals only affect:

Winner

Scoreline

Statistics

---

# Extra Time Handling

Winner evaluation uses official match winner.

Example:

1-1 after regulation

2-1 after extra time

Winner = Team A

Scoring should use official result.

---

# Penalty Handling

Example:

1-1 after extra time

4-3 penalties

Winner = Team A

Scoreline remains:

1-1

Penalty scoring evaluated separately.

---

# Champion Prediction

Evaluated after tournament completion.

---

## Correct Champion

Condition:

Predicted champion equals actual champion.

Points:

250

---

# Match Maximum Score

System must calculate dynamically.

Formula:

Sum of enabled scoring rules.

Multiplied by stage multiplier.

---

# Accuracy Percentage

Purpose:

Leaderboard normalization.

Formula:

Accuracy %

=

Earned Points

/

Maximum Available Points

×

100

Example:

450

/

600

×

100

=

75%

---

# Leaderboard Ranking Logic

Primary:

Total Score DESC

Secondary:

Accuracy Percentage DESC

Tertiary:

Winner Accuracy DESC

Fourth:

Earlier Submission Timestamp ASC

---

# Team Accuracy Metrics

Track separately:

Winner Accuracy %

Scoreline Accuracy %

Scorer Accuracy %

Statistics Accuracy %

Penalty Accuracy %

Champion Accuracy %

Confidence Calibration Score

---

# Recalculation Triggers

Recalculate scores when:

Actual Result Updated

Scoring Rule Updated

Multiplier Updated

Admin Recalculation Requested

---

# Recalculation Workflow

Load Predictions

↓

Load Actual Results

↓

Calculate Match Scores

↓

Apply Multipliers

↓

Calculate Champion Score

↓

Calculate Total Score

↓

Update Leaderboard

↓

Update Analytics

↓

Broadcast Realtime Events

---

# Analytics Metrics

Compute:

Most Accurate Team

Highest Confidence Team

Best Scorer Predictor

Best Outcome Predictor

Hardest Match

Most Predictable Match

Average Accuracy

Champion Prediction Distribution

---

# Database Requirements

All scoring rules stored in:

scoring_rules

table.

No hardcoded values.

All calculations must read values from database.

---

# Edge Cases

Match Cancelled

Score = 0

No points awarded.

---

Result Corrected

Automatically trigger full recalculation.

---

Scoring Rule Changed

Automatically trigger full recalculation.

---

Missing Actual Result

Skip scoring until result exists.

---

Submission Missing Match

Submission rejected.

---

Invalid Player Names

Submission rejected.

---

# Implementation Requirements

Scoring engine must be:

Pure

Deterministic

Idempotent

Fully testable

Independent from UI

Reusable

No side effects during score calculation.

Scoring engine should return:

Match Score

Score Breakdown

Category Breakdown

Multiplier Applied

Final Score

Leaderboard Contribution

For every evaluated match.
