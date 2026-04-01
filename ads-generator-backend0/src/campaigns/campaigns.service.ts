import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException, // <-- Add this
  BadRequestException
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
      data: { ...dto, userId ,isPublic: true },
    })
    await this.cacheService.del(`campaigns:user:${userId}`)
    return {data :campaign};
  }

  // Get all campaigns for current user
  /*async findAll(userId: string) {
    const cacheKey = `campaigns:user:${userId}`
    const cached = await this.cacheService.get(cacheKey)
    if (cached) return {data :cached};

    const campaigns = await this.prisma.db.campaign.findMany({
      where: { userId },
      include: {
        ads: true,
        _count: { select: { ads: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    await this.cacheService.set(cacheKey, campaigns, 60)
    return {data :campaigns};
  }*/
 async findAll(userId: string) {
  // 1. DEBUG: See what is actually coming from the decorator
  console.log('--- FIND ALL CAMPAIGNS ---');
  console.log('User ID received:', userId);

  // 2. SAFETY: If userId is undefined, don't let Prisma crash
  if (!userId || typeof userId !== 'string') {
    console.error('CRITICAL ERROR: userId is missing or not a string!');
    return { data: [], message: 'User not authenticated' };
  }

  const cacheKey = `campaigns:user:${userId}`;
  const cached = await this.cacheService.get(cacheKey);
  if (cached) return { data: cached };

  try {
    const campaigns = await this.prisma.db.campaign.findMany({
      where: { userId },
      include: {
        ads: true,
        media: true,
        _count: { select: { ads: true, media: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    await this.cacheService.set(cacheKey, campaigns, 60);
    return { data: campaigns };
  } catch (error) {
    // 3. CATCH: If the database itself is the problem, see why
    console.error('Prisma Database Error:', error);
    throw new InternalServerErrorException('Database query failed');
  }
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
        media: true,
        _count: { select: { ads: true, media: true } },
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
  // Toggle public/private
async togglePublic(id: string, userId: string) {
  await this.findOne(id, userId)
  const campaign = await this.prisma.db.campaign.findUnique({
    where: { id },
  })
  const updated = await this.prisma.db.campaign.update({
    where: { id },
    data: { isPublic: !campaign!.isPublic },
  })
  await this.cacheService.del(`campaigns:${id}`)
  await this.cacheService.del(`campaigns:user:${userId}`)
  return updated
}

// Get public campaign (no auth needed)
async getPublicCampaign(id: string) {
  const campaign = await this.prisma.db.campaign.findUnique({
    where: { id },
    include: {
      ads: true,
      media: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })
 if (!campaign) {
    // Debug: Is the ID wrong?
    throw new NotFoundException(`Campaign with ID ${id} does not exist in DB`);
  }

  /*if (!campaign.isPublic) {
    // Debug: Is it just hidden?
    throw new NotFoundException('This campaign is marked as Private');
  }*/

  return campaign;
}

async addMedia(campaignId: string, mediaId: string, userId: string) {
  await this.findOne(campaignId, userId); // Ensure campaign exists and belongs to user
  
  const media = await this.prisma.db.media.update({
    where: { id: mediaId },
    data: { campaignId }, // This is the "Storage" happens!
  });
  
  await this.cacheService.del(`campaigns:${campaignId}`);
  await this.cacheService.del(`campaigns:user:${userId}`);
  await this.cacheService.del(`media:user:${userId}`);
  return media;
}
}