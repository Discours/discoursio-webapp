import { UploadFile } from '@solid-primitives/upload'

import { UploadedFile } from '../pages/types'
import { coreApiUrl } from './config'

const apiUrl = `${coreApiUrl}/upload`

export const handleFileUpload = async (uploadFile: UploadFile, token: string): Promise<UploadedFile> => {
  const formData = new FormData()
  formData.append('file', uploadFile.file, uploadFile.name)
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: token,
    },
  })
  return response.json()
}
