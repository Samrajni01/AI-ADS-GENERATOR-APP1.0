import axiosInstance from '../../lib/axios'
import {
  Campaign,
  CreateCampaignPayload,
  UpdateCampaignPayload,
} from '../types/campaign.types'
import { ApiResponse } from '../types/api.types'
import { useQuery } from '@tanstack/react-query'




export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaignsApi,
  })
}

// Get all campaigns
export const getCampaignsApi = async () => {
  const res = await axiosInstance.get<ApiResponse<Campaign[]>>('/campaigns')
  return res.data.data
}

// Get single campaign
export const getCampaignApi = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse<Campaign>>(`/campaigns/${id}`)
  return res.data.data
}

// Create campaign
export const createCampaignApi = async (payload: CreateCampaignPayload) => {
  const res = await axiosInstance.post<ApiResponse<Campaign>>(
    '/campaigns',
    payload,
  )
  return res.data.data
}

// Update campaign
export const updateCampaignApi = async (
  id: string,
  payload: UpdateCampaignPayload,
) => {
  const res = await axiosInstance.patch<ApiResponse<Campaign>>(
    `/campaigns/${id}`,
    payload,
  )
  return res.data.data
}

// Delete campaign
export const deleteCampaignApi = async (id: string) => {
  const res = await axiosInstance.delete<ApiResponse<{ message: string }>>(
    `/campaigns/${id}`,
  )
  return res.data.data
}

// Add ad to campaign
export const addAdToCampaignApi = async (
  campaignId: string,
  adId: string,
) => {
  const res = await axiosInstance.post<ApiResponse<{ message: string }>>(
    `/campaigns/${campaignId}/ads/${adId}`,
  )
  return res.data.data
}

// Remove ad from campaign
export const removeAdFromCampaignApi = async (
  campaignId: string,
  adId: string,
) => {
  const res = await axiosInstance.delete<ApiResponse<{ message: string }>>(
    `/campaigns/${campaignId}/ads/${adId}`,
  )
  return res.data.data
}

export const addMediaToCampaignApi = async (campaignId: string, mediaId: string) => {
  // This uses the axiosInstance already defined in this file
  const res = await axiosInstance.post(`/campaigns/${campaignId}/media/${mediaId}`);
  return res.data;
};