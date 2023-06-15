import { UploadFile } from '@solid-primitives/upload'
import { isDev } from './config'

const api = isDev ? 'https://new.discours.io/api/upload' : '/api/upload'

export const handleFileUpload = async (uploadFile: UploadFile) => {
  const formData = new FormData()
  formData.append('file', uploadFile.file, uploadFile.name)
  const response = await fetch(api, {
    method: 'POST',
    body: formData
  })
  return response.json()
}
