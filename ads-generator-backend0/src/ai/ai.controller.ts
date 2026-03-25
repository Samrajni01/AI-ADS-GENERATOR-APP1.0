import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { AiService } from './ai.service'
import { GenerateAdDto } from './dto/generate-ad.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  // POST /ai/generate
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('generate')
  generateAd(@CurrentUser() user: any, @Body() dto: GenerateAdDto) {
    return this.aiService.generateAd(user.id, dto)
  }

  // POST /ai/variations
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('variations')
  generateVariations(@CurrentUser() user: any, @Body() dto: GenerateAdDto) {
    return this.aiService.generateVariations(user.id, dto)
  }
}