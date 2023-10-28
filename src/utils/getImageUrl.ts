import { thumborUrl } from './config'

const getSizeUrlPart = (options: { width?: number; height?: number } = {}) => {
  const widthString = options.width ? options.width.toString() : ''
  const heightString = options.height ? options.height.toString() : ''

  if (!widthString && !heightString) {
    return ''
  }

  return `${widthString}x${heightString}/`
}

// I'm not proud of this
export const getImageUrl = (src: string, options: { width?: number; height?: number } = {}) => {
  const sizeUrlPart = getSizeUrlPart(options)

  if (!src.startsWith(thumborUrl)) {
    return `${thumborUrl}/unsafe/${sizeUrlPart}${src}`
  }

  if (src.startsWith(`${thumborUrl}/unsafe`)) {
    const thumborKey = src.replace(`${thumborUrl}/unsafe`, '')
    return `${thumborUrl}/unsafe/${sizeUrlPart}${thumborKey}`
  }

  const thumborKey = src.replace(`${thumborUrl}`, '')
  return `${thumborUrl}/${sizeUrlPart}${thumborKey}`
}
