import { UploadedFile } from '../pages/types'

const removeFileExtension = (fileName: string) => {
  return fileName.replace(/\.(wav|flac|mp3|aac|jpg|jpeg|png|gif)$/i, '')
}

export const composeMediaItems = (value: UploadedFile[], optionalParams = {}) => {
  return value.map((fileData) => {
    return {
      url: fileData.url,
      source: '',
      title: fileData.originalFilename ? removeFileExtension(fileData.originalFilename) : '',
      body: '',
      ...optionalParams,
    }
  })
}
