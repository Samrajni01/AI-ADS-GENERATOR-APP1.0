import { IsString, IsOptional, IsEnum } from 'class-validator'
import { Platform } from '@prisma/client'

export class CreateAdDto {
  @IsString()
  title: string

  @IsString()
  body: string

  @IsEnum(Platform)
  platform: Platform

  @IsString()
  @IsOptional()
  imageUrl?: string

  @IsString()
  @IsOptional()
  prompt?: string

  @IsString()
  @IsOptional()
  campaignId?: string
}