import { UploadFile } from '@solid-primitives/upload'
import { isDev } from './config'

const api = isDev ? 'https://new.discours.io/api/upload' : '/api/upload'
const formData = new FormData()
export const handleFileUpload = async (uploadFile: UploadFile) => {
  formData.append('file', uploadFile.file, uploadFile.name)
  const response = await fetch(api, {
    method: 'POST',
    body: formData
  })
  return response.json()
}

//TODO: Merge into one uploader with, be sure to conduct regression testing
export const handleMultiplyFileUpload = async (uploadFiles: UploadFile[]) => {
  const uploadPromises = uploadFiles.map(async (file) => {
    formData.append('file', file.file, file.name)
    const response = await fetch(api, {
      method: 'POST',
      body: formData
    })
    console.log('!!! AAA:')
    return response.json()
  })

  return Promise.all(uploadPromises)
}
