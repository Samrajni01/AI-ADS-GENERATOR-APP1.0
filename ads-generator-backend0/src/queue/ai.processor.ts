import { Processor, Process } from '@nestjs/bull'
import type { Job } from 'bull'
import { PrismaService } from '../prisma/prisma.service'

@Processor('ai')
export class AiProcessor {
  constructor(private prisma: PrismaService) {}

  @Process('post-process')
  async handlePostProcess(job: Job<{ adId: string; userId: string }>) {
    const { adId } = job.data

    // Create analytics entry for new AI generated ad
    await this.prisma.db.adAnalytics.upsert({
      where: { adId },
      create: { adId, views: 0, clicks: 0, impressions: 0 },
      update: {},
    })
  }
}