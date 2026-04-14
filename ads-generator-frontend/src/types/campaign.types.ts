export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'

export interface Campaign {
  id: string
  name: string
  description: string | null
  status: CampaignStatus
  isPublic: boolean
  userId: string
  createdAt: string
  updatedAt: string
  ads?: any[]
  _count?: {
    ads: number
  }
}

export interface CreateCampaignPayload {
  name: string
  description?: string
  status?: CampaignStatus
}

export interface UpdateCampaignPayload {
  name?: string
  description?: string
  status?: CampaignStatus
}