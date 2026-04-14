export type Platform =
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'TWITTER'
  | 'GOOGLE'
  | 'LINKEDIN'
  | 'TIKTOK'

export type AdStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface Ad {
  id: string
  title: string
  body: string
  imageUrl: string | null
  imagePrompt: string | null;
  platform: Platform
 status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'ACTIVE';
  prompt: string | null
  userId: string
  campaignId: string | null
  createdAt: string
  updatedAt: string
}

export interface AdAnalytics {
  id: string
  adId: string
  views: number
  clicks: number
  impressions: number
  createdAt: string
  updatedAt: string
}

export interface CreateAdPayload {
  title: string
  body: string
  platform: Platform
  imageUrl?: string
  prompt?: string
  campaignId?: string
}

export interface UpdateAdPayload {
  title?: string;
  body?: string;
  productName?: string;
  targetAudience?: string;
  tone?: string;
  // Change this line specifically:
  campaignId?: string | null; 
  status?: 'DRAFT' | 'ACTIVE';
}

export interface GenerateAdPayload {
  prompt: string;
  platform: Platform;
  tone?: string;
  targetAudience?: string;
  productName?: string;
  includeImage?: boolean;
}