import axiosInstance from '../../lib/axios'
import { Media } from '../types/media.types'
import { ApiResponse } from '../types/api.types'

// Upload file
export const uploadMediaApi = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await axiosInstance.post<ApiResponse<Media>>(
    '/media/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return res.data.data
}

// Get all media
export const getMediaApi = async () => {
  const res = await axiosInstance.get<ApiResponse<Media[]>>('/media')
  return res.data.data
}

// Get single media
export const getMediaByIdApi = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse<Media>>(`/media/${id}`)
  return res.data.data
}

// Delete media
export const deleteMediaApi = async (id: string) => {
  const res = await axiosInstance.delete<ApiResponse<{ message: string }>>(
    `/media/${id}`,
  )
  return res.data.data
}
