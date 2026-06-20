import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export class RateLimit {
  private redis: Redis | null = null
  private limiters: Map<string, Ratelimit> = new Map()

  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (url && token) {
      this.redis = new Redis({ url, token })
    }
  }

  /**
   * Check if a request should be rate limited.
   * @param key Identifier for the user/IP.
   * @param limit Maximum number of requests allowed in the window.
   * @param windowMs Window duration in milliseconds.
   * @returns An object with `success` true if allowed, false if limited.
   */
  public async check(key: string, limit: number, windowMs: number): Promise<{ success: boolean; remaining: number }> {
    if (!this.redis) {
      console.warn('[RateLimit] Missing UPSTASH_REDIS_REST_URL. Rate limiting is gracefully disabled.')
      return { success: true, remaining: limit }
    }

    const windowSecs = Math.max(1, Math.floor(windowMs / 1000))
    const configKey = `${limit}_${windowSecs}s`

    let limiter = this.limiters.get(configKey)
    if (!limiter) {
      limiter = new Ratelimit({
        redis: this.redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSecs} s` as any),
        ephemeralCache: new Map(),
      })
      this.limiters.set(configKey, limiter)
    }

    try {
      const res = await limiter.limit(key)
      return { success: res.success, remaining: res.remaining }
    } catch (error) {
      console.error('[RateLimit] Redis error, failing open:', error)
      return { success: true, remaining: limit }
    }
  }
}

// Global instance for server-side rate limiting
export const globalRateLimiter = new RateLimit()
