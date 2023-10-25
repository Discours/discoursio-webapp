import { UploadFile } from '@solid-primitives/upload'
import { UploadedFile } from '../pages/types'
import { thumborUrl } from './config'

export const handleFileUpload = async (uploadFile: UploadFile): Promise<UploadedFile> => {
  const formData = new FormData()
  formData.append('media', uploadFile.file, uploadFile.name)
  const response = await fetch(`${thumborUrl}/image`, {
    method: 'POST',
    body: formData
  })

  const location = response.headers.get('Location')

  const url = ''
  const originalFilename = location

  const result: UploadedFile = {
    originalFilename,
    url
  }

  return response.json()
}
