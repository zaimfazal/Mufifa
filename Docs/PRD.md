# FIFA World Cup 2026 ML Prediction Challenge Platform

## Enterprise Product Requirements Document (PRD)

Version: 1.0

Project Name: FIFA World Cup 2026 ML Prediction Challenge

Organization: MuLearn Hackathon

Target Launch: Before FIFA World Cup 2026

---

# 1. Executive Summary

## Objective

Build a web-based Machine Learning evaluation platform for the FIFA World Cup 2026.

Participants develop predictive models and submit a single prediction file before the tournament begins.

The platform evaluates predictions against actual tournament results and automatically ranks participants on a public leaderboard.

The platform DOES NOT run ML models.

The platform only:

* Accepts prediction outputs
* Validates submissions
* Stores predictions
* Compares predictions with actual results
* Calculates scores
* Displays rankings and analytics

---

# 2. Product Vision

Create a Kaggle-style evaluation platform specifically designed for FIFA World Cup predictions.

The platform should:

* Reward prediction accuracy
* Support complex football predictions
* Encourage model explainability
* Provide transparent scoring
* Create competitive engagement throughout the tournament

---

# 3. Success Metrics

## Primary

* Successful submission rate >95%
* Zero scoring disputes caused by system errors
* Real-time leaderboard updates after every completed match

## Secondary

* Leaderboard engagement
* Prediction analytics usage
* Tournament completion rate

---

# 4. User Roles

## Participant

Can:

* Register
* Login
* Download prediction template
* Upload prediction CSV
* View personal score breakdown
* View public leaderboard
* View analytics

Cannot:

* Edit submissions after lock
* View other participants' predictions
* Access admin tools

---

## Admin

Can:

* Manage tournament data
* Create matches
* Update actual results
* Manage users
* Manage scoring configuration
* Recalculate leaderboard
* View all submissions
* Lock/unlock submissions

---

## Public Visitor

Can:

* View leaderboard
* View tournament analytics
* View rankings

Cannot:

* Submit predictions
* View participant prediction files

---

# 5. Tournament Scope

Competition covers the entire FIFA World Cup 2026.

Prediction scope:

* Group Stage
* Round of 32
* Quarter Finals
* Semi Finals
* Third Place Match
* Final

All tournament matches must be predicted.

---

# 6. Submission Workflow

## Submission Model

Single Submission Only

Participants upload one CSV containing predictions for the entire tournament.

Once accepted:

* Submission becomes immutable
* No edits allowed
* No replacement uploads

Submission deadline:

Before the first Group Stage match starts.

---

# 7. Prediction Data Requirements

Each match prediction must include:

## Match Result

* Predicted winner
* Predicted final score
* Predicted extra time score
* Predicted penalty shootout score (if applicable)

---

## Goal Scoring

* Exact goal scorers
* Goal count per scorer
* First goal scorer

---

## Match Statistics

* Possession %
* Shots on target
* Expected Goals (xG)
* Yellow cards
* Red cards

---

## Confidence

* Winner confidence score (0-100)

Example:

Brazil win probability = 87%

---

## Tournament Prediction

* Predicted tournament champion

---

# 8. CSV Specification

## Required Columns

match_id

winner

home_score

away_score

extra_time_home

extra_time_away

penalty_home

penalty_away

goal_scorers

goal_counts

first_goal_scorer

possession_home

possession_away

shots_on_target_home

shots_on_target_away

xg_home

xg_away

yellow_cards_home

yellow_cards_away

red_cards_home

red_cards_away

confidence

---

## Goal Scorer Format

Mbappe:2;Dembele:1

---

## Example Row

R32_001

Brazil

2

1

0

0

0

0

Vinicius:1;Rodrygo:1

Vinicius

58

42

7

4

1.8

0.9

2

3

0

0

87

---

# 9. Validation Rules

Submission validation must verify:

* Required fields exist
* Match IDs valid
* Team names valid
* Player names valid
* Scores non-negative
* Possession totals = 100
* Confidence range 0-100
* Duplicate matches absent
* Champion exists in tournament

Invalid submissions are rejected.

---

# 10. Name Normalization

System must normalize:

Examples:

Mbappe

Kylian Mbappe

K. Mbappe

Should map to same player.

Use fuzzy matching with configurable threshold.

---

# 11. Actual Result Management

Admin manually enters:

* Winner
* Score
* Extra time
* Penalties
* Goal scorers
* Match statistics

Admin remains source of truth.

No dependency on external sports APIs.

Optional future enhancement:

Automatic API result import.

---

# 12. Scoring Engine

Scoring system must be configurable.

All values stored in database.

Admin can modify without code deployment.

---

# 13. Default Scoring Configuration

