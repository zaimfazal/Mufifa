-- Migration: Tier-1-only scoring mode
-- Description: Adds an admin-controlled flag to the competition_settings singleton.
-- When TRUE, the scoring engine counts ONLY Tier-1 predictions:
--   outcome (winner/draw), possession, shots on target, xG.
-- All other categories (scoreline detail, scorers, yellow/red cards,
-- penalties, confidence, champion) score 0 while the mode is on.
-- Defaults to FALSE, so existing behaviour is unchanged until an admin enables it.

ALTER TABLE competition_settings
  ADD COLUMN tier1_only_mode BOOLEAN NOT NULL DEFAULT FALSE;
