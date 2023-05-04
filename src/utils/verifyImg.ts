export const verifyImg = (url: string) => {
  return fetch(url, { method: 'HEAD' }).then((res) => {
    return res.headers.get('Content-Type').startsWith('image')
  })
}

const supportedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'tiff', 'bpg']
export const isImageExtension = (value: string) => {
  return supportedExtensions.some((extension) => value.includes(extension))
}
