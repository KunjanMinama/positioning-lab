/**
 * Mathematical statistics and status gate engine for Positioning Lab.
 *
 * Implements the Wilson score interval (95% confidence level) and strict status gates
 * to prevent premature winner declarations on small-sample developer traffic.
 */

export interface VariantStats {
  variantId: string
  label: string
  views: number // n: unique visitors
  conversions: number // x: unique visitors triggering primary metric
  conversionRate: number // p = x / n
  interval: {
    lower: number
    center: number
    upper: number
  }
}

export type StatusGate = 'not_enough_data' | 'directional' | 'evidence_favors_x'

export interface ExperimentStatsResult {
  variants: VariantStats[]
  statusGate: StatusGate
  statusReason: string
  leaderVariantId: string | null
  minSampleMet: boolean
  minSampleRequired: number
}

const Z_95 = 1.95996398454 // z for 95% confidence
const Z2 = Z_95 * Z_95 // ~3.84146

/**
 * Computes the 95% Wilson score interval for a proportion x/n.
 *
 * @param x Number of successes (conversions)
 * @param n Total sample size (visitors)
 * @returns { lower, center, upper } bounds constrained to [0, 1]
 */
export function wilsonScoreInterval(x: number, n: number): {
  lower: number
  center: number
  upper: number
} {
  if (n <= 0) {
    return { lower: 0, center: 0, upper: 0 }
  }

  // Cap x between 0 and n to prevent impossible inputs
  const clampedX = Math.max(0, Math.min(x, n))
  const p = clampedX / n

  const denominator = 1 + Z2 / n
  const center = (p + Z2 / (2 * n)) / denominator

  const underRadical = (p * (1 - p)) / n + Z2 / (4 * n * n)
  const margin = (Z_95 * Math.sqrt(Math.max(0, underRadical))) / denominator

  const lower = Math.max(0, center - margin)
  const upper = Math.min(1, center + margin)

  return {
    lower: Number(lower.toFixed(4)),
    center: Number(center.toFixed(4)),
    upper: Number(upper.toFixed(4)),
  }
}

/**
 * Computes full experiment statistics, ranking, and status gate.
 *
 * @param rawVariants Array of variants with their observed views and conversions
 * @param minSamplePerVariant Pre-registered minimum sample required per variant (default 50)
 */
export function computeExperimentStats(
  rawVariants: Array<{
    id: string
    label: string
    views: number
    conversions: number
  }>,
  minSamplePerVariant = 50,
): ExperimentStatsResult {
  const variants: VariantStats[] = rawVariants.map((v) => {
    const rate = v.views > 0 ? v.conversions / v.views : 0
    return {
      variantId: v.id,
      label: v.label,
      views: v.views,
      conversions: v.conversions,
      conversionRate: Number(rate.toFixed(4)),
      interval: wilsonScoreInterval(v.conversions, v.views),
    }
  })

  // Sort descending by conversion rate, then by views
  variants.sort((a, b) => {
    if (b.conversionRate !== a.conversionRate) {
      return b.conversionRate - a.conversionRate
    }
    return b.views - a.views
  })

  if (variants.length === 0) {
    return {
      variants: [],
      statusGate: 'not_enough_data',
      statusReason: 'No variants configured.',
      leaderVariantId: null,
      minSampleMet: false,
      minSampleRequired: minSamplePerVariant,
    }
  }

  // Gate 1: Check minimum sample size across ALL variants
  const underSampleVariants = variants.filter((v) => v.views < minSamplePerVariant)
  const minSampleMet = underSampleVariants.length === 0

  if (!minSampleMet) {
    const summary = underSampleVariants
      .map((v) => `${v.label} (${v.views}/${minSamplePerVariant})`)
      .join(', ')
    return {
      variants,
      statusGate: 'not_enough_data',
      statusReason: `Insufficient sample: variants still collecting traffic: ${summary}. Pre-registration requires >= ${minSamplePerVariant} per variant before declaring conclusions.`,
      leaderVariantId: null,
      minSampleMet: false,
      minSampleRequired: minSamplePerVariant,
    }
  }

  // If only 1 variant exists and sample is met
  if (variants.length === 1) {
    return {
      variants,
      statusGate: 'directional',
      statusReason: 'Single variant test; cannot compare against an alternative.',
      leaderVariantId: variants[0].variantId,
      minSampleMet: true,
      minSampleRequired: minSamplePerVariant,
    }
  }

  // Compare top variant (index 0) against runner-up (index 1)
  const leader = variants[0]
  const runnerUp = variants[1]

  // Gate 3 check: Do the 95% Wilson intervals cleanly separate?
  // Leader's lower bound must strictly exceed runner-up's upper bound
  const isSeparated = leader.interval.lower > runnerUp.interval.upper

  if (isSeparated) {
    return {
      variants,
      statusGate: 'evidence_favors_x',
      statusReason: `Evidence favors Variant ${leader.label}: its 95% Wilson lower bound (${(leader.interval.lower * 100).toFixed(1)}%) exceeds Variant ${runnerUp.label}'s upper bound (${(runnerUp.interval.upper * 100).toFixed(1)}%).`,
      leaderVariantId: leader.variantId,
      minSampleMet: true,
      minSampleRequired: minSamplePerVariant,
    }
  }

  // Gate 2: Minimum met, but confidence intervals overlap
  return {
    variants,
    statusGate: 'directional',
    statusReason: `Directional: Variant ${leader.label} leads (${(leader.conversionRate * 100).toFixed(1)}% vs ${(runnerUp.conversionRate * 100).toFixed(1)}%), but their 95% Wilson intervals overlap ([${(leader.interval.lower * 100).toFixed(1)}%–${(leader.interval.upper * 100).toFixed(1)}%] vs [${(runnerUp.interval.lower * 100).toFixed(1)}%–${(runnerUp.interval.upper * 100).toFixed(1)}%]). A conclusive winner cannot be claimed.`,
    leaderVariantId: leader.variantId,
    minSampleMet: true,
    minSampleRequired: minSamplePerVariant,
  }
}
