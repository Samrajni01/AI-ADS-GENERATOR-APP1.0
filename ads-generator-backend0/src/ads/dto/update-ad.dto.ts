import { IsString, IsOptional, IsEnum } from 'class-validator'
import { Platform, AdStatus } from '@prisma/client'

export class UpdateAdDto {
  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  body?: string

  @IsEnum(Platform)
  @IsOptional()
  platform?: Platform

  @IsString()
  @IsOptional()
  imageUrl?: string

  @IsEnum(AdStatus)
  @IsOptional()
  status?: AdStatus

  @IsString()
  @IsOptional()
  campaignId?: string
}