import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getCampaignsApi,
  getCampaignApi,
  createCampaignApi,
  updateCampaignApi,
  deleteCampaignApi,
  addAdToCampaignApi,
  removeAdFromCampaignApi,
  addMediaToCampaignApi, // This is the key helper from your query file
} from '../store/campaigns.query'
import {
  CreateCampaignPayload,
  UpdateCampaignPayload,
} from '../types/campaign.types'

// Get all campaigns
export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaignsApi,
  })
}

// Get single campaign
export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => getCampaignApi(id),
    enabled: !!id,
  })
}

// Create campaign
export const useCreateCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) => createCampaignApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

// Update campaign
export const useUpdateCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateCampaignPayload
    }) => updateCampaignApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

// Delete campaign
export const useDeleteCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCampaignApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

// Add ad to campaign
export const useAddAdToCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      campaignId,
      adId,
    }: {
      campaignId: string
      adId: string
    }) => addAdToCampaignApi(campaignId, adId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

// Remove ad from campaign
export const useRemoveAdFromCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      campaignId,
      adId,
    }: {
      campaignId: string
      adId: string
    }) => removeAdFromCampaignApi(campaignId, adId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

// FIXED: Add media to campaign
export const useAddMediaToCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ campaignId, mediaId }: { campaignId: string; mediaId: string }) => 
      // We use the imported function here so we don't need axiosInstance in this file
      addMediaToCampaignApi(campaignId, mediaId), 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['media'] })
    },
  })
}