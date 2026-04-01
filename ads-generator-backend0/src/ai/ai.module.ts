import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'
import { AiService } from './ai.service'
import { AiController } from './ai.controller'
import { AiProcessor } from '../queue/ai.processor'
import { MediaModule } from 'src/media/media.module'

@Module({
  imports: [MediaModule,
    BullModule.registerQueue({ name: 'ai' }),
  ],
  controllers: [AiController],
  providers: [AiService, AiProcessor],
  exports: [AiService],
})
export class AiModule {}