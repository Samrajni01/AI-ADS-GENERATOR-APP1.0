import { Injectable } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class CacheService {
  private redis: Redis

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 1,        // ← don't retry 20 times, fail fast
      enableOfflineQueue: false,       // ← don't queue commands when disconnected
      lazyConnect: true,               // ← don't crash on startup if Redis is down
    })

    this.redis.on('error', (err) => {
      console.warn('Redis connection error, cache disabled:', err.message)
    })
  }

  async get(key: string) {
    try {
      const data = await this.redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (e) {
      console.warn('Cache get failed, skipping:', e.message)
      return null
    }
  }

  async set(key: string, value: any, ttlSeconds = 60) {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
    } catch (e) {
      console.warn('Cache set failed, skipping:', e.message)
    }
  }

  async del(key: string) {
    try {
      await this.redis.del(key)
    } catch (e) {
      console.warn('Cache del failed, skipping:', e.message)
    }
  }
}