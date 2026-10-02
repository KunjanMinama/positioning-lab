import { describe, it, expect } from 'vitest'
import { assignVariantIndex, fnv1a32, sanitizeChannel } from '../../src/lib/assign'

describe('assign.ts: Deterministic Variant Assignment', () => {
  it('consistently assigns the exact same variant for the same visitor and experiment', () => {
    const experimentId = 'exp-123'
    const visitorId = 'visitor-abc-xyz'

    const assignment1 = assignVariantIndex(experimentId, visitorId, 3)
    const assignment2 = assignVariantIndex(experimentId, visitorId, 3)
    const assignment3 = assignVariantIndex(experimentId, visitorId, 3)

    expect(assignment1).toBe(assignment2)
    expect(assignment2).toBe(assignment3)
    expect(assignment1).toBeGreaterThanOrEqual(0)
    expect(assignment1).toBeLessThan(3)
  })

  it('assigns index 0 when only 1 variant exists', () => {
    expect(assignVariantIndex('exp-1', 'vis-1', 1)).toBe(0)
    expect(assignVariantIndex('exp-1', 'vis-2', 0)).toBe(0)
  })

  it('produces reasonable uniformity across variants with random UUIDs', () => {
    const numVariants = 3
    const totalSamples = 3000
    const counts = [0, 0, 0]

    for (let i = 0; i < totalSamples; i++) {
      const visitorId = `user-uuid-${i}-${Math.random()}`
      const index = assignVariantIndex('exp-test', visitorId, numVariants)
      counts[index]++
    }

    // Expected ~1000 each; check each bucket is within 25% tolerance (between 750 and 1250)
    for (const count of counts) {
      expect(count).toBeGreaterThan(750)
      expect(count).toBeLessThan(1250)
    }
  })

  it('sanitizes channel parameters according to whitelist', () => {
    expect(sanitizeChannel('LINKEDIN')).toBe('linkedin')
    expect(sanitizeChannel('x')).toBe('x')
    expect(sanitizeChannel('reddit')).toBe('reddit')
    expect(sanitizeChannel('hn')).toBe('hn')
    expect(sanitizeChannel('discord')).toBe('discord')
    expect(sanitizeChannel('friend')).toBe('friend')
    expect(sanitizeChannel('other')).toBe('other')

    // Unrecognized or malicious values fallback to 'other'
    expect(sanitizeChannel('facebook')).toBe('other')
    expect(sanitizeChannel('<script>')).toBe('other')
    expect(sanitizeChannel(null)).toBe('other')
    expect(sanitizeChannel(undefined)).toBe('other')
  })
})
