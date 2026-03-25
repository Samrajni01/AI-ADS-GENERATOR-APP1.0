import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import type { Queue } from 'bull'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAdDto } from './dto/create-ad.dto'
import { UpdateAdDto } from './dto/update-ad.dto'
import { CacheService } from '../cache/cache.service'

@Injectable()
export class AdsService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    @InjectQueue('ads') private adsQueue: Queue,
  ) {}

  // Create ad
  async create(userId: string, dto: CreateAdDto) {
    const ad = await this.prisma.db.ad.create({
      data: { ...dto, userId },
    })
    // Invalidate user ads cache
    await this.cacheService.del(`ads:user:${userId}`)
    return ad
  }

  // Get all ads for current user
  async findAll(userId: string) {
    const cacheKey = `ads:user:${userId}`
    const cached = await this.cacheService.get(cacheKey)
    if (cached) return cached

    const ads = await this.prisma.db.ad.findMany({
      where: { userId },
      include: { campaign: true },
      orderBy: { createdAt: 'desc' },
    })

    await this.cacheService.set(cacheKey, ads, 60) // cache 60 seconds
    return ads
  }

  // Get single ad
  async findOne(id: string, userId: string) {
    const cacheKey = `ads:${id}`
    const cached = await this.cacheService.get(cacheKey)
    if (cached) return cached

    const ad = await this.prisma.db.ad.findUnique({
      where: { id },
      include: { campaign: true },
    })
    if (!ad) throw new NotFoundException('Ad not found')
    if (ad.userId !== userId) throw new ForbiddenException('Access denied')

    await this.cacheService.set(cacheKey, ad, 60)
    return ad
  }

  // Update ad
  async update(id: string, userId: string, dto: UpdateAdDto) {
    await this.findOne(id, userId)
    const ad = await this.prisma.db.ad.update({
      where: { id },
      data: { ...dto },
    })
    await this.cacheService.del(`ads:${id}`)
    await this.cacheService.del(`ads:user:${userId}`)
    return ad
  }

  // Delete ad
  async remove(id: string, userId: string) {
    await this.findOne(id, userId)
    await this.prisma.db.ad.delete({ where: { id } })
    await this.cacheService.del(`ads:${id}`)
    await this.cacheService.del(`ads:user:${userId}`)
    return { message: 'Ad deleted successfully' }
  }

  // Track impression (background job)
  async trackImpression(adId: string) {
    await this.adsQueue.add('track-impression', { adId }, { attempts: 3 })
  }

  // Track click (background job)
  async trackClick(adId: string) {
    await this.adsQueue.add('track-click', { adId }, { attempts: 3 })
  }

  // Get analytics for an ad
  async getAnalytics(id: string, userId: string) {
    await this.findOne(id, userId)
    const analytics = await this.prisma.db.adAnalytics.findUnique({
      where: { adId: id },
    })
    return analytics ?? { adId: id, views: 0, clicks: 0, impressions: 0 }
  }
}