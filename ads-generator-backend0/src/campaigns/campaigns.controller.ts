import {
  Controller, Get, Post, Patch,
  Delete, Body, Param, UseGuards,
} from '@nestjs/common'
import { CampaignsService } from './campaigns.service'
import { CreateCampaignDto } from './dto/create-campaign.dto'
import { UpdateCampaignDto } from './dto/update-campaign.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  // POST /campaigns
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(user.id, dto)
  }

  // GET /campaigns
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.campaignsService.findAll(user.id)
  }

  // GET /campaigns/:id
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.campaignsService.findOne(id, user.id)
  }

  // PATCH /campaigns/:id
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(id, user.id, dto)
  }

  // DELETE /campaigns/:id
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.campaignsService.remove(id, user.id)
  }

  // POST /campaigns/:id/ads/:adId
  @Post(':id/ads/:adId')
  addAd(
    @Param('id') id: string,
    @Param('adId') adId: string,
    @CurrentUser() user: any,
  ) {
    return this.campaignsService.addAd(id, adId, user.id)
  }

  // DELETE /campaigns/:id/ads/:adId
  @Delete(':id/ads/:adId')
  removeAd(
    @Param('id') id: string,
    @Param('adId') adId: string,
    @CurrentUser() user: any,
  ) {
    return this.campaignsService.removeAd(id, adId, user.id)
  }
}