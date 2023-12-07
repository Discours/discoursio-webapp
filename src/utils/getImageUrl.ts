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

  return `${thumborUrl}/unsafe/${sizeUrlPart}${src.replace(thumborUrl, '').replace('/unsafe', '')}`
}
