import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createRateLimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const redis = new Redis({ url, token });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    analytics: true,
    prefix: "devroast:ratelimit",
  });
}

export const rateLimiter = createRateLimiter();
