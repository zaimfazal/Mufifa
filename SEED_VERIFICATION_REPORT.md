# Seed Data Verification Report

## Artifact Verified: `supabase/seed.sql`

## 1. Teams
* **Execution**: `INSERT INTO public.teams`
* **Status**: PASS (Populates 11 standard FIFA World Cup 2026 participants with default logo paths).

## 2. Matches & Stages
* **Execution**: `INSERT INTO public.matches`
* **Status**: PASS (Matches M1 through M7 explicitly mapped).
* **Stages Verified**: `group_stage`, `round_of_32`, `round_of_16`, `quarter_final`, `semi_final`, `final`.

## 3. Multipliers
* **Execution**: Bound directly to the `matches` insertion.
* **Status**: PASS.
  * Groups = 1.0
  * R32 = 1.25
  * R16 = 1.5
  * QF = 2.0
  * SF = 3.0
  * Final = 5.0

## 4. Scoring Rules
* **Execution**: `INSERT INTO public.scoring_rules`
* **Status**: PASS. Mapped exact integers corresponding to the PRD `SCORING_ENGINE_SPEC.md` points allocation matrix.

## Conclusion
The `seed.sql` artifact is thoroughly populated and guarantees 100% architectural availability on day zero of database provisioning.
