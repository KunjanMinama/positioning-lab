import { describe, it, expect } from 'vitest'
import { wilsonScoreInterval, computeExperimentStats } from '../../src/lib/stats'

describe('stats.ts: Wilson Score Interval', () => {
  it('handles empty sample n = 0 safely', () => {
    const ci = wilsonScoreInterval(0, 0)
    expect(ci).toEqual({ lower: 0, center: 0, upper: 0 })
  })

  it('handles zero conversions x = 0 with n > 0 without collapsing to 0 margin', () => {
    const ci = wilsonScoreInterval(0, 10)
    expect(ci.lower).toBe(0)
    expect(ci.center).toBeGreaterThan(0)
    expect(ci.upper).toBeGreaterThan(0.2) // ~0.28
  })

  it('handles 100% conversion x = n safely', () => {
    const ci = wilsonScoreInterval(10, 10)
    expect(ci.upper).toBe(1)
    expect(ci.lower).toBeLessThan(1)
    expect(ci.lower).toBeGreaterThan(0.6)
  })

  it('accurately reproduces the hand-calculated 20/100 case from LEARN/04', () => {
    // Hand calculation: center ~0.2111, bounds ~[0.1334, 0.2888]
    const ci = wilsonScoreInterval(20, 100)
    expect(ci.center).toBeCloseTo(0.2111, 2)
    expect(ci.lower).toBeCloseTo(0.1334, 2)
    expect(ci.upper).toBeCloseTo(0.2888, 2)
  })

  it('clamps invalid x values that exceed n', () => {
    const ci = wilsonScoreInterval(15, 10)
    // Should behave as 10/10
    expect(ci.upper).toBe(1)
    expect(ci.lower).toBeGreaterThan(0.6)
  })
})

describe('stats.ts: Status Gate Enforcement', () => {
  it('returns not_enough_data when any variant is below minSample', () => {
    const result = computeExperimentStats(
      [
        { id: 'v1', label: 'A', views: 50, conversions: 10 },
        { id: 'v2', label: 'B', views: 42, conversions: 15 }, // below 50
      ],
      50,
    )

    expect(result.statusGate).toBe('not_enough_data')
    expect(result.minSampleMet).toBe(false)
    expect(result.leaderVariantId).toBeNull()
  })

  it('returns directional when minSample is met but confidence intervals overlap', () => {
    // 20/100 (CI ~ [0.13, 0.29]) vs 25/100 (CI ~ [0.17, 0.34]) -> Overlap!
    const result = computeExperimentStats(
      [
        { id: 'v1', label: 'A', views: 100, conversions: 20 },
        { id: 'v2', label: 'B', views: 100, conversions: 25 },
      ],
      50,
    )

    expect(result.statusGate).toBe('directional')
    expect(result.minSampleMet).toBe(true)
    expect(result.leaderVariantId).toBe('v2')
  })

  it('returns evidence_favors_x when intervals are completely separated', () => {
    // 10/100 (CI ~ [0.055, 0.174]) vs 45/100 (CI ~ [0.356, 0.547]) -> Non-overlapping!
    const result = computeExperimentStats(
      [
        { id: 'v1', label: 'A', views: 100, conversions: 10 },
        { id: 'v2', label: 'B', views: 100, conversions: 45 },
      ],
      50,
    )

    expect(result.statusGate).toBe('evidence_favors_x')
    expect(result.minSampleMet).toBe(true)
    expect(result.leaderVariantId).toBe('v2')
    expect(result.statusReason).toContain('Evidence favors Variant B')
  })
})
