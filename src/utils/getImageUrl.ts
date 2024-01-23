import { thumborUrl, cdnUrl } from './config'

const getSizeUrlPart = (options: { width?: number; height?: number } = {}) => {
  const widthString = options.width ? options.width.toString() : ''
  const heightString = options.height ? options.height.toString() : ''

  if (!widthString && !heightString) {
    return ''
  }

  return `${widthString}x${heightString}/`
}

export const getImageUrl = (
  src: string,
  options: { width?: number; height?: number; noSizeUrlPart?: boolean } = {},
) => {
  const isAudio = src.toLowerCase().split('.')[-1] in ['wav', 'mp3', 'ogg', 'aif', 'flac']
  const base = isAudio ? cdnUrl : thumborUrl
  const sizeUrlPart = isAudio ? '' : getSizeUrlPart(options)

  // Используйте новую переменную вместо переназначения параметра
  let modifiedSrc = src
    .replaceAll(thumborUrl + '/', '')
    .replaceAll(cdnUrl + '/', '')
    .replaceAll('/unsafe', '')

  if (options.noSizeUrlPart) {
    modifiedSrc = modifiedSrc.replace(/\d+x.*?\//, '')
  }

  return `${base}/unsafe/${sizeUrlPart}${modifiedSrc}`
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
