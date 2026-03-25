import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'
import { AdsService } from './ads.service'
import { AdsController } from './ads.controller'
import { AdsProcessor } from '../queue/ads.processor'

@Module({
  imports: [
    BullModule.registerQueue({ name: 'ads' }),
  ],
  controllers: [AdsController],
  providers: [AdsService, AdsProcessor],
  exports: [AdsService],
})
export class AdsModule {}