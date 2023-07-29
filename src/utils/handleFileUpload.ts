import { UploadFile } from '@solid-primitives/upload'
import { apiBaseUrl } from './config'

const apiUrl = `${apiBaseUrl}/upload`

export const handleFileUpload = async (uploadFile: UploadFile) => {
  const formData = new FormData()
  formData.append('file', uploadFile.file, uploadFile.name)
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData
  })
  return response.json()
}
