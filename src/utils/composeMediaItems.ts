export const composeMediaItems = (value) => {
  return value.map((fileData) => {
    return {
      url: fileData.url,
      source: '',
      title: fileData.originalFilename,
      body: ''
    }
  })
}
