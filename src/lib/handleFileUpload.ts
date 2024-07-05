import { UploadFile } from '@solid-primitives/upload'
import { coreApiUrl } from '../config'

const apiUrl = `${coreApiUrl}/upload`

export const handleFileUpload = async (uploadFile: UploadFile, token: string) => {
  const formData = new FormData()
  formData.append('file', uploadFile.file, uploadFile.name)
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: token
    }
  })
  return response.json()
}
