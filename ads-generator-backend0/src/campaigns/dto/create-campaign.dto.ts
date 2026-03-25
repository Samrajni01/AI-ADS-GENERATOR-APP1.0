import { IsString, IsOptional, IsEnum } from 'class-validator'
import { CampaignStatus } from '@prisma/client'

export class CreateCampaignDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus
}