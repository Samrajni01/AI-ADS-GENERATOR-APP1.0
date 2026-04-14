import { Global, Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'
import { CacheService } from './cache.service'

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        tls: {},
        maxRetriesPerRequest: 1,
enableOfflineQueue: true,
    lazyConnect: true, 
      },
      settings: {
        stalledInterval: 300000,
        maxStalledCount: 1,
      },
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
