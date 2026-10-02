/**
 * Deterministic variant assignment and channel sanitization for Positioning Lab.
 *
 * Uses the 32-bit FNV-1a hash algorithm to deterministically map an (experimentId + visitorId)
 * pair to a variant index without storing cookies or personal data.
 */

export const ALLOWED_CHANNELS = [
  'linkedin',
  'x',
  'reddit',
  'hn',
  'discord',
  'friend',
  'other',
] as const

export type Channel = (typeof ALLOWED_CHANNELS)[number]

/**
 * 32-bit FNV-1a hash implementation.
 *
 * Fast, deterministic, non-cryptographic hash with excellent avalanche properties
 * for uniform bucket distribution.
 */
export function fnv1a32(str: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    // 32-bit FNV prime 0x01000193 = 16777619
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0 // Convert to unsigned 32-bit integer
}

/**
 * Deterministically assigns a visitor to one of N variant indices [0, numVariants - 1].
 *
 * @param experimentId Unique experiment identifier or slug
 * @param visitorId Anonymous client-generated UUID
 * @param numVariants Total count of approved variants (must be > 0)
 * @returns Assigned 0-based variant index
 */
export function assignVariantIndex(
  experimentId: string,
  visitorId: string,
  numVariants: number,
): number {
  if (numVariants <= 1) return 0
  const combined = `${experimentId}:${visitorId}`
  const hash = fnv1a32(combined)
  return hash % numVariants
}

/**
 * Sanitizes an incoming URL channel parameter against the allowed whitelist.
 *
 * @param rawChannel Value from query param `?src=`
 * @returns Cleaned Channel enum (defaults to 'other' if unrecognized)
 */
export function sanitizeChannel(rawChannel: string | null | undefined): Channel {
  if (!rawChannel) return 'other'
  const normalized = rawChannel.trim().toLowerCase()
  if ((ALLOWED_CHANNELS as readonly string[]).includes(normalized)) {
    return normalized as Channel
  }
  return 'other'
}
