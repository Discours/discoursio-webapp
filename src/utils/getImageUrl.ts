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

  let modifiedSrc = src // Используйте новую переменную вместо переназначения параметра

  if (options.noSizeUrlPart) {
    modifiedSrc = modifiedSrc.replace(/\d+x.*?\//, '')
  }

  if (src.startsWith(thumborPrefix)) {
    const thumborKey = modifiedSrc.replace(thumborPrefix, '')

    return `${thumborUrl}/unsafe/${sizeUrlPart}${thumborKey}`
  }

  return `${thumborUrl}/unsafe/${sizeUrlPart}${modifiedSrc}`
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
