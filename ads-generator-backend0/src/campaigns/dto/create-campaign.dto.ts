import { IsString, IsOptional, IsEnum ,IsBoolean} from 'class-validator'
import { CampaignStatus } from '@prisma/client'

export class CreateCampaignDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsEnum(CampaignStatus)
  @IsOptional()
  @IsOptional()
  status?: CampaignStatus
}