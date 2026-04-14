export interface Media {
  id: string
  filename: string
  originalName: string
  mimetype: string
  size: number
  url: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface UploadMediaResponse {
  id: string
  filename: string
  originalName: string
  mimetype: string
  size: number
  url: string
  userId: string
  createdAt: string
  updatedAt: string
}