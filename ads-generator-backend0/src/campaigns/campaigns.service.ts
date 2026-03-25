import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCampaignDto } from './dto/create-campaign.dto'
import { UpdateCampaignDto } from './dto/update-campaign.dto'
import { CacheService } from '../cache/cache.service'

@Injectable()
export class CampaignsService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  // Create campaign
  async create(userId: string, dto: CreateCampaignDto) {
    const campaign = await this.prisma.db.campaign.create({
      data: { ...dto, userId },
    })
    await this.cacheService.del(`campaigns:user:${userId}`)
    return campaign
  }

  // Get all campaigns for current user
  async findAll(userId: string) {
    const cacheKey = `campaigns:user:${userId}`
    const cached = await this.cacheService.get(cacheKey)
    if (cached) return cached

    const campaigns = await this.prisma.db.campaign.findMany({
      where: { userId },
      include: {
        ads: true,
        _count: { select: { ads: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    await this.cacheService.set(cacheKey, campaigns, 60)
    return campaigns
  }

  // Get single campaign
  async findOne(id: string, userId: string) {
    const cacheKey = `campaigns:${id}`
    const cached = await this.cacheService.get(cacheKey)
    if (cached) return cached

    const campaign = await this.prisma.db.campaign.findUnique({
      where: { id },
      include: {
        ads: true,
        _count: { select: { ads: true } },
      },
    })

    if (!campaign) throw new NotFoundException('Campaign not found')
    if (campaign.userId !== userId) throw new ForbiddenException('Access denied')

    await this.cacheService.set(cacheKey, campaign, 60)
    return campaign
  }

  // Update campaign
  async update(id: string, userId: string, dto: UpdateCampaignDto) {
    await this.findOne(id, userId)
    const campaign = await this.prisma.db.campaign.update({
      where: { id },
      data: { ...dto },
    })
    await this.cacheService.del(`campaigns:${id}`)
    await this.cacheService.del(`campaigns:user:${userId}`)
    return campaign
  }

  // Delete campaign
  async remove(id: string, userId: string) {
    await this.findOne(id, userId)
    await this.prisma.db.campaign.delete({ where: { id } })
    await this.cacheService.del(`campaigns:${id}`)
    await this.cacheService.del(`campaigns:user:${userId}`)
    return { message: 'Campaign deleted successfully' }
  }

  // Add ad to campaign
  async addAd(campaignId: string, adId: string, userId: string) {
    await this.findOne(campaignId, userId)
    const ad = await this.prisma.db.ad.update({
      where: { id: adId },
      data: { campaignId },
    })
    await this.cacheService.del(`campaigns:${campaignId}`)
    return ad
  }

  // Remove ad from campaign
  async removeAd(campaignId: string, adId: string, userId: string) {
    await this.findOne(campaignId, userId)
    const ad = await this.prisma.db.ad.update({
      where: { id: adId },
      data: { campaignId: null },
    })
    await this.cacheService.del(`campaigns:${campaignId}`)
    return ad
  }
}