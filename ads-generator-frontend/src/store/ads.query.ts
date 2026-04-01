import axiosInstance from '../../lib/axios'
import {
  Ad,
  AdAnalytics,
  CreateAdPayload,
  UpdateAdPayload,
} from '../types/ad.types'
import { ApiResponse } from '../types/api.types'

// Get all ads
export const getAdsApi = async () => {
  const res = await axiosInstance.get<ApiResponse<Ad[]>>('/ads')
  return res.data.data
}

// Get single ad
export const getAdApi = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse<Ad>>(`/ads/${id}`)
  return res.data.data
}

// Create ad
export const createAdApi = async (payload: CreateAdPayload) => {
  const res = await axiosInstance.post<ApiResponse<Ad>>('/ads', payload)
  return res.data.data
}

// Update ad
export const updateAdApi = async (id: string, payload: UpdateAdPayload) => {
  const res = await axiosInstance.patch<ApiResponse<Ad>>(`/ads/${id}`, payload)
  return res.data.data
}

// Delete ad
export const deleteAdApi = async (id: string) => {
  const res = await axiosInstance.delete<ApiResponse<{ message: string }>>(
    `/ads/${id}`,
  )
  return res.data.data
}

// Track impression
export const trackImpressionApi = async (id: string) => {
  const res = await axiosInstance.post<ApiResponse<{ message: string }>>(
    `/ads/${id}/impression`,
  )
  return res.data.data
}

// Track click
export const trackClickApi = async (id: string) => {
  const res = await axiosInstance.post<ApiResponse<{ message: string }>>(
    `/ads/${id}/click`,
  )
  return res.data.data
}

// Get analytics
export const getAdAnalyticsApi = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse<AdAnalytics>>(
    `/ads/${id}/analytics`,
  )
  return res.data.data
}
// Add this to your existing ads.query.ts

export interface GlobalStats {
  totalAds: number;
  publishedAds: number;
  totalCampaigns: number;
}

// Get global stats (Total Ads, Published, etc.)
export const getGlobalStatsApi = async () => {
  const res = await axiosInstance.get<ApiResponse<GlobalStats>>('/ads/stats');
  return res.data.data;
};