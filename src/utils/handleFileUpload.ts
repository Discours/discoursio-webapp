import { UploadFile } from '@solid-primitives/upload'
import { apiBaseUrl } from './config'
import { UploadedFile } from '../pages/types'

export const handleFileUpload = async (uploadFile: UploadFile): Promise<UploadedFile> => {
  const formData = new FormData()
  formData.append('media', uploadFile.file, uploadFile.name)
  const response = await fetch('https://images.discours.io/upload', {
    method: 'POST',
    body: formData
  })
  return response.json()
}
