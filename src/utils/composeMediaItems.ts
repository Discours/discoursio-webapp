import { UploadedFile } from '../pages/types'

export const composeMediaItems = (value: UploadedFile[], optionalParams = {}) => {
  return value.map((fileData) => {
    return {
      url: fileData.url,
      source: '',
      title: fileData.originalFilename,
      body: '',
      ...optionalParams
    }
  })
}
