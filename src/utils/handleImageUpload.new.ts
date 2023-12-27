import { UploadFile } from '@solid-primitives/upload'

import { UploadedFile } from '../pages/types'

import { thumborUrl } from './config'

export const handleImageUpload = async (uploadFile: UploadFile): Promise<UploadedFile> => {
  const formData = new FormData()
  formData.append(
    'media',
    uploadFile.file,
    `image${uploadFile.name.slice(Math.max(0, uploadFile.name.lastIndexOf('.')))}`,
  )
  const response = await fetch(`${thumborUrl}/image`, {
    method: 'POST',
    body: formData,
  })

  const location = response.headers.get('Location')

  const url = `${thumborUrl}${location.slice(0, location.lastIndexOf('/'))}`
  const originalFilename = uploadFile.name

  return {
    originalFilename,
    url,
  }
}
