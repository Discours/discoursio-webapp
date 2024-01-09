import { thumborUrl } from './config'

const thumborPrefix = `${thumborUrl}/unsafe/`

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
  const sizeUrlPart = getSizeUrlPart(options)

  if (options.noSizeUrlPart) {
    src = src.replace(/\d+x.*?\//, '')
  }

  if (src.startsWith(thumborPrefix)) {
    let thumborKey = src.replace(thumborPrefix, '')

    return `${thumborUrl}/unsafe/${sizeUrlPart}${thumborKey}`
  }

  return `${thumborUrl}/unsafe/${sizeUrlPart}${src}`
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

  if (src.startsWith(thumborPrefix)) {
    const thumborKey = src.replace(thumborPrefix, '')
    return `${thumborUrl}/unsafe/${sizeUrlPart}${filtersPart}${thumborKey}`
  }

  return `${thumborUrl}/unsafe/${sizeUrlPart}${filtersPart}${src}`
}
