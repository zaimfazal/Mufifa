# Submission Guide — Limited Mode (Exact Score + Scorers)

This guide describes how to fill and submit your predictions when the
competition is running in **Limited Scoring Mode**. In this mode each match is
scored on only two things:

1. **The exact final score**
2. **Which players score** (by jersey number, per team)

Nothing else (winner, possession, shots, xG, cards, champion) is scored.

---

## The template

Download the template from the Submission Portal ("Get Template"). It has one
row per knockout match and these columns:

| Column | Who fills it | Meaning |
| --- | --- | --- |
| `match_id` | pre-filled | The match identifier — do not change |
| `home_team` | pre-filled | Home/left team (or bracket slot) |
| `away_team` | pre-filled | Away/right team (or bracket slot) |
| `predicted_home_score` | you | Home goals (whole number) |
| `predicted_away_score` | you | Away goals (whole number) |
| `predicted_scorers_home` | you | Home scorer jersey numbers, e.g. `10;7` |
| `predicted_scorers_away` | you | Away scorer jersey numbers, e.g. `9` |

Fill **every** match row. A missing match makes the file invalid.

---

## Rules

### Exact score (all-or-nothing)
You earn the score points only if **both** numbers are exactly right. A `3 : 1`
predicted as `2 : 1` earns nothing for the score — there is no partial credit
for getting the winner or goal difference right.

### Scorers — jersey numbers, listed once
- List the **jersey number** of each player you expect to score.
- Separate multiple numbers with a semicolon: `10;7`.
- List a number **once** even if you think that player scores twice — we only
  care *who* scores, not how many.
- Scorers are **all-or-nothing**: you earn the scorer points only if your set of
  numbers exactly equals the actual scorers for **both** teams — no missing, no
  extra.

### You can't list more scorers than goals
Because each scorer is listed once, the number of scorer entries on a side must
be **no greater than** that side's predicted score. Fewer is fine — that's how
braces, hat-tricks and own goals work:

- `2 : 0` with one player scoring both → home `10` (1 number, 2 goals). ✔
- `2 : 0` with two different scorers → home `10;7`. ✔
- `2 : 0` with three home numbers → rejected (more scorers than goals).
- `0 : 0` → no numbers on either side. A correct `0 : 0` still earns the scorer
  points (an empty set is a valid, correct prediction).

If a side lists more scorers than goals, the file is rejected with an error
telling you which row and side to fix.

---

## Worked example

Match: **Brazil vs Spain**, you predict **Brazil 2 : 1 Spain**, with Brazil's
#10 and #7 scoring and Spain's #9 scoring.

```
predicted_home_score   = 2
predicted_away_score   = 1
predicted_scorers_home = 10;7
predicted_scorers_away = 9
```

- Score points: awarded only if the match ends 2–1.
- Scorer points: awarded only if exactly #10 and #7 score for Brazil **and**  exactly #9 scores for Spain.

---

## Points and stage multiplier

| What | Default points |
| --- | --- |
| Exact score | 40 |
| Exact scorer set | 25 |

These are multiplied by the match's stage multiplier (Round of 32 ×1.2,
Round of 16 ×1.5, Quarter Final ×2.0, Semi Final ×3.0, Third Place ×2.5,
Final ×5.0), so the same correct prediction is worth more in later rounds.

---

## Submitting

1. Download the template.
2. Fill every row with your score + scorer numbers.
3. Upload it on the Submission Portal and click **Validate & Submit**.
4. If validation fails, fix the listed rows and re-upload.
5. You can re-upload to update your predictions any time before the deadline.
