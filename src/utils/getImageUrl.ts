import { cdnUrl, thumborUrl } from './config'

const getSizeUrlPart = (options: { width?: number; height?: number; noSizeUrlPart?: boolean } = {}) => {
  const widthString = options.width ? options.width.toString() : ''
  const heightString = options.height ? options.height.toString() : ''

  if (!(widthString || heightString) || options.noSizeUrlPart) {
    return ''
  }

  return `${widthString}x${heightString}/`
}

export const getImageUrl = (
  src: string,
  options: { width?: number; height?: number; noSizeUrlPart?: boolean } = {},
) => {
  if (src.includes('discours.io')) {
    const filename = src.toLowerCase().split('/').pop()
    const ext = filename.split('.').pop()
    const isAudio = ext in ['wav', 'mp3', 'ogg', 'aif', 'flac']
    const base = isAudio ? cdnUrl : `${thumborUrl}/unsafe/`
    const suffix = isAudio || options.noSizeUrlPart ? '' : getSizeUrlPart(options)
    const subfolder = isAudio ? 'audio' : 'image'

    return `${base}${suffix}production/${subfolder}/${filename}`
  }

  return src
}

export const getOpenGraphImageUrl = (
  src: string,
  options: {
    topic: string
    title: string
    author: string
    width?: number
    height?: number
  },
) => {
  const sizeUrlPart = getSizeUrlPart(options)

  const filtersPart = `filters:discourstext('${encodeURIComponent(options.topic)}','${encodeURIComponent(
    options.author,
  )}','${encodeURIComponent(options.title)}')/`

  if (src.startsWith(thumborUrl)) {
    const thumborKey = src.replace(`${thumborUrl}/unsafe`, '')
    return `${thumborUrl}/unsafe/${sizeUrlPart}${filtersPart}${thumborKey}`
  }

  return `${thumborUrl}/unsafe/${sizeUrlPart}${filtersPart}${src}`
}
