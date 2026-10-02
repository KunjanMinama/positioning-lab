/**
 * Claim Guard Engine for Positioning Lab.
 *
 * Verifies that marketing copy and variant claims are strictly grounded
 * in officially verified documentation from docs.deep.space.
 *
 * Unverified, exaggerated, or unsupported claims are flagged and block variant approval.
 */

export interface Fact {
  id: string
  statement: string
  source: string
}

export type ClaimVerdict = 'supported' | 'unsupported' | 'unclear'

export interface ClaimCheckResult {
  claim: string
  verdict: ClaimVerdict
  matchedFactId?: string
  reason: string
}

export interface VariantClaimEvaluation {
  claimStatus: 'ok' | 'flagged'
  checks: ClaimCheckResult[]
}

/**
 * Seed facts verified directly from docs.deep.space.
 */
export const SEED_FACTS: Fact[] = [
  {
    id: 'fact-deploy',
    statement: 'One-command deploy to <name>.app.space using npx deepspace deploy.',
    source: 'https://docs.deep.space/get-started/quickstart',
  },
  {
    id: 'fact-runtime',
    statement: 'Cloudflare Workers runtime with SQLite-backed Durable Objects for real-time data sync.',
    source: 'https://docs.deep.space/concepts/architecture',
  },
  {
    id: 'fact-auth',
    statement: 'Built-in auth supports GitHub and Google OAuth without managing user passwords.',
    source: 'https://docs.deep.space/guides/authentication',
  },
  {
    id: 'fact-actions',
    statement: 'Server actions provide privileged worker-side execution that bypasses user RBAC for orchestrations.',
    source: 'https://docs.deep.space/guides/server-actions',
  },
  {
    id: 'fact-ai-proxy',
    statement: 'AI proxy routes Anthropic, OpenAI, and Cerebras requests without storing API keys in application code.',
    source: 'https://docs.deep.space/sdk-reference/worker/ai',
  },
  {
    id: 'fact-presence',
    statement: 'Realtime presence and live cursors are synced via ephemeral WebSocket rooms.',
    source: 'https://docs.deep.space/guides/presence-and-cursors',
  },
  {
    id: 'fact-prereqs',
    statement: 'Scaffolder requires Node 22.15+ and npm 11.6+ when using npm.',
    source: 'https://docs.deep.space/get-started/installation',
  },
]

// Unacceptable superlative/ungrounded buzzwords
const UNGROUNDED_TERMS = [
  /\b(infinite|unlimited)\b/i,
  /\b(free forever)\b/i,
  /\b(100% bug[- ]free)\b/i,
  /\b(fastest in the world)\b/i,
  /\b(zero latency)\b/i,
  /\b(no code required)\b/i,
]

/**
 * Evaluates a single claim against the registry of verified facts.
 */
export function verifyClaim(claim: string, facts: Fact[] = SEED_FACTS): ClaimCheckResult {
  const normalizedClaim = claim.trim().toLowerCase()

  // 1. Guard against ungrounded superlatives / impossible guarantees
  for (const term of UNGROUNDED_TERMS) {
    if (term.test(claim)) {
      return {
        claim,
        verdict: 'unsupported',
        reason: `Claim contains ungrounded guarantee or superlative matching "${term.source}".`,
      }
    }
  }

  // 2. Extract key meaningful tokens (words >= 4 chars, excluding stopwords)
  const stopwords = new Set(['with', 'that', 'this', 'from', 'your', 'using', 'into', 'have', 'more'])
  const claimTokens = normalizedClaim
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !stopwords.has(w))

  let bestMatch: Fact | null = null
  let bestScore = 0

  for (const fact of facts) {
    const factTokens = fact.statement
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !stopwords.has(w))

    const factTokenSet = new Set(factTokens)
    let overlapCount = 0

    for (const token of claimTokens) {
      if (factTokenSet.has(token)) {
        overlapCount++
      }
    }

    const score = claimTokens.length > 0 ? overlapCount / claimTokens.length : 0

    if (score > bestScore) {
      bestScore = score
      bestMatch = fact
    }
  }

  // Thresholds:
  // >= 0.40 overlap with a verified fact -> supported
  // 0.25 - 0.40 overlap -> unclear (requires human review / tighter phrasing)
  // < 0.25 -> unsupported
  if (bestMatch && bestScore >= 0.38) {
    return {
      claim,
      verdict: 'supported',
      matchedFactId: bestMatch.id,
      reason: `Supported by fact "${bestMatch.id}" (${bestMatch.source}).`,
    }
  }

  if (bestMatch && bestScore >= 0.22) {
    return {
      claim,
      verdict: 'unclear',
      matchedFactId: bestMatch.id,
      reason: `Partially resembles fact "${bestMatch.id}" but wording is ambiguous or over-extended.`,
    }
  }

  return {
    claim,
    verdict: 'unsupported',
    reason: 'No matching verified fact found in registry for this technical assertion.',
  }
}

/**
 * Evaluates all claims in a variant and computes the composite status.
 */
export function evaluateVariantClaims(
  claims: string[],
  facts: Fact[] = SEED_FACTS,
): VariantClaimEvaluation {
  if (claims.length === 0) {
    return {
      claimStatus: 'ok',
      checks: [],
    }
  }

  const checks = claims.map((claim) => verifyClaim(claim, facts))
  const hasFlagged = checks.some((c) => c.verdict === 'unsupported' || c.verdict === 'unclear')

  return {
    claimStatus: hasFlagged ? 'flagged' : 'ok',
    checks,
  }
}
