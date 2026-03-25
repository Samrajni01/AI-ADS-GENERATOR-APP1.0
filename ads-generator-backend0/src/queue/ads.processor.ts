import { Processor, Process } from '@nestjs/bull'
import type { Job } from 'bull'
import { PrismaService } from '../prisma/prisma.service'

@Processor('ads')
export class AdsProcessor {
  constructor(private prisma: PrismaService) {}

  @Process('track-impression')
  async handleImpression(job: Job<{ adId: string }>) {
    const { adId } = job.data
    await this.prisma.db.adAnalytics.upsert({
      where: { adId },
      create: { adId, impressions: 1, views: 0, clicks: 0 },
      update: { impressions: { increment: 1 } },
    })
  }

  @Process('track-click')
  async handleClick(job: Job<{ adId: string }>) {
    const { adId } = job.data
    await this.prisma.db.adAnalytics.upsert({
      where: { adId },
      create: { adId, clicks: 1, views: 0, impressions: 0 },
      update: { clicks: { increment: 1 } },
    })
  }
}