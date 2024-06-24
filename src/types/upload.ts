export type FileTypeToUpload = 'image' | 'video' | 'doc' | 'audio'

export type UploadedFile = {
  url: string
  originalFilename?: string
}
