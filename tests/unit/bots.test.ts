import { describe, it, expect } from 'vitest'
import { isBotTraffic } from '../../src/lib/bots'

describe('bots.ts: Bot Traffic Filtering', () => {
  it('flags missing or malformed visitorId as bot', () => {
    expect(isBotTraffic('Mozilla/5.0 Chrome', null)).toBe(true)
    expect(isBotTraffic('Mozilla/5.0 Chrome', '')).toBe(true)
    expect(isBotTraffic('Mozilla/5.0 Chrome', '123')).toBe(true)
  })

  it('flags known automated scripts and crawlers', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000'
    expect(isBotTraffic('curl/8.4.0', validUuid)).toBe(true)
    expect(isBotTraffic('Python-requests/2.31.0', validUuid)).toBe(true)
    expect(isBotTraffic('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', validUuid)).toBe(true)
    expect(isBotTraffic('Mozilla/5.0 HeadlessChrome/120.0.0.0', validUuid)).toBe(true)
  })

  it('allows legitimate human browser user agents with valid UUIDs', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000'
    const chromeMac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    const firefoxWin = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0'
    const mobileIos = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'

    expect(isBotTraffic(chromeMac, validUuid)).toBe(false)
    expect(isBotTraffic(firefoxWin, validUuid)).toBe(false)
    expect(isBotTraffic(mobileIos, validUuid)).toBe(false)
  })
})
