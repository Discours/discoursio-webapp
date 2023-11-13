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

  // check that image is available
  await new Promise<void>((resolve, reject) => {
    let retryCount = 0
    const checkUploadedImage = () => {
      const uploadedImage = new Image()
      uploadedImage.addEventListener('load', () => resolve())
      uploadedImage.addEventListener('error', () => {
        retryCount++
        if (retryCount >= 3) {
          return reject()
        }
        setTimeout(() => checkUploadedImage(), 1000)
      })
      uploadedImage.src = url
    }
    checkUploadedImage()
  })

  return {
    originalFilename,
    url
  }
}
