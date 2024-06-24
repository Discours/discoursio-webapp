import { cdnUrl, thumborUrl } from '../config/config'

const URL_CONFIG = {
  cdnUrl: cdnUrl,
  thumborUrl: `${thumborUrl}/unsafe/`,
  audioSubfolder: 'audio',
  imageSubfolder: 'image',
  productionFolder: 'production/',
}

const AUDIO_EXTENSIONS = new Set(['wav', 'mp3', 'ogg', 'aif', 'flac'])

const isAudioFile = (filename: string): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase()
  return AUDIO_EXTENSIONS.has(extension ?? '')
}
const getLastSegment = (url: string): string => url.toLowerCase().split('/').pop() || ''

const buildSizePart = (width?: number, height?: number, includeSize = true): string => {
  if (!includeSize) return ''
  const widthPart = width ? width.toString() : ''
  const heightPart = height ? height.toString() : ''
  return widthPart || heightPart ? `${widthPart}x${heightPart}/` : ''
}

export const getImageUrl = (
  src: string,
  options: { width?: number; height?: number; noSizeUrlPart?: boolean } = {},
): string => {
  if (!src.includes('discours.io') && src.includes('http')) {
    return src
  }
  const filename = getLastSegment(src)
  const base = isAudioFile(filename) ? URL_CONFIG.cdnUrl : URL_CONFIG.thumborUrl
  const suffix = options.noSizeUrlPart ? '' : buildSizePart(options.width, options.height)
  const subfolder = isAudioFile(filename) ? URL_CONFIG.audioSubfolder : URL_CONFIG.imageSubfolder

  return `${base}${suffix}${URL_CONFIG.productionFolder}${subfolder}/${filename}`
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
): string => {
  const sizeUrlPart = buildSizePart(options.width, options.height)
  const filtersPart = `filters:discourstext('${encodeURIComponent(options.topic)}','${encodeURIComponent(
    options.author,
  )}','${encodeURIComponent(options.title)}')/`

  if (src.startsWith(URL_CONFIG.thumborUrl)) {
    const thumborKey = src.replace(URL_CONFIG.thumborUrl, '')
    return `${URL_CONFIG.thumborUrl}${sizeUrlPart}${filtersPart}${thumborKey}`
  }

  return `${URL_CONFIG.thumborUrl}${sizeUrlPart}${filtersPart}${src}`
}
