import { UploadFile } from '@solid-primitives/upload'
import { apiBaseUrl } from './config'
import { UploadedFile } from '../pages/types'

const apiUrl = `${apiBaseUrl}/upload`

export const handleFileUpload = async (uploadFile: UploadFile): Promise<UploadedFile> => {
  const formData = new FormData()
  formData.append('file', uploadFile.file, uploadFile.name)
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData
  })
  return response.json()
}
