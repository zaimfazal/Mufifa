# QA_TEST_PLAN.md

# FIFA World Cup 2026 ML Prediction Challenge

## End-to-End Validation Plan

Version: 1.0

---

# Objective

Before marking the project as complete, the agent must verify that every page, workflow, API endpoint, database interaction, authentication flow, scoring calculation, and leaderboard update works correctly.

The agent must not assume functionality works.

The agent must test and verify.

---

# Global Rule

For every feature:

1. Verify UI renders correctly
2. Verify data loads correctly
3. Verify database updates correctly
4. Verify authorization rules
5. Verify error handling
6. Verify loading states
7. Verify mobile responsiveness

---

# SECTION 1

Authentication Testing

---

Test:

User Registration

Verify:

* Registration form loads
* Validation works
* User created in Supabase
* Verification email sent
* User can login

Expected:

PASS

---

Test:

Login

Verify:

* Login works
* Session created
* Protected routes accessible

Expected:

PASS

---

Test:

Logout

Verify:

* Session destroyed
* Redirect occurs

Expected:

PASS

---

Test:

Forgot Password

Verify:

* Reset email sent
* Password reset works

Expected:

PASS

---

# SECTION 2

Team Management

---

Test:

Create Team

Verify:

* Team saved
* Team linked to user
* Duplicate names rejected

Expected:

PASS

---

Test:

One Team Per User

Verify:

* Second team cannot be created

Expected:

PASS

---

# SECTION 3

Submission Workflow

---

Test:

Download Template

Verify:

* CSV downloads
* Latest format used

Expected:

PASS

---

Test:

Upload Valid CSV

Verify:

* Upload succeeds
* File stored
* Predictions parsed
* Records inserted

Expected:

PASS

---

Test:

Upload Invalid CSV

Verify:

* Validation errors displayed
* No database records inserted

Expected:

PASS

---

Test:

Upload Duplicate Submission

Verify:

* Rejected

Expected:

PASS

---

Test:

Submission Lock

Verify:

* No modification possible after upload

Expected:

PASS

---

# SECTION 4

CSV Validation

---

Verify:

Missing Columns

Expected:

Rejected

---

Verify:

Unknown Match IDs

Expected:

Rejected

---

Verify:

Invalid Player Names

Expected:

Rejected

---

Verify:

Negative Scores

Expected:

Rejected

---

Verify:

Invalid Confidence Values

Expected:

Rejected

---

Verify:

Missing Champion Prediction

Expected:

Rejected

---

# SECTION 5

Admin Dashboard

---

Verify:

Dashboard Loads

Expected:

PASS

---

Verify:

Only Admin Access

Expected:

PASS

---

Verify:

Participant Access Blocked

Expected:

PASS

---

# SECTION 6

Match Management

---

Verify:

Create Match

Expected:

PASS

---

Verify:

Edit Match

Expected:

PASS

---

Verify:

Delete Match

Expected:

PASS

---

Verify:

Stage Multipliers Applied

Expected:

PASS

---

# SECTION 7

Result Management

---

Verify:

Enter Result

Expected:

PASS

---

Verify:

Update Result

Expected:

PASS

---

Verify:

Recalculation Triggered

Expected:

PASS

---

# SECTION 8

Scoring Engine

---

Verify:

Correct Winner Points

Expected:

PASS

---

Verify:

Correct Draw Points

Expected:

PASS

---

Verify:

Exact Scoreline Points

Expected:

PASS

---

Verify:

Goal Difference Points

Expected:

PASS

---

Verify:

Correct Scorer Points

Expected:

PASS

---

Verify:

Correct Goal Count Points

Expected:

PASS

---

Verify:

Exact Scorer List Points

Expected:

PASS

---

Verify:

Possession Tolerance Logic

Expected:

PASS

---

Verify:

Shots Tolerance Logic

Expected:

PASS

---

Verify:

xG Tolerance Logic

Expected:

PASS

---

Verify:

Penalty Winner Logic

Expected:

PASS

---

Verify:

Penalty Score Logic

Expected:

PASS

---

Verify:

Champion Prediction Logic

Expected:

PASS

---

Verify:

Confidence Bonus Logic

Expected:

PASS

---

Verify:

Confidence Penalty Logic

Expected:

PASS

---

Verify:

Stage Multipliers

Expected:

PASS

---

# SECTION 9

Leaderboard

---

Verify:

Leaderboard Loads

Expected:

PASS

---

Verify:

Rank Calculation

Expected:

PASS

---

Verify:

Tie Breakers

Expected:

PASS

---

Verify:

Realtime Updates

Expected:

PASS

---

Verify:

Public Access

Expected:

PASS

---

# SECTION 10

Analytics

---

Verify:

Analytics Page Loads

Expected:

PASS

---

Verify:

Charts Render

Expected:

PASS

---

Verify:

Comparison Tool Works

Expected:

PASS

---

Verify:

Hardest Match Metric

Expected:

PASS

---

Verify:

Most Accurate Team Metric

Expected:

PASS

---

# SECTION 11

Database Integrity

---

Verify:

Foreign Keys

Expected:

PASS

---

Verify:

Indexes Exist

Expected:

PASS

---

Verify:

No Orphan Records

Expected:

PASS

---

Verify:

Audit Logs Written

Expected:

PASS

---

# SECTION 12

Row Level Security

---

Verify:

Participant Cannot Access Other Teams

Expected:

PASS

---

Verify:

Participant Cannot View Other Predictions

Expected:

PASS

---

Verify:

Participant Cannot Access Admin APIs

Expected:

PASS

---

Verify:

Public Can Only Access Public Data

Expected:

PASS

---

# SECTION 13

Realtime

---

Verify:

Leaderboard Channel

Expected:

PASS

---

Verify:

Analytics Channel

Expected:

PASS

---

Verify:

Results Channel

Expected:

PASS

---

# SECTION 14

Mobile Testing

---

Verify:

Homepage

Expected:

PASS

---

Verify:

Leaderboard

Expected:

PASS

---

Verify:

Analytics

Expected:

PASS

---

Verify:

Submission Portal

Expected:

PASS

---

Verify:

Admin Dashboard

Expected:

PASS

---

# SECTION 15

Performance

---

Verify:

Leaderboard < 2 seconds

Expected:

PASS

---

Verify:

Analytics < 3 seconds

Expected:

PASS

---

Verify:

CSV Validation < 5 seconds

Expected:

PASS

---

Verify:

Leaderboard Recalculation < 30 seconds

Expected:

PASS

---

# SECTION 16

Production Audit

Before marking project complete, agent must verify:

* No TODO comments
* No mock data
* No placeholder pages
* No fake APIs
* No unused components
* No TypeScript errors
* No ESLint errors
* No failing tests
* No broken routes
* No broken links
* No console errors
* No hydration errors
* No database schema mismatch

Expected:

100% PASS

---

# Completion Criteria

Project may only be marked COMPLETE if:

* All tests pass
* All PRD requirements implemented
* All TDD requirements implemented
* All acceptance tests pass
* All pages functional
* All workflows functional
* Production deployment succeeds

Otherwise:

Project Status = INCOMPLETE
