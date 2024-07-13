import { cdnUrl, thumborUrl } from '../config'

const URL_CONFIG = {
  cdnUrl: cdnUrl,
  thumborUrl: `${thumborUrl}/unsafe/`,
  audioSubfolder: 'audio',
  imageSubfolder: 'image',
  productionFolder: 'production/'
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
  options: { width?: number; height?: number; noSizeUrlPart?: boolean } = {}
): string => {
  if (!src.includes('discours.io') && src.includes('http')) {
    return src
  }
  const filename = getLastSegment(src)
  const suffix = options.noSizeUrlPart ? '' : buildSizePart(options.width, options.height)
  const base = URL_CONFIG.thumborUrl
  const subfolder = URL_CONFIG.imageSubfolder

  return `${base}${suffix}${URL_CONFIG.productionFolder}${subfolder}/${filename}`
}

export const getAudioUrl = (src: string) => {
  const filename = getLastSegment(src)
  const base = URL_CONFIG.cdnUrl
  const subfolder = URL_CONFIG.audioSubfolder
  const prodfolder = URL_CONFIG.productionFolder
  return `${base}${prodfolder}${subfolder}/${filename}`
}

export const getOpenGraphImageUrl = (
  src: string,
  options: {
    topic: string
    title: string
    author: string
    width?: number
    height?: number
  }
): string => {
  const sizeUrlPart = buildSizePart(options.width, options.height)
  const filtersPart = `filters:discourstext('${encodeURIComponent(options.topic)}','${encodeURIComponent(
    options.author
  )}','${encodeURIComponent(options.title)}')/`

  if (src.startsWith(URL_CONFIG.thumborUrl)) {
    const thumborKey = src.replace(URL_CONFIG.thumborUrl, '')
    return `${URL_CONFIG.thumborUrl}${sizeUrlPart}${filtersPart}${thumborKey}`
  }

  return `${URL_CONFIG.thumborUrl}${sizeUrlPart}${filtersPart}${src}`
}
