import { describe, it, expect } from 'vitest'
import { verifyClaim, evaluateVariantClaims, SEED_FACTS } from '../../src/lib/claimGuard'
import evalCases from '../evals/claimGuard.cases.json'

describe('claimGuard.ts: Evaluation Suite & Verification', () => {
  it('correctly matches supported seed facts', () => {
    const claim = 'Deploy to .app.space with a single command using npx deepspace deploy'
    const result = verifyClaim(claim, SEED_FACTS)
    expect(result.verdict).toBe('supported')
    expect(result.matchedFactId).toBe('fact-deploy')
  })

  it('flags ungrounded superlatives and buzzwords', () => {
    const result = verifyClaim('Infinite scale and free forever cloud hosting')
    expect(result.verdict).toBe('unsupported')
    expect(result.reason).toContain('ungrounded')
  })

  it('evaluates composite variant claims and flags variant if any claim fails', () => {
    const validVariant = evaluateVariantClaims([
      'Deploy to .app.space with a single command using npx deepspace deploy',
      'Cloudflare Workers runtime with SQLite-backed Durable Objects for live data sync',
    ])
    expect(validVariant.claimStatus).toBe('ok')

    const taintedVariant = evaluateVariantClaims([
      'Deploy to .app.space with a single command using npx deepspace deploy',
      'Free forever with infinite memory and zero latency', // flagged
    ])
    expect(taintedVariant.claimStatus).toBe('flagged')
  })

  it('runs all 12 ground-truth eval benchmark cases and reports high precision', () => {
    let passed = 0
    const total = evalCases.length

    for (const testCase of evalCases) {
      const result = verifyClaim(testCase.claim, SEED_FACTS)
      if (result.verdict === testCase.expectedVerdict) {
        passed++
      } else {
        console.warn(`Claim Guard Eval Mismatch on ${testCase.id}: expected ${testCase.expectedVerdict}, got ${result.verdict} for: "${testCase.claim}"`)
      }
    }

    const accuracy = passed / total
    console.log(`Claim Guard Eval Accuracy: ${passed}/${total} (${(accuracy * 100).toFixed(1)}%)`)
    expect(accuracy).toBeGreaterThanOrEqual(0.85) // At least 85% accuracy
  })
})
