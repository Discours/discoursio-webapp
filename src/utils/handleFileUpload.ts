import { UploadFile } from '@solid-primitives/upload'

import { UploadedFile } from '../pages/types'

const apiBaseUrl = 'https://core.discours.io'
const apiUrl = `${apiBaseUrl}/upload`

export const handleFileUpload = async (uploadFile: UploadFile): Promise<UploadedFile> => {
  const formData = new FormData()
  formData.append('file', uploadFile.file, uploadFile.name)
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData,
  })
  return response.json()
}
