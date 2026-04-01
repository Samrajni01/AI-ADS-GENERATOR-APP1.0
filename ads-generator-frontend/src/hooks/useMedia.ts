import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  uploadMediaApi,
  getMediaApi,
  getMediaByIdApi,
  deleteMediaApi,
} from '../store/media.query'

// Get all media
export const useMedia = () => {
  return useQuery({
    queryKey: ['media'],
    queryFn: getMediaApi,
  })
}

// Get single media
export const useMediaById = (id: string) => {
  return useQuery({
    queryKey: ['media', id],
    queryFn: () => getMediaByIdApi(id),
    enabled: !!id,
  })
}

// Upload media
export const useUploadMedia = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadMediaApi(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
    },
  })
}

// Delete media
export const useDeleteMedia = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMediaApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
    },
  })
}
