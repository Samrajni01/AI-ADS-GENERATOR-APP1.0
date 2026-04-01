import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { AdsService } from './ads.service'
import { CreateAdDto } from './dto/create-ad.dto'
import { UpdateAdDto } from './dto/update-ad.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('ads')
export class AdsController {
  constructor(private adsService: AdsService) {}

  // POST /ads
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateAdDto) {
    return this.adsService.create(user.id, dto)
  }

  @Get('stats')
  getGlobalStats(@CurrentUser() user: any) {
    return this.adsService.getGlobalStats(user.id)
  }

  // GET /ads
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.adsService.findAll(user.id)
  }

  // GET /ads/:id
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adsService.findOne(id, user.id)
  }

  // PATCH /ads/:id
  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateAdDto) {
    return this.adsService.update(id, user.id, dto)
  }

  // DELETE /ads/:id
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adsService.remove(id, user.id)
  }

  // POST /ads/:id/impression
  @Post(':id/impression')
  trackImpression(@Param('id') id: string) {
    return this.adsService.trackImpression(id)
  }

  // POST /ads/:id/click
  @Post(':id/click')
  trackClick(@Param('id') id: string) {
    return this.adsService.trackClick(id)
  }

  // GET /ads/:id/analytics
  @Get(':id/analytics')
  getAnalytics(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adsService.getAnalytics(id, user.id)
  }
}