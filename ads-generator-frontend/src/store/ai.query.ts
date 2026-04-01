import axiosInstance from '../../lib/axios'
import { GenerateAdPayload, Ad } from '../types/ad.types'
import { ApiResponse } from '../types/api.types'

export interface GeneratedAd {
  ad: Ad
  callToAction: string
  generatedBy: string
  imageStatus?: 'SUCCESS' | 'FAILED' | 'PENDING'
}

export interface AdVariation {
  title: string
  body: string
  callToAction: string
}

// Generate single ad
export const generateAdApi = async (payload: GenerateAdPayload) => {
  const res = await axiosInstance.post<ApiResponse<GeneratedAd>>(
    '/ai/generate',
    payload,
  )
  return res.data.data
}

// Generate variations
export const generateVariationsApi = async (payload: GenerateAdPayload) => {
  const res = await axiosInstance.post<ApiResponse<AdVariation[]>>(
    '/ai/variations',
    payload,
  )
  return res.data.data
}