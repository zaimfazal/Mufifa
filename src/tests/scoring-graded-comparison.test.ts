/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Comparison harness: THRESHOLD (current engine) vs GRADED decay scoring
 * for the continuous Tier-1 stats (possession, shots, xG, yellow cards).
 *
 * Goal: see the numbers before deciding whether to change the production
 * engine. Discrete categories (winner, scoreline, scorers, red cards,
 * champion) are intentionally NOT touched — decay only applies to the
 * continuous stats where error magnitude carries signal.
 *
 * Run: pnpm vitest run scoring-graded-comparison
 */
import { describe, it, expect } from 'vitest'
import { SCORING_TOLERANCES } from '../lib/constants'

// ---- the three scoring functions for a single continuous stat -------------

/** Current behaviour: full points inside the band, zero outside. */
function thresholdScore(maxPoints: number, error: number, tolerance: number): number {
  return error <= tolerance ? maxPoints : 0
}

/** Linear decay: full at error 0, zero at error >= tolerance. */
function linearScore(maxPoints: number, error: number, tolerance: number): number {
  return maxPoints * Math.max(0, 1 - error / tolerance)
}

/** Gaussian decay: smooth, ~37% of points at error == tolerance, never hard-zero. */
function gaussianScore(maxPoints: number, error: number, tolerance: number): number {
  const x = error / tolerance
  return maxPoints * Math.exp(-(x * x))
}

const round = (n: number) => Number(n.toFixed(2))

// ---- a stat to evaluate, with realistic prediction/actual pairs -----------

type StatCase = {
  label: string
  maxPoints: number
  tolerance: number
  // [predicted, actual] pairs spanning perfect -> wild miss
  samples: [number, number][]
}

const STATS: StatCase[] = [
  {
    label: 'possession',
    maxPoints: 10,
    tolerance: SCORING_TOLERANCES.possession, // 5
    samples: [
      [55, 55], // perfect
      [55, 57], // Δ2 inside band
      [55, 60], // Δ5 edge of band
      [55, 61], // Δ6 just outside
      [55, 70], // Δ15 wild
    ],
  },
  {
    label: 'xg',
    maxPoints: 10,
    tolerance: SCORING_TOLERANCES.xg, // 0.5
    samples: [
      [1.8, 1.8],
      [1.8, 2.0], // Δ0.2 inside
      [1.8, 2.3], // Δ0.5 edge
      [1.8, 2.4], // Δ0.6 just outside
      [1.8, 3.5], // Δ1.7 wild
    ],
  },
  {
    label: 'shots',
    maxPoints: 10,
    tolerance: SCORING_TOLERANCES.shots, // 2
    samples: [
      [6, 6],
      [6, 7], // Δ1 inside
      [6, 8], // Δ2 edge
      [6, 9], // Δ3 just outside
      [6, 14], // Δ8 wild
    ],
  },
]

describe('Graded vs Threshold scoring comparison', () => {
  it('prints a side-by-side table for each continuous stat', () => {
    const lines: string[] = []
    for (const stat of STATS) {
      lines.push('')
      lines.push(`=== ${stat.label}  (max ${stat.maxPoints} pts, tolerance ±${stat.tolerance}) ===`)
      lines.push('  pred  actual   |err|  | threshold  linear  gaussian')
      lines.push('  ----  ------  ------ | ---------  ------  --------')
      for (const [pred, actual] of stat.samples) {
        const err = round(Math.abs(pred - actual))
        const t = round(thresholdScore(stat.maxPoints, err, stat.tolerance))
        const l = round(linearScore(stat.maxPoints, err, stat.tolerance))
        const g = round(gaussianScore(stat.maxPoints, err, stat.tolerance))
        lines.push(
          `  ${String(pred).padStart(4)}  ${String(actual).padStart(6)}  ${String(err).padStart(6)} | ` +
            `${String(t).padStart(9)}  ${String(l).padStart(6)}  ${String(g).padStart(8)}`
        )
      }
    }
    // eslint-disable-next-line no-console
    console.log(lines.join('\n'))
    expect(lines.length).toBeGreaterThan(0)
  })

  it('threshold gives identical points to a near-miss and a wild miss (the flaw)', () => {
    const max = 10
    const tol = SCORING_TOLERANCES.possession
    // Δ6 (near) and Δ40 (wild) both score 0 under threshold:
    expect(thresholdScore(max, 6, tol)).toBe(thresholdScore(max, 40, tol))
    // graded distinguishes them:
    expect(linearScore(max, 6, tol)).toBe(0) // linear hard-zeros past tol too
    expect(gaussianScore(max, 6, tol)).toBeGreaterThan(gaussianScore(max, 40, tol))
  })

  it('threshold rewards a lazy edge-of-band guess as much as a perfect hit (the other flaw)', () => {
    const max = 10
    const tol = SCORING_TOLERANCES.possession
    expect(thresholdScore(max, 0, tol)).toBe(thresholdScore(max, 5, tol)) // both 10
    // graded rewards precision:
    expect(linearScore(max, 0, tol)).toBeGreaterThan(linearScore(max, 5, tol))
    expect(gaussianScore(max, 0, tol)).toBeGreaterThan(gaussianScore(max, 5, tol))
  })

  it('graded never exceeds maxPoints, so calculateMaxPossibleScore stays valid', () => {
    for (const stat of STATS) {
      for (const [pred, actual] of stat.samples) {
        const err = Math.abs(pred - actual)
        expect(linearScore(stat.maxPoints, err, stat.tolerance)).toBeLessThanOrEqual(stat.maxPoints)
        expect(gaussianScore(stat.maxPoints, err, stat.tolerance)).toBeLessThanOrEqual(stat.maxPoints)
      }
    }
  })
})
