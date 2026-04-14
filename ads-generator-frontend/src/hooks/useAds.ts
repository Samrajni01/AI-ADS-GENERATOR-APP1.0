import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAdsApi,
  getAdApi,
  createAdApi,
  updateAdApi,
  deleteAdApi,
  trackImpressionApi,
  trackClickApi,
  getAdAnalyticsApi,
} from '../store/ads.query'
import { CreateAdPayload, UpdateAdPayload } from '../types/ad.types'

// Get all ads
export const useAds = () => {
  return useQuery({
    queryKey: ['ads'],
    queryFn: getAdsApi,
  })
}

// Get single ad
export const useAd = (id: string) => {
  return useQuery({
    queryKey: ['ads', id],
    queryFn: () => getAdApi(id),
    enabled: !!id,
  })
}

// Get ad analytics
export const useAdAnalytics = (id: string) => {
  return useQuery({
    queryKey: ['ads', id, 'analytics'],
    queryFn: () => getAdAnalyticsApi(id),
    enabled: !!id,
  })
}

// Create ad
export const useCreateAd = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAdPayload) => createAdApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] })
    },
  })
}

// Update ad
export const useUpdateAd = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAdPayload }) =>
      updateAdApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] })
    },
  })
}

// Delete ad
export const useDeleteAd = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] })
    },
  })
}

// Track impression
export const useTrackImpression = () => {
  return useMutation({
    mutationFn: (id: string) => trackImpressionApi(id),
  })
}

// Track click
export const useTrackClick = () => {
  return useMutation({
    mutationFn: (id: string) => trackClickApi(id),
  })
}