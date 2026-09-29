import IORedis, { type Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL || '';

let client: Redis | null = null;

function getRedis(): Redis | null {
  if (!redisUrl) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Redis] REDIS_URL not set. Caching and rate-limiting will be in-memory.');
    }
    return null;
  }

  if (!client) {
    client = new IORedis(redisUrl, {
      maxRetriesPerRequest: 5,
      reconnectOnError: (err) => {
        if (err.message.includes('READONLY')) return false;
        return true;
      },
    });

    client.on('error', (err) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Redis] Connection error:', err.message);
      }
    });

    client.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Redis] Connected');
      }
    });
  }

  return client;
}

export const redis = {
  get: async (key: string): Promise<string | null> => {
    const r = getRedis();
    if (!r) return null;
    try {
      return await r.get(key);
    } catch {
      return null;
    }
  },
  set: async (key: string, value: string, ttlSeconds?: number): Promise<boolean> => {
    const r = getRedis();
    if (!r) return false;
    try {
      if (ttlSeconds) {
        await r.setex(key, ttlSeconds, value);
      } else {
        await r.set(key, value);
      }
      return true;
    } catch {
      return false;
    }
  },
  del: async (key: string): Promise<number> => {
    const r = getRedis();
    if (!r) return 0;
    try {
      return await r.del(key);
    } catch {
      return 0;
    }
  },
  incr: async (key: string, ttlSeconds = 60): Promise<number> => {
    const r = getRedis();
    if (!r) return 1;
    try {
      const val = await r.incr(key);
      if (val === 1) {
        await r.expire(key, ttlSeconds);
      }
      return val;
    } catch {
      return 1;
    }
  },
  eval: <T = unknown>(script: string, keys: number, ...args: (string | number)[]): Promise<T> => {
    const r = getRedis();
    if (!r) return Promise.resolve(null as unknown as T);
    return r.eval(script, keys, ...args) as Promise<T>;
  },
  raw: () => getRedis(),
};

export default redis;
