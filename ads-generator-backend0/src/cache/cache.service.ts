import { Injectable } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class CacheService {
  private redis: Redis

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    })
  }

  async get(key: string) {
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async set(key: string, value: any, ttlSeconds = 60) {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  }

  async del(key: string) {
    await this.redis.del(key)
  }
}