## Match Outcome

Correct Winner = 20

Correct Draw = 20

Exact Scoreline = 40

Correct Goal Difference = 15

One Team Goal Count Correct = 10

---

## Goal Scorers

Correct Scorer = 10

Correct Goal Count By Scorer = 10

Exact Scorer List = 25

---

## Match Statistics

Possession Within ±5% = 10

Shots On Target Within ±2 = 10

xG Within ±0.5 = 10

Yellow Cards Within ±1 = 5

Red Cards Exact = 10

---

## Penalties

Correct Shootout Winner = 20

Exact Shootout Score = 30

---

## Confidence

Correct Prediction Above 80% Confidence = +10

Incorrect Prediction Above 80% Confidence = -10

---

## Champion

Correct Champion = 250

---

# 14. Stage Multipliers

Group Stage = 1.0x

Round of 32 = 1.2x

Quarter Final = 2.0x

Semi Final = 3.0x

Third Place = 2.5x

Final = 5.0x

---

# 15. Accuracy Percentage

Formula:

Accuracy %

=

Earned Points

/

Maximum Possible Points

×

100

Display:

74.3%

---

# 16. Leaderboard

Publicly accessible.

Display:

* Rank
* Team Name
* Total Points
* Accuracy %
* Correct Winner %
* Correct Score %
* Champion Status

Updates after every completed match.

---

# 17. User Score Breakdown

Participant dashboard must show:

Winner Accuracy

Score Accuracy

Scorer Accuracy

Statistics Accuracy

Champion Prediction Status

Confidence Score Impact

Total Score

---

# 18. Analytics Dashboard

## Tournament Analytics

Display:

* Overall prediction accuracy
* Most predictable match
* Least predictable match
* Best performing participant
* Average confidence score

---

## Comparison Analytics

Participant A vs Participant B

Compare:

* Winner accuracy
* Score accuracy
* Scorer accuracy
* Confidence calibration

---

# 19. Admin Dashboard

## User Management

* View participants
* Disable accounts
* Export data

---

## Tournament Management

* Create matches
* Update matches
* Mark completed matches

---

## Results Management

* Enter actual results
* Edit actual results
* Trigger recalculation

---

## Scoring Management

* Modify scoring rules
* Modify multipliers
* Recalculate leaderboard

---

# 20. Authentication

Method:

Email + Password

Powered by Supabase Auth.

Features:

* Registration
* Login
* Password reset
* Session management

---

# 21. Database Design

Core Tables

users

teams

submissions

matches

predictions

actual_results

scoring_rules

leaderboard

analytics_cache

audit_logs

---

# 22. Security

Row Level Security enabled.

Participants may access only:

* Their profile
* Their submission

Admins may access all records.

Leaderboard remains public.

---

# 23. UI / UX Requirements

Design inspired by mufifa.mulearn.org

Requirements:

* Dark theme
* Neon football aesthetic
* Modern tournament visuals
* Responsive layouts
* Mobile-first design
* High contrast accessibility

---

# 24. Pages

Home

Leaderboard

Analytics

Login

Register

Submission Portal

My Dashboard

Admin Dashboard

Scoring Settings

Tournament Management

Results Entry

---

# 25. Performance Targets

Participants:

<500

Leaderboard Load:

<2 seconds

CSV Validation:

<5 seconds

Score Recalculation:

<30 seconds

---

# 26. Technology Stack

Frontend

Next.js 15 App Router

TypeScript

Tailwind CSS

shadcn/ui

Recharts

TanStack Table

React Hook Form

Zod

---

Backend

Supabase

PostgreSQL

Supabase Auth

Supabase Storage

Row Level Security

---

Deployment

Vercel

---

# 27. Acceptance Criteria

Participant can upload valid CSV.

Invalid CSV rejected.

Submission becomes immutable.

Admin can enter results.

Scores automatically update.

Leaderboard updates correctly.

Analytics update correctly.

Authentication works.

Mobile experience fully functional.

Public leaderboard accessible.

No participant can access another participant's submission.

---

# 28. Future Enhancements

Sports API integration.

AI-powered prediction explanations.

Model metadata submissions.

CSV export of leaderboard.

Tournament archive.

Historical competitions.

Multi-tournament support.

---

# 29. AI Coding Constraints

Generate production-quality code.

Use strict TypeScript.

Use server actions where appropriate.

Avoid mock data.

Implement database migrations.

Implement proper error handling.

Implement loading states.

Implement optimistic updates.

Use reusable components.

Follow clean architecture principles.

Avoid unnecessary complexity.

Target deployment on Vercel.

Platform expected scale:

<500 participants.

Prioritize maintainability and reliability over scalability.
