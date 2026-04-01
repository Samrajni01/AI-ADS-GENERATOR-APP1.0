import {
  Controller, Get, Post, Patch,
  Delete, Body, Param, UseGuards,
} from '@nestjs/common'
import { CampaignsService } from './campaigns.service'
import { CreateCampaignDto } from './dto/create-campaign.dto'
import { UpdateCampaignDto } from './dto/update-campaign.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@Controller('campaigns')
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  // GET /campaigns/public/:id (NO auth — anyone can access)
  @Get('public/:id')
  getPublicCampaign(@Param('id') id: string) {
    return this.campaignsService.getPublicCampaign(id)
  }

  // POST /campaigns
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(user.id, dto)
  }

  // GET /campaigns
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: any) {
    //check
    console.log("Current User in Controller:", user);
    return this.campaignsService.findAll(user.id)
  }

  // GET /campaigns/:id
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.campaignsService.findOne(id, user.id)
  }

  // PATCH /campaigns/:id
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(id, user.id, dto)
  }

  // DELETE /campaigns/:id
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.campaignsService.remove(id, user.id)
  }

  // POST /campaigns/:id/ads/:adId
  @UseGuards(JwtAuthGuard)
  @Post(':id/ads/:adId')
  addAd(
    @Param('id') id: string,
    @Param('adId') adId: string,
    @CurrentUser() user: any,
  ) {
    return this.campaignsService.addAd(id, adId, user.id)
  }

  // DELETE /campaigns/:id/ads/:adId
  @UseGuards(JwtAuthGuard)
  @Delete(':id/ads/:adId')
  removeAd(
    @Param('id') id: string,
    @Param('adId') adId: string,
    @CurrentUser() user: any,
  ) {
    return this.campaignsService.removeAd(id, adId, user.id)
  }
  //new
  // POST /campaigns/:id/media/:mediaId
  @UseGuards(JwtAuthGuard)
  @Post(':id/media/:mediaId')
  addMedia(
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
    @CurrentUser() user: any,
  ) {
    return this.campaignsService.addMedia(id, mediaId, user.id)
  }

  // DELETE /campaigns/:id/media/:mediaId
  @UseGuards(JwtAuthGuard)
  @Delete(':id/media/:mediaId')
  removeMedia(
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
    @CurrentUser() user: any,
  ) {
    // Note: You'll need to add a removeMedia method in your service 
    // if you want to be able to "un-assign" an image from a folder.
    return this.campaignsService.removeAd(id, mediaId, user.id) 
  }

  // PATCH /campaigns/:id/toggle-public
  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle-public')
  togglePublic(@Param('id') id: string, @CurrentUser() user: any) {
    return this.campaignsService.togglePublic(id, user.id)
  }
}