interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  blockedUntil: number | null;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(maxAttempts = 5, windowMinutes = 15, blockMinutes = 30) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMinutes * 60 * 1000;
    this.blockDurationMs = blockMinutes * 60 * 1000;
    this.cleanupOldEntries();
  }

  private cleanupOldEntries() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.storage.entries()) {
        if (entry.blockedUntil && now > entry.blockedUntil) {
          this.storage.delete(key);
        } else if (now - entry.lastAttempt > this.windowMs) {
          this.storage.delete(key);
        }
      }
    }, 60000);
  }

  checkLimit(identifier: string): { allowed: boolean; remaining: number; resetTime?: number } {
    const now = Date.now();
    const entry = this.storage.get(identifier);

    if (!entry) {
      return { allowed: true, remaining: this.maxAttempts - 1 };
    }

    if (entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
      };
    }

    if (now - entry.lastAttempt > this.windowMs) {
      this.storage.delete(identifier);
      return { allowed: true, remaining: this.maxAttempts - 1 };
    }

    if (entry.attempts >= this.maxAttempts) {
      entry.blockedUntil = now + this.blockDurationMs;
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
      };
    }

    return {
      allowed: true,
      remaining: this.maxAttempts - entry.attempts - 1,
    };
  }

  recordAttempt(identifier: string, success: boolean) {
    const now = Date.now();
    const entry = this.storage.get(identifier);

    if (success) {
      this.storage.delete(identifier);
      return;
    }

    if (!entry) {
      this.storage.set(identifier, {
        attempts: 1,
        lastAttempt: now,
        blockedUntil: null,
      });
    } else {
      entry.attempts++;
      entry.lastAttempt = now;

      if (entry.attempts >= this.maxAttempts) {
        entry.blockedUntil = now + this.blockDurationMs;
      }
    }
  }

  reset(identifier: string) {
    this.storage.delete(identifier);
  }
}

export const loginRateLimiter = new RateLimiter(5, 15, 30);
export const registrationRateLimiter = new RateLimiter(3, 60, 120);
