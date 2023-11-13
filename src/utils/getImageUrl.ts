import { thumborUrl } from './config'

const getSizeUrlPart = (options: { width?: number; height?: number } = {}) => {
  const widthString = options.width ? options.width.toString() : ''
  const heightString = options.height ? options.height.toString() : ''

  if (!widthString && !heightString) {
    return ''
  }

  return `${widthString}x${heightString}/`
}

export const getImageUrl = (src: string, options: { width?: number; height?: number } = {}) => {
  const sizeUrlPart = getSizeUrlPart(options)

  const thumborPrefix = `${thumborUrl}/unsafe/`

  if (src.startsWith(thumborPrefix)) {
    const thumborKey = src.replace(thumborPrefix, '')
    return `${thumborUrl}/unsafe/${sizeUrlPart}${thumborKey}`
  }

  return `${thumborUrl}/unsafe/${sizeUrlPart}${src}`
}
