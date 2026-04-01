import { IsString, IsEnum, IsOptional ,IsBoolean } from 'class-validator'
import { Platform } from '@prisma/client'

export class GenerateAdDto {
  @IsString()
  prompt: string

  @IsEnum(Platform)
  platform: Platform

  @IsString()
  @IsOptional()
  tone?: string

  @IsString()
  @IsOptional()
  targetAudience?: string

  @IsString()
  @IsOptional()
  productName?: string

  @IsBoolean()
  @IsOptional()
  includeImage?: boolean 
//new update for campaign association
  @IsString()
  @IsOptional()
  campaignId?: string
}