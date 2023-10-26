import { UploadFile } from '@solid-primitives/upload'
import { UploadedFile } from '../pages/types'
import { thumborUrl } from './config'

export const handleImageUpload = async (uploadFile: UploadFile): Promise<UploadedFile> => {
  const formData = new FormData()
  formData.append('media', uploadFile.file, uploadFile.name)
  const response = await fetch(`${thumborUrl}/image`, {
    method: 'POST',
    body: formData
  })

  const location = response.headers.get('Location')

  const url = `${thumborUrl}/unsafe/production${location.slice(0, location.lastIndexOf('/'))}`
  const originalFilename = location.slice(location.lastIndexOf('/') + 1)

  return {
    originalFilename,
    url
  }
}
