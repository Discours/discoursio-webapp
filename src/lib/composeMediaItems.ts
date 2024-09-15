const audioExts = /\.(wav|flac|mp3|aac|jpg|jpeg|png|gif)$/i

const removeMediaFileExtension = (fileName: string) => {
  return fileName.replace(audioExts, '')
}

export const composeMediaItems = (
  value: { originalFilename?: string; url: string }[],
  optionalParams = {}
) => {
  return value.map((fileData) => {
    return {
      url: fileData.url,
      source: '',
      title: fileData.originalFilename ? removeMediaFileExtension(fileData.originalFilename) : '',
      body: '',
      ...optionalParams
    }
  })
}
