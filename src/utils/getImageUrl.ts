import { thumborUrl, cdnUrl } from './config'

const getSizeUrlPart = (options: { width?: number; height?: number; noSizeUrlPart?: boolean } = {}) => {
  const widthString = options.width ? options.width.toString() : ''
  const heightString = options.height ? options.height.toString() : ''

  if ((!widthString && !heightString) || options.noSizeUrlPart) {
    return ''
  }

  return `${widthString}x${heightString}/`
}

export const getImageUrl = (
  src: string,
  options: { width?: number; height?: number; noSizeUrlPart?: boolean } = {},
) => {
  const filename = src.split('/').pop()
  const isAudio = src.toLowerCase().split('.').pop() in ['wav', 'mp3', 'ogg', 'aif', 'flac']
  const base = isAudio ? cdnUrl : `${thumborUrl}/unsafe/`
  const sizeUrlPart = isAudio ? '' : getSizeUrlPart(options)

  return `${base}${sizeUrlPart}production/${isAudio ? 'audio' : 'image'}/${filename}`
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
    const thumborKey = src.replace(thumborUrl + '/unsafe', '')
    return `${thumborUrl}/unsafe/${sizeUrlPart}${filtersPart}${thumborKey}`
  }

  return `${thumborUrl}/unsafe/${sizeUrlPart}${filtersPart}${src}`
}
