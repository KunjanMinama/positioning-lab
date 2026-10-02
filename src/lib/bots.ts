/**
 * Lightweight, privacy-preserving bot detection for Positioning Lab.
 *
 * Checks user-agent patterns and visitor ID presence without storing IP addresses
 * or creating privacy-invasive device fingerprints.
 */

const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /postmanruntime/i,
  /go-http-client/i,
  /headlesschrome/i,
  /phantomjs/i,
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /sogou/i,
  /exabot/i,
  /facebot/i,
  /ia_archiver/i,
]

/**
 * Checks whether an incoming request exhibits bot characteristics.
 *
 * @param userAgent The raw User-Agent header (if available)
 * @param visitorId The client-supplied visitor UUID
 * @returns boolean flag indicating suspected bot traffic
 */
export function isBotTraffic(
  userAgent: string | null | undefined,
  visitorId: string | null | undefined,
): boolean {
  // If no visitorId is provided or it is too short to be a valid client UUID, treat as bot
  if (!visitorId || visitorId.trim().length < 10) {
    return true
  }

  // If user-agent is missing or matches known bot/automation patterns
  if (!userAgent || userAgent.trim().length === 0) {
    return true
  }

  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return true
    }
  }

  return false
}
